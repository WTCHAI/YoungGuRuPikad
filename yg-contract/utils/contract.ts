import { ethers } from 'ethers';
import { Address } from 'viem';

export interface IYoungGuRuPikadProxy {
  verifyMia(
    key: string,
    proof: string,
    publicInputs: string[]
  ): Promise<boolean>;
  
  verifyDek(
    key: string,
    proof: string,
    publicInputs: string[]
  ): Promise<boolean>;
  
  configVerifier(
    key: string,
    verifier: string
  ): Promise<void>;
  
  verifierConfiguration(
    key: string,
    verifier: string
  ): Promise<void>;
  
  verifiers(key: string): Promise<string>;
  provers(key: string, prover: string): Promise<boolean>;
}

export interface ProofData {
  proof: string;
  publicInputs: string[];
}

export interface VerifierConfig {
  key: string;
  verifier: Address;
}

export interface ContractStatus {
  isDeployed: boolean;
  isPaused: boolean;
  owner: string;
  admin: string;
  hasVerifiers: boolean;
  verifierCount: number;
}

/**
 * Utils สำหรับ interact กับ YoungGuRuPikadProxy contract
 */
export class YoungGuRuPikadUtils {
  private contract: ethers.Contract;
  private signer: ethers.Signer;
  private provider: ethers.Provider;

  constructor(
    contractAddress: string,
    contractABI: any[],
    signer: ethers.Signer
  ) {
    this.contract = new ethers.Contract(contractAddress, contractABI, signer);
    this.signer = signer;
    this.provider = signer.provider!;
  }

  /**
   * ตรวจสอบว่า contract ถูก deploy แล้วหรือไม่
   * @returns true ถ้า contract ถูก deploy แล้ว
   */
  async isContractDeployed(): Promise<boolean> {
    try {
      const code = await this.provider.getCode(this.contract.target);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking contract deployment:', error);
      return false;
    }
  }

