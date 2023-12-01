// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleEthersWallet {

    error InsufficientBalance();

    address owner;

    constructor() {
        owner = msg.sender;
    }

    function withdraw(uint _amount) public {
        require(msg.sender == owner, "You are not the owner of this wallet!");
        uint balance = address(this).balance;
        if (_amount > balance) revert InsufficientBalance();
        payable (msg.sender).transfer(_amount);
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    receive() external payable { }
}