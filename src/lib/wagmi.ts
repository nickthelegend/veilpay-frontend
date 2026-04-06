import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { CONFLUX_ESPACE_TESTNET } from "./contracts";

// Convert our custom chain to a type compatible with wagmi/viem
const confluxEspaceTestnet = {
  ...CONFLUX_ESPACE_TESTNET,
  rpcUrls: {
    ...CONFLUX_ESPACE_TESTNET.rpcUrls,
    default: { http: CONFLUX_ESPACE_TESTNET.rpcUrls.default.http as [string, ...string[]] },
    public: { http: CONFLUX_ESPACE_TESTNET.rpcUrls.public.http as [string, ...string[]] },
  }
} as const;

export const config = getDefaultConfig({
  appName: "VeilPay",
  projectId: "YOUR_PROJECT_ID", // For demo purposes
  chains: [confluxEspaceTestnet],
  ssr: true,
  transports: {
    [confluxEspaceTestnet.id]: http(),
  },
});
