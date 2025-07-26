"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { LatLngExpression } from "leaflet"
import { Navigation } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PopoverDatePicker from "@/components/popover-date-picker"
import { useLocationStore } from "@/store/location"
import { GenerateProof } from "@/utils/generating-proof"
import { bytesToHex } from "viem"

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  loading: () => <div>Loading map...</div>,
  ssr: false,
})

export default function Home() {
  const selectedLocation = useLocationStore((state) => state.selectedLocation)
  const setSelectedLocation = useLocationStore((state) => state.actions.setSelectedLocation)
  const [radius, setRadius] = useState<number | undefined>(1) // Default radius in km
  const [markedPosition, setMarkedPosition] = useState<
    LatLngExpression | undefined
  >()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [proofs, setProofs] = useState<{ proof: Uint8Array; publicInputs: string[] } | null>(null)
  const [mapKey, setMapKey] = useState(0) // เพื่อ force re-render map

  const handleGetUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      return
    }

    setIsGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation: LatLngExpression = [latitude, longitude]
        setMarkedPosition(newLocation)
        setMapKey(prev => prev + 1) // Force map to re-render and adjust bounds
        setIsGettingLocation(false)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }
    )
  }

  const handleGenProof = async() => {
    console.log("Radius:", radius)
    console.log("Marked Position:", markedPosition)
    console.log("Selected Location:", selectedLocation)
    const { proof, publicInputs} = await GenerateProof({
      position_x:  "10",
      position_y: "1", 
      radius: "10",
      target_x: "2",
      target_y: "3",
    })
    setProofs({ proof, publicInputs })
  }

  const handleRemoveMarkedPosition = () => {
    setMarkedPosition(undefined)
    setMapKey(prev => prev + 1) // Force map to re-render
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
            min={0}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
          />
        </div>

        <Button 
          onClick={handleGetUserLocation}
          disabled={isGettingLocation}
          variant="outline"
        >
          <Navigation size={16} className={isGettingLocation ? 'animate-spin' : ''} />
          {isGettingLocation ? 'หาตำแหน่ง...' : 'หาตำแหน่งของฉัน'}
        </Button>

        <Button onClick={handleRemoveMarkedPosition} disabled={!markedPosition}>
          Remove Marked Position
        </Button>
      </div>

      {locationError && (
        <div className="flex justify-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
            {locationError}
          </div>
        </div>
      )}

      <div className="relative z-0 flex flex-1">
        <MapContainer
          key={mapKey}
          center={selectedLocation}
          zoom={15}
          markedPosition={markedPosition}
          onMarkPositionChange={setMarkedPosition}
          radius={radius}
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

      {proofs && (
        <>
        <div> 
            {bytesToHex(proofs.proof)}

        </div>
        <div>
          {JSON.stringify(proofs.publicInputs as `0x${string}`[])}
        </div>
        </>
      )}
    </main>
  )
}
