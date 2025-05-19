from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx
import os
from typing import Optional, List, Dict, Any
from datetime import datetime

# Create FastAPI instance
app = FastAPI(title="Weather API", version="1.0.0")

# Configure CORS - allowing React frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint redirects to docs
@app.get("/")
async def root():
    return {"message": "Welcome to Weather API! Go to /docs for documentation"}

# Health check endpoint (important for K8s readiness/liveness probes)
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Weather API endpoint
@app.get("/api/weather/current")
async def get_current_weather(city: str = Query(..., description="City name to get weather for")):
    """
    Get current weather information for a specific city
    """
    try:
        api_key = os.getenv("WEATHER_API_KEY", "4f3c295e9b129c28f9f66d7dff9e0202")
        api_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)
            response.raise_for_status()
            weather_data = response.json()

            # Extract and format the relevant information
            formatted_data = {
                "city": weather_data["name"],
                "country": weather_data["sys"]["country"],
                "temperature": weather_data["main"]["temp"],
                "feels_like": weather_data["main"]["feels_like"],
                "humidity": weather_data["main"]["humidity"],
                "pressure": weather_data["main"]["pressure"],
                "weather": weather_data["weather"][0]["main"],
                "description": weather_data["weather"][0]["description"],
                "icon": weather_data["weather"][0]["icon"],
                "wind_speed": weather_data["wind"]["speed"],
                "timestamp": weather_data["dt"],
                "timezone": weather_data["timezone"],
                "clouds": weather_data["clouds"]["all"],
                "sunrise": weather_data["sys"]["sunrise"],
                "sunset": weather_data["sys"]["sunset"]
            }

            return formatted_data
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        elif e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="API key is invalid")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching weather data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

# 5-day forecast endpoint
@app.get("/api/weather/forecast")
async def get_weather_forecast(city: str = Query(..., description="City name to get forecast for")):
    """
    Get 5-day weather forecast for a specific city
    """
    try:
        api_key = os.getenv("WEATHER_API_KEY", "4f3c295e9b129c28f9f66d7dff9e0202")
        api_url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"

        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)
            response.raise_for_status()
            forecast_data = response.json()

            # Process forecast data - group by day
            processed_forecast = []
            daily_forecasts: Dict[str, List[Any]] = {}

            for item in forecast_data["list"]:
                # Convert timestamp to date string (YYYY-MM-DD)
                date = datetime.fromtimestamp(item["dt"]).strftime('%Y-%m-%d')

                if date not in daily_forecasts:
                    daily_forecasts[date] = []

                daily_forecasts[date].append({
                    "time": datetime.fromtimestamp(item["dt"]).strftime('%H:%M'),
                    "temperature": item["main"]["temp"],
                    "feels_like": item["main"]["feels_like"],
                    "weather": item["weather"][0]["main"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                    "humidity": item["main"]["humidity"],
                    "pressure": item["main"]["pressure"],
                    "wind_speed": item["wind"]["speed"],
                    "clouds": item["clouds"]["all"],
                })

            # Create a summary for each day
            for date, forecasts in daily_forecasts.items():
                # Calculate average values for the day
                temp_sum = sum(f["temperature"] for f in forecasts)
                temp_avg = temp_sum / len(forecasts)

                # Find the most common weather condition
                weather_counts = {}
                for f in forecasts:
                    w = f["weather"]
                    weather_counts[w] = weather_counts.get(w, 0) + 1
                most_common_weather = max(weather_counts.items(), key=lambda x: x[1])[0]

                # Get the icon for the most common condition
                icon = next((f["icon"] for f in forecasts if f["weather"] == most_common_weather), forecasts[0]["icon"])

                processed_forecast.append({
                    "date": date,
                    "day_name": datetime.strptime(date, '%Y-%m-%d').strftime('%A'),
                    "avg_temp": round(temp_avg, 1),
                    "min_temp": round(min(f["temperature"] for f in forecasts), 1),
                    "max_temp": round(max(f["temperature"] for f in forecasts), 1),
                    "weather": most_common_weather,
                    "icon": icon,
                    "hourly": forecasts
                })

            return {
                "city": forecast_data["city"]["name"],
                "country": forecast_data["city"]["country"],
                "forecast": processed_forecast
            }
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        elif e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="API key is invalid")
        else:
            raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching forecast data: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

