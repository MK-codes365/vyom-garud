"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDroneControl } from '@/context/drone-control-context';

interface MapComponentProps {
  dronePosition: { lat: number; lng: number; alt: number };
  latitude: number;
  longitude: number;
  altitude: number;
}

// Custom drone marker icon
const droneIcon = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
      position: relative;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
  className: 'drone-marker'
});

// Home marker icon
const homeIcon = L.divIcon({
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      mask-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z%22/%3E%3C/svg%3E');
      -webkit-mask-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z%22/%3E%3C/svg%3E');
      border: 2px solid white;
    ">
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function MapComponent({
  dronePosition,
  latitude,
  longitude,
  altitude,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const droneMarker = useRef<L.Marker | null>(null);
  const homeMarker = useRef<L.Marker | null>(null);
  const polyline = useRef<L.Polyline | null>(null);
  const geofenceCircles = useRef<Map<number, L.Circle>>(new Map());
  const positionsRef = useRef<[number, number][]>([]);
  const { droneOffset, geofences } = useDroneControl();

  // Calculate actual position with offset from manual control
  const actualLatitude = latitude + droneOffset.lat;
  const actualLongitude = longitude + droneOffset.lng;
  const actualAltitude = altitude + droneOffset.alt;

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([actualLatitude, actualLongitude], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Add home marker (starting position)
      homeMarker.current = L.marker([latitude, longitude], { icon: homeIcon })
        .addTo(map.current)
        .bindPopup(`<b>Home Base</b><br/>Lat: ${latitude.toFixed(4)}<br/>Lng: ${longitude.toFixed(4)}`);
    }

    // Update geofence circles
    if (map.current) {
      geofences.forEach(fence => {
        if (fence.active) {
          if (!geofenceCircles.current.has(fence.id)) {
            const circle = L.circle([fence.lat, fence.lng], {
              radius: fence.radius,
              color: '#ef4444',
              weight: 2,
              opacity: 0.6,
              fillColor: '#dc2626',
              fillOpacity: 0.1,
              dashArray: '5, 5',
            })
              .addTo(map.current as L.Map)
              .bindPopup(`<b>${fence.name}</b><br/>Radius: ${fence.radius}m`);
            geofenceCircles.current.set(fence.id, circle);
          }
        } else {
          // Remove inactive geofences from map
          if (geofenceCircles.current.has(fence.id)) {
            const circle = geofenceCircles.current.get(fence.id);
            if (map.current && circle) {
              map.current.removeLayer(circle);
            }
            geofenceCircles.current.delete(fence.id);
          }
        }
      });

      // Remove geofences that no longer exist
      geofenceCircles.current.forEach((circle, id) => {
        if (!geofences.find(f => f.id === id)) {
          if (map.current) {
            map.current.removeLayer(circle);
          }
          geofenceCircles.current.delete(id);
        }
      });
    }

    // Update drone position
    if (map.current) {
      // Add position to trail
      const newPos: [number, number] = [actualLatitude, actualLongitude];
      positionsRef.current.push(newPos);
      
      // Keep only last 500 positions for performance
      if (positionsRef.current.length > 500) {
        positionsRef.current.shift();
      }

      // Update drone marker
      if (!droneMarker.current) {
        droneMarker.current = L.marker([actualLatitude, actualLongitude], { icon: droneIcon })
          .addTo(map.current)
          .bindPopup(`
            <b>Drone Position</b><br/>
            Lat: ${actualLatitude.toFixed(6)}<br/>
            Lng: ${actualLongitude.toFixed(6)}<br/>
            Alt: ${actualAltitude.toFixed(1)}m
          `);
      } else {
        droneMarker.current.setLatLng([actualLatitude, actualLongitude]);
        droneMarker.current.setPopupContent(`
          <b>Drone Position</b><br/>
          Lat: ${actualLatitude.toFixed(6)}<br/>
          Lng: ${actualLongitude.toFixed(6)}<br/>
          Alt: ${actualAltitude.toFixed(1)}m
        `);
      }

      // Update polyline (flight trail)
      if (positionsRef.current.length > 1) {
        if (!polyline.current) {
          polyline.current = L.polyline(positionsRef.current, {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 5',
          }).addTo(map.current);
        } else {
          polyline.current.setLatLngs(positionsRef.current);
        }
      }

      // Pan to drone if it's far from view
      const bounds = map.current.getBounds();
      if (!bounds.contains([actualLatitude, actualLongitude])) {
        map.current.panTo([actualLatitude, actualLongitude]);
      }
    }
  }, [latitude, longitude, altitude, actualLatitude, actualLongitude, actualAltitude, geofences]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
}
