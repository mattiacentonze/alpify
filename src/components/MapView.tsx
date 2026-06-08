import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Location } from "../types";
import { markerColor } from "../lib/ui";

function markerIcon(location: Location) {
  return L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:14px;background:${markerColor(location.crowdingLevel)};border:3px solid white;box-shadow:0 10px 24px rgba(16,42,67,.22);display:grid;place-items:center;color:#102A43;font-weight:900;font-size:13px">${location.basePoints}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export function MapView({ locations, onSelect }: { locations: Location[]; onSelect: (location: Location) => void }) {
  const markerLocations = locations.filter((location): location is Location & { lat: number; lng: number } => location.lat !== undefined && location.lng !== undefined);
  const center = markerLocations[0] ? ([markerLocations[0].lat, markerLocations[0].lng] as [number, number]) : ([47.69, 10.33] as [number, number]);

  return (
    <div className="h-[calc(100dvh-250px)] min-h-[430px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm sm:h-[520px] lg:h-[620px] lg:rounded-[2rem]">
      <MapContainer center={center} zoom={10} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerLocations.map((location) => (
          <Marker key={location.id} position={[location.lat, location.lng]} icon={markerIcon(location)} eventHandlers={{ click: () => onSelect(location) }}>
            <Popup>
              <button type="button" onClick={() => onSelect(location)} className="text-left">
                <strong>{location.name}</strong>
                <br />
                {location.crowdingLevel} crowding · {location.basePoints} pts
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
