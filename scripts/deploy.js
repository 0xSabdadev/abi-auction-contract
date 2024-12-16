const hre = require("hardhat");

async function main() {
    try {
        // Log deployment start
        console.log("Starting Auction contract deployment...");

        // Get contract factory
        const Auction = await hre.ethers.getContractFactory("Auction");
        
        // Deploy contract
        const auction = await Auction.deploy();
        
        // Wait for deployment to finish
        await auction.deployed();
        
        // Log success
        console.log("Auction contract deployed successfully!");
        console.log("Contract address:", auction.address);
        
        // Verify contract if not on localhost
        if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
            console.log("Waiting for block confirmations...");
            await auction.deployTransaction.wait(6);
            
            console.log("Verifying contract...");
            await hre.run("verify:verify", {
                address: auction.address,
                constructorArguments: [],
            });
            
            console.log("Contract verified successfully!");
        }
        
        // Return deployment info
        return {
            address: auction.address,
            contract: auction,
        };
    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

if (require.main === module) {
  main()
      .then(() => process.exit(0))
      .catch((error) => {
          console.error(error);
          process.exit(1);
      });
}

module.exports = main;
