pragma solidity ^0.8.4;

import { AmbiguousLibrary as AmbiguousLibrary2 } from "./AmbiguousLibrary2.sol";

library AmbiguousLibrary {
    function libDo(uint256 n) external returns (uint256) {
        return n * 2;
    }
}

contract TestAmbiguousLib {
    function printNumber(uint256 amount) public returns (uint256) {
        uint result = AmbiguousLibrary.libDo(amount);
        result = AmbiguousLibrary2.libDo(result);
        return result;
    }
}
