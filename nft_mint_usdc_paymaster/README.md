
# Biconomy Gasless NFT Minting - Paying gas fees in USDC

Let's now update our paymaster to pay gas fees in USDC

## Prerequisites

- Node.js 
- Private Key for the Ethereum Wallet


   
1. Install Dependecies
   ```bash
   npm install
   ```
2. Create a .env file in the root directory and add your private key
   ```bash
   PRIVATE_KEY="your-private-key"
   ```
3. Replace YOUR_BUNDLER_URL and YOUR_PAYMASTER_URL with the actual URLs from your Biconomy account.

4. Run the script
    ```bash
   npm run dev 
   ``` 

## Explanation
Contained within index.ts, this code section guides you through the following actions:

* Configuration initiation and setting up of Biconomy.

* Establishment of a Biconomy smart account, along with the retrieval of its unique address.

* Designing a function specifically for minting NFTs using Biconomy's gasless transaction capabilities.

* Crafting the necessary transaction for minting and constructing a user operation.

* Estimation and inclusion of gas fee quotes through Biconomy's Paymaster.

* Actuating the user operation to achieve gasless NFT minting.

## References

- [Biconomy Documentation](https://docs.biconomy.io/)


