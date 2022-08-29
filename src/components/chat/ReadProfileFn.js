// Import and Network Setup
import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';
import 'isomorphic-fetch';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import LSP7Mintable from './LSKToken/LSP7Mintable.json';

import LSP8Mintable from './LSKToken/LSP8Mintable.json';
import LSP8IdentifiableDigitalAsset from './LSKToken/LSP8IdentifiableDigitalAsset.json';
import LSP4DigitalAssetMetadata from './LSKToken/LSP4DigitalAssetMetadata.json';

// https://github.com/lukso-network/lsp-smart-contracts/blob/develop/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol
import KeyManager from './LSKToken/LSP6KeyManager.json';
import UniversalProfile from './LSKToken/UniversalProfile.json';

import LSP4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

// Our static variables
const SAMPLE_PROFILE_ADDRESS = '0xa907c1904c22DFd37FF56c1f3c3d795682539196';
const RPC_ENDPOINT = 'https://rpc.l16.lukso.network';
const IPFS_GATEWAY = 'https://2eff.lukso.dev/ipfs/';
const IPFS_GATEWAY_API_BASE_URL = 'https://api.2eff.lukso.dev:443';

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
const config = { ipfsGateway: IPFS_GATEWAY };

export const DEFAULT_GAS = 5_000_000;
export const DEFAULT_GAS_PRICE = "10000000000";


const LSP8MetadataJSONSchema = {
  name: 'LSP8MetadataJSON:<bytes32>',
  key: '0x9a26b4060ae7f7d5e3cd0000<bytes32>',
  keyType: 'Mapping',
  valueType: 'bytes',
  valueContent: 'JSONURL',
};

/*
 * Try fetching the @param's Universal Profile
 *
 * @param address of Universal Profile
 * @return string JSON or custom error
 */
export async function fetchProfile(address) {
  try {
    const profile = new ERC725(erc725schema, address, provider, config);
    return await profile.fetchData();
  } catch (error) {
    return {
        error : 'This is not an ERC725 Contract'
    }
  }
}

export async function fetchProfileByQuery(address, query) {
  try {
    const profile = new ERC725(erc725schema, address, provider, config);
    return await profile.fetchData(query);
  } catch (error) {
    return {
        error : 'This is not an ERC725 Contract'
    }
  }
}

export async function getProfileData(address) {
    var myProfile = await fetchProfileByQuery(address,"LSP3Profile");
    if (!myProfile.value) {
      return "";
    }
    return myProfile.value.LSP3Profile
}

