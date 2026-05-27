
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Route } from '@/types/models';

interface RoutesMapProps {
  routes: Route[];
  selectedRouteId?: string;
}

// Temporary mapbox token - should be replaced with a proper configuration
// Users should add their own token from mapbox.com
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Albanian map center coordinates
const ALBANIA_CENTER: [number, number] = [20.1683, 41.1533];

// Route colors - Each route will get a distinct color
const ROUTE_COLORS = ['#9b87f5', '#F97316', '#0EA5E9', '#8B5CF6', '#ea384c'];

const RoutesMap: React.FC<RoutesMapProps> = ({ routes, selectedRouteId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: ALBANIA_CENTER,
      zoom: 7
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    return () => {
      map.current?.remove();
    };
  }, []);
  
  // Handle route rendering
  useEffect(() => {
    if (!map.current || !routes.length) return;
    
    const mapInstance = map.current;
    
    // Wait for the map to load before adding sources and layers
    mapInstance.on('load', () => {
      // Remove any existing route layers and sources
      routes.forEach((_, idx) => {
        const id = `route-${idx}`;
        if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
        if (mapInstance.getSource(id)) mapInstance.removeSource(id);
      });
      
      // Add each route as a separate source and layer
      routes.forEach((route, idx) => {
        // Generate simple route path based on stations coordinates
        // In a real app, you would use actual route coordinates
        if (route.stations.length < 2) return;
        
        const coordinates = route.stations.map(station => [station.longitude, station.latitude]);
        const routeId = `route-${idx}`;
        const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
        
        // Add source
        mapInstance.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates
            }
          }
        });
        
        // Add layer
        mapInstance.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': color,
            'line-width': selectedRouteId === route.id ? 5 : 3,
            'line-opacity': selectedRouteId ? (selectedRouteId === route.id ? 1 : 0.5) : 0.8
          }
        });
        
        // Add stations as points
        route.stations.forEach((station, stationIdx) => {
          const stationId = `station-${idx}-${stationIdx}`;
          
          // Add station marker
          new mapboxgl.Marker({ color })
            .setLngLat([station.longitude, station.latitude])
            .setPopup(new mapboxgl.Popup().setHTML(`
              <h3>${station.name}</h3>
              <p>${station.city}, ${station.state}</p>
            `))
            .addTo(mapInstance);
        });
      });
      
      // Fit map to show all routes
      if (routes.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        routes.forEach(route => {
          route.stations.forEach(station => {
            bounds.extend([station.longitude, station.latitude]);
          });
        });
        mapInstance.fitBounds(bounds, { padding: 50 });
      }
    });
  }, [routes, selectedRouteId]);
  
  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-md">
      <div ref={mapContainer} className="h-[400px] w-full" />
    </div>
  );
};

export default RoutesMap;
