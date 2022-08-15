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
  console.log(result);
  if (!result.value) {
    return [];
  }
  const ownedAssets = result.value;
  var rsList = [];

  for (var oi in ownedAssets) {
    // console.log(ownedAssets[oi]);
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
    
    // console.log(contractLSP8);
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
  console.log(fromAddr, toAddr, amount, contractAddr);
  var myToken = new window.web3.eth.Contract(LSP7Mintable.abi, contractAddr);

  const tx= myToken.methods.transfer(fromAddr, toAddr, amount, false, '0x').send({
      from: fromAddr,
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
  });
  return tx;
}

export async function sendLSP8Token(fromAddr, toAddr, tokenId, contractAddr) {
  console.log(fromAddr, toAddr, tokenId, contractAddr);
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

// export async function updateMetadata(publicAddr, contractAddr, paddedTokenId, jsonData) {
  
//   console.log(paddedTokenId);//0x3030303031000000000000000000000000000000000000000000000000000000
  
//   const lsp8IdentifiableDigitalAssetContract = new window.web3.eth.Contract(LSP8Mintable.abi, contractAddr);

//   // We minted the NFT, let's add its metadata in the LSP8 smart contract key/value store
//   const erc725js = new ERC725(
//     [
//       {
//         name: 'LSP8MetadataJSON:<bytes32>',
//         key: '0x9a26b4060ae7f7d5e3cd0000<bytes32>',
//         keyType: 'Mapping',
//         valueType: 'bytes',
//         valueContent: 'JSONURL',
//       },
//     ],
//     publicAddr,
//     window.web3.currentProvider
//   );

//   const encodedErc725Data = erc725js.encodeData({
//     keyName: 'LSP8MetadataJSON:<bytes32>',
//     dynamicKeyParts: paddedTokenId,
//     value: {
//       json: jsonData,
//       url : "https://ipfs.io/ipfs/QmbEcTXqoMaNDpVprLcqxA4ai3VAtRnKN7pKdcv31SJxz3"
//     },
//   });

//   // SEND transaction
//   const receipt = await lsp8IdentifiableDigitalAssetContract.methods['setData(bytes32[],bytes[])'](encodedErc725Data.keys, encodedErc725Data.values).send({ from: publicAddr });

// }