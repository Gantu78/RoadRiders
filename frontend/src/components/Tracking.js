import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Tracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [distance, setDistance] = useState(0); // in kilometers
  const [duration, setDuration] = useState(0); // in seconds
  const [completedRoutes, setCompletedRoutes] = useState([]); 
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState(null);
  
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

useEffect(() => {
  if (location && !mapRef.current && document.getElementById("map")) {
    mapRef.current = L.map("map").setView([location.latitude, location.longitude], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);
    L.marker([location.latitude, location.longitude]).addTo(mapRef.current);
  } else if (location && mapRef.current && !paused) {
    mapRef.current.setView([location.latitude, location.longitude]);
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
      if (layer instanceof L.Polyline) mapRef.current.removeLayer(layer);
    });
    L.marker([location.latitude, location.longitude]).addTo(mapRef.current);
    if (routePoints.length > 1) {
      L.polyline(routePoints, { color: "red" }).addTo(mapRef.current);
    }
  }
  return () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };
}, [location, routePoints, paused]);

  const startTracking = () => {
    if ("geolocation" in navigator) {
      setTracking(true);
      setPaused(false);
      setRoutePoints([]);
      setDistance(0);
      setDuration(0);
      setStartTime(Date.now());
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);// Increment every second
   const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        if (!paused) {
          setRoutePoints((prev) => [...prev, [latitude, longitude]]);
          calculateDistanceAndDuration([latitude, longitude]);
        }
      },
      (error) => {
        setMessage("Geolocation error: " + error.message);
        setTracking(false);
      }
    );
    watchIdRef.current = watchId;
  } else if (paused) {
    setPaused(false); // Resume tracking
    setStartTime(Date.now() - duration * 1000); // Adjust start time to account for elapsed duration
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
  } else {
    setMessage("Geolocation is not supported by your browser");
  }
};

const pauseTracking = () => {
  setPaused(true);
  if (durationIntervalRef.current) {
    clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = null;
  }
};

const calculateDistanceAndDuration = (newPoint) => {
  if (routePoints.length > 0) {
    const prevPoint = routePoints[routePoints.length - 1];
    const newDistance = getDistanceFromLatLonInKm(
      prevPoint[0],
      prevPoint[1],
      newPoint[0],
      newPoint[1]
    );
    setDistance((prev) => prev + newDistance);
  }
};


// Haversine formula to calculate distance between two points
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

const finalizeTracking = async () => {
  if (routePoints.length > 0) {
    const routeData = JSON.stringify(routePoints);
    try {
      const response = await fetch("/api/save-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          route_data: routeData,
          distance: parseFloat(distance.toFixed(2)), // Ensure distance is a number
          duration: parseInt(duration), // Ensure duration is an integer
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const result = await response.json();
      const newRoute = result.data[0]; // Supabase returns an array of inserted rows
      setCompletedRoutes((prev) => [
        ...prev,
        {
          id: newRoute.id,
          distance: parseFloat(newRoute.distance),
          duration: newRoute.duration,
          created_at: newRoute.created_at,
        },
      ]);
      stopTracking();
      setMessage("Route saved successfully");
    } catch (error) {
      setMessage("Failed to save route: " + error.message);
    }
  }
};

const stopTracking = () => {
  if (watchIdRef.current) {
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }
  if (durationIntervalRef.current) {
    clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = null;
  }
  setTracking(false);
  setPaused(false);
  setLocation(null);
  setStartTime(null);
  if (mapRef.current) {
    mapRef.current.remove();
    mapRef.current = null;
  }
  setMessage("");
};

  if (!isAuthenticated) return null;

 return (
  <div className="full-screen flex">
    {/* Left Panel for Completed Routes */}
    <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto h-screen">
      <h3 className="text-xl text-white mb-4">Completed Routes</h3>
      {completedRoutes.map((route) => (
        <div key={route.id} className="bg-gray-700 p-2 mb-2 rounded text-white">
          <p>Distance: {route.distance} km</p>
          <p>Duration: {Math.floor(route.duration / 60)}m {route.duration % 60}s</p>
          <p>Created: {new Date(route.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
    {/* Main Content */}
    <div className="w-3/4">
      <div className="card animate-fade-in">
        <h2>GPS Tracking</h2>
        {!tracking ? (
          <button onClick={startTracking}>Start Tracking</button>
        ) : paused ? (
          <>
            <button onClick={() => setPaused(false)} className="bg-blue-600 hover:bg-blue-700 mr-2">
              Resume
            </button>
            <button onClick={finalizeTracking} className="bg-green-600 hover:bg-green-700 mr-2">
              Finalize
            </button>
            <button onClick={stopTracking} className="bg-gray-600 hover:bg-gray-700">
              Stop
            </button>
          </>
        ) : (
          <>
            <button onClick={pauseTracking} className="bg-yellow-600 hover:bg-yellow-700 mr-2">
              Pause
            </button>
            <button onClick={finalizeTracking} className="bg-green-600 hover:bg-green-700 mr-2">
              Finalize
            </button>
            <button onClick={stopTracking} className="bg-gray-600 hover:bg-gray-700">
              Stop
            </button>
          </>
        )}
        {location && <div id="map"></div>}
        {location && (
          <div className="mt-4 text-center">
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <p>Distance: {distance.toFixed(2)} km</p>
            <p>Duration: {Math.floor(duration / 60)}m {duration % 60}s</p>
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
}

export default Tracking;