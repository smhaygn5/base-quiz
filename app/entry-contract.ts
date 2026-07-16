export const ROUND_ENTRY_ADDRESS = "0x3e038Ca0F5De4DF0E364eAC4664025081c4ca3a7" as const;

export const ROUND_ENTRY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "player", type: "address" },
      { indexed: false, internalType: "uint256", name: "startedAt", type: "uint256" },
    ],
    name: "RoundStarted",
    type: "event",
  },
  {
    inputs: [],
    name: "startRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const CREATE2_DEPLOYER_ADDRESS = "0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2" as const;
export const ROUND_ENTRY_SALT = "0x2059583c4e950a51156ce5c754eee7d2b647fe569f767ae0dc4cc46f7405c0ab" as const;
export const ROUND_ENTRY_CREATION_CODE = "0x6080604052348015600e575f5ffd5b5060e38061001b5f395ff3fe6080604052348015600e575f5ffd5b50600436106026575f3560e01c806355e3f08614602a575b5f5ffd5b60306032565b005b3373ffffffffffffffffffffffffffffffffffffffff167fd8e0ecbb2bbc08efe66f6614e491ca286b13dcd8a7fd042ab4ca2ff30a1d221142604051607691906096565b60405180910390a2565b5f819050919050565b6090816080565b82525050565b5f60208201905060a75f8301846089565b9291505056fea264697066735822122059b79d61e51fc6e0b56b15b1b86b7b474686aa206e5df532eef5f1319861003064736f6c634300081e0033" as const;

export const CREATE2_DEPLOYER_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
      { internalType: "bytes", name: "code", type: "bytes" },
    ],
    name: "deploy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

