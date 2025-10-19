/**
 * Configurazione e ABI del contratto GroupNFT LITE su Arbitrum
 *
 * IMPORTANTE: Sostituisci CONTRACT_ADDRESS con l'indirizzo del tuo contratto deployato!
 */

// 🔴 SOSTITUISCI QUESTO INDIRIZZO CON IL TUO DOPO IL DEPLOY!
export const GROUP_NFT_CONTRACT_ADDRESS = '0x189a3d17cfed4a076cdc3591373d0fa924b6dd22' as const;

// ABI del contratto LITE - versione minimalista (meno gas!)
export const GROUP_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "groupId", "type": "string" }
    ],
    "name": "mintGroupNFT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "groupId", "type": "string" }],
    "name": "hasGroupMintedNFT",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "groupId", "type": "string" }],
    "name": "getTokenIdByGroupId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "groupId", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "minter", "type": "address" }
    ],
    "name": "GroupNFTMinted",
    "type": "event"
  }
] as const;
