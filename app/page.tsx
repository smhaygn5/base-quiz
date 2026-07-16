"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import Image from "next/image";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";
import { useAccount, useConnect, useDisconnect, useWriteContract, useSwitchChain, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { namehash } from "viem/ens";
import { CategoryCarousel } from "@/components/ui/category-carousel";
import { BadgesRoadmap } from "@/components/ui/badges-roadmap";
import { HomeHero } from "@/components/ui/home-hero";
import { LeaderboardTable } from "@/components/ui/leaderboard-table";
import { QuizPanel } from "@/components/ui/quiz-panel";
import { ResultPanel } from "@/components/ui/result-panel";
import { CONTRACT_ADDRESS, CONTRACT_ABI, BADGES_ADDRESS, BADGES_ABI } from "./contract";

// Basenames reverse resolution on Base mainnet (L2 Resolver)
const L2_RESOLVER_ADDRESS = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";
const L2_RESOLVER_ABI = [
  {
    inputs: [{ internalType: "bytes32", name: "node", type: "bytes32" }],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Base mainnet coinType = (0x80000000 | 8453) >>> 0 = 0x80002105
function reverseNode(addr: string): `0x${string}` {
  return namehash(`${addr.toLowerCase().slice(2)}.80002105.reverse`);
}

const CRYPTO_Q = [
  { q: "Which company developed Base?", a: ["Binance", "Coinbase", "Kraken", "OKX"], c: 1 },
  { q: "Base is a Layer-2 of which network?", a: ["Bitcoin", "Solana", "Ethereum", "Avalanche"], c: 2 },
  { q: "Which tech stack does Base use?", a: ["OP Stack", "zkSync", "Polygon CDK", "Arbitrum Nitro"], c: 0 },
  { q: "In which year did Base mainnet launch?", a: ["2021", "2022", "2023", "2024"], c: 2 },
  { q: "Which token is used for gas fees on Base?", a: ["USDC", "BASE", "ETH", "OP"], c: 2 },
  { q: "What was Base App formerly called?", a: ["Coinbase Wallet", "MetaMask", "Rainbow", "Phantom"], c: 0 },
  { q: "Who is the CEO of Coinbase?", a: ["Vitalik Buterin", "Brian Armstrong", "Changpeng Zhao", "Jesse Pollak"], c: 1 },
  { q: "Who leads Base at Coinbase?", a: ["Brian Armstrong", "Jesse Pollak", "Hayden Adams", "Stani Kulechov"], c: 1 },
  { q: "Which superchain does Base belong to?", a: ["Polygon Superchain", "Optimism Superchain", "Arbitrum Orbit", "zkSync Hyperchain"], c: 1 },
  { q: "Base is best described as?", a: ["A standalone L1", "An Ethereum L2 rollup", "A sidechain", "A bridge protocol"], c: 1 },
  { q: "Who is the founder of Ethereum?", a: ["Satoshi Nakamoto", "Vitalik Buterin", "Brian Armstrong", "CZ"], c: 1 },
  { q: "Smart contracts on Base are written in?", a: ["Python", "Rust", "Solidity", "Go"], c: 2 },
  { q: "What is the smallest unit of ETH?", a: ["Satoshi", "Gwei", "Wei", "Finney"], c: 2 },
  { q: "What is the main goal of Layer-2s?", a: ["Minting more tokens", "Scalability & lower fees", "Mining", "Staking"], c: 1 },
  { q: "What consensus does Ethereum use?", a: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of History"], c: 1 },
  { q: "What is an EVM?", a: ["A wallet type", "Ethereum's execution engine", "A token standard", "A bridge"], c: 1 },
  { q: "Which is NOT an L2 of Ethereum?", a: ["Base", "Arbitrum", "Solana", "Optimism"], c: 2 },
  { q: "What does 'gas' refer to?", a: ["A token", "Transaction fee unit", "A wallet", "An NFT type"], c: 1 },
  { q: "When did Ethereum switch to PoS (The Merge)?", a: ["2020", "2021", "2022", "2023"], c: 2 },
  { q: "What is an ERC-20?", a: ["NFT standard", "Fungible token standard", "Wallet format", "L2 standard"], c: 1 },
  { q: "What is Bitcoin's max supply?", a: ["21 million", "100 million", "1 billion", "Unlimited"], c: 0 },
  { q: "Who created Bitcoin?", a: ["Vitalik Buterin", "Satoshi Nakamoto", "Hal Finney", "Nick Szabo"], c: 1 },
  { q: "Bitcoin's smallest unit is called?", a: ["Wei", "Gwei", "Satoshi", "Finney"], c: 2 },
  { q: "How often does Bitcoin halving occur (roughly)?", a: ["Every year", "Every 2 years", "Every 4 years", "Every 10 years"], c: 2 },
  { q: "Bitcoin uses which consensus?", a: ["Proof of Stake", "Proof of Work", "Proof of Authority", "DPoS"], c: 1 },
  { q: "What does DeFi stand for?", a: ["Defined Finance", "Decentralized Finance", "Defaulted Finance", "Deferred Finance"], c: 1 },
  { q: "Uniswap is primarily a?", a: ["Lending platform", "DEX (decentralized exchange)", "Wallet", "Bridge"], c: 1 },
  { q: "What is an AMM?", a: ["Auto Market Mover", "Automated Market Maker", "Asset Management Module", "Aggregated Mint Maker"], c: 1 },
  { q: "What does TVL mean?", a: ["Token Value Locked", "Total Value Locked", "Trade Volume Limit", "Tier Volume Level"], c: 1 },
  { q: "Aave is primarily a?", a: ["DEX", "Lending protocol", "Stablecoin", "NFT marketplace"], c: 1 },
  { q: "What is yield farming?", a: ["Mining crops", "Earning rewards from DeFi protocols", "A staking pool name", "An NFT minting term"], c: 1 },
  { q: "Which company issues USDC?", a: ["Tether", "Circle", "Coinbase", "Paxos"], c: 1 },
  { q: "Which company issues USDT?", a: ["Circle", "Tether", "Coinbase", "MakerDAO"], c: 1 },
  { q: "DAI is primarily backed by?", a: ["US Dollars in a bank", "Crypto collateral", "Gold reserves", "Government bonds"], c: 1 },
  { q: "Stablecoins try to maintain price parity with?", a: ["Bitcoin", "Ethereum", "Fiat currencies", "Gold only"], c: 2 },
  { q: "What does NFT stand for?", a: ["New Finance Token", "Non-Fungible Token", "Network File Transfer", "Node Function Type"], c: 1 },
  { q: "Which is the NFT token standard on Ethereum?", a: ["ERC-20", "ERC-721", "ERC-1155 only", "BEP-20"], c: 1 },
  { q: "OpenSea is primarily a?", a: ["DEX", "NFT marketplace", "Wallet", "L2 chain"], c: 1 },
  { q: "What does 'mint' mean in NFTs?", a: ["Sell an NFT", "Create a new NFT onchain", "Burn an NFT", "Transfer an NFT"], c: 1 },
  { q: "What are a wallet's secret words called?", a: ["Public key", "Seed phrase", "Hash", "Nonce"], c: 1 },
  { q: "What is a hardware wallet?", a: ["A mobile app", "A physical device for storing keys", "A browser extension", "An exchange account"], c: 1 },
  { q: "You should NEVER share your?", a: ["Wallet address", "Seed phrase", "ENS name", "Username"], c: 1 },
  { q: "Self-custody means?", a: ["Exchange holds your keys", "You control your private keys", "A bank holds your keys", "A friend holds your keys"], c: 1 },
  { q: "MetaMask is primarily a?", a: ["Exchange", "Browser wallet", "Hardware wallet", "L2 chain"], c: 1 },
  { q: "What is Farcaster?", a: ["An exchange", "A decentralized social network", "A wallet", "A game"], c: 1 },
  { q: "Posts on Farcaster are called?", a: ["Tweets", "Casts", "Toots", "Snaps"], c: 1 },
  { q: "Who founded Farcaster?", a: ["Vitalik Buterin", "Dan Romero & Varun Srinivasan", "Jesse Pollak", "Jack Dorsey"], c: 1 },
  { q: "A Farcaster user identifier is called?", a: ["UID", "FID", "Handle", "Tag"], c: 1 },
  { q: "Mini Apps on Base App are built with?", a: ["MiniKit / OnchainKit", "Flutter only", "Native iOS only", "Unity"], c: 0 },
  { q: "A blockchain transaction hash is also called?", a: ["Nonce", "TX ID", "Block height", "Gas limit"], c: 1 },
  { q: "What does DAO stand for?", a: ["Digital Asset Order", "Decentralized Autonomous Organization", "Distributed App Output", "Data Access Object"], c: 1 },
  { q: "What is a 'block explorer'?", a: ["A mining tool", "A site to view onchain data", "A wallet type", "A bridge"], c: 1 },
  { q: "What is 'slippage' in trading?", a: ["Network downtime", "Difference between expected & actual price", "A type of fee", "A wallet error"], c: 1 },
  { q: "A 'rug pull' is?", a: ["A trading strategy", "A scam where founders abandon a project", "A staking method", "A wallet feature"], c: 1 },
  { q: "What's a multisig wallet?", a: ["A wallet with many tokens", "A wallet needing multiple signatures to approve tx", "A wallet on multiple chains", "A wallet with a long password"], c: 1 },
  { q: "What does 'HODL' mean in crypto culture?", a: ["Sell quickly", "Hold long-term", "A hardware wallet", "A type of token"], c: 1 },
  { q: "What is a 'whale' in crypto?", a: ["A tiny investor", "A holder of very large amounts", "A stablecoin", "A mining rig"], c: 1 },
  { q: "Gas fees on a blockchain are paid to?", a: ["Developers", "Network validators/miners", "Exchanges", "Banks"], c: 1 },
  { q: "What is a smart contract?", a: ["A paper contract", "Self-executing code on a blockchain", "A savings account", "A hardware device"], c: 1 },
  { q: "What does 'DEX' stand for?", a: ["Digital Exchange", "Decentralized Exchange", "Data Exchange", "Direct Exchange"], c: 1 },
  { q: "What does 'CEX' stand for?", a: ["Central Exchange", "Centralized Exchange", "Crypto Exchange", "Coin Exchange"], c: 1 },
  { q: "What is 'staking'?", a: ["Selling tokens", "Locking tokens to support a network for rewards", "Mining coins", "Burning tokens"], c: 1 },
  { q: "What is a 'private key'?", a: ["Your public address", "A secret that controls your funds", "An exchange password", "A transaction id"], c: 1 },
  { q: "A 'testnet' is used for?", a: ["Real transactions", "Testing without real value", "Storing coins", "Mining Bitcoin"], c: 1 },
  { q: "What does 'burning' tokens mean?", a: ["Creating tokens", "Permanently removing tokens from supply", "Staking tokens", "Sending tokens"], c: 1 },
  { q: "What is a 'bull market'?", a: ["Prices falling", "Prices rising", "No trading", "A type of coin"], c: 1 },
  { q: "What is a 'bear market'?", a: ["Prices rising", "Prices falling", "Sideways only", "A mining term"], c: 1 },
  { q: "What is an 'airdrop'?", a: ["A market crash", "Free distribution of tokens", "A hack", "A trading fee"], c: 1 },
  { q: "What is 'Web3'?", a: ["The third website", "A decentralized internet on blockchain", "A web browser", "A programming language"], c: 1 },
  { q: "What does 'L1' mean?", a: ["Layer 1 base blockchain", "A game level", "A wallet", "A token standard"], c: 0 },
  { q: "Solana is a?", a: ["Layer-2 of Ethereum", "Standalone Layer-1 blockchain", "Wallet", "Stablecoin"], c: 1 },
  { q: "Proof of Work is known for?", a: ["Low energy use", "High energy use via mining", "Staking coins", "No validators"], c: 1 },
  { q: "What does 'DYOR' mean?", a: ["Do Your Own Research", "Deposit Your Own Reserves", "Don't Yield On Returns", "Data Yield Over Risk"], c: 0 },
  { q: "What is a 'cold wallet'?", a: ["Always-online wallet", "Offline wallet for storage", "Exchange wallet", "A stablecoin"], c: 1 },
  { q: "What is a 'hot wallet'?", a: ["Offline wallet", "Internet-connected wallet", "Hardware wallet", "Paper wallet"], c: 1 },
  { q: "'Gwei' is used to measure?", a: ["Token supply", "Gas prices", "Block size", "Wallet balance"], c: 1 },
  { q: "'Impermanent loss' is associated with?", a: ["Staking", "Providing liquidity", "Mining", "Holding"], c: 1 },
  { q: "A blockchain 'bridge' is used to?", a: ["Mine coins", "Move assets between blockchains", "Store keys", "Create tokens"], c: 1 },
  { q: "What is a 'validator'?", a: ["A wallet", "A node that verifies transactions", "A token", "An exchange"], c: 1 },
  { q: "'ATH' stands for?", a: ["All-Time High", "Average Trade Height", "Actual Token Holdings", "Auto Trade Handler"], c: 0 },
  { q: "A 'ticker' like BTC or ETH is?", a: ["A price chart", "A short symbol for an asset", "A wallet", "A block"], c: 1 },
  { q: "In Proof of Work, confirming transactions is called?", a: ["Staking", "Mining", "Bridging", "Burning"], c: 1 },
  { q: "What is 'market cap'?", a: ["Price × circulating supply", "Daily trading volume", "Number of wallets", "Total gas fees"], c: 0 },
  { q: "OnchainKit is a developer toolkit by?", a: ["Binance", "Coinbase", "MetaMask", "Uniswap"], c: 1 },
  { q: "A 'gas limit' sets?", a: ["Token supply", "Max gas a transaction can use", "Wallet size", "Block reward"], c: 1 },
  { q: "Polygon is best known as?", a: ["A base Layer-1", "An Ethereum scaling solution", "A wallet", "An exchange"], c: 1 },
  { q: "What does 'FOMO' mean in trading?", a: ["Fear Of Missing Out", "Full Order Market Offer", "Fixed Order Money Out", "Fast Onchain Market Order"], c: 0 },
  { q: "What is 'liquidity' in a pool?", a: ["Number of users", "Assets available to trade", "Trading fees", "Block height"], c: 1 },
  { q: "'Layer-2' solutions mainly aim to?", a: ["Replace Bitcoin", "Scale a Layer-1 with cheaper, faster txs", "Mine faster", "Issue stablecoins"], c: 1 },
  { q: "A wallet 'address' is generally?", a: ["Secret, never shared", "Public and shareable to receive funds", "Your password", "A private key"], c: 1 },
  { q: "What does 'KYC' stand for?", a: ["Keep Your Coins", "Know Your Customer", "Key Yield Contract", "Known Yield Curve"], c: 1 },
  { q: "A 'nonce' in a transaction is?", a: ["A random word", "A per-account transaction counter", "A token", "A wallet"], c: 1 },
  { q: "'PoS' stands for?", a: ["Proof of Speed", "Proof of Stake", "Point of Sale", "Proof of Storage"], c: 1 },
  { q: "A stablecoin is designed to?", a: ["Grow fast", "Stay near a stable value", "Be an NFT", "Mine blocks"], c: 1 },
  { q: "Which of these is a stablecoin?", a: ["ETH", "USDC", "BTC", "SOL"], c: 1 },
  { q: "'Cross-chain' means operating across?", a: ["One app", "Multiple blockchains", "One wallet", "One token"], c: 1 },
  { q: "A 'block' in a blockchain contains?", a: ["Only one transaction", "A batch of transactions", "Only code", "Nothing"], c: 1 },
  { q: "The 'genesis block' is the?", a: ["Last block", "First block of a blockchain", "A wallet", "A token"], c: 1 },
  { q: "What does 'ROI' stand for?", a: ["Return On Investment", "Rate Of Interest", "Risk Of Inflation", "Ratio Of Income"], c: 0 },
  { q: "Ethereum gas prices are usually measured in?", a: ["US dollars", "Gwei", "Bitcoin", "Bytes"], c: 1 },
];

const SPORTS_Q = [
  { q: "How many players from one soccer team are on the field?", a: ["9", "10", "11", "12"], c: 2 },
  { q: "In which sport would you perform a slam dunk?", a: ["Tennis", "Basketball", "Golf", "Cricket"], c: 1 },
  { q: "How often are the Summer Olympics held?", a: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"], c: 2 },
  { q: "Which country has won the most FIFA World Cups?", a: ["Germany", "Italy", "Brazil", "Argentina"], c: 2 },
  { q: "In tennis, what is a score of zero called?", a: ["Nil", "Love", "Duck", "Blank"], c: 1 },
  { q: "How many rings are on the Olympic flag?", a: ["4", "5", "6", "7"], c: 1 },
  { q: "Which sport uses a shuttlecock?", a: ["Squash", "Badminton", "Table tennis", "Volleyball"], c: 1 },
  { q: "Usain Bolt is famous for which sport?", a: ["Swimming", "Sprinting", "Cycling", "Boxing"], c: 1 },
  { q: "How many points is a touchdown worth in American football?", a: ["3", "6", "7", "2"], c: 1 },
  { q: "The Tour de France is a competition in which sport?", a: ["Running", "Cycling", "Rowing", "Sailing"], c: 1 },
  { q: "Which country hosts the Wimbledon tennis tournament?", a: ["USA", "France", "England", "Australia"], c: 2 },
  { q: "Michael Jordan is a legend of which sport?", a: ["Baseball", "Basketball", "Football", "Hockey"], c: 1 },
  { q: "How many rounds are in a standard championship boxing match?", a: ["10", "12", "15", "9"], c: 1 },
  { q: "Which tennis Grand Slam is played on clay courts?", a: ["Wimbledon", "US Open", "French Open", "Australian Open"], c: 2 },
  { q: "Formula 1 is a form of which racing?", a: ["Boat", "Car", "Horse", "Bicycle"], c: 1 },
  { q: "A marathon is approximately how long?", a: ["21 km", "42 km", "50 km", "30 km"], c: 1 },
  { q: "How many players are on a cricket team?", a: ["9", "10", "11", "12"], c: 2 },
  { q: "The Masters Tournament is played in which sport?", a: ["Golf", "Tennis", "Polo", "Rugby"], c: 0 },
  { q: "Which country won the 2018 FIFA World Cup?", a: ["Germany", "France", "Brazil", "Croatia"], c: 1 },
  { q: "How long is a soccer match excluding stoppage time?", a: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"], c: 1 },
  { q: "Which card sends a soccer player off the field?", a: ["Yellow", "Red", "Blue", "Green"], c: 1 },
  { q: "A hat-trick means scoring how many goals in a match?", a: ["2", "3", "4", "5"], c: 1 },
  { q: "Cristiano Ronaldo represents which national team?", a: ["Brazil", "Spain", "Portugal", "Argentina"], c: 2 },
  { q: "Pelé played internationally for which country?", a: ["Argentina", "Brazil", "Portugal", "Italy"], c: 1 },
  { q: "Europe's top club football competition is the?", a: ["Europa League", "Champions League", "Copa America", "FA Cup"], c: 1 },
  { q: "The Ballon d'Or is awarded in which sport?", a: ["Basketball", "Football/Soccer", "Tennis", "Golf"], c: 1 },
  { q: "Diego Maradona was a legend of which sport?", a: ["Basketball", "Soccer", "Tennis", "Boxing"], c: 1 },
  { q: "A 'clean sheet' in soccer means?", a: ["Scoring many goals", "Conceding no goals", "Getting a red card", "A draw"], c: 1 },
  { q: "A free throw in basketball is worth how many points?", a: ["1", "2", "3", "4"], c: 0 },
  { q: "A basket from beyond the three-point arc is worth?", a: ["1", "2", "3", "4"], c: 2 },
  { q: "Standard basketball hoops are set at what height?", a: ["8 feet", "10 feet", "12 feet", "15 feet"], c: 1 },
  { q: "The NBA is a league based in which country?", a: ["Canada", "USA", "Spain", "Australia"], c: 1 },
  { q: "Which country is credited with inventing basketball?", a: ["Canada", "USA", "UK", "France"], c: 1 },
  { q: "How many Grand Slam events are in tennis each year?", a: ["2", "3", "4", "5"], c: 2 },
  { q: "Which surface is Wimbledon played on?", a: ["Clay", "Grass", "Hard court", "Carpet"], c: 1 },
  { q: "Roger Federer is famous for which sport?", a: ["Golf", "Tennis", "Cycling", "Rowing"], c: 1 },
  { q: "Serena Williams is a champion in which sport?", a: ["Golf", "Tennis", "Swimming", "Athletics"], c: 1 },
  { q: "In tennis, what comes after 'deuce' when a player scores?", a: ["Game", "Advantage", "Set", "Match"], c: 1 },
  { q: "The first modern Olympic Games were held in which year?", a: ["1896", "1900", "1924", "1936"], c: 0 },
  { q: "The 2016 Summer Olympics were held in?", a: ["London", "Rio de Janeiro", "Tokyo", "Beijing"], c: 1 },
  { q: "The 2024 Summer Olympics were held in?", a: ["Tokyo", "Paris", "Los Angeles", "London"], c: 1 },
  { q: "The Olympic motto is 'Faster, Higher, ___'.", a: ["Better", "Stronger", "Farther", "Longer"], c: 1 },
  { q: "Where is the Olympic flame traditionally lit?", a: ["Italy", "Greece", "France", "Egypt"], c: 1 },
  { q: "Michael Phelps dominated which Olympic sport?", a: ["Athletics", "Swimming", "Diving", "Rowing"], c: 1 },
  { q: "Which is NOT a competitive swimming stroke?", a: ["Butterfly", "Backstroke", "Breaststroke", "Sidestroke"], c: 3 },
  { q: "Muhammad Ali was a legendary?", a: ["Footballer", "Boxer", "Swimmer", "Runner"], c: 1 },
  { q: "Judo originated in which country?", a: ["China", "Japan", "Korea", "Thailand"], c: 1 },
  { q: "Taekwondo originated in which country?", a: ["Japan", "China", "South Korea", "Vietnam"], c: 2 },
  { q: "In boxing, 'KO' stands for?", a: ["Knockout", "Keep On", "Knee Out", "Key Opponent"], c: 0 },
  { q: "Sumo wrestling is a traditional sport of?", a: ["China", "Japan", "Korea", "Mongolia"], c: 1 },
  { q: "In golf, one stroke under par on a hole is a?", a: ["Eagle", "Birdie", "Bogey", "Par"], c: 1 },
  { q: "In golf, one stroke over par is a?", a: ["Birdie", "Bogey", "Eagle", "Ace"], c: 1 },
  { q: "A hole-in-one in golf is also called an?", a: ["Ace", "Birdie", "Eagle", "Par"], c: 0 },
  { q: "A standard round of golf has how many holes?", a: ["9", "12", "18", "24"], c: 2 },
  { q: "Which country is the birthplace of golf?", a: ["USA", "Scotland", "France", "Italy"], c: 1 },
  { q: "Lewis Hamilton competes in which sport?", a: ["MotoGP", "Formula 1", "Rally", "NASCAR"], c: 1 },
  { q: "Formula 1 cars race on a?", a: ["Field", "Track/circuit", "Pool", "Court"], c: 1 },
  { q: "In Formula 1, titles go to drivers and?", a: ["Fans", "Constructors", "Cities", "Sponsors"], c: 1 },
  { q: "How many strikes make a strikeout in baseball?", a: ["2", "3", "4", "5"], c: 1 },
  { q: "Baseball is played on a field shaped like a?", a: ["Circle", "Diamond", "Square", "Triangle"], c: 1 },
  { q: "The Super Bowl is the championship of which sport?", a: ["Basketball", "American football", "Baseball", "Ice hockey"], c: 1 },
  { q: "How many players per team are on the field in American football?", a: ["9", "10", "11", "12"], c: 2 },
  { q: "Ice hockey is played on?", a: ["Grass", "Ice", "Sand", "Clay"], c: 1 },
  { q: "The Stanley Cup is the trophy of which sport?", a: ["Basketball", "Ice hockey", "Baseball", "Soccer"], c: 1 },
  { q: "How many players per side are on the ice in ice hockey?", a: ["5", "6", "7", "8"], c: 1 },
  { q: "How many players per team are on a volleyball court?", a: ["5", "6", "7", "8"], c: 1 },
  { q: "Table tennis is also commonly called?", a: ["Squash", "Ping pong", "Badminton", "Racquetball"], c: 1 },
  { q: "Which country dominates international table tennis?", a: ["Brazil", "China", "Canada", "Egypt"], c: 1 },
  { q: "Which racket sport is played inside four walls?", a: ["Tennis", "Squash", "Badminton", "Table tennis"], c: 1 },
  { q: "New Zealand's national rugby team is known as the?", a: ["Wallabies", "All Blacks", "Springboks", "Pumas"], c: 1 },
  { q: "A 'scrum' is a feature of which sport?", a: ["Rugby", "Tennis", "Golf", "Swimming"], c: 0 },
  { q: "A 'try' in rugby union is worth how many points?", a: ["3", "5", "7", "2"], c: 1 },
  { q: "A 'century' (100 runs) is a term in?", a: ["Baseball", "Cricket", "Rugby", "Soccer"], c: 1 },
  { q: "Cricket is especially popular in which country?", a: ["USA", "India", "Norway", "Iceland"], c: 1 },
  { q: "The javelin is thrown in which sport?", a: ["Gymnastics", "Athletics", "Cycling", "Rowing"], c: 1 },
  { q: "The long jump is an event in which sport?", a: ["Swimming", "Athletics", "Cycling", "Gymnastics"], c: 1 },
  { q: "The shortest sprint distance at the Olympics is?", a: ["50 m", "100 m", "200 m", "400 m"], c: 1 },
  { q: "A pommel horse is used in which sport?", a: ["Athletics", "Gymnastics", "Swimming", "Boxing"], c: 1 },
  { q: "'Slalom' is an event in which sport?", a: ["Swimming", "Skiing", "Cycling", "Boxing"], c: 1 },
  { q: "Skiing is typically which type of sport?", a: ["Water", "Winter", "Desert", "Indoor"], c: 1 },
  { q: "Speed skating takes place on?", a: ["Grass", "Ice", "Water", "Sand"], c: 1 },
  { q: "Which sport uses the terms 'strike' and 'spare'?", a: ["Bowling", "Golf", "Tennis", "Cricket"], c: 0 },
  { q: "The maximum break in snooker is?", a: ["147", "100", "180", "200"], c: 0 },
  { q: "The maximum score with three darts is?", a: ["150", "180", "200", "120"], c: 1 },
  { q: "A 'peloton' is a group of riders in which sport?", a: ["Cycling", "Swimming", "Boxing", "Golf"], c: 0 },
  { q: "The Tour de France mainly takes place in?", a: ["Italy", "Spain", "France", "Belgium"], c: 2 },
  { q: "The FIFA World Cup 2022 was hosted by?", a: ["Russia", "Qatar", "Brazil", "USA"], c: 1 },
  { q: "The FIFA World Cup trophy is awarded by?", a: ["UEFA", "FIFA", "NBA", "IOC"], c: 1 },
  { q: "A penalty kick in soccer is taken from about?", a: ["11 m", "20 m", "5 m", "30 m"], c: 0 },
  { q: "How many players start on a soccer pitch in total (both teams)?", a: ["20", "22", "24", "18"], c: 1 },
  { q: "Which sport features 'love', 'deuce', and 'ace'?", a: ["Golf", "Tennis", "Cricket", "Rugby"], c: 1 },
  { q: "The fourth tennis Grand Slam alongside Wimbledon, US and French Opens is the?", a: ["Italian Open", "Australian Open", "Madrid Open", "Dubai Open"], c: 1 },
  { q: "Figure skating is featured in which Olympics?", a: ["Summer", "Winter", "Both equally", "Neither"], c: 1 },
  { q: "How many players are on a baseball team on the field?", a: ["8", "9", "10", "11"], c: 1 },
  { q: "The 2008 Summer Olympics were hosted by?", a: ["London", "Beijing", "Athens", "Sydney"], c: 1 },
  { q: "Rowing races take place on?", a: ["A track", "Water", "Ice", "Grass"], c: 1 },
  { q: "Which sport uses a 'caddie'?", a: ["Golf", "Tennis", "Boxing", "Cycling"], c: 0 },
  { q: "High jump and pole vault belong to which sport?", a: ["Gymnastics", "Athletics", "Swimming", "Cycling"], c: 1 },
  { q: "Which country has hosted the Summer Olympics the most times?", a: ["France", "USA", "Greece", "Japan"], c: 1 },
  { q: "Fencing competitors use a?", a: ["Bat", "Sword/blade", "Racket", "Club"], c: 1 },
  { q: "Which sport is played at Roland Garros?", a: ["Golf", "Tennis", "Rugby", "Cycling"], c: 1 },
  { q: "A marathon runner who wins gold earns a?", a: ["Trophy only", "Gold medal", "Cash prize only", "Belt"], c: 1 },
];

const ART_Q = [
  { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], c: 2 },
  { q: "Who painted 'The Starry Night'?", a: ["Monet", "Van Gogh", "Dalí", "Rembrandt"], c: 1 },
  { q: "In which museum is the Mona Lisa displayed?", a: ["The Met", "Louvre", "Prado", "Uffizi"], c: 1 },
  { q: "Which artist famously cut off part of his own ear?", a: ["Picasso", "Van Gogh", "Dalí", "Monet"], c: 1 },
  { q: "Who painted the ceiling of the Sistine Chapel?", a: ["Raphael", "Michelangelo", "Da Vinci", "Donatello"], c: 1 },
  { q: "Which art movement is Pablo Picasso associated with?", a: ["Impressionism", "Cubism", "Surrealism", "Baroque"], c: 1 },
  { q: "Salvador Dalí is known for which art style?", a: ["Realism", "Surrealism", "Pop Art", "Gothic"], c: 1 },
  { q: "Who painted 'The Scream'?", a: ["Munch", "Klimt", "Warhol", "Cézanne"], c: 0 },
  { q: "Which artist is famous for painting Campbell's soup cans?", a: ["Warhol", "Pollock", "Rothko", "Bacon"], c: 0 },
  { q: "Who painted 'Girl with a Pearl Earring'?", a: ["Vermeer", "Rembrandt", "Rubens", "Bosch"], c: 0 },
  { q: "Mixing blue and yellow paint makes which color?", a: ["Purple", "Green", "Orange", "Brown"], c: 1 },
  { q: "Claude Monet was a leading figure of which movement?", a: ["Impressionism", "Cubism", "Dadaism", "Realism"], c: 0 },
  { q: "The marble statue 'David' was sculpted by?", a: ["Bernini", "Michelangelo", "Rodin", "Donatello"], c: 1 },
  { q: "Which of these is a primary color?", a: ["Green", "Orange", "Red", "Purple"], c: 2 },
  { q: "'Guernica' is a famous work by which artist?", a: ["Dalí", "Picasso", "Miró", "Goya"], c: 1 },
  { q: "Painting on wet plaster is a technique called?", a: ["Fresco", "Collage", "Etching", "Mosaic"], c: 0 },
  { q: "'The Thinker' sculpture was created by?", a: ["Rodin", "Michelangelo", "Bernini", "Calder"], c: 0 },
  { q: "Which tool is traditionally used to apply oil paint?", a: ["Chisel", "Brush", "Pen", "Roller"], c: 1 },
  { q: "'Sunflowers' is a famous painting series by?", a: ["Monet", "Van Gogh", "Cézanne", "Gauguin"], c: 1 },
  { q: "The 'Last Supper' mural was painted by?", a: ["Raphael", "Leonardo da Vinci", "Caravaggio", "Titian"], c: 1 },
  { q: "Which artist is famous for 'drip' paintings?", a: ["Jackson Pollock", "Rothko", "Warhol", "Dalí"], c: 0 },
  { q: "'The Persistence of Memory' (melting clocks) is by?", a: ["Magritte", "Dalí", "Miró", "Ernst"], c: 1 },
  { q: "Frida Kahlo is best known for her?", a: ["Landscapes", "Self-portraits", "Sculptures", "Murals only"], c: 1 },
  { q: "The Statue of Liberty was a gift to the USA from?", a: ["Britain", "France", "Spain", "Italy"], c: 1 },
  { q: "Mixing red and yellow paint makes?", a: ["Green", "Orange", "Purple", "Brown"], c: 1 },
  { q: "Mixing red and blue paint makes?", a: ["Green", "Purple", "Orange", "Brown"], c: 1 },
  { q: "The three primary paint colors are red, yellow and?", a: ["Green", "Blue", "Orange", "Purple"], c: 1 },
  { q: "Which artist is famous for painting water lilies?", a: ["Monet", "Manet", "Degas", "Renoir"], c: 0 },
  { q: "Michelangelo's famous Florence statue depicts?", a: ["Caesar", "David", "Apollo", "Hercules"], c: 1 },
  { q: "The art of beautiful handwriting is called?", a: ["Origami", "Calligraphy", "Etching", "Collage"], c: 1 },
  { q: "A painting depicting a person is a?", a: ["Landscape", "Portrait", "Still life", "Mural"], c: 1 },
  { q: "A painting of fruit or objects is a?", a: ["Portrait", "Still life", "Landscape", "Mural"], c: 1 },
  { q: "Classical statues are traditionally carved from?", a: ["Marble", "Plastic", "Paper", "Glass"], c: 0 },
  { q: "Andy Warhol was a leader of which movement?", a: ["Pop Art", "Cubism", "Baroque", "Gothic"], c: 0 },
  { q: "Vincent van Gogh was from which country?", a: ["France", "Netherlands", "Italy", "Spain"], c: 1 },
  { q: "Pablo Picasso was from which country?", a: ["Italy", "Spain", "France", "Portugal"], c: 1 },
  { q: "Leonardo da Vinci was from which country?", a: ["France", "Italy", "Spain", "Greece"], c: 1 },
  { q: "The Louvre museum is located in which city?", a: ["Rome", "Paris", "Madrid", "London"], c: 1 },
  { q: "Gluing materials onto a surface to make art is called?", a: ["Fresco", "Collage", "Etching", "Casting"], c: 1 },
  { q: "Impressionism began in which country?", a: ["Italy", "France", "Germany", "Spain"], c: 1 },
  { q: "Which is NOT a primary color of paint?", a: ["Red", "Blue", "Yellow", "Green"], c: 3 },
  { q: "Michelangelo's most famous ceiling is in which chapel?", a: ["Sistine Chapel", "King's Chapel", "St Paul's", "Notre-Dame"], c: 0 },
  { q: "Which artist had a 'Blue Period'?", a: ["Picasso", "Monet", "Rembrandt", "Turner"], c: 0 },
  { q: "Rembrandt was a master painter from which country?", a: ["Netherlands", "France", "Italy", "England"], c: 0 },
  { q: "'The Night Watch' was painted by?", a: ["Vermeer", "Rembrandt", "Rubens", "Hals"], c: 1 },
  { q: "Painting, sculpture, and drawing are types of?", a: ["Music", "Visual arts", "Literature", "Dance"], c: 1 },
  { q: "Watercolor is a type of?", a: ["Sculpture", "Paint", "Camera", "Clay"], c: 1 },
  { q: "An 'easel' is used to?", a: ["Mix clay", "Hold a canvas while painting", "Cut marble", "Frame photos"], c: 1 },
  { q: "The Mona Lisa is famous for her mysterious?", a: ["Hat", "Smile", "Dress", "Crown"], c: 1 },
  { q: "The artist Banksy is known for?", a: ["Classical portraits", "Street art", "Marble statues", "Frescoes"], c: 1 },
  { q: "The primary colors of light are red, green and?", a: ["Yellow", "Blue", "Purple", "White"], c: 1 },
  { q: "Cubism represents subjects using?", a: ["Realistic detail", "Geometric shapes", "Only circles", "Photographs"], c: 1 },
  { q: "A 'mural' is a painting made on a?", a: ["Small canvas", "Wall", "Plate", "Paper"], c: 1 },
  { q: "Who painted 'The Birth of Venus'?", a: ["Botticelli", "Raphael", "Giotto", "Titian"], c: 0 },
  { q: "The Renaissance art period began in?", a: ["France", "Italy", "England", "Germany"], c: 1 },
  { q: "Salvador Dalí was known for his distinctive?", a: ["Beard", "Moustache", "Hat", "Glasses"], c: 1 },
  { q: "Pottery is made primarily from?", a: ["Metal", "Clay", "Glass", "Wood"], c: 1 },
  { q: "Which is considered a warm color?", a: ["Blue", "Red", "Green", "Purple"], c: 1 },
  { q: "Which is considered a cool color?", a: ["Red", "Orange", "Blue", "Yellow"], c: 2 },
  { q: "Which artist is famous for painting ballet dancers?", a: ["Degas", "Monet", "Cézanne", "Seurat"], c: 0 },
  { q: "'Pointillism' (painting with dots) is linked to?", a: ["Seurat", "Van Gogh", "Klimt", "Munch"], c: 0 },
  { q: "Gustav Klimt's 'The Kiss' famously uses a lot of?", a: ["Silver", "Gold", "Blue", "Black"], c: 1 },
  { q: "A quick sketch is usually made with a?", a: ["Chisel", "Pencil", "Roller", "Clay"], c: 1 },
  { q: "Abstract art generally does NOT try to?", a: ["Use color", "Represent reality exactly", "Use shapes", "Be creative"], c: 1 },
  { q: "Which city has a museum devoted to Van Gogh?", a: ["Amsterdam", "London", "Rome", "Madrid"], c: 0 },
  { q: "Auguste Rodin was primarily a?", a: ["Painter", "Sculptor", "Photographer", "Architect"], c: 1 },
  { q: "MoMA (Museum of Modern Art) is located in?", a: ["Paris", "New York", "Rome", "Tokyo"], c: 1 },
  { q: "The Prado Museum is located in?", a: ["Madrid", "Paris", "Rome", "London"], c: 0 },
  { q: "'Chiaroscuro' refers to the strong use of?", a: ["Bright colors", "Light and shadow", "Straight lines", "Dots"], c: 1 },
  { q: "A painting canvas is usually which shape?", a: ["Round", "Rectangular", "Triangular", "Star-shaped"], c: 1 },
  { q: "A self-portrait shows?", a: ["The artist themselves", "A landscape", "A building", "An animal"], c: 0 },
  { q: "Michelangelo, Leonardo and Raphael belong to the?", a: ["Baroque", "Renaissance", "Modern era", "Gothic"], c: 1 },
  { q: "Surrealism often depicts?", a: ["Everyday realism", "Dreamlike, strange scenes", "Only portraits", "Pure geometry"], c: 1 },
  { q: "Red mixed with white makes?", a: ["Blue", "Pink", "Green", "Brown"], c: 1 },
  { q: "The famous statue of a seated thinking man is called?", a: ["The Dreamer", "The Thinker", "The Watcher", "The Sitter"], c: 1 },
  { q: "Photography as art captures images using a?", a: ["Brush", "Camera", "Chisel", "Loom"], c: 1 },
  { q: "'Vincent' is the first name of which painter?", a: ["Monet", "Van Gogh", "Picasso", "Dalí"], c: 1 },
  { q: "The Uffizi Gallery is located in which country?", a: ["Italy", "France", "Spain", "Greece"], c: 0 },
  { q: "Origami is the art of?", a: ["Paper folding", "Metalwork", "Glassblowing", "Painting"], c: 0 },
  { q: "Which artist painted many self-portraits across his life?", a: ["Rembrandt", "Botticelli", "Raphael", "Giotto"], c: 0 },
  { q: "A 'palette' is used to?", a: ["Hold and mix paints", "Cut wood", "Frame art", "Fire clay"], c: 0 },
  { q: "The Great Wave off Kanagawa is a famous Japanese?", a: ["Sculpture", "Woodblock print", "Oil painting", "Photograph"], c: 1 },
  { q: "Which is a common sculpture material?", a: ["Bronze", "Watercolor", "Charcoal", "Ink"], c: 0 },
  { q: "The 'vanishing point' is used in?", a: ["Music", "Perspective drawing", "Casting", "Weaving"], c: 1 },
  { q: "Leonardo da Vinci was also famous as an?", a: ["Athlete", "Inventor", "Singer", "Sailor"], c: 1 },
  { q: "A 'gallery' is a place to?", a: ["Store food", "Display artworks", "Repair cars", "Grow plants"], c: 1 },
  { q: "Baroque art is known for being?", a: ["Minimal and plain", "Dramatic and ornate", "Black and white only", "Purely geometric"], c: 1 },
  { q: "Which is a famous art auction house?", a: ["Sotheby's", "Nasdaq", "Airbnb", "Netflix"], c: 0 },
  { q: "The 'Venus de Milo' is a famous ancient?", a: ["Painting", "Statue", "Vase", "Mosaic"], c: 1 },
  { q: "Stained glass art is commonly found in?", a: ["Cathedrals", "Kitchens", "Garages", "Stadiums"], c: 0 },
  { q: "Charcoal is typically used for?", a: ["Painting walls", "Drawing/sketching", "Carving marble", "Printing"], c: 1 },
  { q: "The Tate is an art museum in which city?", a: ["Paris", "London", "Madrid", "Rome"], c: 1 },
  { q: "Which best describes 'sculpture'?", a: ["A 2D painting", "A 3D work of art", "A song", "A poem"], c: 1 },
  { q: "'Modern art' generally refers to art from roughly?", a: ["Ancient times", "The late 1800s onward", "Medieval times", "Prehistory"], c: 1 },
  { q: "Which artist is associated with Tahiti paintings?", a: ["Gauguin", "Monet", "Rembrandt", "Vermeer"], c: 0 },
  { q: "A fresco is painted onto?", a: ["Canvas", "Wet plaster", "Paper", "Wood panel"], c: 1 },
  { q: "The Sistine Chapel is located in?", a: ["Vatican City", "Florence", "Venice", "Naples"], c: 0 },
  { q: "Which of these is an art style?", a: ["Impressionism", "Photosynthesis", "Gravity", "Inflation"], c: 0 },
  { q: "A person who creates sculptures is a?", a: ["Painter", "Sculptor", "Novelist", "Composer"], c: 1 },
  { q: "Who painted 'Impression, Sunrise', which named Impressionism?", a: ["Monet", "Manet", "Renoir", "Degas"], c: 0 },
];

const HISTORY_Q = [
  { q: "In which year did World War II end?", a: ["1943", "1945", "1918", "1950"], c: 1 },
  { q: "Who was the first President of the United States?", a: ["Lincoln", "Washington", "Jefferson", "Adams"], c: 1 },
  { q: "The Great Pyramids were built by which ancient civilization?", a: ["Romans", "Greeks", "Egyptians", "Mayans"], c: 2 },
  { q: "In which year did the Berlin Wall fall?", a: ["1985", "1989", "1991", "1979"], c: 1 },
  { q: "Which philosopher was a student of Socrates?", a: ["Aristotle", "Plato", "Pythagoras", "Homer"], c: 1 },
  { q: "Which ship sank in 1912 after hitting an iceberg?", a: ["Lusitania", "Titanic", "Bismarck", "Mayflower"], c: 1 },
  { q: "Who reached the Americas in 1492?", a: ["Magellan", "Columbus", "Vespucci", "Cook"], c: 1 },
  { q: "The French Revolution began in which year?", a: ["1776", "1789", "1804", "1815"], c: 1 },
  { q: "Which empire was founded by Genghis Khan?", a: ["Ottoman", "Mongol", "Persian", "Roman"], c: 1 },
  { q: "Who led Nazi Germany during World War II?", a: ["Mussolini", "Hitler", "Stalin", "Franco"], c: 1 },
  { q: "The Colosseum is located in which city?", a: ["Athens", "Rome", "Cairo", "Istanbul"], c: 1 },
  { q: "Which Egyptian queen allied with Caesar and Mark Antony?", a: ["Nefertiti", "Cleopatra", "Hatshepsut", "Isis"], c: 1 },
  { q: "The Cold War was mainly between the USA and?", a: ["China", "USSR", "Germany", "Japan"], c: 1 },
  { q: "In which year did humans first land on the Moon?", a: ["1965", "1969", "1972", "1959"], c: 1 },
  { q: "The Renaissance began in which country?", a: ["France", "Italy", "England", "Spain"], c: 1 },
  { q: "The American Civil War was fought between the North and the?", a: ["East", "South", "West", "Midwest"], c: 1 },
  { q: "Which ancient civilization created democracy?", a: ["Rome", "Greece", "Egypt", "Persia"], c: 1 },
  { q: "The printing press was invented by?", a: ["Newton", "Gutenberg", "Edison", "Franklin"], c: 1 },
  { q: "The ancient Great Wall was built in which country?", a: ["India", "China", "Japan", "Egypt"], c: 1 },
  { q: "Which Egyptian queen has a famous bust displayed in Berlin?", a: ["Cleopatra", "Nefertiti", "Hatshepsut", "Isis"], c: 1 },
  { q: "World War I began in which year?", a: ["1912", "1914", "1918", "1920"], c: 1 },
  { q: "World War I ended in which year?", a: ["1916", "1918", "1920", "1922"], c: 1 },
  { q: "The Roman Empire was centered on which city?", a: ["Athens", "Rome", "Cairo", "Carthage"], c: 1 },
  { q: "Julius Caesar was a leader of ancient?", a: ["Greece", "Rome", "Egypt", "Persia"], c: 1 },
  { q: "The US Declaration of Independence was signed in?", a: ["1776", "1789", "1800", "1812"], c: 0 },
  { q: "Napoleon Bonaparte was a leader of which country?", a: ["Spain", "France", "Italy", "Russia"], c: 1 },
  { q: "Napoleon was famously defeated at the Battle of?", a: ["Hastings", "Waterloo", "Gettysburg", "Verdun"], c: 1 },
  { q: "The Berlin Wall divided which city?", a: ["Munich", "Berlin", "Frankfurt", "Vienna"], c: 1 },
  { q: "Which civilization built Machu Picchu?", a: ["Aztec", "Inca", "Maya", "Olmec"], c: 1 },
  { q: "The pyramids of Giza are located in?", a: ["Iraq", "Egypt", "Sudan", "Libya"], c: 1 },
  { q: "Who was the British PM during most of WWII?", a: ["Chamberlain", "Churchill", "Attlee", "Thatcher"], c: 1 },
  { q: "The Titanic was sailing to which city when it sank?", a: ["London", "New York", "Boston", "Halifax"], c: 1 },
  { q: "Which explorer led the first circumnavigation of the globe?", a: ["Columbus", "Magellan", "Da Gama", "Cook"], c: 1 },
  { q: "The word 'Renaissance' literally means?", a: ["Rebirth", "Revolution", "Reform", "Return"], c: 0 },
  { q: "Ancient Egyptians wrote using?", a: ["Latin", "Hieroglyphics", "Cyrillic", "Runes"], c: 1 },
  { q: "The Ottoman Empire was centered in modern-day?", a: ["Egypt", "Turkey", "Iran", "Greece"], c: 1 },
  { q: "Constantinople is the old name of which city?", a: ["Athens", "Istanbul", "Rome", "Cairo"], c: 1 },
  { q: "Which document limited the English king's power in 1215?", a: ["Magna Carta", "Bill of Rights", "Constitution", "Domesday Book"], c: 0 },
  { q: "The Industrial Revolution began in which country?", a: ["USA", "Britain", "France", "Germany"], c: 1 },
  { q: "Which US President was assassinated in 1963?", a: ["Lincoln", "Kennedy", "Roosevelt", "Nixon"], c: 1 },
  { q: "Which US president appears on the $1 bill?", a: ["Lincoln", "Washington", "Jefferson", "Franklin"], c: 1 },
  { q: "Who led India's non-violent independence movement?", a: ["Nehru", "Gandhi", "Bose", "Patel"], c: 1 },
  { q: "The Berlin Wall was built by which side?", a: ["West Germany", "East Germany", "France", "USA"], c: 1 },
  { q: "Which ancient civilization is famous for mummification?", a: ["Greek", "Egyptian", "Roman", "Persian"], c: 1 },
  { q: "The Black Death was a devastating?", a: ["War", "Plague", "Famine", "Earthquake"], c: 1 },
  { q: "The Protestant Reformation was started by?", a: ["Martin Luther", "Henry VIII", "Calvin", "Pope Leo"], c: 0 },
  { q: "The ancient Olympic Games originated in?", a: ["Rome", "Greece", "Egypt", "Persia"], c: 1 },
  { q: "Who was the first human in space?", a: ["Armstrong", "Gagarin", "Glenn", "Aldrin"], c: 1 },
  { q: "Neil Armstrong was the first person to?", a: ["Fly a plane", "Walk on the Moon", "Reach the South Pole", "Climb Everest"], c: 1 },
  { q: "The Soviet Union (USSR) dissolved in which year?", a: ["1989", "1991", "1993", "1985"], c: 1 },
  { q: "The US Declaration of Independence was mainly written by?", a: ["Washington", "Jefferson", "Franklin", "Adams"], c: 1 },
  { q: "Which ship brought the Pilgrims to America in 1620?", a: ["Mayflower", "Titanic", "Santa Maria", "Beagle"], c: 0 },
  { q: "Christopher Columbus sailed under the flag of?", a: ["Portugal", "Spain", "Italy", "England"], c: 1 },
  { q: "The French Revolution began with the storming of the?", a: ["Louvre", "Bastille", "Versailles", "Notre-Dame"], c: 1 },
  { q: "Which ancient wonder still stands in Egypt?", a: ["Great Pyramid of Giza", "Colosseum", "Parthenon", "Taj Mahal"], c: 0 },
  { q: "The Taj Mahal is located in which country?", a: ["Pakistan", "India", "Iran", "Turkey"], c: 1 },
  { q: "Who led the Soviet Union during WWII?", a: ["Lenin", "Stalin", "Khrushchev", "Gorbachev"], c: 1 },
  { q: "In WWII, atomic bombs hit Hiroshima and?", a: ["Tokyo", "Nagasaki", "Osaka", "Kyoto"], c: 1 },
  { q: "The League of Nations was a forerunner to the?", a: ["EU", "United Nations", "NATO", "WHO"], c: 1 },
  { q: "The United Nations was founded in which year?", a: ["1919", "1945", "1950", "1960"], c: 1 },
  { q: "Alexander the Great came from which ancient kingdom?", a: ["Rome", "Macedonia", "Egypt", "Persia"], c: 1 },
  { q: "Which country was home to ancient Sparta?", a: ["Italy", "Greece", "Egypt", "Turkey"], c: 1 },
  { q: "The Cold War ended around which year?", a: ["1975", "1991", "2001", "1965"], c: 1 },
  { q: "The Wright brothers are credited with inventing the?", a: ["Car", "Airplane", "Telephone", "Radio"], c: 1 },
  { q: "The D-Day landings of WWII took place in?", a: ["Italy", "Normandy, France", "Germany", "Poland"], c: 1 },
  { q: "The Hundred Years' War was mainly between England and?", a: ["Spain", "France", "Germany", "Italy"], c: 1 },
  { q: "Who was the UK's 'Iron Lady' Prime Minister in the 1980s?", a: ["Elizabeth II", "Thatcher", "May", "Merkel"], c: 1 },
  { q: "The ancient city of Pompeii was destroyed by?", a: ["A flood", "A volcano (Vesuvius)", "An earthquake", "A war"], c: 1 },
  { q: "Which ancient country was ruled by pharaohs?", a: ["Greece", "Egypt", "Rome", "Persia"], c: 1 },
  { q: "Which famous nurse served in the Crimean War?", a: ["Curie", "Nightingale", "Earhart", "Keller"], c: 1 },
  { q: "The Renaissance is most associated with which Italian city?", a: ["Milan", "Florence", "Naples", "Turin"], c: 1 },
  { q: "Who was the first woman to win a Nobel Prize?", a: ["Curie", "Franklin", "Meitner", "Lovelace"], c: 0 },
  { q: "The Vikings originally came from?", a: ["Scandinavia", "Spain", "Greece", "Egypt"], c: 0 },
  { q: "The Great Fire of London occurred in which year?", a: ["1666", "1700", "1620", "1750"], c: 0 },
  { q: "The Wall Street Crash that began the Great Depression was in?", a: ["1929", "1939", "1919", "1949"], c: 0 },
  { q: "Who introduced Soviet reforms 'glasnost' and 'perestroika'?", a: ["Stalin", "Gorbachev", "Lenin", "Putin"], c: 1 },
  { q: "The Magna Carta was signed in which country?", a: ["France", "England", "Italy", "Spain"], c: 1 },
  { q: "Which explorer reached India by sea in 1498?", a: ["Columbus", "Vasco da Gama", "Magellan", "Cook"], c: 1 },
  { q: "The ancient Mayans lived mainly in which region?", a: ["Central America", "North Africa", "Southeast Asia", "Northern Europe"], c: 0 },
  { q: "The Aztec civilization was located mainly in modern-day?", a: ["Peru", "Mexico", "Brazil", "Chile"], c: 1 },
  { q: "The Cold War space race famously ended with a landing on the?", a: ["Sun", "Moon", "Mars", "Venus"], c: 1 },
  { q: "The Eiffel Tower was built for the 1889 World's Fair in?", a: ["London", "Paris", "Rome", "Berlin"], c: 1 },
  { q: "Who wrote the '95 Theses'?", a: ["Calvin", "Martin Luther", "Erasmus", "Henry VIII"], c: 1 },
  { q: "Which war (1914-1918) featured widespread trench warfare?", a: ["WWII", "WWI", "Cold War", "Napoleonic Wars"], c: 1 },
  { q: "The American Civil War ended in which year?", a: ["1865", "1776", "1812", "1901"], c: 0 },
  { q: "Who was the first emperor of Rome?", a: ["Julius Caesar", "Augustus", "Nero", "Constantine"], c: 1 },
  { q: "The Silk Road connected Europe to?", a: ["Africa", "Asia", "America", "Australia"], c: 1 },
  { q: "Which country gifted the Statue of Liberty to the USA?", a: ["UK", "France", "Spain", "Germany"], c: 1 },
  { q: "The medieval period is also known as the?", a: ["Middle Ages", "Stone Age", "Bronze Age", "Space Age"], c: 0 },
  { q: "Who led the Cuban Revolution?", a: ["Guevara", "Castro", "Batista", "Allende"], c: 1 },
  { q: "Which country first built an atomic bomb?", a: ["Germany", "USA", "USSR", "Japan"], c: 1 },
  { q: "The Renaissance came right after which period?", a: ["Middle Ages", "Modern era", "Space Age", "Industrial era"], c: 0 },
  { q: "The ancient Parthenon temple is located in?", a: ["Rome", "Athens", "Cairo", "Istanbul"], c: 1 },
  { q: "Persepolis was a capital of which ancient empire?", a: ["Roman", "Persian", "Greek", "Egyptian"], c: 1 },
  { q: "The Age of Exploration saw Europeans searching for?", a: ["The Moon", "New trade routes and lands", "Oil", "Electricity"], c: 1 },
  { q: "In 1941, Japan attacked which US naval base?", a: ["San Diego", "Pearl Harbor", "Norfolk", "Guam"], c: 1 },
  { q: "The Roman numeral for 100 is?", a: ["C", "D", "M", "L"], c: 0 },
  { q: "The Rosetta Stone helped decode which ancient writing?", a: ["Latin", "Egyptian hieroglyphs", "Runes", "Sanskrit"], c: 1 },
  { q: "Which WWII US general later became US President?", a: ["Patton", "Eisenhower", "MacArthur", "Marshall"], c: 1 },
  { q: "Which queen reigned over the UK for 70 years until 2022?", a: ["Victoria", "Elizabeth II", "Anne", "Mary"], c: 1 },
];

const SCIENCE_Q = [
  { q: "What is the chemical formula for water?", a: ["CO2", "H2O", "O2", "NaCl"], c: 1 },
  { q: "How many planets are in our solar system?", a: ["7", "8", "9", "10"], c: 1 },
  { q: "What gas do plants absorb from the air?", a: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], c: 1 },
  { q: "Which is the closest planet to the Sun?", a: ["Venus", "Mercury", "Earth", "Mars"], c: 1 },
  { q: "What is known as the powerhouse of the cell?", a: ["Nucleus", "Mitochondria", "Ribosome", "Membrane"], c: 1 },
  { q: "What is the chemical symbol for gold?", a: ["Go", "Gd", "Au", "Ag"], c: 2 },
  { q: "How many bones are in the adult human body?", a: ["206", "150", "300", "101"], c: 0 },
  { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], c: 1 },
  { q: "Who developed the theory of relativity?", a: ["Newton", "Einstein", "Tesla", "Darwin"], c: 1 },
  { q: "What force pulls objects toward Earth?", a: ["Magnetism", "Gravity", "Friction", "Inertia"], c: 1 },
  { q: "Which blood cells fight infection?", a: ["Red cells", "White cells", "Platelets", "Plasma"], c: 1 },
  { q: "What is the largest organ in the human body?", a: ["Liver", "Skin", "Heart", "Brain"], c: 1 },
  { q: "At sea level, water boils at what temperature (°C)?", a: ["90", "100", "120", "80"], c: 1 },
  { q: "Animals that eat only plants are called?", a: ["Carnivores", "Herbivores", "Omnivores", "Predators"], c: 1 },
  { q: "Which is the largest planet in our solar system?", a: ["Saturn", "Jupiter", "Neptune", "Earth"], c: 1 },
  { q: "Plants make food from sunlight through?", a: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], c: 1 },
  { q: "What is the chemical symbol for oxygen?", a: ["O", "Ox", "Og", "On"], c: 0 },
  { q: "What is the hardest natural substance on Earth?", a: ["Gold", "Iron", "Diamond", "Quartz"], c: 2 },
  { q: "What is the chemical symbol for iron?", a: ["Ir", "Fe", "In", "Io"], c: 1 },
  { q: "What is the chemical symbol for sodium?", a: ["So", "Sd", "Na", "S"], c: 2 },
  { q: "How many legs does an insect have?", a: ["4", "6", "8", "10"], c: 1 },
  { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], c: 1 },
  { q: "What is the center of an atom called?", a: ["Electron", "Nucleus", "Proton shell", "Orbit"], c: 1 },
  { q: "Which gas do humans need to breathe to survive?", a: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"], c: 1 },
  { q: "What is the freezing point of water in Celsius?", a: ["0", "10", "-10", "32"], c: 0 },
  { q: "The Earth revolves around the?", a: ["Moon", "Sun", "Mars", "Jupiter"], c: 1 },
  { q: "How long does Earth take to orbit the Sun?", a: ["1 day", "1 month", "1 year", "10 years"], c: 2 },
  { q: "What causes day and night?", a: ["Earth's rotation", "The Moon", "Clouds", "The tides"], c: 0 },
  { q: "What is the smallest planet in our solar system?", a: ["Mars", "Mercury", "Venus", "Earth"], c: 1 },
  { q: "Which galaxy do we live in?", a: ["Andromeda", "Milky Way", "Whirlpool", "Sombrero"], c: 1 },
  { q: "The Sun is mainly composed of?", a: ["Rock", "Hydrogen and helium", "Water", "Iron"], c: 1 },
  { q: "What do bees collect from flowers?", a: ["Water", "Nectar", "Sand", "Leaves"], c: 1 },
  { q: "What gas makes up most of Earth's atmosphere?", a: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], c: 1 },
  { q: "What is the study of living things called?", a: ["Physics", "Biology", "Geology", "Chemistry"], c: 1 },
  { q: "What is the study of matter and energy called?", a: ["Biology", "Physics", "Botany", "Zoology"], c: 1 },
  { q: "What is the study of substances and reactions called?", a: ["Chemistry", "Astronomy", "Ecology", "Geology"], c: 0 },
  { q: "What organ pumps blood around the body?", a: ["Lungs", "Heart", "Liver", "Kidney"], c: 1 },
  { q: "Which organ is used for breathing?", a: ["Heart", "Lungs", "Stomach", "Liver"], c: 1 },
  { q: "What is the hardest substance in the human body?", a: ["Bone", "Tooth enamel", "Nails", "Cartilage"], c: 1 },
  { q: "How many chambers does the human heart have?", a: ["2", "3", "4", "5"], c: 2 },
  { q: "DNA carries?", a: ["Water", "Genetic information", "Oxygen", "Energy"], c: 1 },
  { q: "Which vitamin does sunlight help our body produce?", a: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], c: 2 },
  { q: "What is the boiling point of water in Fahrenheit?", a: ["100", "212", "180", "150"], c: 1 },
  { q: "Sound travels fastest through?", a: ["Vacuum", "Solids", "Gases", "Empty space"], c: 1 },
  { q: "What is the approximate speed of light?", a: ["300,000 km/s", "1,000 km/s", "3,000 km/s", "30 km/s"], c: 0 },
  { q: "Which planet is famous for its rings?", a: ["Mars", "Saturn", "Venus", "Mercury"], c: 1 },
  { q: "What is Earth's only natural satellite?", a: ["The Sun", "The Moon", "Mars", "Venus"], c: 1 },
  { q: "Which force keeps planets orbiting the Sun?", a: ["Magnetism", "Gravity", "Friction", "Electricity"], c: 1 },
  { q: "Animals that eat both plants and meat are called?", a: ["Herbivores", "Carnivores", "Omnivores", "Insectivores"], c: 2 },
  { q: "Animals that eat only meat are called?", a: ["Herbivores", "Carnivores", "Omnivores", "Detritivores"], c: 1 },
  { q: "What process turns liquid water into vapor?", a: ["Condensation", "Evaporation", "Freezing", "Melting"], c: 1 },
  { q: "What process turns vapor back into liquid?", a: ["Evaporation", "Condensation", "Sublimation", "Boiling"], c: 1 },
  { q: "What are the three common states of matter?", a: ["Hot, cold, warm", "Solid, liquid, gas", "Big, small, medium", "Up, down, side"], c: 1 },
  { q: "Ice is the ___ state of water.", a: ["Gas", "Liquid", "Solid", "Plasma"], c: 2 },
  { q: "Which scientist proposed the theory of evolution?", a: ["Newton", "Darwin", "Einstein", "Tesla"], c: 1 },
  { q: "Who formulated the laws of motion and gravity?", a: ["Einstein", "Newton", "Galileo", "Hawking"], c: 1 },
  { q: "What is the chemical symbol for carbon?", a: ["Ca", "C", "Co", "Cn"], c: 1 },
  { q: "What is the chemical symbol for helium?", a: ["H", "He", "Hl", "Ha"], c: 1 },
  { q: "Which planet is very hot with thick clouds of acid?", a: ["Mars", "Venus", "Neptune", "Uranus"], c: 1 },
  { q: "How many teeth does a typical adult human have?", a: ["28", "32", "36", "24"], c: 1 },
  { q: "Which part of a plant absorbs water from the soil?", a: ["Leaves", "Roots", "Flowers", "Stem"], c: 1 },
  { q: "What gas do plants release during photosynthesis?", a: ["Carbon dioxide", "Oxygen", "Nitrogen", "Methane"], c: 1 },
  { q: "What is the nearest star to Earth?", a: ["Polaris", "The Sun", "Sirius", "Alpha Centauri"], c: 1 },
  { q: "Which blood type is the universal donor?", a: ["A", "B", "O negative", "AB"], c: 2 },
  { q: "Which instrument measures temperature?", a: ["Barometer", "Thermometer", "Ruler", "Scale"], c: 1 },
  { q: "Which instrument is used to see tiny cells?", a: ["Telescope", "Microscope", "Periscope", "Binoculars"], c: 1 },
  { q: "Which instrument is used to view distant stars?", a: ["Microscope", "Telescope", "Stethoscope", "Ruler"], c: 1 },
  { q: "Frozen carbon dioxide is commonly called?", a: ["Dry ice", "Snow", "Frost", "Hail"], c: 0 },
  { q: "Humans exhale mostly which gas?", a: ["Oxygen", "Carbon dioxide", "Nitrogen only", "Hydrogen"], c: 1 },
  { q: "Which vitamin is abundant in citrus fruits?", a: ["Vitamin C", "Vitamin D", "Vitamin B12", "Vitamin K"], c: 0 },
  { q: "Molten rock below Earth's surface is called?", a: ["Lava", "Magma", "Ash", "Basalt"], c: 1 },
  { q: "Molten rock that erupts onto the surface is called?", a: ["Magma", "Lava", "Sediment", "Ore"], c: 1 },
  { q: "The Earth's core is mostly made of?", a: ["Water", "Iron and nickel", "Gold", "Ice"], c: 1 },
  { q: "Which layer of the Earth do we live on?", a: ["Core", "Mantle", "Crust", "Atmosphere"], c: 2 },
  { q: "What mainly causes ocean tides?", a: ["Wind only", "The Moon's gravity", "Fish", "Rivers"], c: 1 },
  { q: "A group of stars forming a pattern is a?", a: ["Galaxy", "Constellation", "Comet", "Nebula"], c: 1 },
  { q: "A 'shooting star' is actually a?", a: ["Dying star", "Meteor", "Planet", "Satellite"], c: 1 },
  { q: "Which planet has the famous 'Great Red Spot'?", a: ["Mars", "Jupiter", "Saturn", "Neptune"], c: 1 },
  { q: "What is the basic unit of life?", a: ["Atom", "Cell", "Molecule", "Organ"], c: 1 },
  { q: "Which organ controls thought and movement?", a: ["Heart", "Brain", "Liver", "Lungs"], c: 1 },
  { q: "What is the chemical symbol for potassium?", a: ["P", "Po", "K", "Pt"], c: 2 },
  { q: "Which of these is a noble gas?", a: ["Oxygen", "Helium", "Hydrogen", "Nitrogen"], c: 1 },
  { q: "Water falling from clouds is called?", a: ["Evaporation", "Precipitation", "Condensation", "Radiation"], c: 1 },
  { q: "Which scale measures the magnitude of earthquakes?", a: ["Celsius", "Richter", "Decibel", "Fahrenheit"], c: 1 },
  { q: "Which unit measures electric current?", a: ["Volt", "Ampere", "Watt", "Ohm"], c: 1 },
  { q: "Light bulb power is measured in?", a: ["Watts", "Meters", "Liters", "Grams"], c: 0 },
  { q: "Which planet rotates on its side?", a: ["Uranus", "Mars", "Venus", "Earth"], c: 0 },
  { q: "A caterpillar turning into a butterfly is called?", a: ["Evolution", "Metamorphosis", "Photosynthesis", "Digestion"], c: 1 },
  { q: "What is the most abundant element in the universe?", a: ["Oxygen", "Hydrogen", "Iron", "Carbon"], c: 1 },
  { q: "Which planet is closest in size to Earth?", a: ["Mars", "Venus", "Mercury", "Jupiter"], c: 1 },
  { q: "The human body is made up mostly of?", a: ["Bone", "Water", "Muscle", "Fat"], c: 1 },
  { q: "Which organ filters waste from the blood?", a: ["Heart", "Kidneys", "Lungs", "Brain"], c: 1 },
  { q: "Which sense is linked to the eyes?", a: ["Hearing", "Sight", "Smell", "Taste"], c: 1 },
  { q: "What is the chemical symbol for silver?", a: ["Si", "Ag", "Au", "Sr"], c: 1 },
  { q: "Which planet is farthest from the Sun?", a: ["Saturn", "Uranus", "Neptune", "Jupiter"], c: 2 },
  { q: "Besides sunlight and water, what do plants need to make food?", a: ["Oxygen", "Carbon dioxide", "Nitrogen gas", "Helium"], c: 1 },
  { q: "What do we call a scientist who studies stars and space?", a: ["Biologist", "Astronomer", "Chemist", "Geologist"], c: 1 },
  { q: "Which planet is known as the 'morning star' or 'evening star'?", a: ["Mars", "Venus", "Saturn", "Mercury"], c: 1 },
  { q: "How many colors are in a rainbow?", a: ["5", "6", "7", "8"], c: 2 },
  { q: "Which planet is often called the 'Blue Planet'?", a: ["Mars", "Earth", "Neptune", "Venus"], c: 1 },
];

