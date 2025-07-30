# YoungGuRuPikad Circuit

[![Noir Lang](https://img.shields.io/badge/Noir%20Lang-1.0.0--beta.6-purple)](https://noir-lang.org/) ![BB](https://img.shields.io/badge/Aztec%20BB.js-0.84.0-orange)

A zero-knowledge proof circuit built with Noir that privately verifies whether a given point lies within a specified circular boundary.

## Overview

This Noir circuit enables privacy-preserving location verification by proving that a point `(position_x, position_y)` is inside a circle with center `(target_x, target_y)` and radius `r` without revealing the actual coordinates. This has applications in location-based services, geofencing, and privacy-preserving proximity checks.

## Features

- **Zero-knowledge verification**: Prove location compliance without revealing exact coordinates
- **Geometric validation**: Uses mathematical distance calculations for precise circle boundary checking
- **Comprehensive testing**: Includes edge cases and boundary condition tests
- **Noir 1.0.0-beta.6 compatibility**: Built with the latest Noir framework

## How It Works

The circuit implements the mathematical formula for point-in-circle verification:
```
√((position_x - target_x)² + (position_y - target_y)²) ≤ radius
```


The implementation uses a sophisticated bitwise comparison approach to handle field arithmetic constraints in Noir, ensuring accurate less-than-or-equal comparisons in the zero-knowledge proof system.

## Prerequisites

- [Noir](https://noir-lang.org/) version `1.0.0-beta.6` or later
- [Nargo](https://noir-lang.org/docs/nargo/installation/) (Noir's package manager and toolchain)
- [Barretenberg](https://github.com/AztecProtocol/barretenberg) (bb) - Backend proving system for generating and verifying proofs

## Quick Start

1. **Install Noir and Nargo**
   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   noirup -v 1.0.0-beta.6
   ```

2. **Install Barretenberg (bb)**
   ```bash
   curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/master/barretenberg/cpp/installation/install | bash
   ```

3. **Clone and navigate to the project**
   ```bash
   git clone <your-repo-url>
   cd yg-circuit
   ```

4. **Run the test suite**
   ```bash
   nargo test
   ```

5. **Check the circuit**
   ```bash
   nargo check
   ```

6. **Compile the circuit**
   ```bash
   nargo compile
   ```

7. **Generate a proof using Barretenberg**
   ```bash
   # First, create witness from your inputs
   nargo execute witness
   
   # Generate proof using bb
   bb prove -b ./target/circuit.json -w ./witness -o ./proof
   
   # Verify the proof
   bb verify -k ./target/vk -p ./proof
   ```

## Project Structure

```
yg-circuit/
├── src/
│   └── main.nr          # Main circuit implementation and test cases
├── target/
│   └── circuit.json     # Compiled circuit (generated after nargo compile)
├── Nargo.toml           # Project configuration and dependencies
├── Prover.toml          # Input values for proof generation
├── witness              # Witness file (generated after nargo execute)
├── proof                # Generated proof file (created by bb prove)
└── README.md            # This file
```

## Circuit Interface

### Inputs
- `position_x: Field` - X coordinate of the point to verify (private input)
- `position_y: Field` - Y coordinate of the point to verify (private input)
- `target_x: pub Field` - X coordinate of the circle center (public input)
- `target_y: pub Field` - Y coordinate of the circle center (public input)
- `radius: pub Field` - Radius of the circle (public input)

### Constraints
- The circuit constrains that the point `(position_x, position_y)` lies within or on the circle boundary
- Uses `assert()` to enforce the geometric constraint
- Fails proof generation if the point is outside the circle

## Example Usage

```noir
// Check if point (10, 1) is within a circle centered at (2, 3) with radius 10
main(10, 1, 2, 3, 10); // Should pass - point is inside

// Check if point (5, 3) is within a circle centered at (2, 3) with radius 3  
main(5, 3, 2, 3, 3); // Should pass - point is exactly on boundary

// This would fail proof generation:
// main(10, 10, 2, 3, 5); // Point is outside the circle
```

## Proof Generation Workflow

### Using Nargo + Barretenberg (Recommended)

1. **Set up your inputs in `Prover.toml`**:
   ```toml
   position_x = "10"
   position_y = "1" 
   target_x = "2"
   target_y = "3"
   radius = "10"
   ```

2. **Compile the circuit**:
   ```bash
   nargo compile
   ```

3. **Execute to generate witness**:
   ```bash
   nargo execute witness
   ```

4. **Generate proof with Barretenberg**:
   ```bash
   bb prove -b ./target/circuit.json -w ./witness -o ./proof
   ```

5. **Verify the proof**:
   ```bash
   bb verify -k ./target/vk -p ./proof
   ```

### Using Nargo Built-in (Alternative)
```bash
# Generate proof using nargo's built-in proving
nargo prove

# Verify using nargo
nargo verify
```

```noir
// Check if point (10, 1) is within a circle centered at (2, 3) with radius 10
main(10, 1, 2, 3, 10); // Should pass - point is inside

// Check if point (5, 3) is within a circle centered at (2, 3) with radius 3  
main(5, 3, 2, 3, 3); // Should pass - point is exactly on boundary

// This would fail proof generation:
// main(10, 10, 2, 3, 5); // Point is outside the circle
```

## Test Cases

The circuit includes comprehensive tests covering:
- **Points inside the circle**: `test_main()` validates points that should pass verification
- **Points outside the circle**: `test_main_fail()` uses `#[test(should_fail)]` to verify the circuit correctly rejects invalid points
- **Boundary conditions**: Tests points exactly on the circle edge

Run tests with detailed output:
```bash
nargo test --show-output
```

Current test cases:
- `(10, 1)` with center `(2, 3)` and radius `10` ✓ (passes)
- `(5, 3)` with center `(2, 3)` and radius `3` ✓ (passes) 
- `(10, 10)` with center `(2, 3)` and radius `5` ✗ (should fail)

## Applications

- **Geofencing**: Verify if a user is within a designated area
- **Location-based access control**: Grant permissions based on location without revealing exact position
- **Privacy-preserving proximity**: Check if two parties are within a certain distance
- **Gaming**: Validate player positions in location-based games

## Development

### Adding New Tests
Add test functions to `src/main.nr`:
```noir
#[test]
fn test_your_scenario() {
    main(position_x, position_y, target_x, target_y, radius);
}

#[test(should_fail)]
fn test_point_outside() {
    main(x, y, center_x, center_y, radius); // For points that should be rejected
}
```

### Modifying the Circuit
The main logic is in the `main` function in `src/main.nr`. Follow Noir's syntax and ensure all operations are field-arithmetic compatible.


## Resources

- [Noir Documentation](https://noir-lang.org/docs/)
- [Noir GitHub Repository](https://github.com/noir-lang/noir)
- [Barretenberg Documentation](https://github.com/AztecProtocol/barretenberg)
- [Zero-Knowledge Proofs Explained](https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Noir](https://noir-lang.org/) by Aztec
- Inspired by privacy-preserving location verification research