import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { format } from 'date-fns'
import { WiHumidity, WiStrongWind, WiBarometer, WiCloudy, WiSunrise, WiSunset } from 'react-icons/wi'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import CurrentWeather from './components/CurrentWeather'
import ForecastSection from './components/ForecastSection'
import Footer from './components/Footer'

function App() {
  const [city, setCity] = useState('London')

  // Get backend URL based on environment
  const getBackendUrl = () => {
    // If running in development with port-forward
    if (window.location.hostname === 'localhost') {
      return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    }
    // If accessing via minikube IP, use the same IP with backend port
    const currentUrl = new URL(window.location.href);
    return import.meta.env.VITE_BACKEND_URL || `http://${currentUrl.hostname}:30250`;
  };

  const BACKEND_URL = getBackendUrl();

  // Fetch current weather data
  const {
    data: currentWeather,
    isLoading: isLoadingCurrent,
    error: currentError,
    refetch: refetchCurrent
  } = useQuery(
    ['current-weather', city],
    async () => {
      const response = await fetch(`${BACKEND_URL}/api/weather/current?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      return response.json();
    },
    { refetchOnWindowFocus: false }
  );

  // Fetch forecast data
  const {
    data: forecastData,
    isLoading: isLoadingForecast,
    error: forecastError
  } = useQuery(
    ['forecast', city],
    async () => {
      const response = await fetch(`${BACKEND_URL}/api/weather/forecast?city=${encodeURIComponent(city)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
      }
      return response.json();
    },
    { refetchOnWindowFocus: false }
  );

  const handleCityChange = (newCity) => {
    setCity(newCity);
  };

  const isLoading = isLoadingCurrent || isLoadingForecast;
  const error = currentError || forecastError;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <SearchBar onSearch={handleCityChange} defaultCity={city} />

          {error && (
            <div className="mt-6 card bg-red-500/20 backdrop-blur-md border-red-500/30">
              <p className="text-white font-medium">
                {error.message}. Please try a different city.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="mt-10 flex justify-center">
              <div className="animate-bounce flex space-x-1">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          ) : (
            <>
              {currentWeather && <CurrentWeather data={currentWeather} />}
              {forecastData && <ForecastSection data={forecastData} />}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
