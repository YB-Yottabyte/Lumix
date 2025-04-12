import {
  useForecastQuery,
  useReverseGeocodeQuery,
  useWeatherQuery,
} from "@/hooks/use-weather";
import { CurrentWeather } from "../components/current-weather";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { WeatherDetails } from "../components/weather-details";
import { WeatherForecast } from "../components/weather-forecast";
import { HourlyTemperature } from "../components/hourly-temprature";
import WeatherSkeleton from "../components/loading-skeleton";
import { FavoriteCities } from "@/components/favorite-cities";
import { TemperatureTrendChart } from "../components/temperature-trend-chart";
import { RainProbabilityChart } from "../components/rain-probability-chart";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function WeatherDashboard() {
  const [chartView, setChartView] = useState<"temperature" | "rain">("temperature");
  const [wikiDetails, setWikiDetails] = useState<string | null>(null); // State to store fetched details

  const {
    coordinates,
    error: locationError,
    isLoading: locationLoading,
    getLocation,
  } = useGeolocation();

  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const locationQuery = useReverseGeocodeQuery(coordinates);

  const handleRefresh = () => {
    getLocation();
    if (coordinates) {
      weatherQuery.refetch();
      forecastQuery.refetch();
      locationQuery.refetch();
    }
  };

  // Fetch Wikipedia details for Arizona
  const fetchLearnMoreData = async () => {
    try {
      const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Arizona');
      const data = await response.json();
      setWikiDetails(data.extract); // Save the extracted text from Wikipedia
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (locationLoading) return <WeatherSkeleton />;

  if (locationError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Location Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>{locationError}</p>
          <Button variant="outline" onClick={getLocation} className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!coordinates) {
    return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertTitle>Location Required</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Please enable location access to see your local weather.</p>
          <Button variant="outline" onClick={getLocation} className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const locationName = locationQuery.data?.[0];

  if (weatherQuery.error || forecastQuery.error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Failed to fetch weather data. Please try again.</p>
          <Button variant="outline" onClick={handleRefresh} className="w-fit">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!weatherQuery.data || !forecastQuery.data) return <WeatherSkeleton />;

  return (
    <div className="space-y-6">
      <FavoriteCities />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={weatherQuery.isFetching || forecastQuery.isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${
              weatherQuery.isFetching ? "animate-spin" : ""
            }`}
          />
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <CurrentWeather
            data={weatherQuery.data}
            locationName={locationName}
          />
          <HourlyTemperature data={forecastQuery.data} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <WeatherDetails data={weatherQuery.data} />
          <WeatherForecast data={forecastQuery.data} />
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Button
              variant={chartView === "temperature" ? "default" : "outline"}
              onClick={() => setChartView("temperature")}
            >
              Temperature Trend
            </Button>
            <Button
              variant={chartView === "rain" ? "default" : "outline"}
              onClick={() => setChartView("rain")}
            >
              Rain Probability
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            
              <p>
                Higher rain probabilities could indicate stormy periods. Carry an umbrella if the percentage is high.
              </p>
            
          </div>

          {chartView === "temperature" ? (
            <TemperatureTrendChart forecastData={forecastQuery.data} />
          ) : (
            <RainProbabilityChart forecastData={forecastQuery.data} />
          )}
        </div>

        {/* Learn More Button */}
        <div className="flex justify-center">
          <Button 
            onClick={fetchLearnMoreData} 
            variant="outline" 
            className="w-full md:w-auto mt-4"
          >
            Learn More About Arizona
          </Button>
        </div>

        {/* Display Wikipedia Details */}
        {wikiDetails && (
          <div className="mt-6 p-4 border border-gray-200 rounded-md">
            <h2 className="text-xl font-bold">About Arizona</h2>
            <p>{wikiDetails}</p>
          </div>
        )}
      </div>
    </div>
  );
}
