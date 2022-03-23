pragma solidity ^0.8.4;

contract GreeterWithArgs {

    string greeting;

    event GreetingUpdated(string greeting);

    constructor(string memory _greeting) public {
        greeting = _greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
        emit GreetingUpdated(_greeting);
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

}
