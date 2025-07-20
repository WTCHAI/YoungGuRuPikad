// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "./initializer.sol";

abstract contract PausableUpgradeable is Initializable{
  bool private _paused;

  event Paused(address account);
  event Unpaused(address account);

  modifier whenNotPaused() { 
      require(!_paused, "Contract is paused");
      _;
  }

  modifier whenPaused() {
      require(_paused, "Contract is not paused");
      _;
  }

  function __Pausable_initialize() internal initializer {
    _paused = false;
  }

  function getPause() public view returns (bool){
    return _paused;
  }

   function _pause() internal whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }
    
    function _unpause() internal whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

  uint256[49] private __gap;
}