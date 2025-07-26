import * as dotenv from 'dotenv';
dotenv.config();

export class NetworkUtils {
  /**
   * Network configuration
   */
  static readonly NETWORKS = {
    SEPOLIA: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: process.env.RPC_URL || 'https://sepolia.infura.io/v3/',
      blockExplorer: 'https://sepolia.etherscan.io'
    },
  };

  /**
   * ตรวจสอบว่า network ที่เชื่อมต่ออยู่ถูกต้องหรือไม่
   * @param expectedChainId - chain ID ที่คาดหวัง
   * @param currentChainId - chain ID ปัจจุบัน
   * @returns true ถ้า network ถูกต้อง
   */
  static validateNetwork(expectedChainId: number, currentChainId: number): boolean {
    return expectedChainId === currentChainId;
  }

  /**
   * ดึงข้อมูล network จาก chain ID
   * @param chainId - chain ID ของ network
   * @returns network configuration หรือ null ถ้าไม่พบ
   */
  static getNetworkByChainId(chainId: number) {
    return Object.values(this.NETWORKS).find(network => network.chainId === chainId) || null;
  }

  /**
   * สร้าง RPC URL สำหรับ network ที่กำหนด
   * @param networkName - ชื่อ network
   * @param apiKey - API key สำหรับ Infura (ถ้ามี)
   * @returns RPC URL
   */
  static createRpcUrl(networkName: string, apiKey?: string): string {
    const network = this.NETWORKS[networkName as keyof typeof this.NETWORKS];
    if (!network) {
      throw new Error(`Unknown network: ${networkName}`);
    }

    if (networkName === 'LOCALHOST') {
      return network.rpcUrl;
    }

    if (!apiKey) {
      throw new Error(`API key required for network: ${networkName}`);
    }

    return network.rpcUrl + apiKey;
  }

  /**
   * ตรวจสอบว่า address format ถูกต้องหรือไม่
   * @param address - address ที่จะตรวจสอบ
   * @returns true ถ้า format ถูกต้อง
   */
  static isValidAddress(address: string): boolean {
    try {
      // ตรวจสอบว่าเป็น hex string และมีความยาว 42 characters (รวม 0x)
      if (!address.startsWith('0x') || address.length !== 42) {
        return false;
      }

      // ตรวจสอบว่าเป็น hex ที่ถูกต้อง
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(address.slice(2));
    } catch (error) {
      return false;
    }
  }

  /**
   * แปลง address เป็น checksum format
   * @param address - address ที่จะแปลง
   * @returns checksum address
   */
  static toChecksumAddress(address: string): string {
    if (!this.isValidAddress(address)) {
      throw new Error('Invalid address format');
    }

    // Simple checksum implementation
    // ใน production ควรใช้ library เช่น ethers.js
    return address.toLowerCase();
  }

  /**
   * สร้าง transaction URL สำหรับ block explorer
   * @param txHash - transaction hash
   * @param networkName - ชื่อ network
   * @returns URL สำหรับดู transaction
   */
  static createTransactionUrl(txHash: string, networkName: string): string {
    const network = this.NETWORKS[networkName as keyof typeof this.NETWORKS];
    if (!network || !network.blockExplorer) {
      throw new Error(`Block explorer not available for network: ${networkName}`);
    }

    return `${network.blockExplorer}/tx/${txHash}`;
  }

  /**
   * สร้าง address URL สำหรับ block explorer
   * @param address - contract หรือ wallet address
   * @param networkName - ชื่อ network
   * @returns URL สำหรับดู address
   */
  static createAddressUrl(address: string, networkName: string): string {
    const network = this.NETWORKS[networkName as keyof typeof this.NETWORKS];
    if (!network || !network.blockExplorer) {
      throw new Error(`Block explorer not available for network: ${networkName}`);
    }

    return `${network.blockExplorer}/address/${address}`;
  }

  /**
   * ตรวจสอบว่า transaction hash format ถูกต้องหรือไม่
   * @param txHash - transaction hash ที่จะตรวจสอบ
   * @returns true ถ้า format ถูกต้อง
   */
  static isValidTransactionHash(txHash: string): boolean {
    try {
      // ตรวจสอบว่าเป็น hex string และมีความยาว 66 characters (รวม 0x)
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        return false;
      }

      // ตรวจสอบว่าเป็น hex ที่ถูกต้อง
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(txHash.slice(2));
    } catch (error) {
      return false;
    }
  }

  /**
   * รอให้ transaction ถูก confirm
   * @param provider - ethers provider
   * @param txHash - transaction hash
   * @param confirmations - จำนวน confirmations ที่ต้องการ (default: 1)
   * @returns transaction receipt
   */
  static async waitForTransaction(
    provider: any,
    txHash: string,
    confirmations: number = 1
  ): Promise<any> {
    try {
      if (!this.isValidTransactionHash(txHash)) {
        throw new Error('Invalid transaction hash');
      }

      const receipt = await provider.waitForTransaction(txHash, confirmations);
      return receipt;
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล gas price จาก network
   * @param provider - ethers provider
   * @returns gas price ในรูปแบบ bigint
   */
  static async getGasPrice(provider: any): Promise<bigint> {
    try {
      const gasPrice = await provider.getFeeData();
      return gasPrice.gasPrice || BigInt(0);
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  /**
   * คำนวณ gas limit สำหรับ transaction
   * @param provider - ethers provider
   * @param transaction - transaction object
   * @returns gas limit
   */
  static async estimateGas(provider: any, transaction: any): Promise<bigint> {
    try {
      const gasLimit = await provider.estimateGas(transaction);
      return gasLimit;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }
} 