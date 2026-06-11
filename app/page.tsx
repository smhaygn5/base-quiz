"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";

const QUESTIONS = [
  { q: "Which company developed Base?", a: ["Binance", "Coinbase", "Kraken", "OKX"], c: 1 },
  { q: "Base is a Layer-2 of which network?", a: ["Bitcoin", "Solana", "Ethereum", "Avalanche"], c: 2 },
  { q: "Which tech stack does Base use?", a: ["OP Stack", "zkSync", "Polygon CDK", "Arbitrum Nitro"], c: 0 },
  { q: "In which year did Base mainnet launch?", a: ["2021", "2022", "2023", "2024"], c: 2 },
  { q: "Which token is used for gas fees on Base?", a: ["USDC", "BASE", "ETH", "OP"], c: 2 },
  { q: "Who is the founder of Ethereum?", a: ["Satoshi Nakamoto", "Vitalik Buterin", "Brian Armstrong", "CZ"], c: 1 },
  { q: "Which company issues USDC?", a: ["Tether", "Circle", "Coinbase", "Paxos"], c: 1 },
  { q: "What does NFT stand for?", a: ["New Finance Token", "Non-Fungible Token", "Network File Transfer", "Node Function Type"], c: 1 },
  { q: "Smart contracts on Base are written in?", a: ["Python", "Rust", "Solidity", "Go"], c: 2 },
  { q: "What is Farcaster?", a: ["An exchange", "A decentralized social network", "A wallet", "A game"], c: 1 },
  { q: "What is Bitcoin's max supply?", a: ["21 million", "100 million", "1 billion", "Unlimited"], c: 0 },
  { q: "What is the main goal of Layer-2s?", a: ["Minting more tokens", "Scalability & lower fees", "Mining", "Staking"], c: 1 },
  { q: "What was Base App formerly called?", a: ["Coinbase Wallet", "MetaMask", "Rainbow", "Phantom"], c: 0 },
  { q: "What are a wallet's secret words called?", a: ["Public key", "Seed phrase", "Hash", "Nonce"], c: 1 },
  { q: "What is the smallest unit of ETH?", a: ["Satoshi", "Gwei", "Wei", "Finney"], c: 2 },
];

const QUIZ_SIZE = 5;
const TIME_PER_Q = 15;

function getDailyQuestions() {
  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const ch of today) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const idx: number[] = [];
  while (idx.length < QUIZ_SIZE) {
    seed = (seed * 1103515245 + 12345) % 2147483647;
    const i = seed % QUESTIONS.length;
    if (!idx.includes(i)) idx.push(i);
  }
  return idx.map((i) => QUESTIONS[i]);
}

// ---- STYLES ----
const S: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a1635 0%, #000 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  card: { maxWidth: 400, width: "100%", textAlign: "center" },
  title: { fontSize: 40, fontWeight: 800, margin: "0 0 8px" },
  sub: { color: "#93b4f5", marginBottom: 24 },
  bigBtn: {
    width: "100%",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: 14,
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
  },
  topRow: { display: "flex", justifyContent: "space-between", color: "#93b4f5", fontSize: 14, marginBottom: 10 },
  barBg: { width: "100%", background: "#1f2937", borderRadius: 99, height: 8, marginBottom: 20 },
  question: { fontSize: 22, fontWeight: 700, minHeight: 64, marginBottom: 16, textAlign: "left" },
  option: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    textAlign: "left",
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
    marginBottom: 12,
    display: "block",
  },
  score: { fontSize: 56, fontWeight: 800, color: "#60a5fa", margin: "8px 0" },
  streak: { color: "#fb923c", fontWeight: 600, marginBottom: 20 },
  shareBtn: {
    width: "100%",
    background: "#9333ea",
    color: "#fff",
    border: "none",
    padding: "16px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { composeCast } = useComposeCast();

  const [screen, setScreen] = useState<"start" | "quiz" | "end">("start");
  const [questions] = useState(getDailyQuestions);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [playedToday, setPlayedToday] = useState(false);

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
setTimeout(nextQuestion, 2000);  }

  function share() {
    const text = `🧠 I scored ${score} points on today's Base Quiz! 🔥 Streak: ${streak} days\n\nThink you can beat me? 👇`;
    try {
      composeCast({ text });
    } catch {
      navigator.clipboard.writeText(text);
      alert("Copied! Share it on Base App.");
    }
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
            <p style={{ color: "#facc15" }}>You already played today! New questions tomorrow 👀</p>
          ) : (
            <button style={S.bigBtn} onClick={() => setScreen("quiz")}>Start</button>
          )}
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
          )}          <div>
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
          <button style={S.shareBtn} onClick={share}>📣 Share Your Score</button>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 16 }}>New questions tomorrow!</p>
        </div>
      )}
    </main>
  );
}