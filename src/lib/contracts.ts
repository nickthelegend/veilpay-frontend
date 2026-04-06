export const STEALTH_REGISTRY_ADDRESS = "0x32825cf98aA9f1fA10D2025B06894094F765B177";
export const STEALTH_ANNOUNCER_ADDRESS = "0x37672d29a18F8681F72c8ecB98b99C1F08e34772";

export const CONFLUX_ESPACE_TESTNET = {
  id: 71,
  name: 'Conflux eSpace Testnet',
  network: 'conflux-espace-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'CFX',
    symbol: 'CFX',
  },
  rpcUrls: {
    default: { http: ['https://testnet.conflux.validationcloud.io/v1/bC52X43z8nneoh11p4JiDs7eQLLw1rqv4URTn-AOpfg'] },
    public: { http: ['https://testnet.conflux.validationcloud.io/v1/bC52X43z8nneoh11p4JiDs7eQLLw1rqv4URTn-AOpfg'] },
  },
  blockExplorers: {
    default: { name: 'ConfluxScan', url: 'https://testnet.confluxscan.io' },
  },
  testnet: true,
};
