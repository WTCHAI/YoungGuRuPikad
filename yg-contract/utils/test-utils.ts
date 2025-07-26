import { ProofUtils } from './proof';
import { NetworkUtils } from './network';

// ====== TEST DATA ======
const TEST_DATA = {
  // Test cases สำหรับ bigint conversion
  bigints: [
    BigInt('0'),
    BigInt('123456789'),
    BigInt('9999999999999999999999999999999999999999999999999999999999999999'),
    BigInt('18446744073709551615'), // max uint64
    BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935') // max uint256
  ],
  
  // Test cases สำหรับ proof validation
  validProofs: [
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  ],
  
  invalidProofs: [
    '1234567890abcdef', // ไม่มี 0x
    '0x123', // ความยาวไม่ถูกต้อง
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // ยาวเกินไป
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefg', // มีตัวอักษรที่ไม่ใช่ hex
    '', // ว่าง
    '0x' // เฉพาะ 0x
  ],
  
  // Test cases สำหรับ public inputs
  validPublicInputs: [
    ['0x0000000000000000000000000000000000000000000000000000000000000001'],
    ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'],
    ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002', '0x0000000000000000000000000000000000000000000000000000000000000003']
  ],
  
  invalidPublicInputs: [
    ['0x123'], // ความยาวไม่ถูกต้อง
    ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 'invalid'], // มีตัวที่ไม่ถูกต้อง
    ['0x', '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'] // มีตัวว่าง
  ],
  
  // Test cases สำหรับ address validation
  validAddresses: [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    '0x0000000000000000000000000000000000000000'
  ],
  
  invalidAddresses: [
    '0x123456789012345678901234567890123456789', // สั้นเกินไป
    '0x12345678901234567890123456789012345678901', // ยาวเกินไป
    '1234567890123456789012345678901234567890', // ไม่มี 0x
    '0x123456789012345678901234567890123456789g', // มีตัวอักษรที่ไม่ใช่ hex
    '0x', // เฉพาะ 0x
    '' // ว่าง
  ],
  
  // Test cases สำหรับ transaction hash validation
  validTxHashes: [
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
  ],
  
  invalidTxHashes: [
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // สั้นเกินไป
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // ยาวเกินไป
    '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefg' // มีตัวอักษรที่ไม่ใช่ hex
  ]
};

// ====== TEST SUITE CLASS ======
class UtilsTestSuite {
  private testResults: { [key: string]: { passed: number; failed: number; errors: string[] } } = {};
  
  constructor() {
    this.initializeTestResults();
  }
  
  private initializeTestResults() {
    this.testResults = {
      'BigInt Conversion': { passed: 0, failed: 0, errors: [] },
      'Proof Validation': { passed: 0, failed: 0, errors: [] },
      'Public Inputs Validation': { passed: 0, failed: 0, errors: [] },
      'Address Validation': { passed: 0, failed: 0, errors: [] },
      'Transaction Hash Validation': { passed: 0, failed: 0, errors: [] },
      'Network Validation': { passed: 0, failed: 0, errors: [] },
      'Poseidon Hash': { passed: 0, failed: 0, errors: [] },
      'Verifier Key Generation': { passed: 0, failed: 0, errors: [] }
    };
  }
  
  private logTest(testName: string, testCase: string, passed: boolean, error?: string) {
    const result = this.testResults[testName];
    if (passed) {
      result.passed++;
      console.log(`✅ ${testName} - ${testCase}`);
    } else {
      result.failed++;
      result.errors.push(`${testCase}: ${error}`);
      console.log(`❌ ${testName} - ${testCase}: ${error}`);
    }
  }
  
  // ====== BIGINT CONVERSION TESTS ======
  async testBigIntConversion() {
    console.log('\n🔢 Testing BigInt Conversion...');
    
    for (const bigint of TEST_DATA.bigints) {
      try {
        // Test toBytes32
        const bytes32 = ProofUtils.toBytes32(bigint);
        if (!bytes32.startsWith('0x') || bytes32.length !== 66) {
          this.logTest('BigInt Conversion', `toBytes32(${bigint})`, false, 'Invalid bytes32 format');
          continue;
        }
        
        // Test bytes32ToBigInt
        const backToBigInt = ProofUtils.bytes32ToBigInt(bytes32);
        if (backToBigInt !== bigint) {
          this.logTest('BigInt Conversion', `bytes32ToBigInt(${bytes32})`, false, `Expected ${bigint}, got ${backToBigInt}`);
          continue;
        }
        
        this.logTest('BigInt Conversion', `${bigint} ↔ ${bytes32}`, true);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('BigInt Conversion', `${bigint}`, false, msg);
      }
    }
  }
  
