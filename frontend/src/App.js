import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  // Get backend URL from environment variable or detect it intelligently
  const getBackendUrl = () => {
    // If running in development with port-forward
    if (window.location.hostname === 'localhost') {
      return process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    }
    // If accessing via minikube IP, use the same IP with backend port
    const currentUrl = new URL(window.location.href);
    return process.env.REACT_APP_BACKEND_URL || `http://${currentUrl.hostname}:30250`;
  };
  
  const BACKEND_URL = getBackendUrl();

  useEffect(() => {
    // Fetch data from FastAPI backend
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/data`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BACKEND_URL]);

  // Fetch weather data
  const fetchWeatherData = async (cityName) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const response = await fetch(`${BACKEND_URL}/api/weather?city=${encodeURIComponent(cityName)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setWeatherData(result);
    } catch (err) {
      setWeatherError(err.message);
      console.error('Error fetching weather data:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [BACKEND_URL, city]);

  const handleCitySubmit = (e) => {
    e.preventDefault();
    const inputCity = document.getElementById('cityInput').value.trim();
    if (inputCity) {
      setCity(inputCity);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="loading">Loading...</div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="error">
            <h2>Error</h2>
            <p>{error}</p>
            <p>Make sure the backend is running on {BACKEND_URL}</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + FastAPI + Kubernetes</h1>

        {/* Weather Widget */}
        <div className="weather-widget">
          <h2>Weather Dashboard</h2>

          <form onSubmit={handleCitySubmit} className="search-form">
            <input
              type="text"
              id="cityInput"
              placeholder="Enter city name..."
              defaultValue={city}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {weatherLoading && <div className="weather-loading">Loading weather data...</div>}

          {weatherError && (
            <div className="weather-error">
              <p>Error: {weatherError}</p>
              <p>Try another city name</p>
            </div>
          )}

          {!weatherLoading && !weatherError && weatherData && (
            <div className="weather-card">
              <div className="weather-header">
                <h3>{weatherData.city}, {weatherData.country}</h3>
                <div className="weather-icon">
                  <img
                    src={getWeatherIconUrl(weatherData.icon)}
                    alt={weatherData.description}
                  />
                </div>
              </div>

              <div className="weather-info">
                <div className="temperature">
                  <span className="main-temp">{Math.round(weatherData.temperature)}°C</span>
                  <span className="feels-like">Feels like: {Math.round(weatherData.feels_like)}°C</span>
                </div>

                <div className="weather-description">
                  <h4>{weatherData.weather}</h4>
                  <p>{weatherData.description}</p>
                </div>

                <div className="weather-details">
                  <div className="detail-item">
                    <span className="label">Humidity:</span>
                    <span className="value">{weatherData.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Wind:</span>
                    <span className="value">{weatherData.wind_speed} m/s</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Pressure:</span>
                    <span className="value">{weatherData.pressure} hPa</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Clouds:</span>
                    <span className="value">{weatherData.clouds}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="data-container">
          <h2>Data from {data?.server}:</h2>
          <p>Environment: {data?.environment}</p>
          <ul className="data-list">
            {data?.data?.map(item => (
              <li key={item.id} className="data-item">
                <strong>{item.name}</strong>: {item.description}
              </li>
            ))}
          </ul>
        </div>

        <div className="tech-stack">
          <h3>Tech Stack</h3>
          <p>Frontend: React</p>
          <p>Backend: FastAPI</p>
          <p>Container: Docker</p>
          <p>Orchestration: Kubernetes</p>
        </div>
      </header>
    </div>
  );
}

export default App;

