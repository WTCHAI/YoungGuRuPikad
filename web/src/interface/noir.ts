import { ProofData, UltraHonkBackend, UltraPlonkBackend } from "@aztec/bb.js";
import { Noir } from "@noir-lang/noir_js";

export interface CircuitParameter {
  position_x: string;
  position_y: string; // [u8;32] -> hex string (0x...)
  radius: string; // [u8;32] -> hex string (0x...)
  target_x: string; // [u8;32] -> hex string (0x...)
  target_y: string; // [u8;64] -> hex string (0x...)
}

export interface NoirContextType {
  noir: Noir | null;
  backend: UltraPlonkBackend | UltraHonkBackend | null;
  proofs: ProofData | null;
  isVerified: boolean | null;
  isLoading: boolean;
  error: string | null;
  InitializeNoir: () => Promise<void>;
  GeneratingProof: (params: CircuitParameter) => Promise<ProofData | null>;
  VerifyProof: (proof: ProofData) => Promise<boolean>;
  FormatProof: () => {
    formatted_proof: `0x${string}`;
    formatted_public_output: `0x${string}`[];
  } | null;
}
