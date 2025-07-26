import type { LatLngExpression, Map as LeafletMap } from "leaflet"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

const dataLocationMap: Record<string, LatLngExpression> = {
  "2025-07-25": [13.7466, 100.5395], // Central World
  "2025-07-26": [13.746, 100.5346], // Siam Paragon
  "2025-07-27": [13.8008, 100.552], // Chatuchak
  "2025-07-28": [13.7372, 100.5609], // Asoke
  "2025-07-29": [13.7651, 100.6423], // Bang Kapi
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
    selectedLocation: dataLocationMap[todayKey] || [13.7466, 100.5395], // Default to Central World
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
