'use client'

import React, { useEffect, useState } from 'react'
import { ProofData, splitHonkProof } from '@aztec/bb.js'
import { CircuitParameter } from '../interface/noir'
// import { useNoirContext } from "../context/useNoirContext";
import { GenerateProof } from '../utils/generating-proof'
import { bytesToHex } from 'viem'
import { splitProof, formatProofForSolidity } from '../utils/format-proof'

export default function InputContainer() {
  const [params, setParams] = useState<CircuitParameter | null>(null)
  // const { InitializeNoir, isLoading, error, proofs } = useNoirContext();
  const [proofs, setProofs] = useState<ProofData>()
  // 🟢 Load circuit parameters & initialize Noir
  useEffect(() => {
    async function loadParams() {
      try {
        const response = await fetch('/params.json') // Adjust path if needed
        const data = await response.json()
        setParams(data)
      } catch (err) {
        console.error('Failed to load JSON parameters:', err)
      }
    }
    loadParams()
  }, [])

  // 🟢 Handle proof generation
  const handleGenerateProof = async () => {
    if (!params) {
      alert('All fields must be filled.')
      return
    }
    console.log(params)
    try {
      console.log('Initializing Noir...')
      console.log('Generating proof...')
      const { proof, publicInputs } = await GenerateProof({
        position_x: params.position_x,
        position_y: params.position_y,
        radius: params.radius,
        target_x: params.target_x,
        target_y: params.target_y,
      })
      console.log('Proof: ', bytesToHex(proof), 'public input :', publicInputs)

      setProofs({ proof, publicInputs })
    } catch (err) {
      console.error('Proof generation failed:', err)
    }
  }

  return (
    <section className="p-5 bg-gray-800 text-white rounded-md">
      <h2 className="text-2xl font-bold mb-4">Generate Proof</h2>

      {/* Generate Proof Button */}
      <button
        onClick={handleGenerateProof}
        // disabled={isLoading}
        className="p-3 bg-blue-500 hover:bg-blue-700 rounded-md"
      >
        {/* {isLoading ? "Generating Proof..." : "Generate Proof"} */}
        genearting proof here
      </button>

      {proofs ? (
        <>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Raw Proof (Concatenated):
              </h3>
              <div className="bg-gray-900 p-3 rounded text-xs break-all">
                {bytesToHex(proofs.proof)}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Formatted Proof (Solidity Array):
              </h3>
              <div className="bg-gray-900 p-3 rounded text-xs">
                <pre>
                  {JSON.stringify(
                    formatProofForSolidity(proofs.proof),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Public Inputs:</h3>
              <div className="bg-gray-900 p-3 rounded text-xs">
                {JSON.stringify(proofs.publicInputs as `0x${string}`[])}
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              console.log('Verifying proof...')
              const formattedProof = formatProofForSolidity(proofs.proof)
              console.log('Formatted proof for Solidity:', formattedProof)
              // Here you would typically call a verification function
              // For example, if you have a smart contract method to verify the proof
              // await verifyProof(formattedProof, proofs.publicInputs);
              alert('Proof verified successfully!') // Placeholder for actual verification logic
            }}
            className="mt-4 p-3 bg-green-500 hover:bg-green-700 rounded-md"
          >
            Verify proof
          </button>
        </>
      ) : (
        <></>
      )}
    </section>
  )
}
