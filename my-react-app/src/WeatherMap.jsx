// src/WeatherMap.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons so they show correctly in bundlers (Vite / CRA)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to handle map clicks
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function WeatherMap() {
  const [position, setPosition] = useState(null); // { lat, lng }
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchWeather(lat, lng) {
    try {
      setLoading(true);
      setError("");
      setWeather(null);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }

      const data = await response.json();
      setWeather(data.current_weather);
    } catch (err) {
      setError("Cannot load weather data. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleMapClick(latlng) {
    setPosition(latlng);
    fetchWeather(latlng.lat, latlng.lng);
  }

  return (
    <div className="page">
      <div className="sidebar">
        <h1>Weather Map</h1>
        <p>Click anywhere on the map to see current weather for that point.</p>

        {position && (
          <div className="coords">
            <strong>Selected point:</strong>
            <div>Lat: {position.lat.toFixed(4)}</div>
            <div>Lng: {position.lng.toFixed(4)}</div>
          </div>
        )}

        {loading && <p>Loading weather...</p>}

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-card">
            <h2>Current weather</h2>
            <p>
              <strong>Temperature:</strong> {weather.temperature} °C
            </p>
            <p>
              <strong>Wind speed:</strong> {weather.windspeed} m/s
            </p>
            <p>
              <strong>Direction:</strong> {weather.winddirection}°
            </p>
            <p>
              <strong>Time:</strong> {weather.time}
            </p>
          </div>
        )}

        {!position && !weather && (
          <p className="hint">Tip: start by clicking somewhere on the map 👆</p>
        )}
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={[50.08, 14.43]} // Prague as default center
          zoom={6}
          className="map"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onClick={handleMapClick} />

          {position && (
            <Marker position={position}>
              <Popup>
                <div>
                  <div>
                    <strong>Lat:</strong> {position.lat.toFixed(4)}
                  </div>
                  <div>
                    <strong>Lng:</strong> {position.lng.toFixed(4)}
                  </div>
                  {weather ? (
                    <>
                      <div>
                        <strong>Temp:</strong> {weather.temperature} °C
                      </div>
                      <div>
                        <strong>Wind:</strong> {weather.windspeed} m/s
                      </div>
                    </>
                  ) : (
                    <div>Loading weather...</div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
