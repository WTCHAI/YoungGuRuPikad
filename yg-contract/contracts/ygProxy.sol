// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "./utils/initializer.sol";
import { OwnableUpgradeable } from "./utils/ownableUpgrapable.sol";
import { PausableUpgradeable } from "./utils/pauseableUpgradable.sol";

interface IPikadVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

contract YoungGuRuPikadProxy is Initializable, OwnableUpgradeable, PausableUpgradeable {
    mapping(bytes32 => address) public verifiers;
    mapping(bytes32 => mapping(address => bool)) public provers;

    event VerifierConfigured(bytes32 indexed key, address indexed verifier, address indexed authority);
    event MiaGenProof(
        bytes32 indexed _key,
        address indexed _verifier,
        address _prover,
        bool _result
    );
    event DekGenProof(
        bytes32 indexed _key,
        address indexed _verifier,
        address _prover,
        bool _result
    );

    function initialize(address _owner, address _admin) external initializer {
        __Ownable_initialize(_owner, _admin);
        __Pausable_initialize();
    }

    function configVerifier(
        bytes32 _key,
        address _verifier
    ) external onlyOwnerOrAdmin {
        require(_verifier != address(0), "Invalid verifier address");
        verifiers[_key] = _verifier;
    }

    function verifyMia(
        bytes32 _key,
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external whenNotPaused returns (bool) {
        address targetVerifier = verifiers[_key];
        require(targetVerifier != address(0), "Verifier not configured for this key");
        require(targetVerifier == verifiers[_key], "Invalid verifier address");
        
        bool result = IPikadVerifier(targetVerifier).verify(_proof, _publicInputs);
        emit MiaGenProof(_key, targetVerifier, msg.sender, result);
        return result;
    }

    function verifyDek(
        bytes32 _key,
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external whenNotPaused returns (bool) {
        address targetVerifier = verifiers[_key];
        require(targetVerifier != address(0), "Verifier not configured for this key");
        require(targetVerifier == verifiers[_key], "Invalid verifier address");
        
        bool result = IPikadVerifier(targetVerifier).verify(_proof, _publicInputs);
        provers[_key][msg.sender] = result;
          
        emit DekGenProof(_key, targetVerifier, msg.sender, result);
        return result;
    }

    function verifierConfiguration(bytes32 _key, address _verifier) external {
        require(_verifier != address(0), "Invalid verifier address");
        verifiers[_key] = _verifier;
        emit VerifierConfigured(_key, _verifier, msg.sender);
    }

    uint256[100] private __gap;
}
