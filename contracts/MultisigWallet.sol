// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultisigWallet {

    // Events
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(
        address indexed owner,
        uint indexed txId,
        address indexed to,
        uint value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint txId);
    event RevokeTransaction(address indexed owner, uint txId);
    event ExecuteTransaction(address indexed owner, uint txId);

    // Errors
    error DuplicateOwnerAddress(address owner);
    error InvalidOwnerAddress();
    error InsufficientConfirmations(uint currentConfirmations, uint requiredConfirmations);
    error ExecuteTransactionFailed(Transaction transaction);
    error ConfirmationAlreadyRevoked();

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numOfConfirmations;
    }

    address[] private owners;
    mapping(address => bool) isOwner;
    uint numOfConfirmations;

    Transaction[] private transactions;

    // TxId > Owner > bool
    mapping(uint => mapping(address => bool)) private isConfirmed;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Only owner is allowed to call this function");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier txNotExecuted(uint _txId) {
        require(!transactions[_txId].executed, "Transaction already executed");
        _;
    }

    modifier txNotConfirmed(uint _txId) {
        require(!isConfirmed[_txId][msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _numOfConfirmationsRequired) {
        require(_owners.length > 0, "Owners required");
        require(_owners.length >= _numOfConfirmationsRequired && _numOfConfirmationsRequired > 0,
            "numOfConfirmationsRequired need to be more than equal owners length");

        // Set owners
        for (uint8 i = 0; i < _owners.length;) {
            address currOwner = _owners[i];

            // Ensure owner address is valid
            if (currOwner == address(0)) revert InvalidOwnerAddress();
            // Ensure no duplicate owners
            if (isOwner[currOwner]) revert DuplicateOwnerAddress(currOwner);

            owners.push(currOwner);
            isOwner[currOwner] = true;
            // To optimize gas
            ++i;
        }

        numOfConfirmations = _numOfConfirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // Create new transaction
    function submitTransaction(address _to, uint _value, bytes memory _data) public onlyOwner {
        uint txId = transactions.length;
        Transaction memory newTransaction = Transaction(_to, _value, _data, false, 0);
        transactions.push(newTransaction);
        emit SubmitTransaction(msg.sender, txId, _to, _value, _data);
    }

    // Confirms a transaction and prepare it for execution
    function confirmTransaction(uint _txId) public onlyOwner txExists(_txId) txNotExecuted(_txId) txNotConfirmed(_txId) {
        Transaction storage currTransaction = transactions[_txId];
        currTransaction.numOfConfirmations += 1;
        isConfirmed[_txId][msg.sender] = true;
        emit ConfirmTransaction(msg.sender, _txId);
    }

    // Only confirmed transactions can be executed
    function executeTransaction(uint _txId) public onlyOwner txExists(_txId) txNotExecuted(_txId) {
        Transaction storage currTransaction = transactions[_txId];
        if (currTransaction.numOfConfirmations < numOfConfirmations) revert InsufficientConfirmations(currTransaction.numOfConfirmations, numOfConfirmations);
        currTransaction.executed = true;
        (bool success, ) = currTransaction.to.call{value: currTransaction.value}(currTransaction.data);
        if (!success) revert ExecuteTransactionFailed(currTransaction);
        emit ExecuteTransaction(msg.sender, _txId);
    }

    // Removes the owner's confirmation from the specified transaction
    function revokeTransaction(uint _txId) public onlyOwner txExists(_txId) txNotExecuted(_txId) {
        Transaction storage currTransaction = transactions[_txId];

        // Revert if confirmation is already revoked
        if (!isConfirmed[_txId][msg.sender]) revert ConfirmationAlreadyRevoked();

        currTransaction.numOfConfirmations -= 1;
        isConfirmed[_txId][msg.sender] = false;
        emit RevokeTransaction(msg.sender, _txId);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return transactions.length;
    }

    function getTransaction(uint _txId) public txExists(_txId) view returns (Transaction memory) {
        return transactions[_txId];
    }
}
