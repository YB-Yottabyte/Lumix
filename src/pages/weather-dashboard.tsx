import { useState } from "react"; // Import useState
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Type definition for filters
interface Filters {
  temperatureRange: [number, number];
  weatherType: string;
  timeRange: [string, string];
}



  
  // Type definition for filters
  interface Filters {
    temperatureRange: [number, number];
    weatherType: string;
    timeRange: [string, string];
  }
  
  export function WeatherDashboard() {
    const {
      coordinates,
      error: locationError,
      isLoading: locationLoading,
      getLocation,
    } = useGeolocation();
  
    // State for filters with default values
    const [filters, setFilters] = useState<Filters>({
      temperatureRange: [-30, 50],
      weatherType: "",
      timeRange: ["", ""],
    });
  
    // Queries for weather and forecast
    const weatherQuery = useWeatherQuery(coordinates, filters);
    const forecastQuery = useForecastQuery(coordinates, filters);
    const locationQuery = useReverseGeocodeQuery(coordinates);
  
    // Function to refresh all data
    const handleRefresh = () => {
      getLocation();
      if (coordinates) {
        weatherQuery.refetch();
        forecastQuery.refetch();
        locationQuery.refetch();
      }
    };
  
    // Handle filter changes
    const handleFilterChange = (newFilters: Filters) => {
      setFilters(newFilters);
    };
  
    // Show skeleton while loading location
    if (locationLoading) {
      return <WeatherSkeleton />;
    }
  
    // Show location error
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
  
    // Prompt user to enable location if it's not available
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
  
    // Handle errors in weather or forecast queries
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
  
    // Show skeleton if no weather or forecast data is available
    if (!weatherQuery.data || !forecastQuery.data) {
      return <WeatherSkeleton />;
    }
  
    // Adjust UI with filters
    return (
      <div className="space-y-4">
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
              className={`h-4 w-4 ${weatherQuery.isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
  
        {/* Filters Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Filter Settings</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adjust Filters</DialogTitle>
              <DialogDescription>
                Adjust the filters for temperature range, weather type, and time range.
              </DialogDescription>
            </DialogHeader>
  
            {/* Temperature Range Filter */}
            <div className="space-y-4">
              <div>
                <label className="block">Temperature Range</label>
                <Input
                  value={filters.temperatureRange.join("-")}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split("-").map(Number);
                    handleFilterChange({
                      ...filters,
                      temperatureRange: [min, max],
                    });
                  }}
                  placeholder="e.g., -10-30"
                />
              </div>
  
              {/* Weather Type Filter */}
              <div>
                <label className="block">Weather Type</label>
                <select
                  value={filters.weatherType}
                  onChange={(e) => {
                    handleFilterChange({
                      ...filters,
                      weatherType: e.target.value,
                    });
                  }}
                  className="block w-full"
                >
                  <option value="">All</option>
                  <option value="Clear">Clear</option>
                  <option value="Rainy">Rainy</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Snowy">Snowy</option>
                </select>
              </div>
  
              {/* Time Range Filter */}
              <div>
                <label className="block">Time Range</label>
                <Input
                  value={filters.timeRange.join(" to ")}
                  onChange={(e) => {
                    const [start, end] = e.target.value.split(" to ");
                    handleFilterChange({
                      ...filters,
                      timeRange: [start, end],
                    });
                  }}
                  placeholder="e.g., 2025-04-07T00:00:00 to 2025-04-07T23:59:59"
                />
              </div>
            </div>
  
            <div className="mt-4 flex justify-end">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
  
        <div className="grid gap-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <CurrentWeather data={weatherQuery.data} locationName={locationName} />
            <HourlyTemperature data={forecastQuery.data} />
          </div>
  
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <WeatherDetails data={weatherQuery.data} />
            <WeatherForecast data={forecastQuery.data} />
          </div>
        </div>
      </div>
    );
  }
  