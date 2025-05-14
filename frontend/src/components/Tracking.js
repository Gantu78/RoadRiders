import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Tracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState("");
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location && !mapRef.current) {
      mapRef.current = L.map("map").setView([location.latitude, location.longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
      L.marker([location.latitude, location.longitude]).addTo(mapRef.current);
    } else if (location && mapRef.current) {
      mapRef.current.setView([location.latitude, location.longitude]);
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
      });
      L.marker([location.latitude, location.longitude]).addTo(mapRef.current);
    }
  }, [location]);

  const startTracking = () => {
    if ("geolocation" in navigator) {
      setTracking(true);
      navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          try {
            const response = await fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: 1,
                latitude,
                longitude,
              }),
            });
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText);
            }
            const result = await response.json();
            setMessage(result.message);
          } catch (error) {
            setMessage("Failed to save track: " + error.message);
          }
        },
        (error) => {
          setMessage("Geolocation error: " + error.message);
          setTracking(false);
        }
      );
    } else {
      setMessage("Geolocation is not supported by your browser");
    }
  };

  const stopTracking = () => {
    setTracking(false);
    setLocation(null);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setMessage("");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="full-screen">
      <div className="card animate-fade-in">
        <h2>GPS Tracking</h2>
        {!tracking ? (
          <button onClick={startTracking}>Start Tracking</button>
        ) : (
          <button onClick={stopTracking} className="bg-gray-600 hover:bg-gray-700">
            Stop Tracking
          </button>
        )}
        {location && (
          <div id="map"></div>
        )}
        {location && (
          <div className="mt-4 text-center">
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}
        {message && <p>{message}</p>}
        <button
          onClick={logout}
          className="mt-4 bg-gray-600 hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Tracking;