const GEO_Q = [
  { q: "What is the capital of Japan?", a: ["Seoul", "Beijing", "Tokyo", "Bangkok"], c: 2 },
  { q: "What is the largest ocean on Earth?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], c: 3 },
  { q: "Which river is generally considered the longest in the world?", a: ["Amazon", "Nile", "Yangtze", "Mississippi"], c: 1 },
  { q: "Mount Everest is part of which mountain range?", a: ["Andes", "Alps", "Himalayas", "Rockies"], c: 2 },
  { q: "What is the capital of France?", a: ["Berlin", "Madrid", "Paris", "Rome"], c: 2 },
  { q: "Which is the largest country by land area?", a: ["Canada", "China", "USA", "Russia"], c: 3 },
  { q: "The Sahara Desert is on which continent?", a: ["Asia", "Africa", "Australia", "South America"], c: 1 },
  { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], c: 2 },
  { q: "Which is the smallest continent?", a: ["Europe", "Australia", "Antarctica", "South America"], c: 1 },
  { q: "The Great Barrier Reef lies off the coast of which country?", a: ["Brazil", "Australia", "Mexico", "India"], c: 1 },
  { q: "In which country is the Eiffel Tower?", a: ["Italy", "Spain", "France", "Belgium"], c: 2 },
  { q: "What is the capital of Egypt?", a: ["Cairo", "Alexandria", "Giza", "Luxor"], c: 0 },
  { q: "How many continents are there?", a: ["5", "6", "7", "8"], c: 2 },
  { q: "Which river runs through London?", a: ["Seine", "Thames", "Danube", "Rhine"], c: 1 },
  { q: "The Amazon rainforest is mostly located in which country?", a: ["Peru", "Colombia", "Brazil", "Venezuela"], c: 2 },
  { q: "Which is the largest hot desert in the world?", a: ["Gobi", "Sahara", "Kalahari", "Arabian"], c: 1 },
  { q: "What is the capital of Italy?", a: ["Milan", "Venice", "Rome", "Naples"], c: 2 },
  { q: "Which continent is home to the Amazon River?", a: ["Africa", "Asia", "South America", "Europe"], c: 2 },
  { q: "What is the capital of Germany?", a: ["Munich", "Berlin", "Hamburg", "Frankfurt"], c: 1 },
  { q: "What is the capital of Spain?", a: ["Barcelona", "Madrid", "Seville", "Valencia"], c: 1 },
  { q: "What is the capital of Russia?", a: ["St Petersburg", "Moscow", "Kyiv", "Sochi"], c: 1 },
  { q: "What is the capital of China?", a: ["Shanghai", "Beijing", "Hong Kong", "Guangzhou"], c: 1 },
  { q: "What is the capital of Canada?", a: ["Toronto", "Ottawa", "Vancouver", "Montreal"], c: 1 },
  { q: "What is the capital of the United States?", a: ["New York", "Washington, D.C.", "Los Angeles", "Chicago"], c: 1 },
  { q: "What is the capital of the United Kingdom?", a: ["Manchester", "London", "Liverpool", "Edinburgh"], c: 1 },
  { q: "What is the capital of Brazil?", a: ["Rio de Janeiro", "Brasília", "São Paulo", "Salvador"], c: 1 },
  { q: "What is the capital of India?", a: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], c: 1 },
  { q: "What is the capital of South Korea?", a: ["Busan", "Seoul", "Incheon", "Daegu"], c: 1 },
  { q: "What is the capital of Greece?", a: ["Thessaloniki", "Athens", "Sparta", "Patras"], c: 1 },
  { q: "What is the capital of Turkey?", a: ["Istanbul", "Ankara", "Izmir", "Bursa"], c: 1 },
  { q: "What is the capital of Portugal?", a: ["Porto", "Lisbon", "Faro", "Braga"], c: 1 },
  { q: "What is the capital of the Netherlands?", a: ["Rotterdam", "Amsterdam", "The Hague", "Utrecht"], c: 1 },
  { q: "What is the capital of Mexico?", a: ["Cancún", "Mexico City", "Guadalajara", "Tijuana"], c: 1 },
  { q: "What is the capital of Argentina?", a: ["Córdoba", "Buenos Aires", "Rosario", "Mendoza"], c: 1 },
  { q: "What is the capital of Sweden?", a: ["Oslo", "Stockholm", "Copenhagen", "Helsinki"], c: 1 },
  { q: "What is the capital of Norway?", a: ["Oslo", "Bergen", "Stockholm", "Helsinki"], c: 0 },
  { q: "What is the largest continent by area?", a: ["Africa", "Asia", "Europe", "North America"], c: 1 },
  { q: "Which continent is the coldest?", a: ["Europe", "Antarctica", "Asia", "Australia"], c: 1 },
  { q: "Which continent has the most countries?", a: ["Asia", "Africa", "Europe", "South America"], c: 1 },
  { q: "Which is the smallest ocean?", a: ["Atlantic", "Arctic", "Indian", "Pacific"], c: 1 },
  { q: "Which is the second-largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Southern"], c: 0 },
  { q: "Which country lies in both Europe and Asia?", a: ["Egypt", "Turkey", "Greece", "Italy"], c: 1 },
  { q: "The Great Pyramids are near which city?", a: ["Cairo", "Alexandria", "Luxor", "Aswan"], c: 0 },
  { q: "Which is the tallest mountain in Africa?", a: ["Kilimanjaro", "Mount Kenya", "Atlas", "Elgon"], c: 0 },
  { q: "The Andes mountains are on which continent?", a: ["Asia", "Africa", "South America", "Europe"], c: 2 },
  { q: "The Alps are located mainly in?", a: ["Asia", "Europe", "Africa", "Australia"], c: 1 },
  { q: "Which country is shaped like a boot?", a: ["Spain", "Italy", "Greece", "France"], c: 1 },
  { q: "Which sea lies between Europe and Africa?", a: ["Baltic Sea", "Mediterranean Sea", "Red Sea", "Black Sea"], c: 1 },
  { q: "Which country has the largest population (as of 2024)?", a: ["China", "India", "USA", "Indonesia"], c: 1 },
  { q: "Mount Fuji is located in which country?", a: ["China", "Japan", "Korea", "Nepal"], c: 1 },
  { q: "The Statue of Liberty is in which city?", a: ["Boston", "New York", "Washington", "Chicago"], c: 1 },
  { q: "Big Ben is a landmark in which city?", a: ["Paris", "London", "Berlin", "Dublin"], c: 1 },
  { q: "The Leaning Tower is in which Italian city?", a: ["Rome", "Pisa", "Milan", "Venice"], c: 1 },
  { q: "Which country is home to the kangaroo?", a: ["South Africa", "Australia", "Brazil", "India"], c: 1 },
  { q: "The pyramids of Chichen Itza are in which country?", a: ["Peru", "Mexico", "Egypt", "Guatemala"], c: 1 },
  { q: "The Nile flows into which sea?", a: ["Red Sea", "Mediterranean Sea", "Black Sea", "Caspian Sea"], c: 1 },
  { q: "Which US state is famous for Hollywood?", a: ["Texas", "California", "Florida", "New York"], c: 1 },
  { q: "Which ocean lies between the Americas and Europe/Africa?", a: ["Pacific", "Atlantic", "Indian", "Arctic"], c: 1 },
  { q: "Which ocean lies between Africa, Asia and Australia?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], c: 1 },
  { q: "The equator divides Earth into which halves?", a: ["East and West", "North and South", "Up and Down", "Left and Right"], c: 1 },
  { q: "The imaginary line at 0° longitude is the?", a: ["Equator", "Prime Meridian", "Tropic of Cancer", "Arctic Circle"], c: 1 },
  { q: "Which is the smallest country in the world?", a: ["Monaco", "Vatican City", "Malta", "San Marino"], c: 1 },
  { q: "Which is the largest desert in the world?", a: ["Sahara", "Antarctic", "Gobi", "Kalahari"], c: 1 },
  { q: "The Grand Canyon is located in which country?", a: ["Canada", "USA", "Mexico", "Brazil"], c: 1 },
  { q: "Which country is famous for tulips and windmills?", a: ["Belgium", "Netherlands", "Denmark", "Germany"], c: 1 },
  { q: "Which mountain range separates Europe and Asia?", a: ["Alps", "Ural", "Andes", "Himalayas"], c: 1 },
  { q: "The Dead Sea is famous for being very?", a: ["Deep", "Salty", "Cold", "Large"], c: 1 },
  { q: "Which country has the cities Sydney and Melbourne?", a: ["New Zealand", "Australia", "UK", "Canada"], c: 1 },
  { q: "Which African country was largely never colonized?", a: ["Kenya", "Ethiopia", "Nigeria", "Ghana"], c: 1 },
  { q: "The Amazon is the world's largest tropical?", a: ["Desert", "Rainforest", "Savanna", "Tundra"], c: 1 },
  { q: "Which country spans the most time zones?", a: ["USA", "Russia", "China", "Canada"], c: 1 },
  { q: "Which US city is nicknamed the 'Big Apple'?", a: ["Los Angeles", "New York", "Chicago", "Miami"], c: 1 },
  { q: "Mount Kilimanjaro is located in which country?", a: ["Kenya", "Tanzania", "Uganda", "Ethiopia"], c: 1 },
  { q: "Machu Picchu is located in which country?", a: ["Chile", "Peru", "Bolivia", "Ecuador"], c: 1 },
  { q: "Which country is entirely surrounded by South Africa?", a: ["Lesotho", "Eswatini", "Botswana", "Namibia"], c: 0 },
  { q: "Which of these is a landlocked country?", a: ["Switzerland", "Spain", "Italy", "Portugal"], c: 0 },
  { q: "Which country has a maple leaf on its flag?", a: ["USA", "Canada", "UK", "Australia"], c: 1 },
  { q: "Venice, a city built on water, is in which country?", a: ["Spain", "Italy", "Greece", "Croatia"], c: 1 },
  { q: "Which is the deepest ocean?", a: ["Atlantic", "Pacific", "Indian", "Arctic"], c: 1 },
  { q: "The Mississippi River is mainly in which country?", a: ["Canada", "USA", "Mexico", "Brazil"], c: 1 },
  { q: "The Panama Canal connects which two oceans?", a: ["Atlantic and Pacific", "Indian and Pacific", "Arctic and Atlantic", "Indian and Atlantic"], c: 0 },
  { q: "The Suez Canal is located in which country?", a: ["Turkey", "Egypt", "Panama", "Greece"], c: 1 },
  { q: "Which country is known as the 'Land of the Rising Sun'?", a: ["China", "Japan", "Korea", "Thailand"], c: 1 },
  { q: "Which continent has no permanent human residents?", a: ["Australia", "Antarctica", "Africa", "Asia"], c: 1 },
  { q: "The Rocky Mountains are located in?", a: ["Europe", "North America", "Asia", "Africa"], c: 1 },
  { q: "The city of Marrakech is in which country?", a: ["Egypt", "Morocco", "Algeria", "Tunisia"], c: 1 },
  { q: "Which Scandinavian country is famous for its fjords?", a: ["Norway", "Spain", "Italy", "Greece"], c: 0 },
  { q: "What is the capital of Japan?", a: ["Osaka", "Tokyo", "Kyoto", "Nagoya"], c: 1 },
  { q: "What is the capital of Egypt located along?", a: ["Tigris River", "Nile River", "Congo River", "Niger River"], c: 1 },
  { q: "Which country is famous for the Taj Mahal?", a: ["Pakistan", "India", "Bangladesh", "Nepal"], c: 1 },
  { q: "Which US state is nicknamed the 'Sunshine State'?", a: ["California", "Florida", "Texas", "Nevada"], c: 1 },
  { q: "Which country is home to the Sahara's largest share?", a: ["Egypt", "Algeria", "Morocco", "Tunisia"], c: 1 },
  { q: "Which is the longest mountain range above water?", a: ["Himalayas", "Andes", "Rockies", "Alps"], c: 1 },
  { q: "Iceland lies in which ocean region?", a: ["Pacific", "North Atlantic", "Indian", "Southern"], c: 1 },
  { q: "Which continent lies entirely in the Southern Hemisphere fully?", a: ["Europe", "Antarctica", "Asia", "North America"], c: 1 },
  { q: "The Thames River flows through which city?", a: ["Paris", "London", "Berlin", "Rome"], c: 1 },
  { q: "Which country has the flag with a red circle on white (rising sun)?", a: ["China", "Japan", "South Korea", "Vietnam"], c: 1 },
  { q: "The Amazon River empties into which ocean?", a: ["Pacific", "Atlantic", "Indian", "Arctic"], c: 1 },
  { q: "Which continent is entirely in the Northern Hemisphere?", a: ["Europe", "Africa", "South America", "Australia"], c: 0 },
  { q: "Angel Falls, the tallest waterfall, is located in?", a: ["Brazil", "Venezuela", "Peru", "Colombia"], c: 1 },
];

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  image: string;
  description: string;
  questions: QuizQ[];
};
const CATEGORIES: Category[] = [
  {
    id: "crypto",
    name: "Crypto",
    emoji: "🪙",
    color: "#0974FE",
    image: "/categories/crypto.jpg",
    description: "Test your knowledge of Base, Ethereum, wallets, DeFi, and the culture shaping the onchain world.",
    questions: CRYPTO_Q,
  },
  {
    id: "sports",
    name: "Sports",
    emoji: "⚽",
    color: "#4ADE80",
    image: "/categories/sports.jpg",
    description: "From football and basketball to tennis and the Olympics — see how strong your sports memory is.",
    questions: SPORTS_Q,
  },
  {
    id: "art",
    name: "Art",
    emoji: "🎨",
    color: "#FB7185",
    image: "/categories/art.jpg",
    description: "Explore painting, artists, movements, and the ideas that changed visual culture across generations.",
    questions: ART_Q,
  },
  {
    id: "history",
    name: "History",
    emoji: "🏛️",
    color: "#FBBF24",
    image: "/categories/history.jpg",
    description: "Travel through civilizations, turning points, and the people whose decisions shaped the world.",
    questions: HISTORY_Q,
  },
  {
    id: "science",
    name: "Science",
    emoji: "🔬",
    color: "#60A5FA",
    image: "/categories/science.webp",
    description: "Challenge yourself across physics, biology, chemistry, and discoveries that explain how things work.",
    questions: SCIENCE_Q,
  },
  {
    id: "geography",
    name: "Geography",
    emoji: "🌍",
    color: "#F59E0B",
    image: "/categories/geography.jpg",
    description: "Navigate countries, capitals, oceans, and landmarks from every corner of our planet.",
    questions: GEO_Q,
  },
];

