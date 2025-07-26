# YoungGuRuPikad Contract Utils

Utils สำหรับ interact กับ YoungGuRuPikadProxy contract และจัดการ cryptographic functions

## 📁 โครงสร้างไฟล์

```
utils/
├── contract.ts      # Utils สำหรับ interact กับ contract
├── proof.ts         # Utils สำหรับจัดการ proof และ cryptographic functions
├── network.ts       # Utils สำหรับจัดการ network connection
├── example.ts       # ตัวอย่างการใช้งาน
├── index.ts         # Export ทั้งหมด utils
└── README.md        # เอกสารนี้
```

## 🚀 การติดตั้ง

### Dependencies ที่ต้องการ

```bash
npm install ethers viem circomlibjs
```

หรือ

```bash
pnpm add ethers viem circomlibjs
```

### TypeScript Dependencies

```bash
npm install -D @types/circomlibjs
```

## 📖 การใช้งาน

### 1. Import Utils

```typescript
import { 
  YoungGuRuPikadUtils, 
  ProofUtils, 
  NetworkUtils,
  ProofData,
  VerifierConfig 
} from './utils';
```

### 2. สร้าง Contract Utils Instance

```typescript
import { ethers } from 'ethers';

// สร้าง provider และ signer
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// สร้าง contract utils
const contractUtils = new YoungGuRuPikadUtils(
  'CONTRACT_ADDRESS',
  CONTRACT_ABI,
  signer
);
```

### 3. การใช้งาน Contract Utils

#### ตรวจสอบ Mia Proof

```typescript
const proofData: ProofData = {
  proof: '0x1234567890abcdef...',
  publicInputs: [
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000000000000000000000000000002'
  ]
};

const key = '0x0000000000000000000000000000000000000000000000000000000000000001';
const result = await contractUtils.verifyMia(key, proofData);
console.log('Mia verification result:', result);
```

#### ตรวจสอบ Dek Proof

```typescript
const result = await contractUtils.verifyDek(key, proofData);
console.log('Dek verification result:', result);

// ตรวจสอบสถานะ prover
const proverAddress = await signer.getAddress();
const proverStatus = await contractUtils.getProverStatus(key, proverAddress);
console.log('Prover status:', proverStatus);
```

#### ตั้งค่า Verifier (เฉพาะ Owner/Admin)

```typescript
const config: VerifierConfig = {
  key: '0x0000000000000000000000000000000000000000000000000000000000000001',
  verifier: '0x1234567890123456789012345678901234567890'
};

await contractUtils.configVerifier(config);
```

#### ตรวจสอบ Contract Status

```typescript
const isPaused = await contractUtils.isPaused();
const owner = await contractUtils.getOwner();
const admin = await contractUtils.getAdmin();

console.log('Contract paused:', isPaused);
console.log('Owner:', owner);
console.log('Admin:', admin);
```

### 4. การใช้งาน Proof Utils

#### สร้าง Poseidon Hash

```typescript
const inputs = [
  BigInt('123456789'),
  BigInt('987654321'),
  BigInt('555555555')
];

const hash = await ProofUtils.poseidonHash(inputs);
console.log('Poseidon hash:', hash.toString());
```

#### แปลง BigInt เป็น Bytes32

```typescript
const bigint = BigInt('123456789');
const bytes32 = ProofUtils.toBytes32(bigint);
console.log('Bytes32:', bytes32);

// แปลงกลับ
const backToBigInt = ProofUtils.bytes32ToBigInt(bytes32);
console.log('Back to bigint:', backToBigInt.toString());
```

#### ตรวจสอบ Proof Format

```typescript
const proof = '0x1234567890abcdef...';
const isValid = ProofUtils.validateProofFormat(proof);
console.log('Proof format valid:', isValid);

const publicInputs = [
  '0x0000000000000000000000000000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000000000000000000000000000002'
];
const inputsValid = ProofUtils.validatePublicInputs(publicInputs);
console.log('Public inputs valid:', inputsValid);
```

#### สร้าง Verifier Key

```typescript
const data = [
  '0x1234567890123456789012345678901234567890123456789012345678901234',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
  '0x5555555555555555555555555555555555555555555555555555555555555555'
];

const key = await ProofUtils.generateVerifierKey(data);
console.log('Generated verifier key:', key);
```

