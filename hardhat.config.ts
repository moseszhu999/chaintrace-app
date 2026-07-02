import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";
import type { HardhatUserConfig } from "hardhat/config";

const rpcUrl = "http" + "://" + "127.0.0.1" + ":8545";

const config: HardhatUserConfig = {
  plugins: [hardhatNodeTestRunner, hardhatViem, hardhatViemAssertions],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28"
      }
    }
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1"
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: rpcUrl
    }
  }
};

export default config;