  // ====== PROOF VALIDATION TESTS ======
  testProofValidation() {
    console.log('\n🔍 Testing Proof Validation...');
    
    // Test valid proofs
    for (const proof of TEST_DATA.validProofs) {
      try {
        const isValid = ProofUtils.validateProofFormat(proof);
        this.logTest('Proof Validation', `Valid proof: ${proof}`, isValid, isValid ? undefined : 'Should be valid');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Proof Validation', `Valid proof: ${proof}`, false, msg);
      }
    }
    
    // Test invalid proofs
    for (const proof of TEST_DATA.invalidProofs) {
      try {
        const isValid = ProofUtils.validateProofFormat(proof);
        this.logTest('Proof Validation', `Invalid proof: ${proof}`, !isValid, isValid ? 'Should be invalid' : undefined);
      } catch (error) {
        this.logTest('Proof Validation', `Invalid proof: ${proof}`, true); // Error is expected for invalid proofs
      }
    }
  }
  
  // ====== PUBLIC INPUTS VALIDATION TESTS ======
  testPublicInputsValidation() {
    console.log('\n📝 Testing Public Inputs Validation...');
    
    // Test valid public inputs
    for (const inputs of TEST_DATA.validPublicInputs) {
      try {
        const isValid = ProofUtils.validatePublicInputs(inputs);
        this.logTest('Public Inputs Validation', `Valid inputs: [${inputs.join(', ')}]`, isValid, isValid ? undefined : 'Should be valid');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Public Inputs Validation', `Valid inputs: [${inputs.join(', ')}]`, false, msg);
      }
    }
    
    // Test invalid public inputs
    for (const inputs of TEST_DATA.invalidPublicInputs) {
      try {
        const isValid = ProofUtils.validatePublicInputs(inputs);
        this.logTest('Public Inputs Validation', `Invalid inputs: [${inputs.join(', ')}]`, !isValid, isValid ? 'Should be invalid' : undefined);
      } catch (error) {
        this.logTest('Public Inputs Validation', `Invalid inputs: [${inputs.join(', ')}]`, true); // Error is expected
      }
    }
  }
  
  // ====== ADDRESS VALIDATION TESTS ======
  testAddressValidation() {
    console.log('\n📍 Testing Address Validation...');
    
    // Test valid addresses
    for (const address of TEST_DATA.validAddresses) {
      try {
        const isValid = NetworkUtils.isValidAddress(address);
        this.logTest('Address Validation', `Valid address: ${address}`, isValid, isValid ? undefined : 'Should be valid');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Address Validation', `Valid address: ${address}`, false, msg);
      }
    }
    
    // Test invalid addresses
    for (const address of TEST_DATA.invalidAddresses) {
      try {
        const isValid = NetworkUtils.isValidAddress(address);
        this.logTest('Address Validation', `Invalid address: ${address}`, !isValid, isValid ? 'Should be invalid' : undefined);
      } catch (error) {
        this.logTest('Address Validation', `Invalid address: ${address}`, true); // Error is expected
      }
    }
  }
  
  // ====== TRANSACTION HASH VALIDATION TESTS ======
  testTransactionHashValidation() {
    console.log('\n🔗 Testing Transaction Hash Validation...');
    
    // Test valid transaction hashes
    for (const txHash of TEST_DATA.validTxHashes) {
      try {
        const isValid = NetworkUtils.isValidTransactionHash(txHash);
        this.logTest('Transaction Hash Validation', `Valid txHash: ${txHash}`, isValid, isValid ? undefined : 'Should be valid');
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Transaction Hash Validation', `Valid txHash: ${txHash}`, false, msg);
      }
    }
    
    // Test invalid transaction hashes
    for (const txHash of TEST_DATA.invalidTxHashes) {
      try {
        const isValid = NetworkUtils.isValidTransactionHash(txHash);
        this.logTest('Transaction Hash Validation', `Invalid txHash: ${txHash}`, !isValid, isValid ? 'Should be invalid' : undefined);
      } catch (error) {
        this.logTest('Transaction Hash Validation', `Invalid txHash: ${txHash}`, true); // Error is expected
      }
    }
  }
  
