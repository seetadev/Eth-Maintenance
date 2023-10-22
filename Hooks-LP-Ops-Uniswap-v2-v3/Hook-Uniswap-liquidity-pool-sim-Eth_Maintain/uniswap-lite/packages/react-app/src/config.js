import { Sepolia } from "@usedapp/core";
import env from "./env.js";

export const ROUTER_ADDRESS = env.ROUTER_CONTRACT_ADDRESS;

export const DAPP_CONFIG = {
  readOnlyChainId: Sepolia.chainId,
  readOnlyUrls: {
    [Sepolia.chainId]: env.PROVIDER_API,
  },
};