  /**
   * ดึงข้อมูล contract status ทั้งหมด
   * @returns ContractStatus object
   */
  async getContractStatus(): Promise<ContractStatus> {
    try {
      const isDeployed = await this.isContractDeployed();
      
      if (!isDeployed) {
        return {
          isDeployed: false,
          isPaused: false,
          owner: '',
          admin: '',
          hasVerifiers: false,
          verifierCount: 0
        };
      }

      const [isPaused, owner, admin] = await Promise.all([
        this.isPaused(),
        this.getOwner(),
        this.getAdmin()
      ]);

      // ตรวจสอบว่ามี verifier ตั้งค่าไว้หรือไม่
      const hasVerifiers = await this.hasAnyVerifiers();
      const verifierCount = await this.getVerifierCount();

      return {
        isDeployed: true,
        isPaused,
        owner,
        admin,
        hasVerifiers,
        verifierCount
      };
    } catch (error) {
      console.error('Error getting contract status:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่ามี verifier ตั้งค่าไว้หรือไม่
   * @returns true ถ้ามี verifier อย่างน้อย 1 ตัว
   */
  async hasAnyVerifiers(): Promise<boolean> {
    try {
      // ตรวจสอบ verifier สำหรับ key เริ่มต้น
      const defaultKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
      const verifier = await this.getVerifier(defaultKey);
      return verifier !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('Error checking verifiers:', error);
      return false;
    }
  }

  /**
   * นับจำนวน verifier ที่ตั้งค่าไว้
   * @returns จำนวน verifier
   */
  async getVerifierCount(): Promise<number> {
    try {
      // ตรวจสอบ verifier สำหรับ key ต่างๆ
      const keys = [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000000000000000000000000000003'
      ];

      let count = 0;
      for (const key of keys) {
        try {
          const verifier = await this.getVerifier(key);
          if (verifier !== '0x0000000000000000000000000000000000000000') {
            count++;
          }
        } catch (error) {
          // ข้าม key ที่มีปัญหา
          continue;
        }
      }

      return count;
    } catch (error) {
      console.error('Error counting verifiers:', error);
      return 0;
    }
  }

  /**
   * ดึงรายการ verifier ทั้งหมด
   * @returns array ของ verifier keys และ addresses
   */
  async getAllVerifiers(): Promise<Array<{key: string, address: string}>> {
    try {
      const verifiers: Array<{key: string, address: string}> = [];
      
      // ตรวจสอบ verifier สำหรับ key ต่างๆ
      const keys = [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000002',
        '0x0000000000000000000000000000000000000000000000000000000000000003',
        '0x0000000000000000000000000000000000000000000000000000000000000004',
        '0x0000000000000000000000000000000000000000000000000000000000000005'
      ];

      for (const key of keys) {
        try {
          const address = await this.getVerifier(key);
          if (address !== '0x0000000000000000000000000000000000000000') {
            verifiers.push({ key, address });
          }
        } catch (error) {
          // ข้าม key ที่มีปัญหา
          continue;
        }
      }

      return verifiers;
    } catch (error) {
      console.error('Error getting all verifiers:', error);
      return [];
    }
  }

  /**
   * ตรวจสอบ Mia proof
   * @param key - Key สำหรับ verifier
   * @param proofData - ข้อมูล proof และ public inputs
   * @returns ผลลัพธ์การ verify
   */
  async verifyMia(key: string, proofData: ProofData): Promise<boolean> {
    try {
      // ตรวจสอบว่า contract ถูก deploy แล้ว
      const isDeployed = await this.isContractDeployed();
      if (!isDeployed) {
        throw new Error('Contract is not deployed');
      }

      // ตรวจสอบว่ามี verifier สำหรับ key นี้หรือไม่
      const verifier = await this.getVerifier(key);
      if (verifier === '0x0000000000000000000000000000000000000000') {
        throw new Error(`No verifier configured for key: ${key}`);
      }

      const result = await this.contract.verifyMia(
        key,
        proofData.proof,
        proofData.publicInputs
      );
      return result;
    } catch (error) {
      console.error('Error verifying Mia proof:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบ Dek proof
   * @param key - Key สำหรับ verifier
   * @param proofData - ข้อมูล proof และ public inputs
   * @returns ผลลัพธ์การ verify
   */
  async verifyDek(key: string, proofData: ProofData): Promise<boolean> {
    try {
      // ตรวจสอบว่า contract ถูก deploy แล้ว
      const isDeployed = await this.isContractDeployed();
      if (!isDeployed) {
        throw new Error('Contract is not deployed');
      }

      // ตรวจสอบว่ามี verifier สำหรับ key นี้หรือไม่
      const verifier = await this.getVerifier(key);
      if (verifier === '0x0000000000000000000000000000000000000000') {
        throw new Error(`No verifier configured for key: ${key}`);
      }

      const result = await this.contract.verifyDek(
        key,
        proofData.proof,
        proofData.publicInputs
      );
      return result;
    } catch (error) {
      console.error('Error verifying Dek proof:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า verifier (เฉพาะ owner หรือ admin)
   * @param config - การตั้งค่า verifier
   */
  async configVerifier(config: VerifierConfig): Promise<void> {
    try {
      // ตรวจสอบว่า contract ถูก deploy แล้ว
      const isDeployed = await this.isContractDeployed();
      if (!isDeployed) {
        throw new Error('Contract is not deployed');
      }

      // ตรวจสอบว่าเป็น owner หรือ admin
      const owner = await this.getOwner();
      const admin = await this.getAdmin();
      const currentAddress = await this.signer.getAddress();
      
      if (currentAddress !== owner && currentAddress !== admin) {
        throw new Error('Only owner or admin can configure verifier');
      }

      const tx = await this.contract.configVerifier(
        config.key,
        config.verifier
      );
      await tx.wait();
      console.log('Verifier configured successfully');
    } catch (error) {
      console.error('Error configuring verifier:', error);
      throw error;
    }
  }

  /**
   * ตั้งค่า verifier configuration
   * @param config - การตั้งค่า verifier
   */
  async verifierConfiguration(config: VerifierConfig): Promise<void> {
    try {
      // ตรวจสอบว่า contract ถูก deploy แล้ว
      const isDeployed = await this.isContractDeployed();
      if (!isDeployed) {
        throw new Error('Contract is not deployed');
      }

      const tx = await this.contract.verifierConfiguration(
        config.key,
        config.verifier
      );
      await tx.wait();
      console.log('Verifier configuration updated successfully');
    } catch (error) {
      console.error('Error updating verifier configuration:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล verifier สำหรับ key ที่กำหนด
   * @param key - Key ของ verifier
   * @returns Address ของ verifier
   */
  async getVerifier(key: string): Promise<string> {
    try {
      const verifier = await this.contract.verifiers(key);
      return verifier;
    } catch (error) {
      console.error('Error getting verifier:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะ prover สำหรับ key ที่กำหนด
   * @param key - Key ของ verifier
   * @param prover - Address ของ prover
   * @returns สถานะของ prover
   */
  async getProverStatus(key: string, prover: string): Promise<boolean> {
    try {
      const status = await this.contract.provers(key, prover);
      return status;
    } catch (error) {
      console.error('Error getting prover status:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า contract ถูก pause อยู่หรือไม่
   * @returns true ถ้า contract ถูก pause
   */
  async isPaused(): Promise<boolean> {
    try {
      const paused = await this.contract.paused();
      return paused;
    } catch (error) {
      console.error('Error checking pause status:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล owner ของ contract
   * @returns Address ของ owner
   */
  async getOwner(): Promise<string> {
    try {
      const owner = await this.contract.owner();
      return owner;
    } catch (error) {
      console.error('Error getting owner:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล admin ของ contract
   * @returns Address ของ admin
   */
  async getAdmin(): Promise<string> {
    try {
      const admin = await this.contract.admin();
      return admin;
    } catch (error) {
      console.error('Error getting admin:', error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่า address เป็น owner หรือ admin หรือไม่
   * @param address - address ที่จะตรวจสอบ
   * @returns true ถ้าเป็น owner หรือ admin
   */
  async isOwnerOrAdmin(address: string): Promise<boolean> {
    try {
      const owner = await this.getOwner();
      const admin = await this.getAdmin();
      return address === owner || address === admin;
    } catch (error) {
      console.error('Error checking owner/admin status:', error);
      return false;
    }
  }

  /**
   * ดึงข้อมูล contract address
   * @returns contract address
   */
  getContractAddress(): string {
    return this.contract.target as string;
  }

  /**
   * ดึงข้อมูล signer address
   * @returns signer address
   */
  async getSignerAddress(): Promise<string> {
    return await this.signer.getAddress();
  }
} 