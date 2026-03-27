import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Target, Zap, Fuel, RefreshCw, LocateFixed, AlertTriangle } from "lucide-react";
import { MAPBOX_TOKEN, fetchIsochrone, fetchRoute, generateCirclePolygon, calculateDistance, type MapLocation } from "@/lib/mapService";

interface RangeMapProps {
  rangeKm: number;
  vehicleType: "EV" | "Fuel";
}

export function RangeMap({ rangeKm: initialRange, vehicleType: initialType }: RangeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const startMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<MapLocation>({ lat: 23.8103, lng: 90.4125 }); // Default Dhaka
  const [rangeKm, setRangeKm] = useState(initialRange || 100);
  const [vehicleType, setVehicleType] = useState<"EV" | "Fuel">(initialType || "EV");
  const [useIsochrone, setUseIsochrone] = useState(false);
  const [destination, setDestination] = useState<MapLocation | null>(null);
  const [roadDistance, setRoadDistance] = useState<number | null>(null); // in km
  const [isReachable, setIsReachable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Geolocation Effect
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(newLoc);
        map.current?.flyTo({ center: [newLoc.lng, newLoc.lat], zoom: 11 });
      });
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [userLocation.lng, userLocation.lat],
      zoom: 9
    });

    map.current.on('load', () => {
      // Add Sources
      map.current?.addSource('range-area', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.current?.addLayer({
        id: 'range-layer',
        type: 'fill',
        source: 'range-area',
        layout: {},
        paint: {
          'fill-color': vehicleType === 'EV' ? '#3b82f6' : '#10b981',
          'fill-opacity': 0.2
        }
      });

      map.current?.addLayer({
        id: 'range-outline',
        type: 'line',
        source: 'range-area',
        layout: {},
        paint: {
          'line-color': vehicleType === 'EV' ? '#3b82f6' : '#10b981',
          'line-width': 2,
          'line-dasharray': [2, 1]
        }
      });

      // Route Source & Layer
      map.current?.addSource('route-line', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
      });

      map.current?.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f43f5e',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setDestination({ lat, lng });
    });

    return () => map.current?.remove();
  }, []);

  // Update Range Visualization
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const updateVisualization = async () => {
      setLoading(true);
      let data;
      if (useIsochrone && rangeKm > 0) {
        data = await fetchIsochrone(userLocation, rangeKm);
      } else {
        data = generateCirclePolygon(userLocation, rangeKm);
      }

      if (data && map.current?.getSource('range-area')) {
        (map.current.getSource('range-area') as mapboxgl.GeoJSONSource).setData(data);
      }
      setLoading(false);
    };

    updateVisualization();
  }, [rangeKm, useIsochrone, userLocation, vehicleType]);

  // Update Markers
  useEffect(() => {
    if (!map.current || !mapContainer.current) return;

    const setupMarkers = () => {
      // Start Marker
      if (!startMarker.current) {
        startMarker.current = new mapboxgl.Marker({ color: '#f43f5e' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map.current!);
      } else {
        startMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
      }

      // Destination Marker
      if (destination) {
        if (!destMarker.current) {
          destMarker.current = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat([destination.lng, destination.lat])
            .addTo(map.current!);
        } else {
          destMarker.current.setLngLat([destination.lng, destination.lat]);
        }
      } else if (destMarker.current) {
        destMarker.current.remove();
        destMarker.current = null;
      }
    };

    if (map.current.isStyleLoaded()) {
      setupMarkers();
    } else {
      map.current.on('style.load', setupMarkers);
    }
  }, [userLocation, destination]);

  // Destination Reachability & Route Check
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    if (destination) {
      const dist = calculateDistance(userLocation, destination);
      setIsReachable(dist <= rangeKm);

      const updateRoute = async () => {
        const result = await fetchRoute(userLocation, destination);
        if (result && map.current?.getSource('route-line')) {
          const { geometry, distance } = result;
          const distKm = distance / 1000;
          setRoadDistance(distKm);
          setIsReachable(distKm <= rangeKm);

          (map.current.getSource('route-line') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry
          });
        }
      };
      updateRoute();
    } else {
      setRoadDistance(null);
      if (map.current.getSource('route-line')) {
        (map.current.getSource('route-line') as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] }
        });
      }
    }
  }, [destination, rangeKm, userLocation]);

  return (
    <div className="w-full h-[600px] relative rounded-xl overflow-hidden border-2 shadow-xl animate-in fade-in duration-1000">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-4 w-72">
        <Card className="shadow-2xl border-2 bg-background/95 backdrop-blur">
          <CardHeader className="p-4 bg-muted/30">
            <CardTitle className="text-sm flex items-center justify-between">
              Vehicle Status
              {vehicleType === 'EV' ? <Zap className="h-4 w-4 text-primary" /> : <Fuel className="h-4 w-4 text-emerald-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" /> Input Range (km)
                </Label>
                <Input 
                  type="number" 
                  value={rangeKm} 
                  onChange={(e) => setRangeKm(Number(e.target.value))}
                  className="h-10 text-lg font-black"
                />
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Vehicle Type</Label>
                <div className="flex bg-muted p-1 rounded-lg">
                  <Button 
                    variant={vehicleType === 'EV' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 h-8 gap-1 text-[10px] font-bold"
                    onClick={() => setVehicleType('EV')}
                  >
                    <Zap className="h-3 w-3" /> EV
                  </Button>
                  <Button 
                    variant={vehicleType === 'Fuel' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="flex-1 h-8 gap-1 text-[10px] font-bold"
                    onClick={() => setVehicleType('Fuel')}
                  >
                    <Fuel className="h-3 w-3" /> FUEL
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="map-mode" className="text-xs font-bold uppercase cursor-pointer">Isochrone Mode</Label>
                <Switch 
                  id="map-mode" 
                  checked={useIsochrone} 
                  onCheckedChange={setUseIsochrone} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                {useIsochrone ? "Real driving constraints (roads, traffic)" : "Direct line simple radius"}
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2 text-[10px] font-bold h-9"
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                  setUserLocation(newLoc);
                  map.current?.flyTo({ center: [newLoc.lng, newLoc.lat], zoom: 13, essential: true });
                });
              }}
            >
              <LocateFixed className="h-3.5 w-3.5" /> Use My Location
            </Button>
          </CardContent>
        </Card>

        {destination && (
          <Card className="shadow-2xl border-2 animate-in slide-in-from-left bg-background/95 backdrop-blur">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <Target className="h-4 w-4 text-primary" /> Destination
              </div>
               <div className="p-3 rounded-lg border bg-muted/50">
                  <div className="space-y-1 mb-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex justify-between items-center">
                      <span>Road Distance</span>
                      <span className="text-foreground">{roadDistance ? roadDistance.toFixed(1) : '...'} km</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase flex justify-between items-center opacity-50">
                      <span>Air (Straight)</span>
                      <span>{calculateDistance(userLocation, destination).toFixed(1)} km</span>
                    </p>
                  </div>

                  <div className={`mt-2 text-sm font-black flex items-center gap-2 ${isReachable ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {isReachable ? '✓ Reachable' : '✕ Out of Range'}
                 </div>
                 
                 {isReachable && roadDistance && roadDistance > (rangeKm / 2) && (
                   <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-700 font-bold flex items-start gap-2 animate-pulse">
                     <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                     <span>Round Trip Alert: Distance exceeds 50% of range. You may need to {vehicleType === 'EV' ? 'charge' : 'refuel'} before the return trip.</span>
                   </div>
                 )}
              </div>
              <Button size="sm" variant="ghost" className="w-full text-[10px] h-6" onClick={() => setDestination(null)}>Clear Marker</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-background p-4 rounded-xl shadow-2xl border-2 border-primary/20">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-bold animate-pulse">Calculating Terrain...</span>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-background/90 backdrop-blur p-2 rounded-lg border shadow-lg text-[10px] font-bold uppercase tracking-tighter flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary" /> Reachable Area
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-rose-500" /> Start Point
          </div>
        </div>
      </div>
    </div>
  );
}
