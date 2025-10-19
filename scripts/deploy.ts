import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GroupNFT contract...");

  // Parametro baseURI per gli NFT metadata
  // Puoi modificare questo URL con il tuo server IPFS o backend
  const baseURI = "https://api.yourapp.com/metadata/";

  // Deploy del contratto
  const GroupNFT = await ethers.getContractFactory("GroupNFT");
  const groupNFT = await GroupNFT.deploy(baseURI);

  await groupNFT.waitForDeployment();

  const address = await groupNFT.getAddress();

  console.log("GroupNFT deployed to:", address);
  console.log("Base URI set to:", baseURI);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network arbitrumSepolia ${address} "${baseURI}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
