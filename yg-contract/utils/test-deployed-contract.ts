import 'dotenv/config';
import { ethers } from 'ethers';
import { 
  DeployedContractExample, 
  createDeployedContractExample,
  NetworkUtils 
} from './index';

// Configuration
const CONTRACT_ADDRESS = '0x62a7ae6F5640d888C0CA3519CE48A00b9e36ceA2';
const NETWORK_NAME = 'SEPOLIA';

// ข้อมูลที่ต้องแทนที่ด้วยข้อมูลจริง
const CONFIG = {
  // ABI ของ contract (ต้องแทนที่ด้วย ABI จริง)
  CONTRACT_ABI: [
    // ตัวอย่าง ABI - ต้องแทนที่ด้วย ABI จริงจาก contract
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_key",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_proof",
          "type": "bytes"
        },
        {
          "internalType": "bytes32[]",
          "name": "_publicInputs",
          "type": "bytes32[]"
        }
      ],
      "name": "verifyMia",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_key",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_proof",
          "type": "bytes"
        },
        {
          "internalType": "bytes32[]",
          "name": "_publicInputs",
          "type": "bytes32[]"
        }
      ],
      "name": "verifyDek",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_key",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_verifier",
          "type": "address"
        }
      ],
      "name": "configVerifier",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "verifiers",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "admin",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
  // RPC URL (ต้องแทนที่ด้วย API key จริง)
  RPC_URL: process.env.RPC_URL || 'https://sepolia.infura.io/v3/YOUR_API_KEY',
  
  // Private Key (ต้องแทนที่ด้วย private key จริง)
  PRIVATE_KEY: process.env.PRIVATE_KEY || 'your_private_key_here',
  
  // Verifier Address (ต้องแทนที่ด้วย address จริง)
  VERIFIER_ADDRESS: process.env.VERIFIER_ADDRESS || '0x...'
};

/**
 * ฟังก์ชันหลักสำหรับทดสอบ
 */
async function main() {
  console.log('🚀 เริ่มต้นการทดสอบ Contract ที่ Deploy แล้ว');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Network:', NETWORK_NAME);
  console.log('');

  // ตรวจสอบ configuration
  if (CONFIG.RPC_URL.includes('YOUR_API_KEY')) {
    console.log('❌ กรุณาตั้งค่า RPC_URL ใน environment variables');
    console.log('ตัวอย่าง: export RPC_URL="https://sepolia.infura.io/v3/YOUR_ACTUAL_API_KEY"');
    return;
  }

  if (CONFIG.PRIVATE_KEY === 'your_private_key_here') {
    console.log('❌ กรุณาตั้งค่า PRIVATE_KEY ใน environment variables');
    console.log('ตัวอย่าง: export PRIVATE_KEY="your_actual_private_key"');
    return;
  }

  try {
    // สร้าง provider และตรวจสอบ network
    const provider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
    const network = await provider.getNetwork();
    
    console.log('Network Info:');
    console.log('  Name:', network.name);
    console.log('  Chain ID:', network.chainId);
    console.log('');

    // ตรวจสอบว่าเป็น Sepolia หรือไม่
    if (network.chainId !== 11155111n) {
      console.log('⚠️  ผิด network ต้องเป็น Sepolia (Chain ID: 11155111)');
      console.log('ปัจจุบัน:', network.name, '(Chain ID:', network.chainId, ')');
      return;
    }

    // สร้าง instance ของ DeployedContractExample
    const example = createDeployedContractExample(
      CONFIG.CONTRACT_ABI,
      CONFIG.RPC_URL,
      CONFIG.PRIVATE_KEY
    );

    // รันการทดสอบทั้งหมด
    await example.runFullTest();

    // ถ้ามี verifier address ให้ลองตั้งค่า
    if (CONFIG.VERIFIER_ADDRESS !== '0x...') {
      console.log('\n🔧 ลองตั้งค่า Verifier...');
      const success = await example.setupVerifier(CONFIG.VERIFIER_ADDRESS);
      if (success) {
        console.log('✅ ตั้งค่า verifier สำเร็จ');
        
        // ทดสอบ verify proof หลังจากตั้งค่า verifier
        const proofData = example.createSampleProofData();
        await example.testVerifyProof(proofData);
      }
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    
    // แสดงคำแนะนำการแก้ไขปัญหา
    console.log('\n🔧 คำแนะนำการแก้ไขปัญหา:');
    console.log('1. ตรวจสอบ RPC_URL และ API key');
    console.log('2. ตรวจสอบ PRIVATE_KEY');
    console.log('3. ตรวจสอบ network (ต้องเป็น Sepolia)');
    console.log('4. ตรวจสอบ contract address');
    console.log('5. ตรวจสอบ ABI ของ contract');
  }
}

/**
 * ฟังก์ชันสำหรับทดสอบเฉพาะส่วน
 */
async function testSpecificFunction() {
  console.log('🧪 ทดสอบฟังก์ชันเฉพาะส่วน');
  
  try {
    const example = createDeployedContractExample(
      CONFIG.CONTRACT_ABI,
      CONFIG.RPC_URL,
      CONFIG.PRIVATE_KEY
    );

    // ทดสอบเฉพาะการตรวจสอบสถานะ
    console.log('\n=== ทดสอบการตรวจสอบสถานะ ===');
    const status = await example.checkDeployedContractStatus();
    console.log('Status:', status);

    // ทดสอบเฉพาะการตรวจสอบ verifiers
    console.log('\n=== ทดสอบการตรวจสอบ Verifiers ===');
    const verifiers = await example.checkVerifiers();
    console.log('Verifiers:', verifiers);

  } catch (error) {
    console.error('Error in specific test:', error);
  }
}

/**
 * ฟังก์ชันสำหรับแสดงข้อมูล configuration
 */
function showConfig() {
  console.log('📋 Configuration:');
  console.log('Contract Address:', CONTRACT_ADDRESS);
  console.log('Network:', NETWORK_NAME);
  console.log('RPC URL:', CONFIG.RPC_URL.replace(/\/v3\/[^\/]+$/, '/v3/***'));
  console.log('Private Key:', CONFIG.PRIVATE_KEY.substring(0, 10) + '...');
  console.log('Verifier Address:', CONFIG.VERIFIER_ADDRESS);
  console.log('');
}

// ตรวจสอบ command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: ts-node test-deployed-contract.ts [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     แสดงความช่วยเหลือ');
  console.log('  --config       แสดง configuration');
  console.log('  --test         ทดสอบฟังก์ชันเฉพาะส่วน');
  console.log('  --full         ทดสอบทั้งหมด (default)');
  console.log('');
  console.log('Environment Variables:');
  console.log('  RPC_URL        RPC URL สำหรับ network');
  console.log('  PRIVATE_KEY    Private key ของ wallet');
  console.log('  VERIFIER_ADDRESS Address ของ verifier contract');
  console.log('');
  console.log('Example:');
  console.log('  export RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"');
  console.log('  export PRIVATE_KEY="your_private_key"');
  console.log('  export VERIFIER_ADDRESS="0x..."');
  console.log('  ts-node test-deployed-contract.ts');
  process.exit(0);
}

if (args.includes('--config')) {
  showConfig();
  process.exit(0);
}

if (args.includes('--test')) {
  testSpecificFunction();
} else {
  // รันการทดสอบทั้งหมด (default)
  main();
} 