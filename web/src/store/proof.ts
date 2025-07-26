import { create } from "zustand"

interface ProofState {
  proof: Uint8Array | null
  publicInputs: string[] | null
  isGenerating: boolean
  isVerifying: boolean
  isVerified: boolean
  transactionHash: string | null
  
  // Actions
  setProof: (proof: Uint8Array, publicInputs: string[]) => void
  clearProof: () => void
  setGenerating: (isGenerating: boolean) => void
  setVerifying: (isVerifying: boolean) => void
  setVerified: (isVerified: boolean, txHash?: string) => void
  resetVerification: () => void
}

export const useProofStore = create<ProofState>((set) => ({
  proof: null,
  publicInputs: null,
  isGenerating: false,
  isVerifying: false,
  isVerified: false,
  transactionHash: null,

  setProof: (proof, publicInputs) => 
    set({ 
      proof, 
      publicInputs, 
      isVerified: false, 
      transactionHash: null 
    }),

  clearProof: () => 
    set({ 
      proof: null, 
      publicInputs: null, 
      isVerified: false, 
      transactionHash: null 
    }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setVerifying: (isVerifying) => set({ isVerifying }),

  setVerified: (isVerified, txHash) => 
    set({ 
      isVerified, 
      transactionHash: txHash || null,
      isVerifying: false 
    }),

  resetVerification: () => 
    set({ 
      isVerified: false, 
      transactionHash: null,
      isVerifying: false 
    }),
}))