# Smart Contract Auction System 🏷️

A decentralized auction system built with Solidity and Hardhat. This project implements a complete auction system where users can create auctions, place bids, and automatically handle fund distributions.

## Features 🎯

- Create auctions with custom duration and starting price
- Place bids with automatic refund of previous bids
- Automatic winner determination
- Secure fund distribution system
- Event monitoring and gas estimation utilities
- Comprehensive testing suite
- Gas-optimized implementation

## Contract Architecture 🏗️

The system consists of the following main components:

- `Auction.sol`: Main contract implementing auction functionality
- `IAuction.sol`: Interface defining the contract's public functions
- Integration with OpenZeppelin's security features:
  - ReentrancyGuard for security
  - Ownable for access control

## Technical Stack 🛠️

- Solidity ^0.8.17
- Hardhat Development Environment
- Ethers.js
- OpenZeppelin Contracts
- Hardhat Test Suite
- Chai for assertions

## Getting Started 🚀

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd auction-contract
```

2. Install dependencies
```bash
npm install
```

3. Compile contracts
```bash
npx hardhat compile
```

### Running Tests

```bash
npx hardhat test
```

To see gas reports:
```bash
REPORT_GAS=true npx hardhat test
```

## Deployment 📦

### Local Deployment

1. Start local node
```bash
npx hardhat node
```

2. Deploy contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

1. Configure network in `hardhat.config.js`
2. Add environment variables in `.env`
3. Run deployment
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Contract Interaction 🤝

### Using Hardhat Console

```javascript
// Start console
npx hardhat console --network localhost

// Get contract instance
const Auction = await ethers.getContractFactory("Auction");
const auction = await ethers.getContractAt("Auction", "CONTRACT_ADDRESS");

// Create auction
const tx = await auction.createAuction(
    "Item Name",
    ethers.utils.parseEther("1.0"),
    3600
);
```

### Using Scripts

1. Create Auction
```bash
npx hardhat run scripts/interact.js --network localhost
```

2. Monitor Events
```bash
CONTRACT_ADDRESS=<address> npx hardhat run scripts/monitor.js --network localhost
```

3. Estimate Gas
```bash
npx hardhat run scripts/estimate-gas.js --network localhost
```

## Project Structure 📁

```
auction-contract/
├── contracts/
│   ├── Auction.sol
│   └── interfaces/
│       └── IAuction.sol
├── scripts/
│   ├── deploy.js
│   ├── interact.js
│   ├── monitor.js
│   └── estimate-gas.js
├── test/
│   └── Auction.test.js
└── hardhat.config.js
```

## Core Functions 📝

### Creating an Auction
```javascript
function createAuction(
    string memory description,
    uint256 startingPrice,
    uint256 duration
) external returns (uint256);
```

### Placing a Bid
```javascript
function placeBid(uint256 auctionId) external payable;
```

### Ending an Auction
```javascript
function endAuction(uint256 auctionId) external;
```

### Withdrawing Funds
```javascript
function withdrawFunds(uint256 auctionId) external;
```

## Events 📡

- `AuctionCreated`
- `BidPlaced`
- `AuctionEnded`
- `FundsDistributed`

## Security Considerations 🔒

- Reentrancy protection
- Overflow/underflow protection
- Access control implementation
- Secure fund handling
- Gas optimization

## Gas Optimization ⛽

The contract implements several gas optimization techniques:
- Efficient storage packing
- Minimal storage operations
- Optimized loops
- Event usage for state tracking

## Testing Coverage 🧪

Tests cover:
- Basic functionality
- Edge cases
- Security scenarios
- Gas estimation

## Utilities 🛠️

### Event Monitor
Real-time monitoring of contract events:
```bash
CONTRACT_ADDRESS=<address> npx hardhat run scripts/monitor.js --network localhost
```

### Gas Estimator
Estimate gas costs for contract operations:
```bash
npx hardhat run scripts/estimate-gas.js --network localhost
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💬

For support, please open an issue in the GitHub repository or contact the maintainers.

## Authors ✍️

- [0xSabdadev]
- [Contributors]