const QUIZ_SIZE = 5;
const TIME_PER_Q = 15;
const APP_URL =
  process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") ||
  "https://basequiz.xyz";

// Base Builder Code (bc_tajhkats) — appended as a calldata suffix so onchain
// transactions are attributed to this builder for Base Builder Rewards.
const BUILDER_CODE_SUFFIX = "0x62635f74616a686b6174730b0080218021802180218021802180218021" as const;

const BADGES = [
  { id: 1, name: "Bronze", emoji: "🥉", days: 3, color: "#cd7f32" },
  { id: 2, name: "Silver", emoji: "🥈", days: 7, color: "#c0c0c0" },
  { id: 3, name: "Gold", emoji: "🥇", days: 30, color: "#ffd700" },
  { id: 4, name: "Diamond", emoji: "💎", days: 100, color: "#60a5fa" },
];

const T = {
  bg: "var(--bq-bg)",
  surface: "var(--bq-surface)",
  surfaceHi: "var(--bq-surface-hi)",
  border: "var(--bq-border)",
  borderHi: "var(--bq-border-hi)",
  base: "var(--bq-base)",
  baseHi: "var(--bq-base-hi)",
  accent: "var(--bq-accent)",
  correct: "var(--bq-correct)",
  wrong: "var(--bq-wrong)",
  text: "var(--bq-text)",
  textDim: "var(--bq-text-dim)",
  textDimmer: "var(--bq-text-dimmer)",
  mono: "var(--font-plex-mono), ui-monospace, monospace",
  sans: "var(--font-inter), system-ui, sans-serif",
};

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});
type LeaderRow = {
  addr: string;
  bestScore: number;
  totalScore: number;
  streak: number;
  name?: string | null;
  badgeIds: number[];
};
type QuizQ = { q: string; a: string[]; c: number };
type WalletKind = "base" | "metamask" | "okx" | "rabby" | "phantom";

