pragma solidity ^0.4.21;

contract AccountTakeoverChallenge {
    address owner = 0xD26200f85703272e48eDcC3400220B4f5662eD98;
    bool public isComplete;

    function authenticate() public {
        require(msg.sender == owner);

        isComplete = true;
    }
}