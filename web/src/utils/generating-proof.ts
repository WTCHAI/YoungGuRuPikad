import {
    splitHonkProof,
    UltraHonkBackend,
    UltraPlonkBackend,
  } from '@aztec/bb.js'
  import circuit from '../../../yg-circuit/target/circuit.json'
  // @ts-ignore
  import { Noir } from '@noir-lang/noir_js'
  
  import initNoirC from '@noir-lang/noirc_abi'
  import initACVM from '@noir-lang/acvm_js'
  
  import { CompiledCircuit } from '@noir-lang/types'
  import { CircuitParameter } from '../interface/noir'
  
  export async function GenerateProof(
    params: CircuitParameter
  ): Promise<{ proof: Uint8Array; publicInputs: string[] }> {
    try {
      const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
        import("@noir-lang/noir_js"),
        import("@aztec/bb.js"),
      ])

      const circuit = await import("../../../yg-circuit/target/circuit.json")
      const compiledCircuit = circuit.default as CompiledCircuit

      const noir = new Noir(compiledCircuit)
      const backend = new UltraHonkBackend(compiledCircuit.bytecode)
      await noir.init()
      const inputs = {
        position_x: params.position_x,
        position_y: params.position_y,
        radius: params.radius,
        target_x: params.target_x,
        target_y: params.target_y,
      }
  
      const { witness } = await noir.execute(inputs)
      const { proof, publicInputs } = await backend.generateProof(witness, {
        keccak: true,
      })
      const verified = await backend.verifyProof({ proof, publicInputs })
      console.log('Proof generated and verified successfully:', verified)
      console.log(await backend.verifyProof({ proof, publicInputs }))
      return { proof, publicInputs }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  