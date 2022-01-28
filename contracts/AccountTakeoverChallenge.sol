pragma solidity ^0.4.21;

contract AccountTakeoverChallenge {
    address owner = 0x883C9944e456C4cDd254300beE4C716bE11e9aDF;
    bool public isComplete;

    function authenticate() public {
        require(msg.sender == owner);

        isComplete = true;
    }
}