const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Auction", function () {
    let Auction;
    let auction;
    let owner;
    let bidder1;
    let bidder2;
    
    const AUCTION_DURATION = 3600; // 1 hour
    const STARTING_PRICE = ethers.utils.parseEther("1.0");
    
    beforeEach(async function () {
        // Get signers
        [owner, bidder1, bidder2] = await ethers.getSigners();
        
        // Deploy contract
        Auction = await ethers.getContractFactory("Auction");
        auction = await Auction.deploy();
        await auction.deployed();
    });
    
    describe("Create Auction", function () {
        it("Should create new auction with correct parameters", async function () {
            const tx = await auction.createAuction(
                "Test Item",
                STARTING_PRICE,
                AUCTION_DURATION
            );
            
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'AuctionCreated');
            
            expect(event).to.not.be.undefined;
            expect(event.args.auctionId).to.equal(0);
            expect(event.args.owner).to.equal(owner.address);
            expect(event.args.startingPrice).to.equal(STARTING_PRICE);
        });
    });
    
    describe("Place Bid", function () {
        let auctionId;
        
        beforeEach(async function () {
            const tx = await auction.createAuction(
                "Test Item",
                STARTING_PRICE,
                AUCTION_DURATION
            );
            const receipt = await tx.wait();
            auctionId = receipt.events[0].args.auctionId;
        });
        
        it("Should accept valid bid", async function () {
            const bidAmount = STARTING_PRICE.mul(2);
            
            const tx = await auction.connect(bidder1).placeBid(auctionId, {
                value: bidAmount
            });
            
            const receipt = await tx.wait();
            const event = receipt.events?.find(e => e.event === 'BidPlaced');
            
            expect(event.args.bidder).to.equal(bidder1.address);
            expect(event.args.amount).to.equal(bidAmount);
        });
        
        it("Should reject bid lower than current highest", async function () {
            const highBid = STARTING_PRICE.mul(2);
            const lowBid = STARTING_PRICE;
            
            await auction.connect(bidder1).placeBid(auctionId, {
                value: highBid
            });
            
            await expect(
                auction.connect(bidder2).placeBid(auctionId, {
                    value: lowBid
                })
            ).to.be.revertedWith("BidTooLow");
        });
    });
    
    describe("End Auction", function () {
        let auctionId;
        
        beforeEach(async function () {
            const tx = await auction.createAuction(
                "Test Item",
                STARTING_PRICE,
                AUCTION_DURATION
            );
            const receipt = await tx.wait();
            auctionId = receipt.events[0].args.auctionId;
        });
        
        it("Should not end auction before time", async function () {
            await expect(
                auction.endAuction(auctionId)
            ).to.be.revertedWith("AuctionStillActive");
        });
        
        it("Should end auction after time", async function () {
            // Increase time
            await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
            await ethers.provider.send("evm_mine");
            
            const tx = await auction.endAuction(auctionId);
            const receipt = await tx.wait();
            
            const event = receipt.events?.find(e => e.event === 'AuctionEnded');
            expect(event).to.not.be.undefined;
        });
    });
    
    describe("Withdraw Funds", function () {
        let auctionId;
        
        beforeEach(async function () {
            const tx = await auction.createAuction(
                "Test Item",
                STARTING_PRICE,
                AUCTION_DURATION
            );
            const receipt = await tx.wait();
            auctionId = receipt.events[0].args.auctionId;
            
            // Place bids
            await auction.connect(bidder1).placeBid(auctionId, {
                value: STARTING_PRICE.mul(2)
            });
            
            await auction.connect(bidder2).placeBid(auctionId, {
                value: STARTING_PRICE.mul(3)
            });
            
            // End auction
            await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
            await ethers.provider.send("evm_mine");
            await auction.endAuction(auctionId);
        });
        
        it("Should allow winner to withdraw funds", async function () {
            const initialBalance = await owner.getBalance();
            
            await auction.withdrawFunds(auctionId);
            
            const finalBalance = await owner.getBalance();
            expect(finalBalance.sub(initialBalance)).to.be.closeTo(
                STARTING_PRICE.mul(3),
                ethers.utils.parseEther("0.01") // Allow for gas costs
            );
        });
        
        it("Should allow losing bidder to withdraw", async function () {
            const initialBalance = await bidder1.getBalance();
            
            await auction.connect(bidder1).withdrawFunds(auctionId);
            
            const finalBalance = await bidder1.getBalance();
            expect(finalBalance.sub(initialBalance)).to.be.closeTo(
                STARTING_PRICE.mul(2),
                ethers.utils.parseEther("0.01") // Allow for gas costs
            );
        });
    });
});