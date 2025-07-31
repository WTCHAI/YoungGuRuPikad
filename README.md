# YoungGuRuPikad Monorepo

A modular, privacy-preserving location verification system leveraging zero-knowledge proofs, blockchain smart contracts, and a modern web frontend.

## Project Structure

This repository contains the following main components:

- [`yg-circuit`](./yg-circuit/README.md): Noir zero-knowledge circuit for point-in-circle (location) verification.
- [`yg-contract`](./yg-contract/README.md): Solidity smart contracts for upgradeable proxy and ZK proof verification.
- [`web`](./web/README.md): Next.js 15 + React 19 frontend for user interaction, proof generation, and blockchain integration.
- [`telegram-bot`](./telegram-bot/README.md): Python Telegram bot and backend for user onboarding, notifications, and blockchain event indexing.

## Quick Navigation

- [🟣 Noir Circuit (`yg-circuit`)](./yg-circuit/README.md)
- [🟤 Smart Contracts (`yg-contract`)](./yg-contract/README.md)
- [🟦 Web Frontend (`web`)](./web/README.md)
- [🟩 Telegram Bot & Backend (`telegram-bot`)](./telegram-bot/README.md)

## High-Level Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │◀────▶│   Backend    │◀────▶│  Blockchain  │
│   (web)      │      │ (telegram-bot│      │ (yg-contract │
└──────────────┘      │   + API)     │      └──────────────┘
        ▲             └──────────────┘              ▲
        │                                           │
        ▼                                           │
┌────────────────────┐                              │
│   ZK Circuit       │                              │
│   (yg-circuit)     │──────────────────────────────┘
└────────────────────┘
```

- **Frontend**: User interface for proof generation and contract interaction
- **Backend/Bot**: Telegram bot, FastAPI backend, and blockchain indexer
- **Smart Contracts**: Upgradeable proxy and ZK verifier on Ethereum-compatible chains
- **ZK Circuit**: Noir circuit for privacy-preserving location proofs

## Getting Started

Each component has its own setup instructions. Please refer to the README in each folder:

- [yg-circuit/README.md](./yg-circuit/README.md)
- [yg-contract/README.md](./yg-contract/README.md)
- [web/README.md](./web/README.md)
- [telegram-bot/README.md](./telegram-bot/README.md)

## License

This project is licensed under the MIT License. See each subproject for details.

---

**Built with ❤️ by the YoungGuRuPikad team**
