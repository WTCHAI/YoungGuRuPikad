import { ethers } from 'ethers';
import { 
  YoungGuRuPikadUtils, 
  ProofUtils, 
  NetworkUtils,
  ProofData,
  VerifierConfig 
} from './index';

/**
 * ตัวอย่างการใช้งาน Utils สำหรับ YoungGuRuPikad Contract
 */
export class ExampleUsage {
  private contractUtils: YoungGuRuPikadUtils;
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(
    contractAddress: string,
    contractABI: any[],
    rpcUrl: string,
    privateKey: string
  ) {
    // สร้าง provider และ signer
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    // สร้าง contract utils
    this.contractUtils = new YoungGuRuPikadUtils(
      contractAddress,
      contractABI,
      this.signer
    );
  }

  /**
   * ตัวอย่างการ verify Mia proof
   */
  async exampleVerifyMia() {
    try {
      console.log('=== ตัวอย่างการ Verify Mia Proof ===');
      
      // ข้อมูล proof และ public inputs
      const proofData: ProofData = {
        proof: '0x1234567890abcdef...', // ใส่ proof ที่ถูกต้อง
        publicInputs: [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002'
        ]
      };

      // ตรวจสอบ format ของ proof
      if (!ProofUtils.validateProofFormat(proofData.proof)) {
        throw new Error('Invalid proof format');
      }

      // ตรวจสอบ format ของ public inputs
      if (!ProofUtils.validatePublicInputs(proofData.publicInputs)) {
        throw new Error('Invalid public inputs format');
      }

      // Key สำหรับ verifier
      const key = '0x0000000000000000000000000000000000000000000000000000000000000001';

      // ตรวจสอบ Mia proof
      const result = await this.contractUtils.verifyMia(key, proofData);
      console.log('Mia verification result:', result);

      return result;
    } catch (error) {
      console.error('Error in exampleVerifyMia:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการ verify Dek proof
   */
  async exampleVerifyDek() {
    try {
      console.log('=== ตัวอย่างการ Verify Dek Proof ===');
      
      // ข้อมูล proof และ public inputs
      const proofData: ProofData = {
        proof: '0xabcdef1234567890...', // ใส่ proof ที่ถูกต้อง
        publicInputs: [
          '0x0000000000000000000000000000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000000000000000000000000000004'
        ]
      };

      // Key สำหรับ verifier
      const key = '0x0000000000000000000000000000000000000000000000000000000000000002';

      // ตรวจสอบ Dek proof
      const result = await this.contractUtils.verifyDek(key, proofData);
      console.log('Dek verification result:', result);

      // ตรวจสอบสถานะ prover
      const proverAddress = await this.signer.getAddress();
      const proverStatus = await this.contractUtils.getProverStatus(key, proverAddress);
      console.log('Prover status:', proverStatus);

      return result;
    } catch (error) {
      console.error('Error in exampleVerifyDek:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการตั้งค่า verifier (เฉพาะ owner/admin)
   */
  async exampleConfigVerifier() {
    try {
      console.log('=== ตัวอย่างการตั้งค่า Verifier ===');
      
      // ตรวจสอบว่าเป็น owner หรือ admin
      const owner = await this.contractUtils.getOwner();
      const admin = await this.contractUtils.getAdmin();
      const currentAddress = await this.signer.getAddress();
      
      if (currentAddress !== owner && currentAddress !== admin) {
        throw new Error('Only owner or admin can configure verifier');
      }

      // การตั้งค่า verifier
      const config: VerifierConfig = {
        key: '0x0000000000000000000000000000000000000000000000000000000000000001',
        verifier: '0x1234567890123456789012345678901234567890' as any
      };

      // ตรวจสอบ address format
      if (!NetworkUtils.isValidAddress(config.verifier)) {
        throw new Error('Invalid verifier address');
      }

      // ตั้งค่า verifier
      await this.contractUtils.configVerifier(config);
      console.log('Verifier configured successfully');

      // ตรวจสอบการตั้งค่า
      const verifier = await this.contractUtils.getVerifier(config.key);
      console.log('Configured verifier:', verifier);

    } catch (error) {
      console.error('Error in exampleConfigVerifier:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการสร้าง Poseidon hash
   */
  async examplePoseidonHash() {
    try {
      console.log('=== ตัวอย่างการสร้าง Poseidon Hash ===');
      
      // ข้อมูลที่จะ hash
      const inputs = [
        BigInt('123456789'),
        BigInt('987654321'),
        BigInt('555555555')
      ];

      // สร้าง hash
      const hash = await ProofUtils.poseidonHash(inputs);
      console.log('Poseidon hash:', hash.toString());

      // แปลงเป็น bytes32
      const bytes32 = ProofUtils.toBytes32(hash);
      console.log('Bytes32 format:', bytes32);

      // แปลงกลับเป็น bigint
      const backToBigInt = ProofUtils.bytes32ToBigInt(bytes32);
      console.log('Back to bigint:', backToBigInt.toString());

      return hash;
    } catch (error) {
      console.error('Error in examplePoseidonHash:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการสร้าง verifier key
   */
  async exampleGenerateVerifierKey() {
    try {
      console.log('=== ตัวอย่างการสร้าง Verifier Key ===');
      
      // ข้อมูลที่จะใช้สร้าง key
      const data = [
        '0x1234567890123456789012345678901234567890123456789012345678901234',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        '0x5555555555555555555555555555555555555555555555555555555555555555'
      ];

      // สร้าง verifier key
      const key = await ProofUtils.generateVerifierKey(data);
      console.log('Generated verifier key:', key);

      return key;
    } catch (error) {
      console.error('Error in exampleGenerateVerifierKey:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการตรวจสอบ network
   */
  async exampleNetworkValidation() {
    try {
      console.log('=== ตัวอย่างการตรวจสอบ Network ===');
      
      // ดึงข้อมูล network ปัจจุบัน
      const network = await this.provider.getNetwork();
      console.log('Current network:', network.name);
      console.log('Chain ID:', network.chainId);

      // ตรวจสอบว่าเป็น network ที่ถูกต้อง
      const expectedChainId = 11155111; // Sepolia
      const isValid = NetworkUtils.validateNetwork(expectedChainId, Number(network.chainId));
      console.log('Network validation:', isValid);

      // ดึงข้อมูล network configuration
      const networkConfig = NetworkUtils.getNetworkByChainId(Number(network.chainId));
      console.log('Network config:', networkConfig);

      return isValid;
    } catch (error) {
      console.error('Error in exampleNetworkValidation:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการตรวจสอบ contract status
   */
  async exampleContractStatus() {
    try {
      console.log('=== ตัวอย่างการตรวจสอบ Contract Status ===');
      
      // ตรวจสอบว่า contract ถูก pause อยู่หรือไม่
      const isPaused = await this.contractUtils.isPaused();
      console.log('Contract paused:', isPaused);

      // ดึงข้อมูล owner
      const owner = await this.contractUtils.getOwner();
      console.log('Contract owner:', owner);

      // ดึงข้อมูล admin
      const admin = await this.contractUtils.getAdmin();
      console.log('Contract admin:', admin);

      // ตรวจสอบ address format
      console.log('Owner address valid:', NetworkUtils.isValidAddress(owner));
      console.log('Admin address valid:', NetworkUtils.isValidAddress(admin));

      return {
        isPaused,
        owner,
        admin
      };
    } catch (error) {
      console.error('Error in exampleContractStatus:', error);
      throw error;
    }
  }

  /**
   * ตัวอย่างการใช้งานทั้งหมด
   */
  async runAllExamples() {
    try {
      console.log('🚀 เริ่มต้นการทดสอบ Utils ทั้งหมด\n');

      // ตรวจสอบ network
      await this.exampleNetworkValidation();
      console.log('');

      // ตรวจสอบ contract status
      await this.exampleContractStatus();
      console.log('');

      // สร้าง Poseidon hash
      await this.examplePoseidonHash();
      console.log('');

      // สร้าง verifier key
      await this.exampleGenerateVerifierKey();
      console.log('');

      // ตั้งค่า verifier (ถ้าเป็น owner/admin)
      try {
        await this.exampleConfigVerifier();
        console.log('');
      } catch (error) {
        console.log('ไม่สามารถตั้งค่า verifier ได้ (ไม่ใช่ owner/admin)');
        console.log('');
      }

      // ตรวจสอบ proofs (ต้องมี proof ที่ถูกต้อง)
      console.log('หมายเหตุ: การทดสอบ verify proofs ต้องมี proof ที่ถูกต้อง');
      console.log('สามารถ uncomment บรรทัดด้านล่างเพื่อทดสอบได้\n');

      // await this.exampleVerifyMia();
      // await this.exampleVerifyDek();

      console.log('✅ การทดสอบเสร็จสิ้น');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error);
      throw error;
    }
  }
}

/**
 * ฟังก์ชันสำหรับสร้าง instance ของ ExampleUsage
 */
export function createExampleUsage(
  contractAddress: string,
  contractABI: any[],
  rpcUrl: string,
  privateKey: string
): ExampleUsage {
  return new ExampleUsage(contractAddress, contractABI, rpcUrl, privateKey);
} 