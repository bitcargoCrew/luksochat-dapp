require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7"
      },
      {
        version: "0.5.16"
      }
    ],
  },
  networks: { 
    hardhat: {
      chainId: 1337
    },
  },
};