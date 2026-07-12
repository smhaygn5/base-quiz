"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";
import { useAccount, useConnect, useDisconnect, useWriteContract, useSwitchChain, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { namehash } from "viem/ens";
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

const QUESTIONS = [
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
];

const QUIZ_SIZE = 5;
const TIME_PER_Q = 15;
const APP_URL = "https://base-quiz-v5is.vercel.app";

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
  bg: "#0E0F1A",
  surface: "#101A35",
  surfaceHi: "#16224a",
  border: "#1f2d5c",
  borderHi: "#2a3d75",
  base: "#0052FF",
  baseHi: "#1a6bff",
  accent: "#FFE66D",
  correct: "#7BFF8C",
  wrong: "#FF5577",
  text: "#F5F7FF",
  textDim: "#8a96c7",
  textDimmer: "#5a6798",
  mono: "var(--font-plex-mono), ui-monospace, monospace",
  sans: "var(--font-inter), system-ui, sans-serif",
};

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});
type LeaderRow = { addr: string; bestScore: number; totalScore: number; streak: number; name?: string | null };
type QuizQ = { q: string; a: string[]; c: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomQuestions(): QuizQ[] {
  const picked = shuffle(QUESTIONS).slice(0, QUIZ_SIZE);
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

  const baseWallet = connectors.find((c) =>
    c.id === "farcasterMiniApp" || c.id === "farcaster" || c.id?.toLowerCase().includes("miniapp")
  ) || connectors.find((c) => c.name?.toLowerCase().includes("coinbase") || c.id === "coinbaseWalletSDK");

  const orderedOthers = [
    { match: ["metamask"], color: "#f6851b" },
    { match: ["okx"], color: "#000000" },
    { match: ["phantom"], color: "#534bb1" },
    { match: ["rabby"], color: "#7084ff" },
    { match: ["coinbase"], color: "#1652f0" },
    { match: ["keplr"], color: "#1a4cd8" },
    { match: ["trust"], color: "#3375bb" },
  ]
    .map((w) => ({
      connector: connectors.find(
        (c) =>
          c !== baseWallet &&
          w.match.some((m) => c.name?.toLowerCase().includes(m) || c.id?.toLowerCase().includes(m))
      ),
      color: w.color,
    }))
    .filter((w) => w.connector);

  const [screen, setScreen] = useState<"start" | "quiz" | "end" | "board" | "badges">("start");
  const [questions, setQuestions] = useState<QuizQ[]>(getRandomQuestions);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [onchainStreak, setOnchainStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [playedTodayOnchain, setPlayedTodayOnchain] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [board, setBoard] = useState<LeaderRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [owned, setOwned] = useState<boolean[]>([false, false, false, false]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [claimError, setClaimError] = useState("");
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    if (localStorage.getItem("soundOff") === "1") setSoundOn(false);
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

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastPlayed = localStorage.getItem("lastPlayed");
    setStreak(parseInt(localStorage.getItem("streak") || "0"));
    if (lastPlayed === today) setPlayedToday(true);
    if (!localStorage.getItem("tutorialSeen")) setTutorialStep(0);
  }, []);

  function closeTutorial() {
    localStorage.setItem("tutorialSeen", "1");
    setTutorialStep(null);
  }

  useEffect(() => {
    if (!address) {
      setPlayedTodayOnchain(false);
      return;
    }
    (async () => {
      try {
        const p = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "players",
          args: [address],
        });
        const lastPlayedDay = Number(p[3]);
        const todayUTC = Math.floor(Date.now() / 86400000);
        setPlayedTodayOnchain(lastPlayedDay === todayUTC);
        const chainStreak = Number(p[2]);
        if (chainStreak > 0) setStreak(chainStreak);
      } catch {
        setPlayedTodayOnchain(false);
      }
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
      const newStreak = lastPlayed === yesterday ? streak + 1 : 1;
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

  function startGame() {
    setQuestions(getRandomQuestions());
    setQIndex(0);
    setScore(0);
    setSelected(null);
    setTimeLeft(TIME_PER_Q);
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
      if (address) {
        const p = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "players",
          args: [address],
        });
        const lastPlayedDay = Number(p[3]);
        const todayUTC = Math.floor(Date.now() / 86400000);
        if (lastPlayedDay === todayUTC) {
          setTxError("Already saved today. Come back tomorrow.");
          setTxStatus("error");
          return;
        }
      }
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
      for (let i = 0; i < n && i < 100; i++) {
        try {
          const [addr, best, total, stk] = await publicClient.readContract({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: "getPlayer",
            args: [BigInt(i)],
          });
          rows.push({ addr, bestScore: Number(best), totalScore: Number(total), streak: Number(stk) });
        } catch (err) {
          console.warn(`Skipped player ${i}:`, err);
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      rows.sort((a, b) => b.totalScore - a.totalScore);
      const top = rows.slice(0, 10);
      setBoard(top);
      setBoardLoading(false);
      // Resolve Basenames for the shown rows, sequentially to respect RPC limits
      for (const row of top) {
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
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: T.sans,
      display: "flex",
      flexDirection: "column",
      backgroundImage: `radial-gradient(circle at 15% 0%, rgba(0,82,255,0.08), transparent 40%), radial-gradient(circle at 85% 100%, rgba(255,230,109,0.05), transparent 40%)`,
    },
    header: {
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
    brandDot: {
      width: 8,
      height: 8,
      background: T.base,
      boxShadow: `0 0 12px ${T.base}`,
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
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          <span>BASE_QUIZ</span>
          <span style={{ color: T.textDimmer, marginLeft: 8 }}>v1.0</span>
        </div>
        <div style={styles.headerRight}>
          {isConnected && address && (
            <button style={styles.walletPill} onClick={() => disconnect()} title="Disconnect">
              {shortAddr(address)} ×
            </button>
          )}
          <button style={styles.iconBtn} onClick={toggleSound} title={soundOn ? "Mute" : "Unmute"}>
            {soundOn ? "♪" : "×"}
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {screen === "start" && (
          <div style={styles.card}>
            <div style={styles.eyebrow}>Onchain trivia · Base mainnet</div>
            <h1 style={styles.title}>
              Daily<br />
              <span style={styles.titleAccent}>crypto</span><br />
              quiz.
            </h1>
            <p style={styles.lede}>
              Five questions. Fifteen seconds each. Answer fast, save your score to the chain, climb the global board.
            </p>

            {streak > 0 && (
              <div style={styles.streakBox}>
                <span>🔥</span>
                <span>STREAK · {streak} {streak === 1 ? "day" : "days"}</span>
              </div>
            )}

            {playedToday || playedTodayOnchain ? (
              <div style={{ ...styles.ghostBtn, background: T.surface, cursor: "default", color: T.accent }}>
                ✓ {playedTodayOnchain ? "Score saved today" : "Played today"} — back tomorrow
              </div>
            ) : (
              <button
                style={styles.primaryBtn}
                onClick={startGame}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translateY(1px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                ▶ Start round
              </button>
            )}
            <button style={styles.ghostBtn} onClick={loadBoard}>Leaderboard</button>
            <button style={styles.ghostBtn} onClick={loadBadges}>Streak badges</button>
          </div>
        )}

        {screen === "quiz" && (
          <div style={{ ...styles.card, position: "relative", maxWidth: 560 }}>
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -20,
                fontFamily: T.mono,
                fontSize: 240,
                fontWeight: 700,
                lineHeight: 1,
                color: T.border,
                opacity: 0.5,
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 0,
              }}
            >
              {String(qIndex + 1).padStart(2, "0")}
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={styles.meta}>Q{String(qIndex + 1).padStart(2, "0")} / {String(QUIZ_SIZE).padStart(2, "0")}</span>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 28,
                    fontWeight: 700,
                    color: timeLeft <= 3 ? T.wrong : T.text,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(timeLeft).padStart(2, "0")}s
                </span>
              </div>

              <div style={{ width: "100%", height: 2, background: T.border, marginBottom: 32 }}>
                <div
                  style={{
                    width: `${(timeLeft / TIME_PER_Q) * 100}%`,
                    height: "100%",
                    background: timeLeft <= 3 ? T.wrong : T.base,
                    transition: "width 1s linear, background 0.3s",
                  }}
                />
              </div>

              <h2
                style={{
                  fontFamily: T.mono,
                  fontSize: 28,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                  marginBottom: 28,
                  minHeight: 100,
                }}
              >
                {questions[qIndex].q}
              </h2>

              {selected !== null && (
                <p
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    color: selected === questions[qIndex].c ? T.correct : T.wrong,
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  {selected === questions[qIndex].c
                    ? `✓ Correct · +${100 + timeLeft * 10}`
                    : `✗ Wrong · answer was ${String.fromCharCode(65 + questions[qIndex].c)}`}
                </p>
              )}

              {questions[qIndex].a.map((opt, i) => {
                const isCorrect = i === questions[qIndex].c;
                const isSelected = i === selected;
                let bg = T.surface;
                let borderColor = T.border;
                let color = T.text;
                let extraStyle: CSSProperties = {};

                if (selected !== null) {
                  if (isCorrect) {
                    bg = "rgba(123, 255, 140, 0.12)";
                    borderColor = T.correct;
                    color = T.correct;
                    extraStyle = { animation: "pulseGreen 0.4s ease" };
                  } else if (isSelected) {
                    bg = "rgba(255, 85, 119, 0.12)";
                    borderColor = T.wrong;
                    color = T.wrong;
                    extraStyle = { animation: "shake 0.4s ease" };
                  } else {
                    bg = T.surface;
                    borderColor = T.border;
                    color = T.textDimmer;
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={selected !== null}
                    style={{
                      width: "100%",
                      background: bg,
                      color,
                      border: `1px solid ${borderColor}`,
                      padding: "16px 20px",
                      borderRadius: 4,
                      textAlign: "left",
                      fontSize: 15,
                      marginBottom: 10,
                      cursor: selected !== null ? "default" : "pointer",
                      fontFamily: T.sans,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      transition: "border-color 0.2s, background 0.2s",
                      ...extraStyle,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        color: selected !== null && !isCorrect && !isSelected ? T.textDimmer : T.textDim,
                        minWidth: 16,
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <style>{`
              @keyframes pulseGreen {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
              }
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-6px); }
                75% { transform: translateX(6px); }
              }
            `}</style>
          </div>
        )}

        {screen === "end" && (
          <div style={styles.card}>
            <p style={styles.eyebrow}>Round complete</p>
            <h1 style={{ ...styles.title, fontSize: 88, color: T.accent }}>{score}</h1>
            <p style={styles.meta}>points · streak {streak}</p>
            <div style={{ marginTop: 32 }}>
              {!isConnected ? (
                <div>
                  <p style={{ ...styles.eyebrow, marginBottom: 16 }}>Connect to save score</p>
                  {baseWallet && (
                    <button style={{ ...styles.primaryBtn, marginBottom: 24 }} onClick={() => connect({ connector: baseWallet })}>
                      Base wallet
                    </button>
                  )}
                  {orderedOthers.map((w) => (
                    <button key={w.connector!.uid} style={{ ...styles.ghostBtn }} onClick={() => connect({ connector: w.connector! })}>
                      {w.connector!.name}
                    </button>
                  ))}
                </div>
              ) : txStatus === "idle" ? (
                <button style={styles.primaryBtn} onClick={saveOnchain}>Save score onchain</button>
              ) : txStatus === "pending" ? (
                <button style={{ ...styles.primaryBtn, opacity: 0.6 }} disabled>Confirming…</button>
              ) : txStatus === "done" ? (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: T.correct, fontFamily: T.mono, fontSize: 13, marginBottom: 8 }}>✓ SAVED ONCHAIN</p>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" style={{ color: T.base, fontSize: 12, fontFamily: T.mono }}>
                    View tx →
                  </a>
                </div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: T.wrong, fontSize: 13, fontFamily: T.mono }}>{txError}</p>
                  <button style={styles.ghostBtn} onClick={saveOnchain}>Try again</button>
                </div>
              )}
              {!shareMenuOpen ? (
                <button style={styles.ghostBtn} onClick={() => setShareMenuOpen(true)}>Share score</button>
              ) : (
                <div>
                  <button style={styles.ghostBtn} onClick={shareFarcaster}>On Farcaster</button>
                  <button style={styles.ghostBtn} onClick={shareTwitter}>On X</button>
                  <button style={styles.ghostBtn} onClick={shareCopy}>Copy text</button>
                </div>
              )}
              <button style={styles.ghostBtn} onClick={loadBadges}>Streak badges</button>
              <button style={styles.ghostBtn} onClick={loadBoard}>Leaderboard</button>
            </div>
          </div>
        )}

        {screen === "board" && (
          <div style={styles.card}>
            <p style={styles.eyebrow}>Top players · all-time</p>
            <h1 style={{ ...styles.title, fontSize: 40, marginBottom: 24 }}>Leaderboard</h1>
            {boardLoading ? (
              <p style={styles.meta}>Reading chain…</p>
            ) : board.length === 0 ? (
              <p style={styles.meta}>No scores yet. Be first.</p>
            ) : (
              board.map((r, i) => (
                <div
                  key={r.addr}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    border: `1px solid ${address && r.addr.toLowerCase() === address.toLowerCase() ? T.base : T.border}`,
                    borderRadius: 4,
                    marginBottom: 8,
                    fontFamily: T.mono,
                    fontSize: 13,
                  }}
                >
                  <span><span style={{ color: T.textDim, marginRight: 12 }}>{String(i + 1).padStart(2, "0")}</span>{r.name || shortAddr(r.addr)}</span>
                  <span style={{ color: T.accent }}>{r.totalScore} · 🔥{r.streak}</span>
                </div>
              ))
            )}
            <button style={{ ...styles.ghostBtn, marginTop: 16 }} onClick={() => setScreen("start")}>← Back</button>
          </div>
        )}

        {screen === "badges" && (
          <div style={styles.card}>
            <p style={styles.eyebrow}>Streak NFTs · Base mainnet</p>
            <h1 style={{ ...styles.title, fontSize: 40, marginBottom: 24 }}>Badges</h1>
            {!isConnected ? (
              <div>
                <p style={{ ...styles.meta, marginBottom: 16 }}>Connect to view badges</p>
                {baseWallet && (
                  <button style={{ ...styles.primaryBtn, marginBottom: 24 }} onClick={() => connect({ connector: baseWallet })}>
                    Base wallet
                  </button>
                )}
                {orderedOthers.map((w) => (
                  <button key={w.connector!.uid} style={styles.ghostBtn} onClick={() => connect({ connector: w.connector! })}>
                    {w.connector!.name}
                  </button>
                ))}
              </div>
            ) : badgesLoading ? (
              <p style={styles.meta}>Reading chain…</p>
            ) : (
              <>
                <p style={{ ...styles.streakBox, marginBottom: 24 }}>🔥 ONCHAIN STREAK · {onchainStreak}</p>
                {claimError && <p style={{ color: T.wrong, fontSize: 12, marginBottom: 12, fontFamily: T.mono }}>{claimError}</p>}
                {BADGES.map((b, i) => {
                  const hasIt = owned[i];
                  const canClaim = !hasIt && onchainStreak >= b.days;
                  const isClaiming = claimingId === b.id;
                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: 20,
                        border: `1px solid ${hasIt ? T.correct : canClaim ? T.accent : T.border}`,
                        borderRadius: 4,
                        marginBottom: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: hasIt || canClaim ? 1 : 0.6,
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textDim, letterSpacing: "0.15em" }}>TIER {String(b.id).padStart(2, "0")}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: b.color }}>{b.emoji} {b.name}</div>
                        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textDimmer, marginTop: 4 }}>{b.days}-DAY STREAK</div>
                      </div>
                      <div>
                        {hasIt ? (
                          <span style={{ color: T.correct, fontFamily: T.mono, fontSize: 11, letterSpacing: "0.15em" }}>✓ OWNED</span>
                        ) : canClaim ? (
                          <button
                            style={{ ...styles.primaryBtn, width: "auto", padding: "10px 16px", marginBottom: 0, fontSize: 11 }}
                            onClick={() => claimBadge(b.id)}
                            disabled={isClaiming}
                          >
                            {isClaiming ? "…" : "CLAIM"}
                          </button>
                        ) : (
                          <span style={{ color: T.textDimmer, fontFamily: T.mono, fontSize: 11 }}>{b.days - onchainStreak}d left</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <button style={{ ...styles.ghostBtn, marginTop: 16 }} onClick={() => setScreen("start")}>← Back</button>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <span>BLOCK_DATA · BASE_MAINNET</span>
        <span>{totalPlayers !== null ? `${totalPlayers} PLAYERS_ONCHAIN` : "···"}</span>
      </footer>

      {tutorialStep !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }}>
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