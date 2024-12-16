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

    uint256 private _auctionIdCounter;
    mapping (uint256 => AuctionInfo) public auctions;
    mapping (uint256 => mapping (address => uint256)) public bids;

    error AuctionNotFound();
    error AuctionAlreadyEnded();
    error AuctionNotEnded();
    error BidTooLow();
    error AuctionStillActive();
    error FundsAlreadyDistributed();
    error NotAuctionOwner();
    error TransferFailed();

    modifier auctionExists(uint256 auctionId) {
        if (auctions[auctionId].owner == address(0)){
            revert AuctionNotFound();
        }
        _;
    }

    modifier auctionActive(uint256 auctionId) {
        if (auctions[auctionId].ended){
            revert AuctionAlreadyEnded();
        }
        if (block.timestamp >= auctions[auctionId].endTime) {
            revert AuctionAlreadyEnded();
        }
        _;
    }

    modifier auctionEnded(uint256 auctionId) {
        if (!auctions[auctionId].ended && block.timestamp < auctions[auctionId].endTime) {
            revert AuctionNotEnded();
        }
        _;
    }

    function createAuction(
        string memory description,
        uint256 startingPrice,
        uint256 duration
    ) external override returns (uint256) {
        uint256 auctionId = _auctionIdCounter++;
        
        auctions[auctionId] = AuctionInfo({
            description: description,
            owner: msg.sender,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            ended: false,
            fundsDistributed: false
        });
        
        emit AuctionCreated(
            auctionId,
            msg.sender,
            startingPrice,
            duration
        );
        
        return auctionId;
    }
    
    function placeBid(uint256 auctionId) 
        external 
        payable 
        override 
        auctionExists(auctionId)
        auctionActive(auctionId)
        nonReentrant 
    {
        AuctionInfo storage auction = auctions[auctionId];
        
        // Check if bid is high enough
        if (msg.value <= auction.highestBid) {
            revert BidTooLow();
        }
        
        // Refund previous highest bidder
        address previousBidder = auction.highestBidder;
        uint256 previousBid = auction.highestBid;
        
        if (previousBidder != address(0)) {
            bids[auctionId][previousBidder] += previousBid;
        }
        
        // Update auction state
        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }
    
    function endAuction(uint256 auctionId) 
        external 
        override 
        auctionExists(auctionId) 
    {
        AuctionInfo storage auction = auctions[auctionId];
        
        if (block.timestamp < auction.endTime) {
            revert AuctionStillActive();
        }
        
        if (auction.ended) {
            revert AuctionAlreadyEnded();
        }
        
        auction.ended = true;
        
        emit AuctionEnded(
            auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }
    
    function withdrawFunds(uint256 auctionId) 
        external 
        override 
        auctionExists(auctionId)
        auctionEnded(auctionId)
        nonReentrant 
    {
        AuctionInfo storage auction = auctions[auctionId];
        
        if (msg.sender == auction.owner) {
            if (auction.fundsDistributed) {
                revert FundsAlreadyDistributed();
            }
            
            auction.fundsDistributed = true;
            uint256 amount = auction.highestBid;
            
            (bool success, ) = auction.owner.call{value: amount}("");
            if (!success) {
                revert TransferFailed();
            }
            
            emit FundsDistributed(auctionId, auction.owner, amount);
        } else {
            uint256 amount = bids[auctionId][msg.sender];
            if (amount > 0) {
                bids[auctionId][msg.sender] = 0;
                
                (bool success, ) = msg.sender.call{value: amount}("");
                if (!success) {
                    revert TransferFailed();
                }
            }
        }
    }
    
    // View functions
    function getAuction(uint256 auctionId) 
        external 
        view 
        returns (AuctionInfo memory) 
    {
        return auctions[auctionId];
    }
    
    function getBid(uint256 auctionId, address bidder) 
        external 
        view 
        returns (uint256) 
    {
        return bids[auctionId][bidder];
    }

}