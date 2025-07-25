import { LatLngExpression } from "leaflet"
import { useMapEvents } from "react-leaflet"

const MapClickHandler = ({
  onMarkPositionChange,
}: {
  onMarkPositionChange: (position: LatLngExpression) => void
}) => {
  useMapEvents({
    click: (event) => {
      const { lat, lng } = event.latlng
      onMarkPositionChange([lat, lng])
    },
  })

  return null
}

export default MapClickHandler
