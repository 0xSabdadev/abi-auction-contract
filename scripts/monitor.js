const hre = require("hardhat");

async function main() {
    // Get contract address from command line arguments
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    if (!contractAddress) {
        console.error("Please provide contract address via env variable CONTRACT_ADDRESS");
        process.exit(1);
    }

    const auction = await ethers.getContractAt("Auction", contractAddress);
    
    console.log("Starting event monitoring...");
    console.log("Contract address:", contractAddress);
    
    // Monitor AuctionCreated events
    auction.on("AuctionCreated", (auctionId, owner, startingPrice, duration) => {
        console.log("\nNew Auction Created:");
        console.log("ID:", auctionId.toString());
        console.log("Owner:", owner);
        console.log("Starting Price:", ethers.utils.formatEther(startingPrice), "ETH");
        console.log("Duration:", duration.toString(), "seconds");
    });
    
    // Monitor BidPlaced events
    auction.on("BidPlaced", (auctionId, bidder, amount) => {
        console.log("\nNew Bid Placed:");
        console.log("Auction ID:", auctionId.toString());
        console.log("Bidder:", bidder);
        console.log("Amount:", ethers.utils.formatEther(amount), "ETH");
    });
    
    // Monitor AuctionEnded events
    auction.on("AuctionEnded", (auctionId, winner, winningBid) => {
        console.log("\nAuction Ended:");
        console.log("Auction ID:", auctionId.toString());
        console.log("Winner:", winner);
        console.log("Winning Bid:", ethers.utils.formatEther(winningBid), "ETH");
    });
    
    console.log("Monitoring events... (Press Ctrl+C to stop)");

    // Keep the script running
    await new Promise(() => {});
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });