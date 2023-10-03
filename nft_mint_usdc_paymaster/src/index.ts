
import { config } from "dotenv"
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccount, BiconomySmartAccountConfig, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { Wallet, providers, ethers  } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import { 
  IPaymaster, 
  BiconomyPaymaster,  
  IHybridPaymaster,
  PaymasterMode,
  SponsorUserOperationDto, 
  PaymasterFeeQuote
} from '@biconomy/paymaster'

config()



const bundler: IBundler = new Bundler({
  bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',    
  chainId: ChainId.POLYGON_MUMBAI,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
})

console.log({ ep: DEFAULT_ENTRYPOINT_ADDRESS})

const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: 'https://paymaster.biconomy.io/api/v1/80001/WJpOe4VgM.0db762d2-d21c-480f-a781-ba5c9c8f217f' 
})

const provider = new providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
const wallet = new Wallet(process.env.PRIVATE_KEY || "", provider);

const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
  signer: wallet,
  chainId: ChainId.POLYGON_MUMBAI,
  bundler: bundler,
  paymaster: paymaster
}

let smartAccount: BiconomySmartAccount
let address: string

async function createAccount() {
  let biconomySmartAccount = new BiconomySmartAccount(biconomySmartAccountConfig)
  biconomySmartAccount =  await biconomySmartAccount.init()
  address = await biconomySmartAccount.getSmartAccountAddress()
  console.log(address)
  smartAccount = biconomySmartAccount;
  return biconomySmartAccount;
}

async function mintNFT() {
  await createAccount()
  const nftInterface = new ethers.utils.Interface([
    "function safeMint(address _to)",
  ]);
  
  const data = nftInterface.encodeFunctionData("safeMint", [address]);

  const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

  const transaction = {
    to: nftAddress,
    data: data,
  };

  console.log("creating nft mint userop")
  let partialUserOp = await smartAccount.buildUserOp([transaction]);

  let finalUserOp = partialUserOp;

    const biconomyPaymaster =
    smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

  const feeQuotesResponse = await biconomyPaymaster.getPaymasterFeeQuotesOrData(partialUserOp, {
        mode: PaymasterMode.ERC20,
        tokenList:["0xda5289fcaaf71d52a80a254da614a192b693e977"],
      });

      const feeQuotes = feeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
      const spender = feeQuotesResponse.tokenPaymasterAddress || "";
      const usdcFeeQuotes = feeQuotes[0]

      finalUserOp = await smartAccount.buildTokenPaymasterUserOp(
        partialUserOp,
        {
          feeQuote: usdcFeeQuotes,
          spender: spender,
          maxApproval: false,
        }
      );

      let paymasterServiceData = {
    mode: PaymasterMode.ERC20,
    feeTokenAddress: usdcFeeQuotes.tokenAddress,
    calculateGasLimits: true, // Always recommended and especially when using token paymaster
};

      try{
        const paymasterAndDataWithLimits =
          await biconomyPaymaster.getPaymasterAndData(
            finalUserOp,
            paymasterServiceData
          );
        finalUserOp.paymasterAndData = paymasterAndDataWithLimits.paymasterAndData;
    
      } catch (e) {
        console.log("error received ", e);
      }

      try {
        const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
        const transactionDetails = await userOpResponse.wait();
        console.log(
          `transactionDetails: https://mumbai.polygonscan.com/tx/${transactionDetails.logs[0].transactionHash}`
        )
        console.log(
        `view minted nfts for smart account: https://testnets.opensea.io/${address}`
      )
        } catch (e) {
          console.log("error received ", e);
        }
  };

  mintNFT();

