"use client"

import { LatLngExpression } from "leaflet"
import {
  Circle,
  MapContainer as LeafletMapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"

import "leaflet/dist/leaflet.css"

import { useEffect } from "react"
import L from "leaflet"

import MapCenterUpdater from "./map-center-updater"
import MapClickHandler from "./map-click-handler"

// Fix for default marker icons not loading correctly
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const customIcon = L.icon({
  iconUrl: "/younggu.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

type MapContainerProps = {
  center: LatLngExpression
  zoom?: number
  onMarkPositionChange: (position: LatLngExpression) => void
  markedPosition?: LatLngExpression
  radius: number
}

const MapContainer = ({
  center,
  zoom,
  onMarkPositionChange,
  markedPosition,
  radius,
}: MapContainerProps) => {
  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ flexGrow: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <div>
        <Marker position={center} icon={customIcon}>
          <Popup>Younggu</Popup>
        </Marker>
        {radius && (
          <Circle
            center={center}
            radius={(radius ?? 0) * 1000}
            pathOptions={{ color: "red", fillOpacity: 0.2 }}
          />
        )}
      </div>

      <MapCenterUpdater center={center} zoom={zoom} />

      {markedPosition && (
        <Marker position={markedPosition}>
          <Popup>Wife Position</Popup>
        </Marker>
      )}

      <MapClickHandler onMarkPositionChange={onMarkPositionChange} />
    </LeafletMapContainer>
  )
}

export default MapContainer
