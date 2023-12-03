// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UpgradableV2 is UUPSUpgradeable, Initializable, OwnableUpgradeable  {
    uint public testValue;

    function initialize(uint256 _testValue) public initializer {
        testValue = _testValue;
        __Ownable_init(msg.sender);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function incrementTestValueBy2() public {
        testValue += 2;
    }

    function resetTestValueToZero() public {
        testValue = 0;
    }
}