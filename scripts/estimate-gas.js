const hre = require("hardhat");

async function estimateGas() {
    const Auction = await ethers.getContractFactory("Auction");
    const [owner, bidder1] = await ethers.getSigners();
    
    console.log("Estimating gas costs...\n");
    
    // Deployment
    const deploymentGas = await ethers.provider.estimateGas(
        Auction.getDeployTransaction()
    );
    console.log("Deployment gas:", deploymentGas.toString());
    
    // Create auction
    const auction = await Auction.deploy();
    await auction.deployed();
    
    const createAuctionGas = await auction.estimateGas.createAuction(
        "Test Item",
        ethers.utils.parseEther("1.0"),
        3600
    );
    console.log("Create auction gas:", createAuctionGas.toString());
    
    // Place bid
    const createTx = await auction.createAuction(
        "Test Item",
        ethers.utils.parseEther("1.0"),
        3600
    );
    const receipt = await createTx.wait();
    const auctionId = receipt.events[0].args.auctionId;
    
    const placeBidGas = await auction.connect(bidder1).estimateGas.placeBid(
        auctionId,
        { value: ethers.utils.parseEther("2.0") }
    );
    console.log("Place bid gas:", placeBidGas.toString());
    
    console.log("\nGas estimation completed!");
}

// Execute estimation
if (require.main === module) {
    estimateGas()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = estimateGas;