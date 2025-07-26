import { buildPoseidon } from "circomlibjs";

/**
 * Utils สำหรับจัดการ proof และ cryptographic functions
 */
export class ProofUtils {
  /**
   * สร้าง Poseidon hash จาก inputs
   * @param inputs - ข้อมูลที่จะ hash (bigint หรือ array ของ bigint)
   * @returns hash result เป็น bigint
   */
  static async poseidonHash(inputs: bigint[] | bigint): Promise<bigint> {
    try {
      const poseidon = await buildPoseidon();
      const F = poseidon.F;

      const inputArray = Array.isArray(inputs) ? inputs : [inputs];
      const bigints = inputArray.map((x) => BigInt(x));

      const result = poseidon(bigints);
      return BigInt(F.toString(result));
    } catch (error) {
      console.error('Error creating Poseidon hash:', error);
      throw error;
    }
  }

  /**
   * แปลง bigint เป็น bytes32 format
   * @param bigint - ตัวเลขที่จะแปลง
   * @returns hex string ในรูปแบบ bytes32
   */
  static toBytes32(bigint: bigint): string {
    let hex = bigint.toString(16);
    while (hex.length < 64) hex = "0" + hex; // pad to 32 bytes (64 hex chars)
    return "0x" + hex;
  }

  /**
   * แปลง bytes32 hex เป็น bigint
   * @param bytes32hex - hex string ในรูปแบบ bytes32
   * @returns bigint
   */
  static bytes32ToBigInt(bytes32hex: string): bigint {
    if (bytes32hex.startsWith("0x")) {
      return BigInt(bytes32hex);
    }
    return BigInt("0x" + bytes32hex);
  }

  /**
   * ตรวจสอบว่า proof format ถูกต้องหรือไม่
   * @param proof - proof string
   * @returns true ถ้า format ถูกต้อง
   */
  static validateProofFormat(proof: string): boolean {
    try {
      // ตรวจสอบว่าเป็น hex string และมีความยาวที่เหมาะสม
      if (!proof.startsWith('0x')) {
        return false;
      }
      
      const hexLength = proof.length - 2; // ลบ '0x' ออก
      if (hexLength % 2 !== 0) {
        return false;
      }

      // ตรวจสอบว่าเป็น hex ที่ถูกต้อง
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(proof.slice(2));
    } catch (error) {
      return false;
    }
  }

  /**
   * ตรวจสอบว่า public inputs format ถูกต้องหรือไม่
   * @param publicInputs - array ของ public inputs
   * @returns true ถ้า format ถูกต้อง
   */
  static validatePublicInputs(publicInputs: string[]): boolean {
    try {
      if (!Array.isArray(publicInputs)) {
        return false;
      }

      return publicInputs.every(input => {
        return this.validateProofFormat(input);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * สร้าง key สำหรับ verifier จากข้อมูลต่างๆ
   * @param data - ข้อมูลที่จะใช้สร้าง key
   * @returns key string
   */
  static async generateVerifierKey(data: string[]): Promise<string> {
    try {
      const bigints = data.map(item => BigInt(item));
      const hash = await this.poseidonHash(bigints);
      return this.toBytes32(hash);
    } catch (error) {
      console.error('Error generating verifier key:', error);
      throw error;
    }
  }

  /**
   * แปลง proof object เป็น string format
   * @param proofObject - object ที่มี proof data
   * @returns proof string
   */
  static proofObjectToString(proofObject: any): string {
    try {
      if (typeof proofObject === 'string') {
        return proofObject;
      }
      
      if (typeof proofObject === 'object' && proofObject.proof) {
        return proofObject.proof;
      }

      throw new Error('Invalid proof object format');
    } catch (error) {
      console.error('Error converting proof object to string:', error);
      throw error;
    }
  }

  /**
   * แปลง public inputs array เป็น bytes32 array
   * @param publicInputs - array ของ public inputs
   * @returns array ของ bytes32 strings
   */
  static convertToBytes32Array(publicInputs: (string | number | bigint)[]): string[] {
    try {
      return publicInputs.map(input => {
        if (typeof input === 'string') {
          if (input.startsWith('0x')) {
            return input;
          }
          return this.toBytes32(BigInt(input));
        }
        
        if (typeof input === 'number') {
          return this.toBytes32(BigInt(input));
        }
        
        if (typeof input === 'bigint') {
          return this.toBytes32(input);
        }
        
        throw new Error(`Unsupported input type: ${typeof input}`);
      });
    } catch (error) {
      console.error('Error converting to bytes32 array:', error);
      throw error;
    }
  }
} 