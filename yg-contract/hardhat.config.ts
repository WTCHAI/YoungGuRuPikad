import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"
import '@nomicfoundation/hardhat-verify'

import dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
        ],
    },
    networks: {
        hardhat: {
          allowBlocksWithSameTimestamp: true,
        },
        sepolia: {
          url: process.env.RPC_SEPOLIA!,
          accounts: [process.env.DEPLOYER_PK!],
        },
      },
      etherscan: {
        apiKey: {
          sepolia: process.env.ETHERSCAN_API_KEY_SEPOLIA!,
        },
      },
};

export default config;
