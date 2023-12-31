
import { config } from "dotenv"
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
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
async function mintNFT() {

  const bundler: IBundler = new Bundler({
    bundlerUrl:
        "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

  console.log({ ep: DEFAULT_ENTRYPOINT_ADDRESS });

  const paymaster: IPaymaster = new BiconomyPaymaster({
      paymasterUrl:
          "https://paymaster.biconomy.io/api/v1/80001/Tpk8nuCUd.70bd3a7f-a368-4e5a-af14-80c7f1fcda1a",
  });

  const provider = new providers.JsonRpcProvider(
      "https://rpc.ankr.com/polygon_mumbai"
  );
  const wallet = new Wallet(process.env.PRIVATE_KEY || "", provider);

  const module = await ECDSAOwnershipValidationModule.create({
    signer: wallet,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
  })

  let smartAccount: BiconomySmartAccountV2
  let address: string

  let biconomySmartAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler: bundler,
    paymaster: paymaster, 
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    activeValidationModule: module
});
  address = await biconomySmartAccount.getAccountAddress()
  console.log(address)
  smartAccount = biconomySmartAccount;
    const nftInterface = new ethers.utils.Interface([
        "function safeMint(address _to)",
    ]);

    const data = nftInterface.encodeFunctionData("safeMint", [address]);

    const nftAddress = "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e";

    const transaction = {
        to: nftAddress,
        data: data,
    };

    console.log("creating nft mint userop");
    let partialUserOp = await smartAccount.buildUserOp([transaction]);

    let finalUserOp = partialUserOp;

    const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

    const feeQuotesResponse =
        await biconomyPaymaster.getPaymasterFeeQuotesOrData(partialUserOp, {
            mode: PaymasterMode.ERC20,
            tokenList: ["0xda5289fcaaf71d52a80a254da614a192b693e977"],
        });

    const feeQuotes = feeQuotesResponse.feeQuotes as PaymasterFeeQuote[];
    const spender = feeQuotesResponse.tokenPaymasterAddress || "";
    const usdcFeeQuotes = feeQuotes[0];

    finalUserOp = await smartAccount.buildTokenPaymasterUserOp(partialUserOp, {
        feeQuote: usdcFeeQuotes,
        spender: spender,
        maxApproval: false,
    });

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

    // below code is only needed if you sent the flag calculateGasLimits = true
    if (
      paymasterAndDataWithLimits.callGasLimit &&
      paymasterAndDataWithLimits.verificationGasLimit &&
      paymasterAndDataWithLimits.preVerificationGas
    ) {

      // Returned gas limits must be replaced in your op as you update paymasterAndData.
      // Because these are the limits paymaster service signed on to generate paymasterAndData
      // If you receive AA34 error check here..   

      finalUserOp.callGasLimit = paymasterAndDataWithLimits.callGasLimit;
      finalUserOp.verificationGasLimit =
        paymasterAndDataWithLimits.verificationGasLimit;
      finalUserOp.preVerificationGas =
        paymasterAndDataWithLimits.preVerificationGas;
    }
  } catch (e) {
    console.log("error received ", e);
  }

    try {
        const userOpResponse = await smartAccount.sendUserOp(finalUserOp);
        const transactionDetails = await userOpResponse.wait();
        console.log(
            `transactionDetails: https://mumbai.polygonscan.com/tx/${transactionDetails.logs[0].transactionHash}`
        );
        console.log(
            `view minted nfts for smart account: https://testnets.opensea.io/${address}`
        );
    } catch (e) {
        console.log("error received ", e);
    }
}

mintNFT();
