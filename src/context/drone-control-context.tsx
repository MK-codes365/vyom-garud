'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Geofence {
  id: number;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  active: boolean;
}

export interface Waypoint {
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  order: number;
}

export interface Mission {
  id: string;
  name: string;
  waypoints: Waypoint[];
  isActive: boolean;
  createdAt: number;
}

interface DroneControlContextType {
  droneOffset: { lat: number; lng: number; alt: number };
  moveDrone: (direction: string, distance: number) => void;
  setAltitude: (altitude: number) => void;
  flightMode: 'AUTO' | 'MANUAL';
  setFlightMode: (mode: 'AUTO' | 'MANUAL') => void;
  isArmed: boolean;
  arm: () => void;
  disarm: () => void;
  returnToHome: () => void;
  emergencyStop: () => void;
  mission: Mission;
  addWaypoint: (waypoint: Omit<Waypoint, 'id' | 'order'>) => void;
  removeWaypoint: (id: number) => void;
  uploadMission: () => void;
  clearMission: () => void;
  geofences: Geofence[];
  addGeofence: (geofence: Omit<Geofence, 'id'>) => void;
  removeGeofence: (id: number) => void;
  toggleGeofence: (id: number) => void;
  isInsideGeofence: (lat: number, lng: number) => boolean;
  getActiveGeofences: () => Geofence[];
}

const DroneControlContext = createContext<DroneControlContextType | undefined>(undefined);

export function DroneControlProvider({ children }: { children: React.ReactNode }) {
  const [droneOffset, setDroneOffset] = useState({ lat: 0, lng: 0, alt: 0 });
  const [flightMode, setFlightMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [isArmed, setIsArmed] = useState(false);
  const [mission, setMission] = useState<Mission>({
    id: 'default',
    name: 'Default Mission',
    waypoints: [],
    isActive: false,
    createdAt: Date.now(),
  });
  const [geofences, setGeofences] = useState<Geofence[]>([
    { id: 1, name: "Mission Area", lat: 34.0522, lng: -118.2437, radius: 500, active: true },
    { id: 2, name: "No-Fly Zone 1", lat: 34.0522, lng: -118.2437, radius: 100, active: true },
  ]);

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if point is inside any active geofence
  const isInsideGeofence = useCallback((lat: number, lng: number): boolean => {
    const activeGeofences = geofences.filter(g => g.active);
    if (activeGeofences.length === 0) return true; // If no geofences, always allow
    
    // Must be inside at least one geofence to be valid
    return activeGeofences.some(fence => {
      const distance = calculateDistance(lat, lng, fence.lat, fence.lng);
      return distance <= fence.radius;
    });
  }, [geofences]);

  const getActiveGeofences = useCallback(() => {
    return geofences.filter(g => g.active);
  }, [geofences]);

  const moveDrone = useCallback((direction: string, distance: number = 0.0001) => {
    setDroneOffset((prev) => {
      const offset = distance / 111320; // Convert meters to degrees
      let newOffset = { ...prev };
      
      switch (direction.toLowerCase()) {
        case 'forward':
          newOffset = { ...prev, lat: prev.lat + offset };
          break;
        case 'backward':
          newOffset = { ...prev, lat: prev.lat - offset };
          break;
        case 'left':
          newOffset = { ...prev, lng: prev.lng - offset };
          break;
        case 'right':
          newOffset = { ...prev, lng: prev.lng + offset };
          break;
        case 'ascend':
          newOffset = { ...prev, alt: prev.alt + 5 };
          break;
        case 'descend':
          newOffset = { ...prev, alt: Math.max(0, prev.alt - 5) };
          break;
        default:
          return prev;
      }

      // Check if new position is inside geofence - restrict movement if outside
      const actualLat = 34.0522 + newOffset.lat;
      const actualLng = -118.2437 + newOffset.lng;
      if (!isInsideGeofence(actualLat, actualLng)) {
        return prev; // Don't move if it would exit geofence
      }
      return newOffset;
    });
  }, [isInsideGeofence]);

  const setAltitude = useCallback((altitude: number) => {
    setDroneOffset((prev) => ({ ...prev, alt: altitude }));
  }, []);

  const addGeofence = useCallback((geofence: Omit<Geofence, 'id'>) => {
    const id = Math.max(...geofences.map(g => g.id), 0) + 1;
    setGeofences(prev => [...prev, { ...geofence, id }]);
  }, [geofences]);

  const removeGeofence = useCallback((id: number) => {
    setGeofences(prev => prev.filter(g => g.id !== id));
  }, []);

  const toggleGeofence = useCallback((id: number) => {
    setGeofences(prev => 
      prev.map(g => g.id === id ? { ...g, active: !g.active } : g)
    );
  }, []);

  // Immediate Control Functions
  const arm = useCallback(() => {
    setIsArmed(true);
  }, []);

  const disarm = useCallback(() => {
    setIsArmed(false);
    setMission(prev => ({ ...prev, isActive: false }));
  }, []);

  const returnToHome = useCallback(() => {
    setDroneOffset({ lat: 0, lng: 0, alt: 0 });
  }, []);

  const emergencyStop = useCallback(() => {
    setIsArmed(false);
    setMission(prev => ({ ...prev, isActive: false }));
    setDroneOffset({ lat: 0, lng: 0, alt: 0 });
  }, []);

  // Mission Functions
  const addWaypoint = useCallback((waypoint: Omit<Waypoint, 'id' | 'order'>) => {
    const id = Math.max(...mission.waypoints.map(w => w.id), 0) + 1;
    const order = mission.waypoints.length + 1;
    setMission(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, { ...waypoint, id, order }],
    }));
  }, [mission.waypoints]);

  const removeWaypoint = useCallback((id: number) => {
    setMission(prev => ({
      ...prev,
      waypoints: prev.waypoints
        .filter(w => w.id !== id)
        .map((w, idx) => ({ ...w, order: idx + 1 })),
    }));
  }, []);

  const uploadMission = useCallback(() => {
    setMission(prev => ({ ...prev, isActive: true }));
  }, []);

  const clearMission = useCallback(() => {
    setMission(prev => ({
      ...prev,
      waypoints: [],
      isActive: false,
    }));
  }, []);

  return (
    <DroneControlContext.Provider 
      value={{ 
        droneOffset, 
        moveDrone, 
        setAltitude,
        flightMode,
        setFlightMode,
        isArmed,
        arm,
        disarm,
        returnToHome,
        emergencyStop,
        mission,
        addWaypoint,
        removeWaypoint,
        uploadMission,
        clearMission,
        geofences,
        addGeofence,
        removeGeofence,
        toggleGeofence,
        isInsideGeofence,
        getActiveGeofences,
      }}
    >
      {children}
    </DroneControlContext.Provider>
  );
}

export function useDroneControl() {
  const context = useContext(DroneControlContext);
  if (!context) {
    throw new Error('useDroneControl must be used within DroneControlProvider');
  }
  return context;
}
