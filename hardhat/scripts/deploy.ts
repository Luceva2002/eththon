import hre from "hardhat";

async function main() {
  console.log("Deploying GroupNFT contract to", hre.network.name);

  // Parametro baseURI per gli NFT metadata
  // Puoi modificare questo URL con il tuo server IPFS o backend
  const baseURI = "https://api.yourapp.com/metadata/";

  console.log("Base URI:", baseURI);

  // Deploy del contratto usando Viem
  const groupNFT = await hre.viem.deployContract("GroupNFT", [baseURI]);

  console.log("GroupNFT deployed to:", groupNFT.address);
  console.log("\nSave this address for your frontend!");
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${groupNFT.address} "${baseURI}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
