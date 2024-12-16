// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IAuction {
    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed owner,
        uint256 startingPrice,
        uint256 duration
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );
    
    event FundsDistributed(
        uint256 indexed auctionId,
        address indexed owner,
        uint256 amount
    );
    
    // Functions
    function createAuction(
        string memory description,
        uint256 startingPrice,
        uint256 duration
    ) external returns (uint256);
    
    function placeBid(uint256 auctionId) external payable;
    
    function endAuction(uint256 auctionId) external;
    
    function withdrawFunds(uint256 auctionId) external;
}