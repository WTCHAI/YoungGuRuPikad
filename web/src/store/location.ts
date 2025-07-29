import type { LatLngExpression, Map as LeafletMap } from "leaflet"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

const dataLocationMap: Record<string, LatLngExpression> = {
  "2025-07-25": [13.7466, 100.5395], // Central World
  "2025-07-26": [13.746, 100.5346], // Siam Paragon
  "2025-07-27": [13.8008, 100.552], // Chatuchak
  "2025-07-28": [13.7372, 100.5609], // Asoke
  "2025-07-29": [13.7651, 100.6423], // Bang Kapi
  "2025-07-30":[11.562108,104.888535], // Phnom Penh, Cambodia :contentReference[oaicite:3]{index=3}
  "2025-07-31":[13.364047,103.860313], // Siem Reap, Cambodia :contentReference[oaicite:4]{index=4}
  "2025-08-01":[13.095453,103.182907], // Battambang, Cambodia :contentReference[oaicite:5]{index=5}
  "2025-08-02":[10.594242,104.164032], // Kampot, Cambodia :contentReference[oaicite:6]{index=6}
  // Back to Bangkok
  "2025-08-03":[13.730833,100.524167], // Bang Rak (Bangkok) :contentReference[oaicite:7]{index=7}
  "2025-08-04":[13.809722,100.537222], // Bang Sue (Bangkok) :contentReference[oaicite:8]{index=8}
  "2025-08-05":[13.873889,100.596389], // Bang Khen (Bangkok) :contentReference[oaicite:9]{index=9}
  "2025-08-06":[13.696111,100.409444], // Bang Khae (Bangkok) :contentReference[oaicite:10]{index=10}
  "2025-08-07":[13.680081,100.5918],   // Bang Na (Bangkok) :contentReference[oaicite:11]{index=11}
}

type LocationStore = {
  selectedLocation: LatLngExpression

  actions: {
    setSelectedDate: (date: Date | undefined) => void
    setSelectedLocation: (location: LatLngExpression) => void
  }

  selectedDate: Date | undefined
}

const today = new Date()
const todayKey = today.toLocaleDateString("sv-SE")

export const useLocationStore = create<LocationStore>()(
  devtools((set) => ({
    selectedDate: today,
    selectedLocation: dataLocationMap[todayKey] || [11.562108,104.888535], // Default to Phanom Penh if no date matches
    actions: {
      setSelectedDate: (date) => {
        set({ selectedDate: date })
        const key = date.toLocaleDateString("sv-SE")

        const location = dataLocationMap[key]
        if (location) {
          set({ selectedLocation: location })
        }
      },
      setSelectedLocation: (location) => set({ selectedLocation: location }),
    },
  }))
)
