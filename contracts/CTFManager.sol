pragma solidity ^0.4.21;

import "./LotteryChallenge.sol";
import "./TokenSaleChallenge.sol";
import "./RetirementFundChallenge.sol";
import "./AccountTakeoverChallenge.sol";

contract CTFManager {

    // Define challenge struct
    struct Challenge {
        address addr;
        bool solved;
    }

    // Define user struct
    struct User { 
        string username;
        mapping (uint8 => Challenge) challenges;
    }

    // Users object
    mapping(address => User) ctfUsers;

    // Define variable owner of the type address
    address public owner;

    // This function is executed at initialization and sets the owner of the contract
    constructor() public {
        owner = msg.sender; 
    }

    // Creates or update a user.
    function createUser(string username) public {
        ctfUsers[msg.sender].username = username;
    }

    // Get Username
    function getUsername() public view returns (string) {
        return ctfUsers[msg.sender].username;
    }

    // Deploy a new challenge for the user
    function deployChallenge(uint8 challengeId) public payable {
        require(challengeId > 0 && challengeId < 5);

        if (challengeId < 4 ){
            require(msg.value == 1 ether);
        }

        if(challengeId == 1){
            LotteryChallenge lotteryInstance = (new LotteryChallenge).value(1 ether)();
            ctfUsers[msg.sender].challenges[challengeId] = Challenge({addr:address(lotteryInstance), solved:false});
        } else if (challengeId == 2){
            TokenSaleChallenge tokenSaleInstance = (new TokenSaleChallenge).value(1 ether)();
            ctfUsers[msg.sender].challenges[challengeId] = Challenge({addr:address(tokenSaleInstance), solved:false});
        } else if (challengeId == 3){
            RetirementFundChallenge retirementFundInstance = (new RetirementFundChallenge).value(1 ether)(msg.sender);
            ctfUsers[msg.sender].challenges[challengeId] = Challenge({addr:address(retirementFundInstance), solved:false});
        } else if (challengeId == 4){
            AccountTakeoverChallenge accountTakeoverInstance = new AccountTakeoverChallenge();
            ctfUsers[msg.sender].challenges[challengeId] = Challenge({addr:address(accountTakeoverInstance), solved:false});
        }
        
    }

    // Remove challenge from user
    function removeChallenge(uint8 challengeId) public {
        delete(ctfUsers[msg.sender].challenges[challengeId]);
    }

    // Fetch Challenge n from user
    function getChallenge(uint8 challengeId) public view returns (address, bool) {
        return (
            ctfUsers[msg.sender].challenges[challengeId].addr,
            ctfUsers[msg.sender].challenges[challengeId].solved
        );
    }

    // Update the challenge completion state
    function solveChallenge(uint8 challengeId) public {
        address challengeAddr = ctfUsers[msg.sender].challenges[challengeId].addr;

        if(challengeId == 1){
            ctfUsers[msg.sender].challenges[challengeId].solved = LotteryChallenge(challengeAddr).isComplete();
        } else if (challengeId == 2){
            ctfUsers[msg.sender].challenges[challengeId].solved = TokenSaleChallenge(challengeAddr).isComplete();
        } else if (challengeId == 3){
            ctfUsers[msg.sender].challenges[challengeId].solved = RetirementFundChallenge(challengeAddr).isComplete();
        } else if (challengeId == 4){
            ctfUsers[msg.sender].challenges[challengeId].solved = AccountTakeoverChallenge(challengeAddr).isComplete();
        }
    }
    
}