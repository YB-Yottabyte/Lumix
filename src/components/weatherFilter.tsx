import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Type definition for filters
interface Filters {
  temperatureRange: [number, number];
  weatherType: string;
  timeRange: [string, string];
}

export function Weather() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    temperatureRange: [-30, 50],
    weatherType: "",
    timeRange: ["", ""],
  });

  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);

  const apiKey = "VITE_OPENWEATHER_API_KEY";

  // Fetch current weather data based on filters
  const fetchWeatherData = async () => {
    if (!coordinates) return;

    const { lat, lon } = coordinates;
    try {
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: apiKey,
            units: "metric", // Celsius
          },
        }
      );

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall`,
        {
          params: {
            lat,
            lon,
            appid: apiKey,
            units: "metric", // Celsius
            exclude: "current,minutely,daily", // Get only hourly forecast
          },
        }
      );

      // Filter the data based on the temperature range, weather type, and time range
      const filteredHourly = forecastResponse.data.hourly.filter((hour: any) => {
        const timestamp = new Date(hour.dt * 1000);
        const hourTime = timestamp.toISOString().split("T")[1].slice(0, 5);

        // Check time range filter
        const isWithinTimeRange =
          filters.timeRange[0] === "" ||
          (hourTime >= filters.timeRange[0] && hourTime <= filters.timeRange[1]);

        // Check weather type filter
        const hasValidWeatherType =
          filters.weatherType === "" || hour.weather[0].main === filters.weatherType;

        // Check temperature range filter
        const isWithinTemperatureRange =
          hour.temp >= filters.temperatureRange[0] && hour.temp <= filters.temperatureRange[1];

        return isWithinTimeRange && hasValidWeatherType && isWithinTemperatureRange;
      });

      setWeatherData(currentWeatherResponse.data);
      setForecastData(filteredHourly);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Get user's geolocation
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [coordinates, filters]); // Fetch data when coordinates or filters change

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  if (!coordinates) {
    return <div>Loading your location...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Weather Dashboard</h1>
        <Button onClick={fetchWeatherData}>Refresh</Button>
      </div>

      {/* Filter Settings */}
      <div>
        <h2>Filter Settings</h2>
        <Input
          value={filters.temperatureRange.join("-")}
          onChange={(e) => {
            const [min, max] = e.target.value.split("-").map(Number);
            handleFilterChange({
              ...filters,
              temperatureRange: [min, max],
            });
          }}
          placeholder="Temperature Range (e.g., -10-30)"
        />
        <select
          value={filters.weatherType}
          onChange={(e) =>
            handleFilterChange({
              ...filters,
              weatherType: e.target.value,
            })
          }
        >
          <option value="">All Weather</option>
          <option value="Clear">Clear</option>
          <option value="Rainy">Rainy</option>
          <option value="Cloudy">Cloudy</option>
          <option value="Snowy">Snowy</option>
        </select>
        <Input
          value={filters.timeRange.join(" to ")}
          onChange={(e) => {
            const [start, end] = e.target.value.split(" to ");
            handleFilterChange({
              ...filters,
              timeRange: [start, end],
            });
          }}
          placeholder="Time Range (e.g., 01:00 to 02:00)"
        />
      </div>

      {/* Display Weather Data */}
      {weatherData && (
        <div>
          <h2>Current Weather</h2>
          <p>Location: {weatherData.name}</p>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Weather: {weatherData.weather[0].description}</p>
        </div>
      )}

      {/* Display Filtered Forecast Data */}
      {forecastData && (
        <div>
          <h2>Hourly Forecast</h2>
          <ul>
            {forecastData.map((hour: any, index: number) => {
              const timestamp = new Date(hour.dt * 1000);
              return (
                <li key={index}>
                  <p>{timestamp.toLocaleTimeString()}</p>
                  <p>Temperature: {hour.temp}°C</p>
                  <p>Weather: {hour.weather[0].description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
