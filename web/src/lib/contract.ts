import { createConfig, getAccount, http } from "@wagmi/core"
import { sepolia } from "@wagmi/core/chains"
import { Address, createPublicClient, parseAbi } from "viem"

export const SepoliaContract = {
  youngGuRuPikadProxy: "0xbF5b256525a6bC77D878cA530b795F1720Dfb5b5" as Address,
}

export const contractConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
})

export const { connector, address: AccountAddress } = getAccount(contractConfig)

export const YOUNG_GU_RU_PIKAD_PROXY_ABI = parseAbi([
  // Events
  "event AdminChanged(address indexed previousAdmin, address indexed newAdmin)",
  "event DekGenProof(bytes32 indexed _key, address indexed _verifier, address indexed _prover, bool _result)",
  "event MiaGenProof(bytes32 indexed _key, address indexed _verifier, address indexed _prover, bool _result)",
  "event OwnerShipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Paused(address account)",
  "event Unpaused(address account)",
  "event VerifierConfigured(bytes32 indexed key, address indexed verifier, address indexed authority)",

  // Functions
  "function configVerifier(bytes32 _key, address _verifier)",
  "function getAdmin() view returns (address)",
  "function getOwner() view returns (address)",
  "function getPause() view returns (bool)",
  "function initialize(address _owner, address _admin)",
  "function initialized() view returns (bool)",
  "function provers(bytes32, address) view returns (bool)",
  "function setAdmin(address newAdmin)",
  "function transferOwnership(address newOwner)",
  "function verifierConfiguration(bytes32 _key, address _verifier)",
  "function verifiers(bytes32) view returns (address)",
  "function verifyDek(bytes32 _key, bytes _proof, bytes32[] _publicInputs) returns (bool)",
  "function verifyMia(bytes32 _key, bytes _proof, bytes32[] _publicInputs) returns (bool)",
])

export const ContractConfigs = {
  verifyMia: (
    _key: `0x${string}`,
    _proof: `0x${string}`,
    _publicInputs: `0x${string}`[]
  ) => ({
    address: SepoliaContract.youngGuRuPikadProxy,
    abi: YOUNG_GU_RU_PIKAD_PROXY_ABI,
    functionName: "verifyMia",
    args: [_key, _proof, _publicInputs],
  }),
  verifyDek: (
    _key: `0x${string}`,
    _proof: `0x${string}`,
    _publicInputs: `0x${string}`[]
  ) => ({
    address: SepoliaContract.youngGuRuPikadProxy,
    abi: YOUNG_GU_RU_PIKAD_PROXY_ABI,
    functionName: "verifyDek",
    args: [_key, _proof, _publicInputs],
  }),
  configVerifier: (_key: `0x${string}`, _verifier: Address) => ({
    address: SepoliaContract.youngGuRuPikadProxy,
    abi: YOUNG_GU_RU_PIKAD_PROXY_ABI,
    functionName: "configVerifier",
    args: [_key, _verifier],
  }),
}

export const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

export const contracts = {
  youngGuRuPikadProxy: SepoliaContract.youngGuRuPikadProxy,
}