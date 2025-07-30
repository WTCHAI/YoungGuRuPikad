# YoungGuRuPikad Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6)](https://www.typescriptlang.org/) [![Wagmi](https://img.shields.io/badge/Wagmi-Latest-646CFF)](https://wagmi.sh/) [![Aztec BB.js](https://img.shields.io/badge/Aztec%20BB.js-0.84.0-orange)](https://github.com/AztecProtocol/barretenberg) [![Noir Lang](https://img.shields.io/badge/Noir%20Lang-1.0.0--beta.6-purple)](https://noir-lang.org/) [![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/) [![pnpm](https://img.shields.io/badge/pnpm-Preferred-F69220)](https://pnpm.io/)

A modern frontend application for the YoungGuRuPikad project, built with Next.js 15 and React 19. Features blockchain integrations, zero-knowledge proof generation, and a sleek user interface for seamless Web3 interactions.

## ✨ Features

- **🚀 Next.js 15**: App directory, server components, and lightning-fast development
- **⚛️ React 19**: Latest React features with concurrent rendering and improved hooks
- **🔗 Wagmi Integration**: Seamless Ethereum wallet connections and blockchain interactions
- **🔐 Zero-Knowledge Proofs**: Advanced ZK proof generation and verification with Aztec's Barretenberg
- **🎨 Modern UI**: Custom components with responsive design and accessibility
- **🌙 Theming**: Built-in light/dark mode with system preference detection
- **📘 TypeScript**: Full type safety for enhanced developer experience
- **🔄 State Management**: Efficient global state with React context and custom hooks
- **⚡ Performance**: Optimized builds with code splitting and lazy loading

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **pnpm** (recommended) or npm - [Install pnpm](https://pnpm.io/installation)

### Installation

Clone the repository and install dependencies:

```bash
# Install dependencies
pnpm install

# Or with npm
npm install
```

### Development Server

Start the development server with hot reload:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Production Build

Build and start the production server:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Preview Build

Test the production build locally:

```bash
pnpm build
pnpm preview
```

## 📁 Project Structure

```
├── package.json              # Project dependencies and scripts
├── pnpm-lock.yaml           # Lock file for reproducible installs
├── tsconfig.json            # TypeScript configuration
├── postcss.config.js        # PostCSS configuration
├── prettier.config.js       # Code formatting configuration
├── public/
│   └── younggu.png         # Static assets and images
└── src/
    ├── app/                # Next.js app directory
    │   ├── layout.tsx      # Root layout component
    │   └── page.tsx        # Home page component
    ├── components/         # Reusable React components
    │   ├── Input-container.tsx      # Input wrapper component
    │   ├── background-music.tsx     # Audio background component
    │   ├── popover-date-picker.tsx  # Date selection component
    │   ├── providers.tsx           # App-wide context providers
    │   ├── theme-provider.tsx      # Theme management
    │   ├── map/                    # Map-related components
    │   │   ├── map-center-updater.tsx   # Map center control
    │   │   ├── map-click-handler.tsx    # Map interaction handler
    │   │   └── map-container.tsx        # Main map component
    │   └── ui/                     # Base UI components
    │       ├── button.tsx          # Button variants
    │       ├── calendar.tsx        # Calendar component
    │       ├── dialog.tsx          # Modal dialogs
    │       ├── dropdown-menu.tsx   # Dropdown menus
    │       ├── form.tsx           # Form components
    │       ├── input.tsx          # Input fields
    │       ├── label.tsx          # Form labels
    │       ├── popover.tsx        # Popover containers
    │       ├── separator.tsx      # Visual separators
    │       ├── slider.tsx         # Range sliders
    │       ├── sonner.tsx         # Toast notifications
    │       ├── table.tsx          # Data tables
    │       ├── toggle-group.tsx   # Toggle button groups
    │       └── toggle.tsx         # Toggle switches
    ├── config/             # Configuration files
    │   ├── site.ts         # Site metadata and settings
    │   └── wallet.ts       # Wallet connection config
    ├── env.mjs            # Environment variable validation
    ├── hooks/             # Custom React hooks
    │   └── use-boolean.tsx # Boolean state hook
    ├── interface/         # TypeScript interfaces
    │   └── noir.ts        # Noir/ZK proof interfaces
    ├── lib/               # Core utilities
    │   ├── contract.ts    # Smart contract utilities
    │   ├── formatter.ts   # Data formatting functions
    │   └── utils.ts       # General utility functions
    ├── store/             # State management
    │   ├── location.ts    # Location state store
    │   └── proof.ts       # ZK proof state store
    ├── styles/            # Styling
    │   └── globals.css    # Global CSS styles
    ├── types/             # TypeScript definitions
    │   └── index.d.ts     # Global type declarations
    └── utils/             # Specialized utilities
        ├── format-proof.ts        # Proof formatting utilities
        ├── generating-proof.ts    # ZK proof generation
        └── lat-long-conversion.ts # Geographic coordinate utils
```

## 🔗 Blockchain & ZK Integration

### Wallet Connection
- **Wagmi v2**: Modern React hooks for Ethereum interactions
- **Multi-wallet support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Network switching**: Automatic network detection and switching

### Smart Contracts
- **Type-safe contract interactions** with generated TypeScript bindings
- **Real-time event listening** and state synchronization
- **Transaction status tracking** with user-friendly feedback

### Zero-Knowledge Proofs
- **Aztec Barretenberg**: High-performance ZK proof generation
- **Browser-optimized**: WASM-based proofs running client-side
- **Proof verification**: On-chain and off-chain verification support

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Create optimized production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint for code quality checks |
| `pnpm lint:fix` | Fix auto-fixable linting issues |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run test suites |
| `pnpm clean` | Clean build artifacts and node_modules |

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript

### Blockchain
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Aztec Barretenberg** - Zero-knowledge proofs

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Pre-commit checks

## 🚀 Deployment

### Vercel (Recommended)

Deploy using the Vercel CLI for full control:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

**Alternative: GitHub Integration**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/youngguru-frontend)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### Other Platforms

The application can be deployed to any platform that supports Node.js:

- **Netlify**: Static export with `next export`
- **Railway**: Full-stack deployment
- **Heroku**: Container or buildpack deployment


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⚡ Built with passion by the YoungGuRuPikad team**
