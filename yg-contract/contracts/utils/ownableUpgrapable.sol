// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Initializable } from "./initializer.sol";

abstract contract OwnableUpgradeable is Initializable {
    address private _owner;
    address private _admin;

    event OwnerShipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyOwner() {
        require(_owner == msg.sender, "Caller is not the Owner");
        _;
    }

    modifier onlyAdmin() {
        require(_admin == msg.sender, "Caller is not Admin");
        _;
    }

    modifier onlyOwnerOrAdmin() {
        require(
            _owner == msg.sender || _admin == msg.sender,
            "Caller is not Owner or Admin"
        );
        _;
    }

    function getAdmin() public view returns (address) {
        return _admin;
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function __Ownable_initialize(
        address initilizeOwner,
        address initializeAdmin
    ) internal initializer {
        _transferOwnership(initilizeOwner);
        _setAdmin(initializeAdmin);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid incoming address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnerShipTransferred(oldOwner, _owner);
    }

    function setAdmin(address newAdmin) public onlyOwnerOrAdmin {
        require(newAdmin != address(0), "Invalid incoming address");
        _setAdmin(newAdmin);
    }

    function _setAdmin(address newAdmin) internal {
        address oldAdmin = _admin;
        _admin = newAdmin;
        emit AdminChanged(oldAdmin, _admin);
    }

    uint256[48] private __gaps;
}
