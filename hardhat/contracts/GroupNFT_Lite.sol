// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GroupNFT Lite
 * @dev Versione minimalista - Gas ottimizzato
 * Metadata gestiti off-chain per ridurre costi
 */
contract GroupNFT is ERC721, Ownable {

    uint256 private _tokenIdCounter;

    // Metadata base URI (IPFS o server)
    string private _baseTokenURI;

    // Mapping groupId -> tokenId per evitare duplicati
    mapping(string => uint256) public groupIdToTokenId;

    // Mapping tokenId -> groupId
    mapping(uint256 => string) public tokenIdToGroupId;

    event GroupNFTMinted(
        uint256 indexed tokenId,
        string groupId,
        address indexed minter
    );

    constructor(string memory baseURI) ERC721("Ethton Group NFT", "ETHGRP") Ownable(msg.sender) {
        _tokenIdCounter = 1;
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Minta NFT per un gruppo chiuso
     * Metadata saranno su IPFS/server esterno
     */
    function mintGroupNFT(
        address to,
        string memory groupId
    ) public returns (uint256) {
        require(bytes(groupId).length > 0, "Group ID empty");
        require(groupIdToTokenId[groupId] == 0, "Already minted");
        require(to != address(0), "Invalid address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        groupIdToTokenId[groupId] = tokenId;
        tokenIdToGroupId[tokenId] = groupId;

        _safeMint(to, tokenId);

        emit GroupNFTMinted(tokenId, groupId, to);

        return tokenId;
    }

    /**
     * @dev Verifica se gruppo ha mintato NFT
     */
    function hasGroupMintedNFT(string memory groupId) public view returns (bool) {
        return groupIdToTokenId[groupId] != 0;
    }

    /**
     * @dev Ottieni tokenId da groupId
     */
    function getTokenIdByGroupId(string memory groupId) public view returns (uint256) {
        return groupIdToTokenId[groupId];
    }

    /**
     * @dev Aggiorna base URI (solo owner)
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override tokenURI per usare baseURI
     * Esempio: ipfs://QmHash/1.json
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Converte uint a string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
