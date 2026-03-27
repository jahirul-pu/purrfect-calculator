import mapboxgl from 'mapbox-gl';

export interface MapLocation {
  lat: number;
  lng: number;
}

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

export async function fetchIsochrone(location: MapLocation, rangeKm: number): Promise<any> {
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/driving/${location.lng},${location.lat}?contours_meters=${Math.round(rangeKm * 1000)}&polygons=true&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Isochrone API Error');
    return await response.ok ? response.json() : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function calculateDistance(loc1: MapLocation, loc2: MapLocation): number {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function generateCirclePolygon(center: MapLocation, radiusKm: number, points = 64) {
  const coords: number[][] = [];
  const distanceX = radiusKm / (111.32 * Math.cos(center.lat * Math.PI / 180));
  const distanceY = radiusKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center.lng + x, center.lat + y]);
  }
  coords.push(coords[0]); // close the polygon

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}

export async function fetchRoute(start: MapLocation, end: MapLocation): Promise<any> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Directions API Error');
    const data = await response.json();
    return {
      geometry: data.routes[0].geometry,
      distance: data.routes[0].distance // in meters
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
