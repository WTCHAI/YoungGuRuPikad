"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { LatLngExpression } from "leaflet"
import { toast } from "sonner"
import { bytesToHex } from "viem"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PopoverDatePicker from "@/components/popover-date-picker"
import { useLocationStore } from "@/store/location"
import { useProofStore } from "@/store/proof"
import { GenerateProof } from "@/utils/generating-proof"
import {latLngToXY} from "@/utils/lat-long-conversion"

import { ContractConfigs } from "../lib/contract"
import { se } from "date-fns/locale"

const MapContainer = dynamic(() => import("@/components/map/map-container"), {
  loading: () => <div>Loading map...</div>,
  ssr: false,
})

export default function Home() {
  const selectedLocation = useLocationStore((state) => state.selectedLocation)
  const [radius, setRadius] = useState<number | undefined>(1) // Default radius in km
  const [markedPosition, setMarkedPosition] = useState<
    LatLngExpression | undefined
  >()

  // Zustand store
  const {
    proof,
    publicInputs,
    isGenerating,
    isVerifying,
    isVerified,
    transactionHash,
    setProof,
    clearProof,
    setGenerating,
    setVerifying,
    setVerified,
    resetVerification,
  } = useProofStore()

  // Wagmi hooks
  const { isConnected } = useAccount()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleGenProof = async () => {
    if (!markedPosition || !radius || radius <= 0) return

    try {
      setGenerating(true)
      console.log("Radius:", radius)
      console.log("Marked Position:", markedPosition)
      let position_x = 0
      let position_y = 0
      const { x: target_x, y: target_y } = latLngToXY(markedPosition[0], markedPosition[1], selectedLocation[0], selectedLocation[1])
      console.log("Selected Location:", selectedLocation)
      console.log(Math.sqrt(Math.pow((target_x - position_x), 2) + Math.pow((target_y - position_y), 2)))
      console.log("Target Position:", { target_x: Math.floor(target_x * 1000).toString(), target_y: Math.floor(target_y * 1000).toString() , radius: Math.floor(radius * Math.pow(1000, 2)).toString()})
      const { proof: generatedProof, publicInputs: generatedPublicInputs } =
        await GenerateProof({
          position_x: "0",
          position_y: "0",
          radius: Math.floor(radius * Math.pow(1000, 2)).toString(),
          target_x: Math.abs(Math.floor(target_x * 1000)).toString(),
          target_y: Math.abs(Math.floor(target_y * 1000)).toString(),
        })

      setProof(generatedProof, generatedPublicInputs)
      toast.success("Proof generated successfully!")
    } catch (error) {
      console.error("Error generating proof:", error)
      toast.error("Failed to generate proof")
    } finally {
      setGenerating(false)
    }
  }

  const handleVerifyMia = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!proof || !publicInputs) {
      toast.error("Please generate proof first")
      return
    }

    try {
      setVerifying(true)

      // Convert proof to hex string
      const proofHex = bytesToHex(proof)

      // Convert publicInputs to bytes32 array
      const publicInputsBytes32 = publicInputs as `0x${string}`[]

      // Example key - you'll need to provide the actual key for your use case
      const key =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`
      console.log("proof: ", proofHex, publicInputsBytes32)
      const tx = await writeContract(
        ContractConfigs.verifyMia(key, proofHex, publicInputsBytes32)
      )
      console.log(tx)

      toast.success("Transaction submitted!")
    } catch (error) {
      console.error("Error verifying proof:", error)
      toast.error("Failed to verify proof")
      setVerifying(false)
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirming) {
      toast.loading("Confirming transaction...")
    }
    if (isSuccess && hash) {
      toast.dismiss()
      setVerified(true, hash)
      toast.success(
        <div className="flex flex-col gap-2">
          <span>Proof verified on-chain successfully!</span>
          <a 
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            View on Etherscan →
          </a>
        </div>,
        { duration: 8000 }
      )
    }
  }, [isConfirming, isSuccess, hash, setVerified])

  // Clear proof when markedPosition changes
  useEffect(() => {
    if (markedPosition && (proof || publicInputs)) {
      clearProof()
      toast.info("Position changed - proof cleared")
    }
  }, [markedPosition, clearProof])

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
            value={isNaN(radius) ? "" : radius}
            min={0}
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
          radius={radius}
        />
      </div>

      <div className="flex justify-center gap-4">
        {!proof ? (
          <Button
            onClick={handleGenProof}
            disabled={!markedPosition || !radius || radius <= 0 || isGenerating}
          >
            {isGenerating ? "Generating..." : "Gen Proof"}
          </Button>
        ) : (
          <Button
            onClick={handleVerifyMia}
            disabled={
              !isConnected ||
              isVerifying ||
              isPending ||
              isConfirming ||
              isVerified
            }
            variant={isVerified ? "default" : "secondary"}
          >
            {isVerifying || isPending
              ? "Verifying..."
              : isConfirming
                ? "Confirming..."
                : isVerified
                  ? "✓ Verified"
                  : "Verify On-Chain"}
          </Button>
        )}

        <ConnectButton />
      </div>

      {/* {proof && publicInputs && (
        <div className="flex flex-col gap-4 p-4 border rounded-lg">
          <div className="text-sm font-medium">Generated Proof:</div>
          <div className="text-xs break-all bg-gray-100 p-2 rounded">
            {bytesToHex(proof)}
          </div>
          
          <div className="text-sm font-medium">Public Inputs:</div>
          <div className="text-xs break-all bg-gray-100 p-2 rounded">
            {JSON.stringify(publicInputs as `0x${string}`[])}
          </div>

          {isVerified && transactionHash && (
            <div className="flex flex-col gap-2 p-3 bg-green-50 rounded border border-green-200">
              <div className="text-sm font-medium text-green-800">✓ Verification Complete!</div>
              <div className="text-xs text-green-600">
                Transaction: {transactionHash}
              </div>
            </div>
          )}
        </div>
      )} */}
    </main>
  )
}