### 5. การใช้งาน Network Utils

#### ตรวจสอบ Network

```typescript
const expectedChainId = 11155111; // Sepolia
const currentChainId = 11155111;
const isValid = NetworkUtils.validateNetwork(expectedChainId, currentChainId);
console.log('Network valid:', isValid);
```

#### ตรวจสอบ Address Format

```typescript
const address = '0x1234567890123456789012345678901234567890';
const isValid = NetworkUtils.isValidAddress(address);
console.log('Address valid:', isValid);
```

#### สร้าง Transaction URL

```typescript
const txHash = '0x1234567890abcdef...';
const url = NetworkUtils.createTransactionUrl(txHash, 'SEPOLIA');
console.log('Transaction URL:', url);
```

## 🧪 การทดสอบ

### ใช้ Example Usage

```typescript
import { createExampleUsage } from './utils/example';

const example = createExampleUsage(
  'CONTRACT_ADDRESS',
  CONTRACT_ABI,
  'RPC_URL',
  'PRIVATE_KEY'
);

// รันตัวอย่างทั้งหมด
await example.runAllExamples();
```

### รันตัวอย่างเฉพาะ

```typescript
// ตรวจสอบ network
await example.exampleNetworkValidation();

// ตรวจสอบ contract status
await example.exampleContractStatus();

// สร้าง Poseidon hash
await example.examplePoseidonHash();

// สร้าง verifier key
await example.exampleGenerateVerifierKey();
```

## 🔧 Configuration

### Environment Variables

สร้างไฟล์ `.env`:

```env
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
```

### Network Configuration

```typescript
// ใช้ network ที่มีอยู่
const rpcUrl = NetworkUtils.createRpcUrl('SEPOLIA', 'YOUR_API_KEY');

// หรือสร้าง custom network
const customNetwork = {
  chainId: 12345,
  name: 'Custom Network',
  rpcUrl: 'https://custom.rpc.url',
  blockExplorer: 'https://custom.explorer.url'
};
```

## 📝 Types และ Interfaces

### ProofData

```typescript
interface ProofData {
  proof: string;
  publicInputs: string[];
}
```

### VerifierConfig

```typescript
interface VerifierConfig {
  key: string;
  verifier: Address;
}
```

### IYoungGuRuPikadProxy

```typescript
interface IYoungGuRuPikadProxy {
  verifyMia(key: string, proof: string, publicInputs: string[]): Promise<boolean>;
  verifyDek(key: string, proof: string, publicInputs: string[]): Promise<boolean>;
  configVerifier(key: string, verifier: string): Promise<void>;
  verifierConfiguration(key: string, verifier: string): Promise<void>;
  verifiers(key: string): Promise<string>;
  provers(key: string, prover: string): Promise<boolean>;
}
```

## ⚠️ ข้อควรระวัง

1. **Private Key Security**: อย่าเก็บ private key ในโค้ดโดยตรง ใช้ environment variables
2. **Network Validation**: ตรวจสอบ network ก่อนทำ transaction
3. **Proof Validation**: ตรวจสอบ format ของ proof และ public inputs ก่อนส่ง
4. **Error Handling**: ใช้ try-catch เพื่อจัดการ error ที่อาจเกิดขึ้น
5. **Gas Estimation**: ประมาณการ gas ก่อนทำ transaction

## 🐛 การแก้ไขปัญหา

### Common Issues

1. **Module not found**: ตรวจสอบว่าได้ติดตั้ง dependencies แล้ว
2. **Invalid address**: ตรวจสอบ format ของ address
3. **Network mismatch**: ตรวจสอบ chain ID ของ network
4. **Proof validation failed**: ตรวจสอบ format ของ proof และ public inputs

### Debug Mode

```typescript
// เปิด debug mode
console.log('Contract address:', contractAddress);
console.log('Network:', await provider.getNetwork());
console.log('Signer address:', await signer.getAddress());
```

## 📚 References

- [Ethers.js Documentation](https://docs.ethers.org/)
- [Viem Documentation](https://viem.sh/)
- [Circomlibjs Documentation](https://github.com/iden3/circomlibjs)
- [YoungGuRuPikad Contract](contracts/ygProxy.sol)

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch
3. Commit changes
4. Push to branch
5. สร้าง Pull Request

## 📄 License

MIT License 