import { useEffect } from "react"
import { LatLngExpression } from "leaflet"
import { useMap } from "react-leaflet"

type Props = {
  center: LatLngExpression
  zoom?: number
}

const MapCenterUpdater = ({ center, zoom = 15 }: Props) => {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.5,
    })
  }, [center, map, zoom])

  return null
}

export default MapCenterUpdater
