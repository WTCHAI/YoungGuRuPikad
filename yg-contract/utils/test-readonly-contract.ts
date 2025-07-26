import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

// ====== CONFIG ======
const RPC_URL = process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_API_KEY';
const CONTRACT_ADDRESS = '0x62a7ae6F5640d888C0CA3519CE48A00b9e36ceA2';

// ใส่ ABI เฉพาะฟังก์ชันที่อ่านข้อมูลได้ (view/pure) - แก้ไขให้ตรงกับ contract จริง
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getOwner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAdmin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPause",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ],
    "name": "verifiers",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "provers",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// ====== MAIN ======
async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  console.log('===== Contract Read-Only Test =====');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('RPC_URL:', RPC_URL);

  // getOwner (ไม่ใช่ owner)
  const owner = await contract.getOwner();
  console.log('getOwner():', owner);

  // getAdmin (ไม่ใช่ admin)
  const admin = await contract.getAdmin();
  console.log('getAdmin():', admin);

  // getPause (ไม่ใช่ paused)
  const paused = await contract.getPause();
  console.log('getPause():', paused);

  // verifiers (ลองอ่าน key ตัวอย่าง)
  const keys = [
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000000000000000000000000000002',
    '0x0000000000000000000000000000000000000000000000000000000000000003'
  ];
  for (const key of keys) {
    const verifier = await contract.verifiers(key);
    console.log(`verifiers[${key}]:`, verifier);
  }

  // provers (ลองอ่าน key+address ตัวอย่าง)
  // (ต้องใส่ address จริงที่เคย verifyDek สำเร็จถึงจะเป็น true)
  const testProver = owner; // หรือใส่ address อื่นที่ต้องการ
  for (const key of keys) {
    const proverStatus = await contract.provers(key, testProver);
    console.log(`provers[${key}][${testProver}]:`, proverStatus);
  }

  console.log('===== END =====');
}

main().catch(e => {
  console.error('เกิดข้อผิดพลาด:', e);
}); 