const EXTENSION_WALLET_ORDER = [
  { label: "MetaMask", kind: "metamask", match: ["metamask", "io.metamask"] },
  { label: "OKX Wallet", kind: "okx", match: ["okx", "okex", "com.okex"] },
  { label: "Rabby", kind: "rabby", match: ["rabby", "io.rabby"] },
  { label: "Phantom", kind: "phantom", match: ["phantom", "app.phantom"] },
] as const;

const WALLET_FALLBACK = {
  metamask: { label: "M", background: "#f6851b", color: "#171717" },
  okx: { label: "OKX", background: "#050505", color: "#ffffff" },
  rabby: { label: "R", background: "#7084ff", color: "#ffffff" },
  phantom: { label: "P", background: "#ab9ff2", color: "#171717" },
} as const;

function WalletIcon({ kind, icon }: { kind: WalletKind; icon?: string }) {
  if (kind === "base") {
    return (
      <span
        aria-hidden="true"
        style={{ width: 34, height: 34, borderRadius: 9, background: "#0052ff", display: "grid", placeItems: "center", flexShrink: 0 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" fill="white" />
          <rect x="4" y="10" width="9" height="4" fill="#0052ff" />
        </svg>
      </span>
    );
  }

  if (icon) {
    return <img src={icon} alt="" width={34} height={34} style={{ borderRadius: 9, flexShrink: 0 }} />;
  }

  const fallback = WALLET_FALLBACK[kind];
  return (
    <span
      aria-hidden="true"
      style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        background: fallback.background,
        color: fallback.color,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        fontFamily: T.mono,
        fontWeight: 800,
        fontSize: kind === "okx" ? 9 : 15,
      }}
    >
      {fallback.label}
    </span>
  );
}

