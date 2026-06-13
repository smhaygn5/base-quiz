"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";
import { useAccount, useConnect, useWriteContract, useSwitchChain, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";


  const QUESTIONS = [
  // ---- BASE & COINBASE ----
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

  // ---- ETHEREUM ----
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

  // ---- BITCOIN ----
  { q: "What is Bitcoin's max supply?", a: ["21 million", "100 million", "1 billion", "Unlimited"], c: 0 },
  { q: "Who created Bitcoin?", a: ["Vitalik Buterin", "Satoshi Nakamoto", "Hal Finney", "Nick Szabo"], c: 1 },
  { q: "Bitcoin's smallest unit is called?", a: ["Wei", "Gwei", "Satoshi", "Finney"], c: 2 },
  { q: "How often does Bitcoin halving occur (roughly)?", a: ["Every year", "Every 2 years", "Every 4 years", "Every 10 years"], c: 2 },
  { q: "Bitcoin uses which consensus?", a: ["Proof of Stake", "Proof of Work", "Proof of Authority", "DPoS"], c: 1 },

  // ---- DEFI ----
  { q: "What does DeFi stand for?", a: ["Defined Finance", "Decentralized Finance", "Defaulted Finance", "Deferred Finance"], c: 1 },
  { q: "Uniswap is primarily a?", a: ["Lending platform", "DEX (decentralized exchange)", "Wallet", "Bridge"], c: 1 },
  { q: "What is an AMM?", a: ["Auto Market Mover", "Automated Market Maker", "Asset Management Module", "Aggregated Mint Maker"], c: 1 },
  { q: "What does TVL mean?", a: ["Token Value Locked", "Total Value Locked", "Trade Volume Limit", "Tier Volume Level"], c: 1 },
  { q: "Aave is primarily a?", a: ["DEX", "Lending protocol", "Stablecoin", "NFT marketplace"], c: 1 },
  { q: "What is yield farming?", a: ["Mining crops", "Earning rewards from DeFi protocols", "A staking pool name", "An NFT minting term"], c: 1 },

  // ---- STABLECOINS ----
  { q: "Which company issues USDC?", a: ["Tether", "Circle", "Coinbase", "Paxos"], c: 1 },
  { q: "Which company issues USDT?", a: ["Circle", "Tether", "Coinbase", "MakerDAO"], c: 1 },
  { q: "DAI is primarily backed by?", a: ["US Dollars in a bank", "Crypto collateral", "Gold reserves", "Government bonds"], c: 1 },
  { q: "Stablecoins try to maintain price parity with?", a: ["Bitcoin", "Ethereum", "Fiat currencies", "Gold only"], c: 2 },

  // ---- NFT ----
  { q: "What does NFT stand for?", a: ["New Finance Token", "Non-Fungible Token", "Network File Transfer", "Node Function Type"], c: 1 },
  { q: "Which is the NFT token standard on Ethereum?", a: ["ERC-20", "ERC-721", "ERC-1155 only", "BEP-20"], c: 1 },
  { q: "OpenSea is primarily a?", a: ["DEX", "NFT marketplace", "Wallet", "L2 chain"], c: 1 },
  { q: "What does 'mint' mean in NFTs?", a: ["Sell an NFT", "Create a new NFT onchain", "Burn an NFT", "Transfer an NFT"], c: 1 },

  // ---- WALLETS & SECURITY ----
  { q: "What are a wallet's secret words called?", a: ["Public key", "Seed phrase", "Hash", "Nonce"], c: 1 },
  { q: "What is a hardware wallet?", a: ["A mobile app", "A physical device for storing keys", "A browser extension", "An exchange account"], c: 1 },
  { q: "You should NEVER share your?", a: ["Wallet address", "Seed phrase", "ENS name", "Username"], c: 1 },
  { q: "Self-custody means?", a: ["Exchange holds your keys", "You control your private keys", "A bank holds your keys", "A friend holds your keys"], c: 1 },
  { q: "MetaMask is primarily a?", a: ["Exchange", "Browser wallet", "Hardware wallet", "L2 chain"], c: 1 },

  // ---- FARCASTER & SOCIAL ----
  { q: "What is Farcaster?", a: ["An exchange", "A decentralized social network", "A wallet", "A game"], c: 1 },
  { q: "Posts on Farcaster are called?", a: ["Tweets", "Casts", "Toots", "Snaps"], c: 1 },
  { q: "Who founded Farcaster?", a: ["Vitalik Buterin", "Dan Romero & Varun Srinivasan", "Jesse Pollak", "Jack Dorsey"], c: 1 },
  { q: "A Farcaster user identifier is called?", a: ["UID", "FID", "Handle", "Tag"], c: 1 },
  { q: "Mini Apps on Base App are built with?", a: ["MiniKit / OnchainKit", "Flutter only", "Native iOS only", "Unity"], c: 0 },

  // ---- GENERAL ----
  { q: "A blockchain transaction hash is also called?", a: ["Nonce", "TX ID", "Block height", "Gas limit"], c: 1 },
  { q: "What does DAO stand for?", a: ["Digital Asset Order", "Decentralized Autonomous Organization", "Distributed App Output", "Data Access Object"], c: 1 },
  { q: "What is a 'block explorer'?", a: ["A mining tool", "A site to view onchain data", "A wallet type", "A bridge"], c: 1 },
  { q: "What is 'slippage' in trading?", a: ["Network downtime", "Difference between expected & actual price", "A type of fee", "A wallet error"], c: 1 },
  { q: "A 'rug pull' is?", a: ["A trading strategy", "A scam where founders abandon a project", "A staking method", "A wallet feature"], c: 1 },
  { q: "What's a multisig wallet?", a: ["A wallet with many tokens", "A wallet needing multiple signatures to approve tx", "A wallet on multiple chains", "A wallet with a long password"], c: 1 },
];

const QUIZ_SIZE = 5;
const TIME_PER_Q = 15;

const publicClient = createPublicClient({ chain: base, transport: http() });

type LeaderRow = { addr: string; bestScore: number; totalScore: number; streak: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type QuizQ = { q: string; a: string[]; c: number };

function getRandomQuestions(): QuizQ[] {
  // Rastgele 5 soru seç + her sorunun şıklarını karıştır
  const picked = shuffle(QUESTIONS).slice(0, QUIZ_SIZE);
  return picked.map((q) => {
    const correctAnswer = q.a[q.c];
    const shuffledOptions = shuffle(q.a);
    const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);
    return { q: q.q, a: shuffledOptions, c: newCorrectIndex };
  });
}

const S: Record<string, CSSProperties> = {
  main: { minHeight: "100vh", background: "linear-gradient(180deg, #0a1635 0%, #000 100%)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" },
  card: { maxWidth: 400, width: "100%", textAlign: "center" },
  title: { fontSize: 40, fontWeight: 800, margin: "0 0 8px" },
  sub: { color: "#93b4f5", marginBottom: 24 },
  bigBtn: { width: "100%", background: "#2563eb", color: "#fff", border: "none", padding: "16px", borderRadius: 14, fontSize: 20, fontWeight: 700, cursor: "pointer", marginBottom: 12 },
  grayBtn: { width: "100%", background: "#1f2937", color: "#fff", border: "none", padding: "14px", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 12 },
  topRow: { display: "flex", justifyContent: "space-between", color: "#93b4f5", fontSize: 14, marginBottom: 10 },
  barBg: { width: "100%", background: "#1f2937", borderRadius: 99, height: 8, marginBottom: 20 },
  question: { fontSize: 22, fontWeight: 700, minHeight: 64, marginBottom: 16, textAlign: "left" },
  option: { width: "100%", padding: "14px 16px", borderRadius: 12, border: "none", textAlign: "left", fontSize: 16, fontWeight: 500, color: "#fff", cursor: "pointer", marginBottom: 12, display: "block" },
  score: { fontSize: 56, fontWeight: 800, color: "#60a5fa", margin: "8px 0" },
  streak: { color: "#fb923c", fontWeight: 600, marginBottom: 20 },
  shareBtn: { width: "100%", background: "#9333ea", color: "#fff", border: "none", padding: "16px", borderRadius: 14, fontSize: 18, fontWeight: 700, cursor: "pointer", marginBottom: 12 },
  saveBtn: { width: "100%", background: "#16a34a", color: "#fff", border: "none", padding: "16px", borderRadius: 14, fontSize: 18, fontWeight: 700, cursor: "pointer", marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#111827", borderRadius: 12, padding: "12px 16px", marginBottom: 8, fontSize: 14 },
};

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { composeCast } = useComposeCast();
const { address, isConnected, chainId: walletChainId } = useAccount();  const { connect, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const [screen, setScreen] = useState<"start" | "quiz" | "end" | "board">("start");
  const [questions, setQuestions] = useState<QuizQ[]>(getRandomQuestions);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");
  const [board, setBoard] = useState<LeaderRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastPlayed = localStorage.getItem("lastPlayed");
    setStreak(parseInt(localStorage.getItem("streak") || "0"));
    if (lastPlayed === today) setPlayedToday(true);
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
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, screen, selected, nextQuestion]);

  function answer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[qIndex].c) setScore(score + 100 + timeLeft * 10);
    setTimeout(nextQuestion, 2000);
  }

  function share() {
    const text = `🧠 I scored ${score} points on today's Base Quiz! 🔥 Streak: ${streak} days\n\nThink you can beat me? 👇`;
    try {
      composeCast({ text });
    } catch {
      navigator.clipboard.writeText(text);
      alert("Copied! Share it on Base App.");
    }
  }

 async function saveOnchain() {
    setTxStatus("pending");
    setTxError("");
    try {
      // Önce zincire sor: bugün zaten oynadı mı? (bedava kontrol)
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
          setTxError("Already saved today! Come back tomorrow.");
          setTxStatus("error");
          return;
        }
      }
 if (walletChainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "submitScore",
        args: [BigInt(score)],
        chainId: base.id,
      });
      setTxHash(hash);
      setTxStatus("done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed";
      setTxError(msg.includes("Already played") ? "Already saved today! Come back tomorrow." : msg.slice(0, 120));
      setTxStatus("error");
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
        const [addr, best, total, stk] = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: "getPlayer",
          args: [BigInt(i)],
        });
        rows.push({ addr, bestScore: Number(best), totalScore: Number(total), streak: Number(stk) });
      }
      rows.sort((a, b) => b.totalScore - a.totalScore);
      setBoard(rows.slice(0, 10));
    } catch (e) {
      console.error("Leaderboard error:", e);
      setBoard([]);
    }
    setBoardLoading(false);
  }

  function shortAddr(a: string) {
    return a.slice(0, 6) + "..." + a.slice(-4);
  }

  function optionStyle(i: number): CSSProperties {
    let bg = "#1f2937";
    let opacity = 1;
    if (selected !== null) {
      if (i === questions[qIndex].c) bg = "#16a34a";
      else if (i === selected) bg = "#dc2626";
      else opacity = 0.5;
    }
    return { ...S.option, background: bg, opacity };
  }

  return (
    <main style={S.main}>
      {screen === "start" && (
        <div style={S.card}>
          <h1 style={S.title}>🧠 Base Quiz</h1>
          <p style={S.sub}>5 daily questions. Answer fast, score big!</p>
          {streak > 0 && <p style={S.streak}>🔥 {streak}-day streak</p>}
          {playedToday ? (
            <p style={{ color: "#facc15", marginBottom: 16 }}>You already played today! New questions tomorrow 👀</p>
          ) : (
            <button style={S.bigBtn} onClick={() => { setQuestions(getRandomQuestions()); setQIndex(0); setScore(0); setSelected(null); setTimeLeft(TIME_PER_Q); setScreen("quiz"); }}>Start</button>
          )}
          <button style={S.grayBtn} onClick={loadBoard}>🏆 Leaderboard</button>
        </div>
      )}

      {screen === "quiz" && (
        <div style={S.card}>
          <div style={S.topRow}>
            <span>Question {qIndex + 1}/{QUIZ_SIZE}</span>
            <span>Score: {score}</span>
          </div>
          <div style={S.barBg}>
            <div style={{ background: "#3b82f6", height: 8, borderRadius: 99, width: `${(timeLeft / TIME_PER_Q) * 100}%`, transition: "width 1s linear" }} />
          </div>
          <h2 style={S.question}>{questions[qIndex].q}</h2>
          {selected !== null && (
            <p style={{ fontWeight: 700, marginBottom: 12, color: selected === questions[qIndex].c ? "#4ade80" : "#f87171" }}>
              {selected === questions[qIndex].c ? "✅ Correct!" : "❌ Wrong!"}
            </p>
          )}
          <div>
            {questions[qIndex].a.map((opt, i) => (
              <button key={i} style={optionStyle(i)} onClick={() => answer(i)}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div style={S.card}>
          <h1 style={{ fontSize: 30, fontWeight: 800 }}>🎉 Done!</h1>
          <p style={S.score}>{score}</p>
          <p style={S.sub}>points</p>
          <p style={S.streak}>🔥 Streak: {streak} days</p>

          {!isConnected ? (
            <button style={S.saveBtn} onClick={() => connect({ connector: connectors[0] })}>
              🔗 Connect Wallet to Save Score
            </button>
          ) : txStatus === "idle" ? (
            <button style={S.saveBtn} onClick={saveOnchain}>💾 Save Score Onchain</button>
          ) : txStatus === "pending" ? (
            <button style={{ ...S.saveBtn, opacity: 0.6 }} disabled>⏳ Confirm in wallet...</button>
          ) : txStatus === "done" ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: "#4ade80", fontWeight: 700 }}>✅ Saved onchain!</p>
              <a href={`https://basescan.org/tx/${txHash}`} target="_blank" style={{ color: "#60a5fa", fontSize: 13 }}>
                View transaction ↗
              </a>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              <p style={{ color: "#f87171", fontSize: 14 }}>{txError}</p>
              <button style={{ ...S.grayBtn, marginTop: 8 }} onClick={saveOnchain}>Try again</button>
            </div>
          )}

          <button style={S.shareBtn} onClick={share}>📣 Share Your Score</button>
          <button style={S.grayBtn} onClick={loadBoard}>🏆 Leaderboard</button>
        </div>
      )}

      {screen === "board" && (
        <div style={S.card}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 20 }}>🏆 Leaderboard</h1>
          {boardLoading ? (
            <p style={S.sub}>Loading from chain...</p>
          ) : board.length === 0 ? (
            <p style={S.sub}>No scores yet. Be the first!</p>
          ) : (
            board.map((r, i) => (
              <div key={r.addr} style={{ ...S.row, border: address && r.addr.toLowerCase() === address.toLowerCase() ? "1px solid #3b82f6" : "none" }}>
                <span style={{ fontWeight: 700 }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {shortAddr(r.addr)}
                </span>
                <span style={{ color: "#93b4f5" }}>{r.totalScore} pts 🔥{r.streak}</span>
              </div>
            ))
          )}
          <button style={{ ...S.grayBtn, marginTop: 12 }} onClick={() => setScreen("start")}>← Back</button>
        </div>
      )}
    </main>
  );
}