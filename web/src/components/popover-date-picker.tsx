import * as React from "react"
import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { useBoolean } from "@/hooks/use-boolean"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocationStore } from "@/store/location"

const PopoverDatePicker = () => {
  const { value: open, setValue: setOpen } = useBoolean(false)
  const selectedDate = useLocationStore((state) => state.selectedDate)
  const { setSelectedDate } = useLocationStore((state) => state.actions)

  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setSelectedDate(selectedDate)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-48 justify-between font-normal"
        >
          {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  )
}

export default PopoverDatePicker