export async function getLSP5ReceivedAssets(address) {
  var result = await fetchProfileByQuery(address,"LSP5ReceivedAssets[]");
  if (!result.value) {
    return [];
  }
  const ownedAssets = result.value;
  var rsList = [];

  for (var oi in ownedAssets) {

    const digitalAsset = new ERC725(LSP4Schema, ownedAssets[oi], provider, config);
    
    var fullProfileLs = await digitalAsset.fetchData();
    var fullProfileStrc ={};
    for (var e in fullProfileLs) {
      fullProfileStrc[fullProfileLs[e].name] = fullProfileLs[e].value;
    }
    var symbol = fullProfileStrc["LSP4TokenSymbol"];
    var name = fullProfileStrc["LSP4TokenName"];
    var icon = "https://upload.wikimedia.org/wikipedia/commons/2/24/NFT_Icon.png";
    if (fullProfileStrc["LSP4Metadata"] && fullProfileStrc["LSP4Metadata"].LSP4Metadata && fullProfileStrc["LSP4Metadata"].LSP4Metadata.icon) {
      icon = fullProfileStrc["LSP4Metadata"].LSP4Metadata.icon[0].url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    var contractLSP8 = new window.web3.eth.Contract(LSP8Mintable.abi, ownedAssets[oi]);
    
    var nftId = await contractLSP8.methods.tokenIdsOf(address).call();
    if (!nftId) {
      var contractLSP7 = new window.web3.eth.Contract(LSP7Mintable.abi, ownedAssets[oi]);
      var balance = await contractLSP7.methods.balanceOf(address).call();
      rsList.push({symbol,name, balance, address : ownedAssets[oi], type : "LSP7"})
    } else {
      var balance = 1;
      for (var i in nftId) {
        var id = nftId[i];
        rsList.push({symbol,name, balance, address : ownedAssets[oi], id, type : "LSP8", icon})
      }
    }

  }

  return rsList;
}

export async function sendLSP7Token(fromAddr, toAddr, amount, contractAddr) {

  var myToken = new window.web3.eth.Contract(LSP7Mintable.abi, contractAddr);

  const tx= myToken.methods.transfer(fromAddr, toAddr, amount, false, '0x').send({
      from: fromAddr,
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
  });
  return tx;
}

export async function sendLSP8Token(fromAddr, toAddr, tokenId, contractAddr) {

  var myToken = new window.web3.eth.Contract(LSP8Mintable.abi, contractAddr);

  const tx= myToken.methods.transfer(fromAddr, toAddr, tokenId, false, '0x').send({
      from: fromAddr,
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
  });
  return tx;
}

export async function getBalanceOf(fromAddr) {
  const wei = await window.web3.eth.getBalance(fromAddr);
  return window.web3.utils.fromWei(wei);
}

export async function sendLYX(fromAddr, toAddr, amount) {
  // const myUniversalProfile = new window.web3.eth.Contract(UniversalProfile.abi, fromAddr);
  // const OPERATION_CALL = 0;
  // const data = '0x';

  const amountWei = window.web3.utils.toWei(amount);

  // const transferLYXPayload = await myUniversalProfile.methods
  // .execute(OPERATION_CALL, toAddr, amountWei, data)
  // .encodeABI();
  let transaction = {
    from: fromAddr,
    to: toAddr,
    value: amountWei,
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  }
  const tx = sendTransaction(transaction);
  return tx;
}

export async function sendTransaction (transaction) {
  return await window.web3.eth.sendTransaction(transaction);
};

export async function createAndMintLSP7Token(publicKey, tokenName, tokenSymbol, amount) {
  // create an instance
  const myToken = new window.web3.eth.Contract(LSP7Mintable.abi, {
    gas: 5_000_000,
    gasPrice: '1000000000',
  });

  // deploy the token contract
  const myDeployedToken = await myToken.deploy({
      data: LSP7Mintable.bytecode,
      arguments: [
        tokenName || "LS7", // token name
        tokenSymbol || 'LSP7', // token symbol
        publicKey, // new owner, who will mint later
        false, // isNonDivisible = TRUE, means NOT divisible, decimals = 0)
      ]
    })
    .send({
      from: publicKey,
    });
  
  await myDeployedToken.methods.mint(publicKey, amount, false, '0x').send({
    from: publicKey,
  });
}

export async function createAndMintLSP8Token(publicKey, tokenName, tokenSymbol, firstId, url) {
  // create an instance
  const myToken = new window.web3.eth.Contract(LSP8Mintable.abi, {
    gas: 5_000_000,
    gasPrice: '1000000000',
  });
  
  // deploy the token contract
  const myDeployedToken = await myToken.deploy({
      data: LSP8Mintable.bytecode,
      arguments: [
        tokenName || "LSP8", // token name
        tokenSymbol || 'LSP8', // token symbol
        publicKey // new owner, who will mint later
      ]
    })
    .send({
      from: publicKey,
    });


  const to = publicKey;
  const paddedTokenId = window.web3.utils.padRight(window.web3.utils.stringToHex("00001"), 64);
  const force = false;
  // const data = window.web3.utils.padRight(window.web3.utils.stringToHex(url), 64);;
  const data = '0x';
  await myDeployedToken.methods.mint(to, paddedTokenId, force, data).send({
    from: publicKey,
  });
  // updateMetadata(publicKey, myDeployedToken._address, paddedTokenId, {description : "hello", avatar : url });
}

export function getBackground() {
  return {
    backgroundColor: "#cac9c9",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z' fill='%23dcdcdc' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")"
  }
}