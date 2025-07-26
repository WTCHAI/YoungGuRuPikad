import { ethers } from 'ethers';
import { 
  YoungGuRuPikadUtils, 
  ProofUtils, 
  NetworkUtils,
  ProofData,
  VerifierConfig,
  ContractStatus
} from './index';

/**
 * ตัวอย่างการใช้งาน Utils สำหรับ Contract ที่ Deploy แล้ว
 * Contract Address: 0x62a7ae6F5640d888C0CA3519CE48A00b9e36ceA2
 */
export class DeployedContractExample {
  private contractUtils: YoungGuRuPikadUtils;
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private contractAddress: string = '0x62a7ae6F5640d888C0CA3519CE48A00b9e36ceA2';

  constructor(
    contractABI: any[],
    rpcUrl: string,
    privateKey: string
  ) {
    // สร้าง provider และ signer
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    // สร้าง contract utils
    this.contractUtils = new YoungGuRuPikadUtils(
      this.contractAddress,
      contractABI,
      this.signer
    );
  }

  /**
   * ตรวจสอบสถานะ contract ที่ deploy แล้ว
   */
  async checkDeployedContractStatus() {
    try {
      console.log('=== ตรวจสอบสถานะ Contract ที่ Deploy แล้ว ===');
      console.log('Contract Address:', this.contractAddress);
      
      // ตรวจสอบว่า contract ถูก deploy แล้วหรือไม่
      const isDeployed = await this.contractUtils.isContractDeployed();
      console.log('Contract Deployed:', isDeployed);

      if (!isDeployed) {
        console.log('❌ Contract ยังไม่ถูก deploy');
        return;
      }

      // ดึงข้อมูล contract status ทั้งหมด
      const status: ContractStatus = await this.contractUtils.getContractStatus();
      console.log('Contract Status:', {
        isDeployed: status.isDeployed,
        isPaused: status.isPaused,
        owner: status.owner,
        admin: status.admin,
        hasVerifiers: status.hasVerifiers,
        verifierCount: status.verifierCount
      });

      // ตรวจสอบ network
      const network = await this.provider.getNetwork();
      console.log('Network:', network.name, '(Chain ID:', network.chainId, ')');

      // ตรวจสอบ signer address
      const signerAddress = await this.contractUtils.getSignerAddress();
      console.log('Signer Address:', signerAddress);

      // ตรวจสอบว่า signer เป็น owner หรือ admin หรือไม่
      const isOwnerOrAdmin = await this.contractUtils.isOwnerOrAdmin(signerAddress);
      console.log('Is Owner/Admin:', isOwnerOrAdmin);

      return status;
    } catch (error) {
      console.error('Error checking deployed contract status:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบ verifier ที่ตั้งค่าไว้
   */
  async checkVerifiers() {
    try {
      console.log('\n=== ตรวจสอบ Verifiers ===');
      
      // ตรวจสอบว่ามี verifier หรือไม่
      const hasVerifiers = await this.contractUtils.hasAnyVerifiers();
      console.log('Has Verifiers:', hasVerifiers);

      if (!hasVerifiers) {
        console.log('⚠️  ยังไม่มี verifier ตั้งค่าไว้');
        console.log('💡 ต้องตั้งค่า verifier ก่อนจึงจะสามารถ verify proof ได้');
        return [];
      }

      // นับจำนวน verifier
      const verifierCount = await this.contractUtils.getVerifierCount();
      console.log('Verifier Count:', verifierCount);

      // ดึงรายการ verifier ทั้งหมด
      const verifiers = await this.contractUtils.getAllVerifiers();
      console.log('All Verifiers:');
      verifiers.forEach((verifier, index) => {
        console.log(`  ${index + 1}. Key: ${verifier.key}`);
        console.log(`     Address: ${verifier.address}`);
      });

      return verifiers;
    } catch (error) {
      console.error('Error checking verifiers:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า verifier (เฉพาะ owner/admin)
   */
  async setupVerifier(verifierAddress: string, key?: string) {
    try {
      console.log('\n=== ตั้งค่า Verifier ===');
      
      // ตรวจสอบว่าเป็น owner หรือ admin
      const signerAddress = await this.contractUtils.getSignerAddress();
      const isOwnerOrAdmin = await this.contractUtils.isOwnerOrAdmin(signerAddress);
      
      if (!isOwnerOrAdmin) {
        console.log('❌ เฉพาะ owner หรือ admin เท่านั้นที่สามารถตั้งค่า verifier ได้');
        console.log('Signer Address:', signerAddress);
        return false;
      }

      // ตรวจสอบ address format
      if (!NetworkUtils.isValidAddress(verifierAddress)) {
        console.log('❌ Invalid verifier address format');
        return false;
      }

      // ใช้ key ที่กำหนดหรือสร้าง key ใหม่
      const verifierKey = key || '0x0000000000000000000000000000000000000000000000000000000000000001';
      
      const config: VerifierConfig = {
        key: verifierKey,
        verifier: verifierAddress as any
      };

      console.log('Setting up verifier:');
      console.log('  Key:', config.key);
      console.log('  Address:', config.verifier);

      // ตั้งค่า verifier
      await this.contractUtils.configVerifier(config);
      console.log('✅ Verifier ตั้งค่าเรียบร้อยแล้ว');

      // ตรวจสอบการตั้งค่า
      const verifier = await this.contractUtils.getVerifier(config.key);
      console.log('Verified Address:', verifier);

      return true;
    } catch (error) {
      console.error('Error setting up verifier:', error);
      return false;
    }
  }

  /**
   * ทดสอบ verify proof (ต้องมี verifier ก่อน)
   */
  async testVerifyProof(proofData: ProofData, key?: string) {
    try {
      console.log('\n=== ทดสอบ Verify Proof ===');
      
      // ตรวจสอบว่ามี verifier หรือไม่
      const hasVerifiers = await this.contractUtils.hasAnyVerifiers();
      if (!hasVerifiers) {
        console.log('❌ ไม่มี verifier ตั้งค่าไว้ ไม่สามารถ verify proof ได้');
        console.log('💡 ต้องตั้งค่า verifier ก่อน');
        return false;
      }

      // ใช้ key ที่กำหนดหรือใช้ key เริ่มต้น
      const verifierKey = key || '0x0000000000000000000000000000000000000000000000000000000000000001';
      
      // ตรวจสอบว่ามี verifier สำหรับ key นี้หรือไม่
      const verifier = await this.contractUtils.getVerifier(verifierKey);
      if (verifier === '0x0000000000000000000000000000000000000000') {
        console.log(`❌ ไม่มี verifier สำหรับ key: ${verifierKey}`);
        return false;
      }

      console.log('Verifying proof with:');
      console.log('  Key:', verifierKey);
      console.log('  Verifier:', verifier);

      // ตรวจสอบ proof format
      if (!ProofUtils.validateProofFormat(proofData.proof)) {
        console.log('❌ Invalid proof format');
        return false;
      }

      if (!ProofUtils.validatePublicInputs(proofData.publicInputs)) {
        console.log('❌ Invalid public inputs format');
        return false;
      }

      // ทดสอบ verify Mia proof
      console.log('Testing Mia verification...');
      const miaResult = await this.contractUtils.verifyMia(verifierKey, proofData);
      console.log('Mia verification result:', miaResult);

      // ทดสอบ verify Dek proof
      console.log('Testing Dek verification...');
      const dekResult = await this.contractUtils.verifyDek(verifierKey, proofData);
      console.log('Dek verification result:', dekResult);

      return miaResult && dekResult;
    } catch (error) {
      console.error('Error testing verify proof:', error);
      return false;
    }
  }

  /**
   * สร้างตัวอย่าง proof data สำหรับทดสอบ
   */
  createSampleProofData(): ProofData {
    console.log('\n=== สร้างตัวอย่าง Proof Data ===');
    
    // สร้างตัวอย่าง proof data (ต้องแทนที่ด้วย proof จริง)
    const sampleProofData: ProofData = {
      proof: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      publicInputs: [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      ]
    };

    console.log('Sample Proof Data:');
    console.log('  Proof:', sampleProofData.proof);
    console.log('  Public Inputs:', sampleProofData.publicInputs);

    console.log('⚠️  หมายเหตุ: นี่เป็นเพียงตัวอย่าง ต้องใช้ proof จริงในการทดสอบ');

    return sampleProofData;
  }

  /**
   * รันการทดสอบทั้งหมด
   */
  async runFullTest() {
    try {
      console.log('🚀 เริ่มต้นการทดสอบ Contract ที่ Deploy แล้ว\n');

      // 1. ตรวจสอบสถานะ contract
      const status = await this.checkDeployedContractStatus();
      if (!status?.isDeployed) {
        console.log('❌ ไม่สามารถทดสอบต่อได้ - Contract ยังไม่ถูก deploy');
        return;
      }

      // 2. ตรวจสอบ verifiers
      const verifiers = await this.checkVerifiers();

      // 3. ถ้าไม่มี verifier ให้แสดงคำแนะนำ
      if (verifiers.length === 0) {
        console.log('\n📋 คำแนะนำสำหรับการตั้งค่า Verifier:');
        console.log('1. ต้องมี verifier contract ที่ deploy แล้ว');
        console.log('2. ต้องเป็น owner หรือ admin ของ contract นี้');
        console.log('3. ใช้ฟังก์ชัน setupVerifier() เพื่อตั้งค่า');
        console.log('4. ตัวอย่าง: await example.setupVerifier("VERIFIER_ADDRESS")');
      }

      // 4. สร้างตัวอย่าง proof data
      const sampleProofData = this.createSampleProofData();

      // 5. ทดสอบ verify proof (ถ้ามี verifier)
      if (verifiers.length > 0) {
        await this.testVerifyProof(sampleProofData);
      }

      console.log('\n✅ การทดสอบเสร็จสิ้น');
      console.log('\n📝 สรุป:');
      console.log('- Contract Address:', this.contractAddress);
      console.log('- Deployed:', status.isDeployed);
      console.log('- Paused:', status.isPaused);
      console.log('- Verifiers:', verifiers.length);
      console.log('- Owner:', status.owner);
      console.log('- Admin:', status.admin);

    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
      throw error;
    }
  }
}

/**
 * ฟังก์ชันสำหรับสร้าง instance ของ DeployedContractExample
 */
export function createDeployedContractExample(
  contractABI: any[],
  rpcUrl: string,
  privateKey: string
): DeployedContractExample {
  return new DeployedContractExample(contractABI, rpcUrl, privateKey);
}

/**
 * ตัวอย่างการใช้งาน
 */
export async function exampleUsage() {
  // ข้อมูลที่ต้องแทนที่ด้วยข้อมูลจริง
  const CONTRACT_ABI: any[] = []; // ใส่ ABI ของ contract
  const RPC_URL = 'https://sepolia.infura.io/v3/YOUR_API_KEY';
  const PRIVATE_KEY = 'your_private_key_here';
  const VERIFIER_ADDRESS = '0x...'; // address ของ verifier contract

  try {
    // สร้าง instance
    const example = createDeployedContractExample(CONTRACT_ABI, RPC_URL, PRIVATE_KEY);

    // รันการทดสอบทั้งหมด
    await example.runFullTest();

    // หรือรันเฉพาะส่วน
    // await example.checkDeployedContractStatus();
    // await example.checkVerifiers();
    // await example.setupVerifier(VERIFIER_ADDRESS);

  } catch (error) {
    console.error('Error in example usage:', error);
  }
} 