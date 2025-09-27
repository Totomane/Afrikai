import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Globe from 'globe.gl';

export interface CountryData {
  properties: { NAME?: string; name?: string };
  geometry: any;
}

interface GlobeMapProps {
  selectedCountry: CountryData | null;
  setSelectedCountry: (country: CountryData | null) => void;
  setZoomedCountry: (country: CountryData | null) => void;
}

export interface GlobeMapRef {
  resetToInitialView: () => void;
}

export const GlobeMap = forwardRef<GlobeMapRef, GlobeMapProps>(({
  selectedCountry,
  setSelectedCountry,
  setZoomedCountry,
}, ref) => {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);

  // Ref pour toujours avoir la sélection à jour dans les handlers
  const selectedRef = useRef<CountryData | null>(null);

  // Initial camera position
  const initialCameraPosition = { lat: 5, lng: 17, altitude: 2 };

  // Expose reset function to parent component
  useImperativeHandle(ref, () => ({
    resetToInitialView: () => {
      if (globeInstance.current) {
        globeInstance.current.pointOfView(initialCameraPosition, 1000);
      }
    }
  }));

  const isCountrySelected = (d: CountryData, sel: CountryData | null) => {
    if (!sel) return false;
    const dName = d.properties?.NAME || d.properties?.name;
    const selName = sel.properties?.NAME || sel.properties?.name;
    return dName === selName;
  };

  const getCountryCenter = (geometry: any) => {
    let allCoords: number[][] = [];

    if (geometry.type === "Polygon") {
      allCoords = geometry.coordinates[0];
    } else if (geometry.type === "MultiPolygon") {
      allCoords = geometry.coordinates.flat(2);
    }

    if (!allCoords.length) return { lat: 0, lng: 0 };

    const lngSum = allCoords.reduce((sum, c) => sum + c[0], 0);
    const latSum = allCoords.reduce((sum, c) => sum + c[1], 0);

    return {
      lat: latSum / allCoords.length,
      lng: lngSum / allCoords.length
    };
  };

  // Applique styles (highlight + altitude)
  const updatePolygonStyles = (
    globe: any,
    selected: CountryData | null,
    hovered: CountryData | null = null
  ) => {
    globe
      .polygonCapColor((d: CountryData) => {
        if (isCountrySelected(d, selected)) return '#2563eb'; // sélection (blue-600)
        if (hovered && d === hovered) return '#3b82f6'; // survol (blue-500)
        return '#e0e7ef'; // normal (white-ish)
      })
      .polygonAltitude((d: CountryData) => {
        if (isCountrySelected(d, selected)) return 0.06; // élevé si sélection
        if (hovered && d === hovered) return 0.06;       // élevé au survol
        return 0.01;
      });
  };

  // Init du globe
  useEffect(() => {
    if (!globeEl.current) return;

    const globe = (Globe as any)()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(window.innerWidth)
      .height(window.innerHeight)
      .showAtmosphere(true)
      .atmosphereColor('#4f46e5')
      .atmosphereAltitude(0.15)
      .polygonsTransitionDuration(250); // animation fluide

    fetch('/src/assets/custom.geo.json')
      .then(res => res.json())
      .then(countries => {
        globe
          .polygonsData(countries.features)
          .polygonSideColor(() => 'rgba(59, 130, 246, 0.15)') // blue-500/15
          .polygonStrokeColor(() => '#2563eb') // blue-600
          .polygonLabel(
            (d: CountryData) =>
              `<div style="
                background: rgba(30, 64, 175, 0.85); /* blue-800 */
                color: #e0e7ef;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              ">
                ${d.properties?.NAME || d.properties?.name || 'Unknown'}
              </div>`
          )
          .onPolygonHover((polygon: CountryData | null) => {
            updatePolygonStyles(globeInstance.current, selectedRef.current, polygon);

            if (!polygon) {
              // souris sortie → réapplique uniquement la sélection
              updatePolygonStyles(globeInstance.current, selectedRef.current);
            }
          })
          .onPolygonClick((polygon: CountryData) => {
            if (!polygon) return;
            console.log(
              `Clicked country: ${polygon.properties?.NAME || polygon.properties?.name || 'Unknown'}`
            );
            setSelectedCountry(polygon);
            setZoomedCountry(polygon);

            // feedback immédiat
            updatePolygonStyles(globeInstance.current, polygon);
          });

        globe.pointOfView(initialCameraPosition);
      })
      .catch(err => console.error(err));

    globe(globeEl.current);
    globeInstance.current = globe;

    const handleResize = () => {
      if (globeInstance.current) {
        globeInstance.current.width(window.innerWidth).height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quand la sélection change depuis React
  useEffect(() => {
    selectedRef.current = selectedCountry;
    if (!globeInstance.current) return;

    updatePolygonStyles(globeInstance.current, selectedRef.current);

    if (selectedCountry) {
      const { lat, lng } = getCountryCenter(selectedCountry.geometry);
      globeInstance.current.pointOfView({ lat, lng, altitude: 0.8 }, 1000);
    }
  }, [selectedCountry]);

  return <div ref={globeEl} className="absolute inset-0 top-0" />;
});
