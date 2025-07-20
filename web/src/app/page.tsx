"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { LatLngExpression } from "leaflet"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PopoverDatePicker from "@/components/popover-date-picker"
import { useLocationStore } from "@/store/location"

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  loading: () => <div>Loading map...</div>,
  ssr: false,
})

export default function Home() {
  const selectedLocation = useLocationStore((state) => state.selectedLocation)
  const [radius, setRadius] = useState<number | undefined>(5) // Default radius in km
  const [markedPosition, setMarkedPosition] = useState<
    LatLngExpression | undefined
  >()
  const selectedDate = useLocationStore((state) => state.selectedDate)

  const handleGenProof = () => {
    console.log("Radius:", radius)
    console.log("Marked Position:", markedPosition)
    console.log("Selected Location:", selectedLocation)
  }

  const handleRemoveMarkedPosition = () => {
    setMarkedPosition(undefined)
  }

  return (
    <main className="container flex h-screen flex-col space-y-6 p-6">
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="flex gap-3">
          <Label>Date</Label>
          <PopoverDatePicker />
        </div>

        <div className="flex gap-3">
          <Label htmlFor="radius">Radius</Label>
          <Input
            id="radius"
            type="number"
            step="any"
            placeholder="Radius (km)"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
          />
        </div>

        <Button onClick={handleRemoveMarkedPosition} disabled={!markedPosition}>
          Remove Marked Position
        </Button>
      </div>

      <div className="relative z-0 flex flex-1">
        <MapContainer
          center={selectedLocation}
          zoom={15}
          markedPosition={markedPosition}
          onMarkPositionChange={setMarkedPosition}
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleGenProof}
          disabled={!markedPosition || !radius || radius <= 0}
        >
          Gen Proof
        </Button>
      </div>
    </main>
  )
}
