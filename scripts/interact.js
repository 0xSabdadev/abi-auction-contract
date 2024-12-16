const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    // Contract configuration
    const AUCTION_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const AUCTION_DURATION = 3600; // 1 hour
    const STARTING_PRICE = ethers.utils.parseEther("1.0");
    
    try {
        // Get contract instance
        const auction = await ethers.getContractAt("Auction", AUCTION_ADDRESS);
        
        // Get signers
        const [owner, bidder1, bidder2] = await ethers.getSigners();
        
        console.log("Starting interaction script...");
        console.log("Contract address:", auction.address);
        console.log("Interacting as:", owner.address);
        
        // 1. Create new auction
        console.log("\nCreating new auction...");
        const createTx = await auction.createAuction(
            "Rare Digital Artwork",
            STARTING_PRICE,
            AUCTION_DURATION
        );
        const createReceipt = await createTx.wait();
        const auctionId = createReceipt.events[0].args.auctionId;
        console.log("Auction created with ID:", auctionId.toString());
        
        // 2. Place bids
        console.log("\nPlacing bids...");
        const bid1Amount = STARTING_PRICE.mul(2);
        const bid2Amount = STARTING_PRICE.mul(3);
        
        // Bid from bidder1
        const bid1Tx = await auction.connect(bidder1).placeBid(auctionId, {
            value: bid1Amount
        });
        await bid1Tx.wait();
        console.log("Bid placed by bidder1:", ethers.utils.formatEther(bid1Amount), "ETH");
        
        // Bid from bidder2
        const bid2Tx = await auction.connect(bidder2).placeBid(auctionId, {
            value: bid2Amount
        });
        await bid2Tx.wait();
        console.log("Bid placed by bidder2:", ethers.utils.formatEther(bid2Amount), "ETH");
        
        // 3. Get auction info
        const auctionInfo = await auction.getAuction(auctionId);
        console.log("\nAuction information:");
        console.log("Highest bid:", ethers.utils.formatEther(auctionInfo.highestBid), "ETH");
        console.log("Highest bidder:", auctionInfo.highestBidder);
        console.log("End time:", new Date(auctionInfo.endTime.toNumber() * 1000).toLocaleString());
        
        // 4. End auction (time manipulation in local network)
        if (network.name === "localhost" || network.name === "hardhat") {
            console.log("\nFast-forwarding time...");
            await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
            await ethers.provider.send("evm_mine");
        }
        
        console.log("Ending auction...");
        const endTx = await auction.endAuction(auctionId);
        await endTx.wait();
        console.log("Auction ended successfully!");
        
        // 5. Withdraw funds
        console.log("\nWithdrawing funds...");
        
        // Owner withdraws winning bid
        const withdrawTx = await auction.withdrawFunds(auctionId);
        await withdrawTx.wait();
        console.log("Owner withdrew winning bid!");
        
        // Losing bidder withdraws their bid
        const refundTx = await auction.connect(bidder1).withdrawFunds(auctionId);
        await refundTx.wait();
        console.log("Losing bidder withdrew their bid!");
        
        console.log("\nInteraction script completed successfully!");
        
    } catch (error) {
        console.error("Interaction failed:", error);
        process.exit(1);
    }
}

// Execute interaction script
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;