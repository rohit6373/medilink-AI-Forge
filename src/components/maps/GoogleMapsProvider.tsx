import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserGpsLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  address?: string;
}

interface LocationContextValue {
  apiKey: string;
  hasApiKey: boolean;
  userLocation: UserGpsLocation | null;
  isLocating: boolean;
  locateError: string | null;
  requestUserLocation: () => Promise<UserGpsLocation | null>;
  setUserLocation: (loc: UserGpsLocation | null) => void;
  selectedMapHospitalId: string | null;
  setSelectedMapHospitalId: (id: string | null) => void;
  mapCenter: { lat: number; lng: number };
  setMapCenter: (center: { lat: number; lng: number }) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  highlightedRoute: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } | null;
  setHighlightedRoute: (route: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } | null) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

// Default Metro coordinates (San Francisco Metro medical cluster)
export const DEFAULT_MAP_CENTER = { lat: 37.7749, lng: -122.4194 };
export const DEFAULT_MAP_ZOOM = 13;

export const GoogleMapsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserGpsLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [selectedMapHospitalId, setSelectedMapHospitalId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_MAP_ZOOM);
  const [highlightedRoute, setHighlightedRoute] = useState<{ origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } | null>(null);

  // Request browser GPS position
  const requestUserLocation = async (): Promise<UserGpsLocation | null> => {
    setIsLocating(true);
    setLocateError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocateError('Geolocation is not supported by this browser.');
        setIsLocating(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: UserGpsLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            address: 'Your Live GPS Location',
          };
          setUserLocation(loc);
          setMapCenter({ lat: loc.latitude, lng: loc.longitude });
          setMapZoom(14);
          setIsLocating(false);
          resolve(loc);
        },
        (error) => {
          let message = 'Could not acquire GPS position.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location permission was denied. Using hospital reference position.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location signal is unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setLocateError(message);
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const contextValue: LocationContextValue = {
    apiKey: '',
    hasApiKey: false,
    userLocation,
    isLocating,
    locateError,
    requestUserLocation,
    setUserLocation,
    selectedMapHospitalId,
    setSelectedMapHospitalId,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    highlightedRoute,
    setHighlightedRoute,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useGoogleMaps = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

// Also export as NetworkLocationProvider for semantic cleanliness
export const NetworkLocationProvider = GoogleMapsProvider;
export const useNetworkLocation = useGoogleMaps;
