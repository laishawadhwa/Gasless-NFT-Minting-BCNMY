# Gasless NFT Minting| Biconomy SDK

Now you have the smart contract accounts setup and are familiarised with some components of the SDK. In this step, we will create a basic Node.js script [TypeScript] which allows users to mint an NFT without paying gas fee using the Biconomy SDK.

All the dev testing will be done on the Polygon Mumbai Network. The address for the contract is `0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789`.

## Prerequisites

- Node.js 
- Private Key for the Ethereum Wallet

## Setup

1. Clone the repository:

   ```bash
   cd gasless_transaction_mint_nft
   ```
2. Install Dependecies
   ```bash
   npm install 
   ```
3. Create a .env file at the root directory and add your private key from metamask.

   ```bash
   PRIVATE_KEY="your-private-key-here"
   ```
4. Replace YOUR_BUNDLER_URL and YOUR_PAYMASTER_URL with the actual URLs from your Biconomy account.
You can generate your own Bundler and Paymaster URL [here](dashboard.biconomy.io/)
5. Run the script
    ```bash
   npm run dev 
   ``` 

## Explanation
The code defines the mintNFT function responsible for minting an NFT using Biconomy. Here's a breakdown of the key steps involved:

* Import necessary libraries and configure Biconomy's Bundler and Paymaster.

* Initialize a provider, wallet, and configure the Biconomy Smart Account.

* Create a Biconomy Smart Account using the configured settings.

* Define the NFT contract interface and encode the function data for minting.

* Specify the NFT contract address and transaction details.

* Build a user operation for minting the NFT.

* Access the Biconomy Paymaster and retrieve paymaster service data.

* Send the user operation for minting the NFT.

* Display transaction details and a link to view the minted NFTs.



## References

- [Biconomy Documentation](https://docs.biconomy.io/)
