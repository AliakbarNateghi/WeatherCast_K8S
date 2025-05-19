import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';

const ForecastSection = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  // Get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">5-Day Forecast</h2>

      {/* Daily forecast tabs */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
        {data.forecast.map((day, index) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
              selectedDay === index
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="font-medium">{day.day_name}</div>
            <div className="flex items-center justify-center">
              <img
                src={getWeatherIconUrl(day.icon)}
                alt={day.weather}
                className="w-10 h-10"
              />
              <span className="ml-1">{Math.round(day.avg_temp)}°C</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detailed forecast for selected day */}
      {data.forecast[selectedDay] && (
        <div className="card">
          <h3 className="text-xl font-semibold mb-3">
            {data.forecast[selectedDay].day_name} - {data.forecast[selectedDay].date}
          </h3>
          <div className="flex items-center space-x-4 mb-4">
            <div>
              <img
                src={getWeatherIconUrl(data.forecast[selectedDay].icon)}
                alt={data.forecast[selectedDay].weather}
                className="w-16 h-16"
              />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(data.forecast[selectedDay].avg_temp)}°C
              </div>
              <div>{data.forecast[selectedDay].weather}</div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center">
                <span className="text-blue-300">↓</span>
                <span className="ml-1">{Math.round(data.forecast[selectedDay].min_temp)}°C</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-300">↑</span>
                <span className="ml-1">{Math.round(data.forecast[selectedDay].max_temp)}°C</span>
              </div>
            </div>
          </div>

          {/* Hourly forecast */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Hourly Forecast</h4>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3">
                {data.forecast[selectedDay].hourly.map((hour, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 bg-white/5 rounded-lg p-3 text-center w-24"
                  >
                    <div className="text-sm">{hour.time}</div>
                    <img
                      src={getWeatherIconUrl(hour.icon)}
                      alt={hour.description}
                      className="w-12 h-12 mx-auto"
                    />
                    <div className="font-bold">{Math.round(hour.temperature)}°C</div>
                    <div className="text-xs text-gray-300">{hour.weather}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastSection;