function WalletOptionButton({
  label,
  kind,
  icon,
  recommended = false,
  onClick,
}: {
  label: string;
  kind: WalletKind;
  icon?: string;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        minHeight: 58,
        marginBottom: 8,
        padding: "10px 13px",
        borderRadius: 8,
        border: `1px solid ${recommended ? "#0052ff" : T.border}`,
        background: recommended ? "rgba(0, 82, 255, 0.14)" : "transparent",
        color: T.text,
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: T.sans,
      }}
    >
      <WalletIcon kind={kind} icon={icon} />
      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
        {recommended && (
          <span style={{ color: T.baseHi, fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em" }}>RECOMMENDED</span>
        )}
      </span>
    </button>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomQuestions(catId: string): QuizQ[] {
  const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  const picked = shuffle(cat.questions).slice(0, QUIZ_SIZE);
  return picked.map((q) => {
    const correctAnswer = q.a[q.c];
    const shuffledOptions = shuffle(q.a);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    return { q: q.q, a: shuffledOptions, c: newCorrectIndex };
  });
}

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { composeCast } = useComposeCast();
  const { address, isConnected, chainId: walletChainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const baseWallet = connectors.find((c) => c.id === "baseAccount") ||
    connectors.find((c) => c.name?.toLowerCase().includes("base account"));

  const orderedOthers = EXTENSION_WALLET_ORDER.map((wallet) => ({
    ...wallet,
    connector: connectors.find((connector) => {
      if (connector === baseWallet) return false;
      const rdns = Array.isArray(connector.rdns) ? connector.rdns.join(" ") : connector.rdns || "";
      const identity = `${connector.id} ${connector.name} ${rdns}`.toLowerCase();
      return wallet.match.some((value) => identity.includes(value));
    }),
  })).filter((wallet) => wallet.connector);

  const [screen, setScreen] = useState<"start" | "categories" | "quiz" | "end" | "board" | "badges">("start");
  const [category, setCategory] = useState<string>("crypto");
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [onchainStreak, setOnchainStreak] = useState(0);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [board, setBoard] = useState<LeaderRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [connectMenuOpen, setConnectMenuOpen] = useState(false);
  const [owned, setOwned] = useState<boolean[]>([false, false, false, false]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimError, setClaimError] = useState("");
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    if (isConnected) setConnectMenuOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (localStorage.getItem("soundOff") === "1") setSoundOn(false);
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function playSound(type: "correct" | "wrong" | "tick" | "win") {
    if (!soundOn) return;
    try {
      const AudioCtx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      if (type === "correct") {
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o.start();
        o.stop(ctx.currentTime + 0.3);
      } else if (type === "wrong") {
        o.type = "sawtooth";
        o.frequency.setValueAtTime(200, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        o.start();
        o.stop(ctx.currentTime + 0.3);
      } else if (type === "tick") {
        o.frequency.setValueAtTime(1000, ctx.currentTime);
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        o.start();
        o.stop(ctx.currentTime + 0.08);
      } else if (type === "win") {
        [523, 659, 784].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);
          osc.start(ctx.currentTime + i * 0.12);
          osc.stop(ctx.currentTime + i * 0.12 + 0.25);
        });
        o.stop(ctx.currentTime);
      }
    } catch {}
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("soundOff", next ? "0" : "1");
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem("baseQuizTheme", nextTheme);
    setTheme(nextTheme);
  }

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("streak") || "0"));
    if (!localStorage.getItem("tutorialSeen")) setTutorialStep(0);
  }, []);

  function closeTutorial() {
    localStorage.setItem("tutorialSeen", "1");
    setTutorialStep(null);
  }

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        const p = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "players",
          args: [address],
        });
        const chainStreak = Number(p[2]);
        if (chainStreak > 0) setStreak(chainStreak);
      } catch {}
    })();
  }, [address]);

  useEffect(() => {
    (async () => {
      try {
        const count = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "getPlayerCount",
        });
        setTotalPlayers(Number(count));
      } catch {}
    })();
  }, []);

  const nextQuestion = useCallback(() => {
    setSelected(null);
    setTimeLeft(TIME_PER_Q);
    if (qIndex + 1 < QUIZ_SIZE) {
      setQIndex(qIndex + 1);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const lastPlayed = localStorage.getItem("lastPlayed");
      // Day-based streak: replaying the same day keeps it, a new consecutive day increments.
      const newStreak = lastPlayed === today ? streak : lastPlayed === yesterday ? streak + 1 : 1;
      localStorage.setItem("streak", String(newStreak));
      localStorage.setItem("lastPlayed", today);
      setStreak(newStreak);
      setScreen("end");
    }
  }, [qIndex, streak]);

  useEffect(() => {
    if (screen !== "quiz" || selected !== null) return;
    if (timeLeft <= 0) {
      nextQuestion();
      return;
    }
    if (timeLeft <= 3) playSound("tick");
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, selected, nextQuestion]);

  useEffect(() => {
    if (screen === "end") playSound("win");
  }, [screen]);

  function startGame(catId: string) {
    setCategory(catId);
    setQuestions(getRandomQuestions(catId));
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setTimeLeft(TIME_PER_Q);
    // Reset the previous round's save/share state so the end screen never
    // shows a stale "saved onchain" or an old transaction link.
    setTxStatus("idle");
    setTxHash("");
    setTxError("");
    setShareMenuOpen(false);
    setScreen("quiz");
  }

  function answer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === questions[qIndex].c;
    if (correct) setScore(score + 100 + timeLeft * 10);
    playSound(correct ? "correct" : "wrong");
    setTimeout(nextQuestion, 2000);
  }

  const shareText = `🧠 I scored ${score} points on Base Quiz! 🔥 Streak: ${streak} days\n\nThink you can beat me? 👇`;

  function shareFarcaster() {
    setShareMenuOpen(false);
    try {
      composeCast({ text: shareText, embeds: [APP_URL] });
    } catch {
      window.open(`https://farcaster.xyz/~/compose?text=${encodeURIComponent(shareText + "\n\n" + APP_URL)}`, "_blank");
    }
  }

  function shareTwitter() {
    setShareMenuOpen(false);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(APP_URL)}`;
    window.open(url, "_blank");
  }

  function shareCopy() {
    setShareMenuOpen(false);
    navigator.clipboard.writeText(`${shareText}\n\n${APP_URL}`);
    alert("Copied to clipboard!");
  }

  async function saveOnchain() {
    setTxStatus("pending");
    setTxError("");
    try {
      if (walletChainId !== base.id) await switchChainAsync({ chainId: base.id });
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "submitScore",
        args: [BigInt(score)],
        chainId: base.id,
        dataSuffix: BUILDER_CODE_SUFFIX,
      });
      setTxHash(hash);
      setTxStatus("done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setTxError(msg.includes("Already played") ? "Already saved today. Come back tomorrow." : msg.slice(0, 120));
      setTxStatus("error");
    }
  }

  async function resolveBasename(addr: string): Promise<string | null> {
    try {
      const name = await publicClient.readContract({
        address: L2_RESOLVER_ADDRESS as `0x${string}`,
        abi: L2_RESOLVER_ABI,
        functionName: "name",
        args: [reverseNode(addr)],
      });
      return name && name.length > 0 ? name : null;
    } catch {
      return null;
    }
  }

  async function loadBoard() {
    setScreen("board");
    setBoardLoading(true);
    try {
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "getPlayerCount",
      });
      const n = Number(count);
      const rows: LeaderRow[] = [];
      for (let i = 0; i < n; i++) {
        try {
          const [addr, best, total, stk] = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: "getPlayer",
            args: [BigInt(i)],
          });
          rows.push({
            addr,
            bestScore: Number(best),
            totalScore: Number(total),
            streak: Number(stk),
            badgeIds: [],
          });
        } catch (err) {
          console.warn(`Skipped player ${i}:`, err);
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      rows.sort((a, b) => b.bestScore - a.bestScore || b.streak - a.streak || b.totalScore - a.totalScore);

      // ERC-1155 exposes a batch read, so every player's four badge balances
      // can be fetched in one RPC call instead of delaying the table row by row.
      if (rows.length > 0) {
        try {
          const badgeAccounts = rows.flatMap((row) =>
            BADGES.map(() => row.addr as `0x${string}`),
          );
          const badgeIds = rows.flatMap(() => BADGES.map((badge) => BigInt(badge.id)));
          const badgeBalances = await publicClient.readContract({
            address: BADGES_ADDRESS as `0x${string}`,
            abi: BADGES_ABI,
            functionName: "balanceOfBatch",
            args: [badgeAccounts, badgeIds],
          });

          rows.forEach((row, rowIndex) => {
            row.badgeIds = BADGES.filter((_, badgeIndex) =>
              Number(badgeBalances[rowIndex * BADGES.length + badgeIndex]) > 0,
            ).map((badge) => badge.id);
          });
        } catch (error) {
          console.warn("Leaderboard badges could not be loaded:", error);
        }
      }

      setBoard(rows);
      setBoardLoading(false);
      // Resolve Basenames for the shown rows, sequentially to respect RPC limits
      for (const row of rows) {
        const name = await resolveBasename(row.addr);
        if (name) {
          setBoard((prev) => prev.map((r) => (r.addr === row.addr ? { ...r, name } : r)));
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      return;
    } catch (e) {
      console.error("Leaderboard error:", e);
      setBoard([]);
    }
    setBoardLoading(false);
  }

  async function loadBadges() {
    setScreen("badges");
    setBadgesLoading(true);
    setClaimError("");
    try {
      if (address) {
        const p = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "players",
          args: [address],
        });
        const chainStreak = Number(p[2]);
        setOnchainStreak(chainStreak);
        const balances: bigint[] = [];
        for (const b of BADGES) {
          const bal = await publicClient.readContract({
            address: BADGES_ADDRESS as `0x${string}`,
            abi: BADGES_ABI,
            functionName: "balanceOf",
            args: [address, BigInt(b.id)],
          });
          balances.push(bal as bigint);
          await new Promise((r) => setTimeout(r, 150));
        }
        setOwned(balances.map((b) => Number(b) > 0));
      }
    } catch (e) {
      console.error("Badges load error:", e);
    }
    setBadgesLoading(false);
  }

  async function claimBadge(badgeId: number) {
    setClaimingId(badgeId);
    setClaimError("");
    try {
      if (walletChainId !== base.id) await switchChainAsync({ chainId: base.id });
      await writeContractAsync({
        address: BADGES_ADDRESS as `0x${string}`,
        abi: BADGES_ABI,
        functionName: "claim",
        args: [BigInt(badgeId)],
        chainId: base.id,
        dataSuffix: BUILDER_CODE_SUFFIX,
      });
      await loadBadges();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Claim failed";
      setClaimError(msg.slice(0, 150));
    }
    setClaimingId(null);
  }

  function shortAddr(a: string) {
    return a.slice(0, 6) + "…" + a.slice(-4);
  }

  const styles: Record<string, CSSProperties> = {
    root: {
      position: "relative",
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: T.sans,
      display: "flex",
      flexDirection: "column",
      backgroundImage: `radial-gradient(circle at 15% 0%, var(--bq-glow-primary), transparent 40%), radial-gradient(circle at 85% 100%, var(--bq-glow-secondary), transparent 40%)`,
    },
    header: {
      position: "relative",
      zIndex: 1,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      borderBottom: `1px solid ${T.border}`,
      fontFamily: T.mono,
    },
    brand: {
      fontFamily: T.mono,
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    headerRight: { display: "flex", gap: 8, alignItems: "center" },
    iconBtn: {
      background: "transparent",
      color: T.textDim,
      border: `1px solid ${T.border}`,
      width: 36,
      height: 36,
      fontSize: 16,
      cursor: "pointer",
      borderRadius: 4,
      fontFamily: T.mono,
    },
    walletPill: {
      background: "transparent",
      color: T.textDim,
      border: `1px solid ${T.border}`,
      padding: "0 12px",
      height: 36,
      fontSize: 12,
      fontFamily: T.mono,
      fontWeight: 600,
      cursor: "pointer",
      borderRadius: 4,
      letterSpacing: "0.05em",
    },
    main: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: { width: "100%", maxWidth: 440 },
    eyebrow: {
      fontFamily: T.mono,
      fontSize: 11,
      letterSpacing: "0.25em",
      textTransform: "uppercase" as const,
      color: T.textDim,
      marginBottom: 12,
    },
    title: {
      fontFamily: T.mono,
      fontSize: 56,
      fontWeight: 700,
      lineHeight: 0.95,
      letterSpacing: "-0.02em",
      margin: 0,
      marginBottom: 20,
    },
    titleAccent: { color: T.accent },
    lede: {
      fontSize: 16,
      lineHeight: 1.5,
      color: T.textDim,
      marginBottom: 32,
      maxWidth: 360,
    },
    primaryBtn: {
      width: "100%",
      background: T.base,
      color: "#fff",
      border: "none",
      padding: "18px 24px",
      borderRadius: 4,
      fontSize: 14,
      fontWeight: 700,
      fontFamily: T.mono,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
      cursor: "pointer",
      marginBottom: 12,
      transition: "transform 0.1s, background 0.2s",
    },
    ghostBtn: {
      width: "100%",
      background: "transparent",
      color: T.text,
      border: `1px solid ${T.border}`,
      padding: "16px 24px",
      borderRadius: 4,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: T.mono,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      cursor: "pointer",
      marginBottom: 10,
    },
    meta: {
      fontFamily: T.mono,
      fontSize: 11,
      color: T.textDimmer,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
    },
    streakBox: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      border: `1px solid ${T.borderHi}`,
      borderRadius: 4,
      marginBottom: 24,
      fontFamily: T.mono,
      fontSize: 12,
      color: T.accent,
      letterSpacing: "0.1em",
    },
    footer: {
      position: "relative",
      zIndex: 1,
      padding: "12px 20px",
      borderTop: `1px solid ${T.border}`,
      display: "flex",
      justifyContent: "space-between",
      fontFamily: T.mono,
      fontSize: 10,
      color: T.textDimmer,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
    },
  };

  return (
    <div className="base-quiz-app" style={styles.root}>
      <header className="base-quiz-header" style={styles.header}>
        <div style={styles.brand}>
          <Image
            src="/base-quiz-logo.svg"
            alt="Base Quiz"
            width={850}
            height={245}
            className="base-quiz-header-logo"
            priority
          />
          <span className="base-quiz-version" style={{ color: T.textDimmer, marginLeft: 4 }}>v1.0</span>
        </div>
        <div className="base-quiz-header-actions" style={styles.headerRight}>
          {isConnected && address ? (
            <button className="base-quiz-wallet-button" style={styles.walletPill} onClick={() => disconnect()} title="Disconnect">
              {shortAddr(address)} ×
            </button>
          ) : (
            <button
              className="base-quiz-wallet-button"
              style={{ ...styles.walletPill, color: T.base, borderColor: T.base }}
              onClick={() => setConnectMenuOpen(true)}
              title="Connect wallet"
            >
              Connect
            </button>
          )}
          <button
            className="base-quiz-icon-button base-quiz-theme-button"
            style={styles.iconBtn}
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
          <button className="base-quiz-icon-button base-quiz-sound-button" style={styles.iconBtn} onClick={toggleSound} title={soundOn ? "Mute" : "Unmute"}>
            {soundOn ? "♪" : "×"}
          </button>
        </div>
      </header>

      <main
        className={`base-quiz-main${screen === "categories" ? " is-category-screen" : ""}`}
        style={styles.main}
      >
        {screen === "start" && (
          <HomeHero
            streak={streak}
            onStart={() => setScreen("categories")}
            onLeaderboard={loadBoard}
            onBadges={loadBadges}
          />
        )}

        {screen === "categories" && (
          <CategoryCarousel
            items={CATEGORIES.map((cat) => ({
              id: cat.id,
              name: cat.name,
              emoji: cat.emoji,
              color: cat.color,
              image: cat.image,
              description: cat.description,
              questionCount: cat.questions.length,
            }))}
            onStart={startGame}
            onBack={() => setScreen("start")}
          />
        )}

        {screen === "quiz" && (
          <QuizPanel
            categoryName={CATEGORIES.find((item) => item.id === category)?.name || "Quiz"}
            categoryEmoji={CATEGORIES.find((item) => item.id === category)?.emoji || ""}
            currentIndex={qIndex}
            totalQuestions={QUIZ_SIZE}
            score={score}
            timeLeft={timeLeft}
            question={questions[qIndex].q}
            options={questions[qIndex].a}
            correctIndex={questions[qIndex].c}
            selectedIndex={selected}
            onAnswer={answer}
          />
        )}

        {screen === "end" && (
          <ResultPanel
            score={score}
            streak={streak}
            categoryName={CATEGORIES.find((c) => c.id === category)?.name || "Quiz"}
            isConnected={isConnected}
            saveStatus={txStatus}
            saveContent={
              !isConnected ? (
                <div className="result-wallet-list">
                  {baseWallet && (
                    <WalletOptionButton
                      label="Base Wallet"
                      kind="base"
                      recommended
                      onClick={() => connect({ connector: baseWallet })}
                    />
                  )}
                  {orderedOthers.map((wallet) => wallet.connector && (
                    <WalletOptionButton
                      key={wallet.connector.uid}
                      label={wallet.label}
                      kind={wallet.kind}
                      icon={wallet.connector.icon}
                      onClick={() => connect({ connector: wallet.connector! })}
                    />
                  ))}
                </div>
              ) : txStatus === "idle" ? (
                <button type="button" className="result-inline-button is-primary" onClick={saveOnchain}>
                  Save score onchain <span aria-hidden="true">›</span>
                </button>
              ) : txStatus === "pending" ? (
                <button type="button" className="result-inline-button is-primary" disabled>
                  <span className="result-button-spinner" aria-hidden="true" /> Confirming…
                </button>
              ) : txStatus === "done" ? (
                <div className="result-save-success">
                  <span>✓ Saved onchain</span>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer">
                    View transaction ↗
                  </a>
                </div>
              ) : (
                <div className="result-save-error">
                  <p>{txError}</p>
                  <button type="button" className="result-inline-button is-secondary" onClick={saveOnchain}>
                    Try again <span aria-hidden="true">›</span>
                  </button>
                </div>
              )}
            shareContent={
              !shareMenuOpen ? (
                <button type="button" className="result-inline-button is-secondary" onClick={() => setShareMenuOpen(true)}>
                  Share score <span aria-hidden="true">›</span>
                </button>
              ) : (
                <div className="result-share-options">
                  <button type="button" onClick={shareFarcaster}>Farcaster</button>
                  <button type="button" onClick={shareTwitter}>X</button>
                  <button type="button" onClick={shareCopy}>Copy text</button>
                </div>
              )}
            onPlayAgain={() => startGame(category)}
            onChooseCategory={() => setScreen("categories")}
            onBadges={loadBadges}
            onLeaderboard={loadBoard}
          />
        )}

        {screen === "board" && (
          <LeaderboardTable
            rows={board}
            badges={BADGES}
            currentAddress={address}
            loading={boardLoading}
            onBack={() => setScreen("start")}
          />
        )}

        {screen === "badges" && (
          <BadgesRoadmap
            badges={BADGES}
            connected={isConnected}
            loading={badgesLoading}
            streak={onchainStreak}
            owned={isConnected ? owned : [false, false, false, false]}
            claimingId={claimingId}
            error={claimError}
            onClaim={claimBadge}
            onBack={() => setScreen("start")}
            connectSlot={!isConnected ? (
              <div className="badges-roadmap-wallets">
                {baseWallet && (
                  <WalletOptionButton
                    label="Base Wallet"
                    kind="base"
                    recommended
                    onClick={() => connect({ connector: baseWallet })}
                  />
                )}
                {orderedOthers.map((wallet) => wallet.connector && (
                  <WalletOptionButton
                    key={wallet.connector.uid}
                    label={wallet.label}
                    kind={wallet.kind}
                    icon={wallet.connector.icon}
                    onClick={() => connect({ connector: wallet.connector! })}
                  />
                ))}
              </div>
            ) : undefined}
          />
        )}
      </main>

      <footer className="base-quiz-footer" style={styles.footer}>
        <div className="base-quiz-footer-brand">
          <Image
            src="/base-quiz-logo.svg"
            alt=""
            aria-hidden="true"
            width={850}
            height={245}
            className="base-quiz-footer-logo"
          />
          <span className="base-quiz-footer-data">BLOCK_DATA · BASE_MAINNET</span>
        </div>
        <span>{totalPlayers !== null ? `${totalPlayers} PLAYERS_ONCHAIN` : "···"}</span>
      </footer>

      {connectMenuOpen && !isConnected && (
        <div
          style={{ position: "fixed", inset: 0, background: "var(--bq-modal-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 200 }}
          onClick={() => setConnectMenuOpen(false)}
        >
          <div
            style={{ ...styles.card, background: T.surface, padding: 28, border: `1px solid ${T.border}`, borderRadius: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={styles.eyebrow}>Connect wallet</p>
            {baseWallet && (
              <WalletOptionButton
                label="Base Wallet"
                kind="base"
                recommended
                onClick={() => { connect({ connector: baseWallet }); setConnectMenuOpen(false); }}
              />
            )}
            {orderedOthers.length > 0 && (
              <p style={{ ...styles.meta, marginTop: 18, marginBottom: 10 }}>Browser wallets</p>
            )}
            {orderedOthers.map((wallet) => wallet.connector && (
              <WalletOptionButton
                key={wallet.connector.uid}
                label={wallet.label}
                kind={wallet.kind}
                icon={wallet.connector.icon}
                onClick={() => { connect({ connector: wallet.connector! }); setConnectMenuOpen(false); }}
              />
            ))}
            <button style={{ ...styles.ghostBtn, marginTop: 6 }} onClick={() => setConnectMenuOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {tutorialStep !== null && (
        <div style={{ position: "fixed", inset: 0, background: "var(--bq-tutorial-overlay)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
          <div style={{ ...styles.card, background: T.surface, padding: 32, border: `1px solid ${T.border}`, borderRadius: 4 }}>
            <p style={styles.eyebrow}>{String(tutorialStep + 1).padStart(2, "0")} / 03</p>
            {tutorialStep === 0 && (
              <>
                <h2 style={{ ...styles.title, fontSize: 36 }}>Welcome.</h2>
                <p style={styles.lede}>A daily crypto trivia game on Base. Test your knowledge, build streaks, compete worldwide.</p>
              </>
            )}
            {tutorialStep === 1 && (
              <>
                <h2 style={{ ...styles.title, fontSize: 36 }}>5 questions.<br />Daily.</h2>
                <p style={styles.lede}>Answer fast — quicker means more points. Save your score onchain to appear on the global leaderboard.</p>
              </>
            )}
            {tutorialStep === 2 && (
              <>
                <h2 style={{ ...styles.title, fontSize: 36 }}>Earn<br />NFT badges.</h2>
                <p style={styles.lede}>Keep your streak alive and claim onchain NFTs: Bronze (3d), Silver (7d), Gold (30d), Diamond (100d).</p>
              </>
            )}
            <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ flex: 1, height: 2, background: tutorialStep === i ? T.base : T.border }} />
              ))}
            </div>
            {tutorialStep < 2 ? (
              <>
                <button style={styles.primaryBtn} onClick={() => setTutorialStep(tutorialStep + 1)}>Next →</button>
                <button style={styles.ghostBtn} onClick={closeTutorial}>Skip</button>
              </>
            ) : (
              <button style={styles.primaryBtn} onClick={closeTutorial}>Let&apos;s play →</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
