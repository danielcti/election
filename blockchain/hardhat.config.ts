import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

// i want to set the owner of the contract to the address of the signer
const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    },
  },
};

export default config;
