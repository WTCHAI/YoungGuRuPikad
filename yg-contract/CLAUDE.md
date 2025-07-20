# YG Proxy Contract Implementation

## Overview

Custom-built upgradeable proxy pattern contract with ZK verifier integration, following EIP-1967 standard without external dependencies.

## Contract Features

### 1. Proxy Pattern Design

- **EIP-1967 Storage Slots**: Uses standardized storage slots to avoid collisions
- **Admin Control**: Only admin can change verifier and upgrade implementation
- **Delegate Call**: Fallback function delegates calls to implementation contract
- **Upgradeable**: Full upgradeable contract pattern with `upgradeToAndCall`

### 2. ZK Verifier Integration

- **IVerifier Interface**: Standardized interface for verification contracts
- **Changeable Verifier**: Admin can switch verifier contract addresses
- **Verification Proxy**: `verify()` function proxies calls to current verifier
- **Returns Boolean**: True/false verification results

### 3. Storage Slots (EIP-1967)

```solidity
_ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103
_VERIFIER_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
_IMPLEMENTATION_SLOT = 0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3
```

### 4. Key Functions

#### Admin Functions

- `changeAdmin(address)`: Transfer admin ownership
- `changeVerifier(address)`: Update verifier contract
- `upgradeToAndCall(address, bytes)`: Upgrade implementation with initialization

#### Public Functions

- `verify(bytes, bytes32[])`: ZK proof verification
- `getAdmin()`: View current admin
- `getVerifier()`: View current verifier
- `implementation()`: View current implementation

#### Internal Functions

- `_getAdmin()`, `_setAdmin()`: Admin management
- `_getVerifier()`, `_setVerifier()`: Verifier management
- `_getImplementation()`, `_setImplementation()`: Implementation management

### 5. Security Features

- **Zero Address Checks**: Prevents setting addresses to zero
- **Admin Modifier**: Restricts critical functions to admin only
- **Event Emissions**: Transparent change tracking
- **Fallback Protection**: Requires implementation to be set

### 6. Initializer Pattern

- **Constructor Disabled**: Constructor calls `_disableInitializers()` to prevent direct initialization
- **Initialize Function**: Use `initialize()` instead of constructor for setup
- **Reinitializer**: Supports versioned upgrades with `reinitializer(version)` modifier
- **State Tracking**: Tracks initialization status and version in storage slots

### 7. Usage Example

```solidity
// Deploy proxy (constructor disabled)
YGProxy proxy = new YGProxy();

// Initialize with admin and verifier (only once)
proxy.initialize(adminAddress, verifierAddress);

// Change verifier (admin only)
proxy.changeVerifier(newVerifierAddress);

// Verify ZK proof
bool isValid = proxy.verify(proof, publicInputs);

// Upgrade implementation (admin only)
proxy.upgradeToAndCall(newImplAddress, initData);

// Check initialization version
uint64 version = proxy.getInitializedVersion();
```

## Learning Notes - Upgradeable Contract Patterns

### 1. Storage Collision Prevention

- Uses EIP-1967 standardized slots
- Custom `StorageSlot` library for assembly-level storage access
- Avoids variable storage in proxy contract

### 2. Delegate Call Pattern

- Preserves `msg.sender` and `msg.value` context
- Executes code in proxy's storage context
- Assembly-level implementation for gas efficiency

### 3. Transparent Proxy Benefits

- Admin can upgrade without affecting user interface
- Verifier changes don't require contract redeployment
- Maintains state across upgrades

### 4. Initializer Pattern Benefits

- **Proxy-Safe**: No constructor code in proxy contract storage
- **Versioned Upgrades**: Track initialization versions for complex upgrades
- **Prevention Mechanisms**: Prevents accidental re-initialization
- **Upgrade Safety**: Supports incremental upgrades with `reinitializer`

### 5. Security Considerations

- Admin key management critical for security
- Implementation contract should not have constructors
- Initialize patterns instead of constructors for implementations
- Initializer version tracking prevents replay attacks

## Compilation Commands

```bash
npx hardhat compile
npx hardhat test
```
