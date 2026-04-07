// Auto-generated — do not edit manually
export const CONTRACTS = {
  network: "confluxTestnet",
  chainId: 71,
  rpc: "https://testnet.conflux.validationcloud.io/v1/bC52X43z8nneoh11p4JiDs7eQLLw1rqv4URTn-AOpfg",
  // Stealth payment contracts
  StealthRegistry: "0x32825cf98aA9f1fA10D2025B06894094F765B177",
  StealthAnnouncer: "0x37672d29a18F8681F72c8ecB98b99C1F08e34772",
  // DarkBook ZK dark pool contracts
  UltraPlonkVerifier: "0xa724a2eC009Ae6F2c8fFF287b849a926645B6670",
  Vault: "0x97f9BB7A7D941eb6B4995307F6E03d038e2Dcb18",
  DarkBookEngine: "0xf8b85BCf5a9b52F3D95b323a82F3cF90dF8AB0C1",
  TestToken: "0xfCaBa68297d86E56e01E8e9CcB88AF06bc093b9E",
} as const;

export const CONFLUX_TESTNET = {
  id: 71,
  name: "Conflux eSpace Testnet",
  rpcUrls: {
    default: { http: [CONTRACTS.rpc] },
    public: { http: [CONTRACTS.rpc] },
  },
  nativeCurrency: { name: "CFX", symbol: "CFX", decimals: 18 },
  blockExplorers: {
    default: { name: "ConfluxScan", url: "https://evmtestnet.confluxscan.io" }
  },
} as const;

export const CONFLUX_ESPACE_TESTNET = CONFLUX_TESTNET;
