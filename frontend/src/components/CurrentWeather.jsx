import React from 'react';
import { format } from 'date-fns';
import { WiHumidity, WiStrongWind, WiBarometer, WiCloudy, WiSunrise, WiSunset } from 'react-icons/wi';

const CurrentWeather = ({ data }) => {
  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return format(new Date(timestamp * 1000), 'h:mm a');
  };

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        Current Weather in {data.city}, {data.country}
      </h2>

      <div className="card backdrop-blur-xl bg-gradient-to-br from-blue-800/30 to-purple-800/30">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
          {/* Temperature and main info */}
          <div className="flex items-center mb-6 md:mb-0">
            <img
              src={getWeatherIconUrl(data.icon)}
              alt={data.description}
              className="w-24 h-24"
            />
            <div>
              <div className="text-6xl font-bold">{Math.round(data.temperature)}°C</div>
              <div className="text-xl capitalize">{data.description}</div>
              <div className="text-gray-200">Feels like: {Math.round(data.feels_like)}°C</div>
            </div>
          </div>

          {/* Weather details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="flex items-center">
              <WiHumidity className="text-3xl text-blue-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Humidity</div>
                <div className="font-medium">{data.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center">
              <WiStrongWind className="text-3xl text-blue-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Wind</div>
                <div className="font-medium">{data.wind_speed} m/s</div>
              </div>
            </div>

            <div className="flex items-center">
              <WiBarometer className="text-3xl text-blue-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Pressure</div>
                <div className="font-medium">{data.pressure} hPa</div>
              </div>
            </div>

            <div className="flex items-center">
              <WiCloudy className="text-3xl text-blue-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Clouds</div>
                <div className="font-medium">{data.clouds}%</div>
              </div>
            </div>

            <div className="flex items-center">
              <WiSunrise className="text-3xl text-yellow-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Sunrise</div>
                <div className="font-medium">{formatTime(data.sunrise)}</div>
              </div>
            </div>

            <div className="flex items-center">
              <WiSunset className="text-3xl text-orange-300 mr-2" />
              <div>
                <div className="text-sm text-gray-300">Sunset</div>
                <div className="font-medium">{formatTime(data.sunset)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