  // ====== NETWORK VALIDATION TESTS ======
  testNetworkValidation() {
    console.log('\n🌐 Testing Network Validation...');
    
    const testCases = [
      { expected: 1, current: 1, shouldPass: true },
      { expected: 11155111, current: 11155111, shouldPass: true },
      { expected: 1, current: 11155111, shouldPass: false },
      { expected: 11155111, current: 1, shouldPass: false },
      { expected: 5, current: 5, shouldPass: true },
      { expected: 31337, current: 31337, shouldPass: true }
    ];
    
    for (const testCase of testCases) {
      try {
        const isValid = NetworkUtils.validateNetwork(testCase.expected, testCase.current);
        this.logTest('Network Validation', 
          `Expected: ${testCase.expected}, Current: ${testCase.current}`, 
          isValid === testCase.shouldPass, 
          isValid !== testCase.shouldPass ? `Expected ${testCase.shouldPass}, got ${isValid}` : undefined
        );
      } catch (error) {
        this.logTest('Network Validation', 
          `Expected: ${testCase.expected}, Current: ${testCase.current}`, 
          false, 
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }
  
  // ====== POSEIDON HASH TESTS ======
  async testPoseidonHash() {
    console.log('\n🔐 Testing Poseidon Hash...');
    
    const testCases = [
      { input: [BigInt(1)], description: 'Single value' },
      { input: [BigInt(1), BigInt(2), BigInt(3)], description: 'Multiple values' },
      { input: [BigInt(0), BigInt(0), BigInt(0)], description: 'Zero values' },
      { input: [BigInt('123456789'), BigInt('987654321')], description: 'Large numbers' }
    ];
    
    for (const testCase of testCases) {
      try {
        const hash = await ProofUtils.poseidonHash(testCase.input);
        
        // Check if hash is a valid bigint
        if (typeof hash === 'bigint' && hash >= 0) {
          this.logTest('Poseidon Hash', `${testCase.description}: [${testCase.input.join(', ')}] → ${hash}`, true);
        } else {
          this.logTest('Poseidon Hash', `${testCase.description}: [${testCase.input.join(', ')}]`, false, 'Invalid hash result');
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Poseidon Hash', `${testCase.description}: [${testCase.input.join(', ')}]`, false, msg);
      }
    }
  }
  
  // ====== VERIFIER KEY GENERATION TESTS ======
  async testVerifierKeyGeneration() {
    console.log('\n🔑 Testing Verifier Key Generation...');
    
    const testCases = [
      { data: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'], description: 'Single key' },
      { data: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'], description: 'Multiple keys' },
      { data: ['0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000002'], description: 'Sequential keys' }
    ];
    
    for (const testCase of testCases) {
      try {
        const key = await ProofUtils.generateVerifierKey(testCase.data);
        
        // Check if key is a valid bytes32 format
        if (key.startsWith('0x') && key.length === 66) {
          this.logTest('Verifier Key Generation', `${testCase.description}: [${testCase.data.join(', ')}] → ${key}`, true);
        } else {
          this.logTest('Verifier Key Generation', `${testCase.description}: [${testCase.data.join(', ')}]`, false, 'Invalid key format');
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logTest('Verifier Key Generation', `${testCase.description}: [${testCase.data.join(', ')}]`, false, msg);
      }
    }
  }
  
  // ====== RUN ALL TESTS ======
  async runAllTests() {
    console.log('🚀 Starting YoungGuRuPikad Utils Test Suite');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    await this.testBigIntConversion();
    this.testProofValidation();
    this.testPublicInputsValidation();
    this.testAddressValidation();
    this.testTransactionHashValidation();
    this.testNetworkValidation();
    await this.testPoseidonHash();
    await this.testVerifierKeyGeneration();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    this.printTestSummary(duration);
  }
  
  // ====== PRINT TEST SUMMARY ======
  printTestSummary(duration: number) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const [testName, result] of Object.entries(this.testResults)) {
      const total = result.passed + result.failed;
      const percentage = total > 0 ? ((result.passed / total) * 100).toFixed(1) : '0.0';
      
      console.log(`${testName}:`);
      console.log(`  ✅ Passed: ${result.passed}/${total} (${percentage}%)`);
      if (result.failed > 0) {
        console.log(`  ❌ Failed: ${result.failed}/${total}`);
        console.log(`  📝 Errors:`);
        result.errors.forEach(error => console.log(`    - ${error}`));
      }
      console.log('');
      
      totalPassed += result.passed;
      totalFailed += result.failed;
    }
    
    const totalTests = totalPassed + totalFailed;
    const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    
    console.log('='.repeat(60));
    console.log(`🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} (${overallPercentage}%)`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    if (totalFailed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed`);
    }
    console.log('='.repeat(60));
  }
}

// ====== MAIN EXECUTION ======
async function main() {
  try {
    const testSuite = new UtilsTestSuite();
    await testSuite.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed to run:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main();
}

export { UtilsTestSuite };