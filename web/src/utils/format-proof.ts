import { bytesToHex } from 'viem'

// Function to process the proof and remove public inputs
export function splitProof(proofWithPublicInputs: Uint8Array): `0x${string}` {
  // const { proof, publicInputs } = splitHonkProof(proofWithPublicInputs); // Split proof from public inputs

  // Convert the proof part to hex string
  const hexProof = bytesToHex(proofWithPublicInputs.slice(16))

  // Remove the first 8 bytes (16 hex chars) from the string
  //const resultHex = hexProof.slice(16);  // Removes first 16 hex chars (8 bytes)

  return hexProof // Return the final proof part as hex
}

// taken from @aztec/bb.js/proof
export function uint8ArrayToHex(buffer: Uint8Array): string {
  const hex: string[] = []

  buffer.forEach(function (i) {
    let h = i.toString(16)
    if (h.length % 2) {
      h = '0' + h
    }
    hex.push(h)
  })

  return '0x' + hex.join('')
}

// Function to format proof as array of 32-byte hex strings (like proof_fields.json)
export function formatProofForSolidity(proof: Uint8Array): `0x${string}`[] {
  const hexProof = bytesToHex(proof)

  // Remove '0x' prefix and split into 64-character chunks (32 bytes each)
  const cleanHex = hexProof.slice(2)
  const chunks: `0x${string}`[] = []

  for (let i = 0; i < cleanHex.length; i += 64) {
    const chunk = cleanHex.slice(i, i + 64)
    if (chunk.length === 64) {
      chunks.push(`0x${chunk}`)
    }
  }

  return chunks
}
