import { cookieStorage, createConfig, createStorage, http } from "wagmi"
import { sepolia, scrollSepolia } from "wagmi/chains"

export const config = createConfig({
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(),
    [scrollSepolia.id]: http(),
  },
  chains: [sepolia, scrollSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  batch: {
    multicall: true,
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
