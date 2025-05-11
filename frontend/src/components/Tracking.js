import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet"; // Importar Leaflet
import "leaflet/dist/leaflet.css"; // Importar estilos de Leaflet

const Tracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState("");
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const mapRef = useRef(null); // Referencia al contenedor del mapa

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location && !mapRef.current) {
      // Inicializar el mapa solo una vez
      mapRef.current = L.map("map").setView([location.latitude, location.longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
      L.marker([location.latitude, location.longitude]).addTo(mapRef.current);
    } else if (location && mapRef.current) {
      // Actualizar el mapa si la ubicación cambia
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
                user_id: 1, // Reemplaza con un ID de usuario dinámico
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="neumorphic max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          GPS Tracking
        </h2>
        {!tracking ? (
          <button
            onClick={startTracking}
            className="neumorphic-button w-full bg-secondary text-primary animate-pulse"
          >
            Start Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="neumorphic-button w-full bg-darkGray text-softWhite"
          >
            Stop Tracking
          </button>
        )}
        {location && (
          <div id="map" className="h-64 mt-4 rounded-lg overflow-hidden">
            {/* Contenedor para el mapa */}
          </div>
        )}
        {location && (
          <div className="mt-4 text-center text-darkGray">
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}
        {message && (
          <p className="mt-4 text-center text-sm text-darkGray animate-fade-in">
            {message}
          </p>
        )}
        <button
          onClick={logout}
          className="neumorphic-button w-full mt-4 bg-darkGray text-softWhite"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Tracking;