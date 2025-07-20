import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.29",
            },
            {
                version: "0.8.4",
            },
        ],
    },
};

export default config;
