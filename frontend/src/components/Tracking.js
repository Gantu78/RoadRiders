import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet";
import { createClient } from '@supabase/supabase-js';
import "leaflet/dist/leaflet.css";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const Tracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [completedRoutes, setCompletedRoutes] = useState([]);
  const [message, setMessage] = useState("");
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchCompletedRoutes = async () => {
      try {
        const { data, error } = await supabase.from('completed_routes').select('*').eq('user_id', 1);
        if (error) throw error;
        setCompletedRoutes(data || []);
      } catch (error) {
        setMessage("Failed to fetch routes: " + error.message);
      }
    };
    fetchCompletedRoutes();
  }, []);

useEffect(() => {
  if (location) {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    mapRef.current = L.map("map").setView([location.latitude, location.longitude], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);
    L.polyline(routePoints.map(p => [p.latitude, p.longitude]), { color: 'red' }).addTo(mapRef.current);
  }
}, [location, routePoints]);

  const startTracking = () => {
    if ("geolocation" in navigator) {
      setTracking(true);
      startTimeRef.current = Date.now();
      navigator.geolocation.watchPosition(
        async (position) => {
          if (!paused) {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            setRoutePoints(prev => [...prev, { latitude, longitude }]);
            try {
              const response = await fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: 1, latitude, longitude }),
              });
              if (!response.ok) throw new Error(await response.text());
            } catch (error) {
              setMessage("Failed to save track: " + error.message);
            }
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

  const pauseTracking = () => setPaused(true);
  const resumeTracking = () => setPaused(false);

  const finalizeTracking = async () => {
    setTracking(false);
    setPaused(false);
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const distance = calculateDistance(routePoints);
    const routeData = routePoints.map(p => [p.latitude, p.longitude]);
    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: 1, action: 'finalize', route_data: routeData, distance, duration }),
      });
      if (!response.ok) throw new Error(await response.text());
      const { data } = await response.json();
      setMessage("Route saved");
      setCompletedRoutes(prev => [...prev, data[0]]);
      setRoutePoints([]);
    } catch (error) {
      setMessage("Failed to save route: " + error.message);
    }
  };

  const calculateDistance = (points) => {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const R = 6371; // Earth's radius in km
      const dLat = toRad(p2.latitude - p1.latitude);
      const dLon = toRad(p2.longitude - p1.longitude);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(p1.latitude)) * Math.cos(toRad(p2.latitude)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance += R * c;
    }
    return distance.toFixed(2);
  };

  const toRad = (value) => value * Math.PI / 180;

  if (!isAuthenticated) return null;

  return (
    <div className="full-screen flex">
      <div className="w-1 bg-gray-800 p-4 overflow-y-auto h-full">
        <h3 className="text-white text-lg mb-2">Completed Routes</h3>
        {completedRoutes.map(route => (
          <div key={route.id} className="bg-gray-700 p-2 mb-2 rounded text-white">
            <p>Route ID: {route.id}</p>
            <p>Distance: {route.distance} km</p>
            <p>Duration: {Math.floor(route.duration / 60)}m {route.duration % 60}s</p>
          </div>
        ))}
      </div>
      <div className="w-3">
        <div className="card animate-fade-in">
          <h2>GPS Tracking</h2>
          {!tracking ? (
            <button onClick={startTracking}>Start Tracking</button>
          ) : paused ? (
            <button onClick={resumeTracking}>Resume Tracking</button>
          ) : (
            <button onClick={pauseTracking}>Pause Tracking</button>
          )}
          <button onClick={finalizeTracking} className="bg-red-600 hover:bg-red-700 ml-2">
            Finalize Tracking
          </button>
          {location && <div id="map" style={{ height: '400px' }}></div>}
          {location && (
            <div className="mt-4 text-center">
              <p>Latitude: {location.latitude}</p>
              <p>Longitude: {location.longitude}</p>
            </div>
          )}
          {message && <p>{message}</p>}
          <button onClick={logout} className="mt-4 bg-gray-600 hover:bg-gray-700">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tracking;