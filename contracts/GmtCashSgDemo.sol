pragma solidity ^0.8.20;

contract GmtCashSgDemo {
    string[] private names;

    event MemberAdded(string name, uint256 totalMembers);

    function addMember(string memory _name) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        names.push(_name);
        emit MemberAdded(_name, names.length);
    }

    function selectPersonToTreatDinner() public view returns (string memory) {
        require(names.length > 0, "No names available");

        // Using block-based randomness (Note: This is not cryptographically secure)
        // The randomness is based on block timestamp and previous block hash which is predicable and can be manipulated by validators
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao
        ))) % names.length;

        return names[randomIndex];
    }

    function getNamesCount() public view returns (uint256) {
        return names.length;
    }
}