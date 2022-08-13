// Import and Network Setup
import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';
import 'isomorphic-fetch';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';

// Our static variables
const SAMPLE_PROFILE_ADDRESS = '0xa907c1904c22DFd37FF56c1f3c3d795682539196';
const RPC_ENDPOINT = 'https://rpc.l16.lukso.network';
const IPFS_GATEWAY = 'https://2eff.lukso.dev/ipfs/';

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
const config = { ipfsGateway: IPFS_GATEWAY };

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

export async function getProfileData(address) {
    var myProfile = await fetchProfile(address);
    for (var e in myProfile) {
        if (myProfile[e].name == "LSP3Profile") {
            return myProfile[e].value.LSP3Profile
        }
    }
    return "";
}

// // Debug
// fetchProfile(SAMPLE_PROFILE_ADDRESS).then((profileData) =>
//   console.log(JSON.stringify(profileData, undefined, 2)),
// );