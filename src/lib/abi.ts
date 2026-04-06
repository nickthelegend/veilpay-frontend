export const STEALTH_REGISTRY_ABI = [
  {
    "inputs": [
      { "internalType": "bytes", "name": "stealthMetaAddress", "type": "bytes" }
    ],
    "name": "registerStealthMetaAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getStealthMetaAddress",
    "outputs": [
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const STEALTH_ANNOUNCER_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "stealthAddress", "type": "address" },
      { "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" },
      { "internalType": "bytes", "name": "metadata", "type": "bytes" }
    ],
    "name": "sendNative",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "address", "name": "stealthAddress", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" },
      { "internalType": "bytes", "name": "metadata", "type": "bytes" }
    ],
    "name": "sendERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
