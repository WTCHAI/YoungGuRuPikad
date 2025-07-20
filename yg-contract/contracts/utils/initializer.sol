// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Initializable (Simplified)
 * @dev Simple initialization pattern for proxy contracts
 */
abstract contract Initializable {
    bool private _initialized;
    event Initialized();

    /**
     * @dev Prevents multiple initialization
     */
    modifier initializer() {
        require(!_initialized, "Already initialized");
        _initialized = true;
        _;
        emit Initialized();
    }

    /**
     * @dev Check if contract is initialized
     */
    function initialized() public view returns (bool) {
        return _initialized;
    }

    /**
     * @dev Disable initialization (for implementation contracts)
     */
    function _disableInitializers() internal {
        require(!_initialized, "Already initialized");
        _initialized = true;
    }
}
