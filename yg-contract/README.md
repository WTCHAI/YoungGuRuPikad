# YG Proxy Contract

[![Solidity](https://img.shields.io/badge/Solidity-0.8.29-brown?logo=solidity)](https://soliditylang.org/)

A custom-built upgradeable proxy contract with Zero-Knowledge verifier integration, implementing the EIP-1967 standard for transparent proxies.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Security](#security)

## Overview

The YG Proxy Contract is an upgradeable proxy implementation that combines the flexibility of upgradeable contracts with Zero-Knowledge proof verification capabilities. It follows the EIP-1967 transparent proxy pattern, ensuring compatibility with existing tooling while providing custom ZK verification functionality.

### Key Benefits

- **Upgradeable**: Seamlessly upgrade contract logic without losing state
- **ZK Integration**: Built-in support for Zero-Knowledge proof verification
- **Standard Compliant**: Follows EIP-1967 for maximum compatibility
- **Gas Efficient**: Optimized assembly code for critical operations
- **Secure**: Comprehensive access controls and safety checks

## Features

### 🔄 Upgradeable Proxy Pattern

- **EIP-1967 Compliance**: Uses standardized storage slots to prevent collisions
- **Transparent Proxy**: Admin and users interact through the same interface
- **Delegate Call Architecture**: Preserves context while executing implementation code
- **Version Management**: Track initialization versions for complex upgrades

### 🔐 Zero-Knowledge Verifier Integration

- **Pluggable Verifiers**: Easily swap ZK verifier implementations
- **Standardized Interface**: `IVerifier` interface for consistency
- **Direct Verification**: Proxy verification calls without extra gas overhead
- **Boolean Results**: Clean true/false verification responses

### 🛡️ Security Features

- **Admin Controls**: Restricted access to critical functions
- **Zero Address Protection**: Prevents invalid address assignments
- **Event Logging**: Comprehensive event emissions for transparency
- **Initialization Safety**: Prevents re-initialization attacks

## Architecture

### Storage Layout (EIP-1967)

The contract uses standardized storage slots to prevent storage collisions:

```solidity
// Admin address storage slot
bytes32 private constant _ADMIN_SLOT = 
    0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

// ZK Verifier address storage slot  
bytes32 private constant _VERIFIER_SLOT = 
    0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

// Implementation address storage slot
bytes32 private constant _IMPLEMENTATION_SLOT = 
    0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3;
```

### Component Interaction

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  User/Contract  │───▶│   YG Proxy       │───▶│  Implementation │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌──────────────────┐
                       │                  │
                       │   ZK Verifier    │
                       │                  │
                       └──────────────────┘
```

## Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Hardhat development environment

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd yg-proxy-contract

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

## Usage

### Basic Deployment

```solidity
// 1. Deploy the proxy contract
YGProxy proxy = new YGProxy();

// 2. Initialize with admin and verifier addresses
proxy.initialize(adminAddress, verifierAddress);

// 3. Deploy and set implementation contract
MyImplementation impl = new MyImplementation();
proxy.upgradeToAndCall(address(impl), "");
```

### ZK Proof Verification

```solidity
// Verify a Zero-Knowledge proof
bytes memory proof = "..."; // Your ZK proof
bytes32[] memory publicInputs = [...]; // Public inputs array

bool isValid = proxy.verify(proof, publicInputs);
require(isValid, "Invalid proof");
```

### Upgrading the Contract

```solidity
// Deploy new implementation
MyImplementationV2 newImpl = new MyImplementationV2();

// Upgrade with initialization data (admin only)
bytes memory initData = abi.encodeWithSignature("initializeV2(uint256)", 42);
proxy.upgradeToAndCall(address(newImpl), initData);
```

### Changing the Verifier

```solidity
// Deploy new verifier
NewVerifier verifier = new NewVerifier();

// Update verifier (admin only)
proxy.changeVerifier(address(verifier));
```

## API Reference

### Admin Functions

| Function | Description | Access |
|----------|-------------|--------|
| `initialize(address admin, address verifier)` | Initialize proxy with admin and verifier | Public (once) |
| `changeAdmin(address newAdmin)` | Transfer admin ownership | Admin only |
| `changeVerifier(address newVerifier)` | Update ZK verifier contract | Admin only |
| `upgradeToAndCall(address impl, bytes data)` | Upgrade implementation with optional initialization | Admin only |

### Public Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `verify(bytes proof, bytes32[] inputs)` | Verify ZK proof using current verifier | `bool` |
| `getAdmin()` | Get current admin address | `address` |
| `getVerifier()` | Get current verifier address | `address` |
| `implementation()` | Get current implementation address | `address` |
| `getInitializedVersion()` | Get current initialization version | `uint64` |

### Events

```solidity
event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
event VerifierChanged(address indexed oldVerifier, address indexed newVerifier);
event Upgraded(address indexed implementation);
event Initialized(uint64 version);
```

## Security

### Access Control

- **Admin Role**: Only the admin can upgrade implementations and change verifiers
- **Initialization**: Single initialization with version tracking
- **Address Validation**: All address parameters are validated against zero address

### Best Practices

1. **Admin Key Management**: Use multi-signature wallets for admin operations
2. **Implementation Testing**: Thoroughly test implementation contracts before upgrading
3. **Verifier Validation**: Ensure new verifiers implement the correct interface
4. **Gradual Rollouts**: Consider using proxy patterns for gradual feature rollouts

### Known Considerations

- Implementation contracts should not use constructors (use initializers instead)
- Storage layout must be carefully managed during upgrades
- Admin address should be secured with appropriate access controls


### Code Coverage

```bash
npx hardhat coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⚠️ Important**: This contract handles critical functionality. Always conduct thorough security audits before deploying to mainnet.