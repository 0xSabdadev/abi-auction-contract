// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./interfaces/IAuction.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Auction is IAuction, ReentrancyGuard, Ownable {
    struct AuctionInfo {
        string description;
        address owner;
        uint256 startingPrice;
        uint256 hisghestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        bool FundsDistributed;
    }
}
