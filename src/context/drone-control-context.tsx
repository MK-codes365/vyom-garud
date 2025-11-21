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

interface DroneControlContextType {
  droneOffset: { lat: number; lng: number; alt: number };
  moveDrone: (direction: string, distance: number) => void;
  setAltitude: (altitude: number) => void;
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
  const [geofences, setGeofences] = useState<Geofence[]>([
    { id: 1, name: "Mission Area", lat: 0, lng: 0, radius: 500, active: true },
    { id: 2, name: "No-Fly Zone 1", lat: 0.003, lng: 0.003, radius: 100, active: true },
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

  return (
    <DroneControlContext.Provider 
      value={{ 
        droneOffset, 
        moveDrone, 
        setAltitude,
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
