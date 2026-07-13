export const CONTRACT_ADDRESS = "0xaa9287430Ba68874817EF8B84Bfb18B3463Bfe6e";

export const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "player", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "streak", "type": "uint256" }
		],
		"name": "ScoreSubmitted",
		"type": "event"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "score", "type": "uint256" }],
		"name": "submitScore",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
		"name": "getPlayer",
		"outputs": [
			{ "internalType": "address", "name": "addr", "type": "address" },
			{ "internalType": "uint256", "name": "bestScore", "type": "uint256" },
			{ "internalType": "uint256", "name": "totalScore", "type": "uint256" },
			{ "internalType": "uint256", "name": "streak", "type": "uint256" }
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getPlayerCount",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"name": "playerList",
		"outputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "address", "name": "", "type": "address" }],
		"name": "players",
		"outputs": [
			{ "internalType": "uint256", "name": "bestScore", "type": "uint256" },
			{ "internalType": "uint256", "name": "totalScore", "type": "uint256" },
			{ "internalType": "uint256", "name": "streak", "type": "uint256" },
			{ "internalType": "uint256", "name": "lastPlayedDay", "type": "uint256" },
			{ "internalType": "bool", "name": "exists", "type": "bool" }
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

export const BADGES_ADDRESS = "0x434870391d05A636769c5506AA80811D8d14e5c5";

export const BADGES_ABI = [
	{
		"inputs": [{ "internalType": "address", "name": "_leaderboard", "type": "address" }],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "player", "type": "address" },
			{ "indexed": true, "internalType": "uint256", "name": "badgeId", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "streak", "type": "uint256" }
		],
		"name": "BadgeClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{ "indexed": true, "internalType": "address", "name": "operator", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "from", "type": "address" },
			{ "indexed": true, "internalType": "address", "name": "to", "type": "address" },
			{ "indexed": false, "internalType": "uint256", "name": "id", "type": "uint256" },
			{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
		],
		"name": "TransferSingle",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "BRONZE",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SILVER",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GOLD",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DIAMOND",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "address", "name": "account", "type": "address" },
			{ "internalType": "uint256", "name": "id", "type": "uint256" }
		],
		"name": "balanceOf",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{ "internalType": "address[]", "name": "accounts", "type": "address[]" },
			{ "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }
		],
		"name": "balanceOfBatch",
		"outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "badgeId", "type": "uint256" }],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"name": "requiredStreak",
		"outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
		"name": "uri",
		"outputs": [{ "internalType": "string", "name": "", "type": "string" }],
		"stateMutability": "view",
		"type": "function"
	}
] as const;