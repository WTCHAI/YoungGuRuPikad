import hre, { ethers } from "hardhat"

const YoungGuRuPikadProxyContractName = "YoungGuRuPikadProxy"

async function ProxyDeployer() {
  const YoungGuRuPikadProxyContract = await ethers.getContractFactory(YoungGuRuPikadProxyContractName)
  const youngGuRuPikadProxyContract = await YoungGuRuPikadProxyContract.deploy()
  await youngGuRuPikadProxyContract.deploymentTransaction()?.wait(3)
  
  const youngGuRuPikadProxyAddress = await youngGuRuPikadProxyContract.getAddress()
  console.log("YoungGuRuPikadProxy deployed to:", youngGuRuPikadProxyAddress)

  try {
    await hre.run('verify:verify', {
      address: youngGuRuPikadProxyAddress,
      constructorArguments: [],
      contract: 'contracts/ygProxy.sol:YoungGuRuPikadProxy',
    })
    console.log('✅ Adapter verification successful')
  } catch (e: any) {
    console.error('❌ Adapter verification failed:', e.message)
  }

  console.log(`Deployed contract: ${YoungGuRuPikadProxyContractName}, network: ${hre.network.name}, address: ${youngGuRuPikadProxyAddress}`)
  return youngGuRuPikadProxyAddress
}

async function proxyInitilizer(address: string){
  const deployers = await ethers.getSigners()
  const YoungGuRuPikadProxyContract = await ethers.getContractFactory(YoungGuRuPikadProxyContractName)
  const youngGuRuPikadProxyContract = await  YoungGuRuPikadProxyContract.attach(address)
  console.log("Initializing YoungGuRuPikadProxy contract...")
  const tx = await youngGuRuPikadProxyContract.initialize(deployers[0], deployers[0])
  await tx.wait(3)
  console.log("Initialization transaction hash:", tx.hash)
  console.log("YoungGuRuPikadProxy contract initialized successfully.")
}

(async ()=>{
  try {
    console.log("deploying contract")
    const address = await ProxyDeployer()
    await proxyInitilizer(address)
  } catch (error) {
    console.error("Error deploying contract:", error)
    process.exit(1)
  }
  process.exit(0)
})()