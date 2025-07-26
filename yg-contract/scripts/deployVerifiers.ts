import hre, { ethers } from 'hardhat'

const contractName = "YGVerifier"

async function VerifierDeployer () { 
  const VerifierContract = await ethers.getContractFactory(contractName)
  const verifierContract = await VerifierContract.deploy()
  await verifierContract.deploymentTransaction()?.wait(3)
  const verifierAddress = await verifierContract.getAddress()
  console.log("YoungGuRuVerifier deployed to:", verifierAddress)

  try {
    await hre.run('verify:verify', {
      address: verifierAddress,
      constructorArguments: [],
      contract: 'contracts/verifier.sol:YGVerifier',
    })
    console.log('✅ Verifier verification successful')
  } catch (e: any) {
    console.error('❌ Verifier verification failed:', e.message)
  }
  return verifierAddress
}

const YoungGuRuPikadProxyContractName = "YoungGuRuPikadProxy"

async function ProxyConiguration(ygAddress: string, verifierAddress: string) { 
  const YoungGuRuPikadProxyContract = await ethers.getContractFactory(YoungGuRuPikadProxyContractName)
  const youngGuRuPikadProxyContract = await  YoungGuRuPikadProxyContract.attach(ygAddress)

  // const proxyAddress = await proxyAdmin.getProxyImplementation("0xBA8f8bC595A5e2d79dd70e73c859f46aF484DfdC")
  // Proxy
  const key_bytes32 = ethers.keccak256(ethers.toUtf8Bytes("yg-22/01/47"))
  console.log("Adding verifier configuration with key:", key_bytes32, "and verifier address:", verifierAddress)
  await youngGuRuPikadProxyContract.verifierConfiguration(key_bytes32, verifierAddress)
  console.log("sucessfull add")
}

(async ()=> {
  await VerifierDeployer()
  await ProxyConiguration("0x62a7ae6F5640d888C0CA3519CE48A00b9e36ceA2","0xBA8f8bC595A5e2d79dd70e73c859f46aF484DfdC")
})()


