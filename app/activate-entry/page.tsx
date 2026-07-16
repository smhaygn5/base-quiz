"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { useAccount, useConnect, useSwitchChain, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import {
  CREATE2_DEPLOYER_ABI,
  CREATE2_DEPLOYER_ADDRESS,
  ROUND_ENTRY_ADDRESS,
  ROUND_ENTRY_CREATION_CODE,
  ROUND_ENTRY_SALT,
} from "../entry-contract";

const BUILDER_CODE_SUFFIX = "0x62635f74616a686b6174730b0080218021802180218021802180218021" as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export default function ActivateEntryContract() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [active, setActive] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hash, setHash] = useState("");

  const checkContract = useCallback(async () => {
    try {
      const code = await publicClient.getCode({ address: ROUND_ENTRY_ADDRESS });
      const deployed = Boolean(code && code !== "0x");
      setActive(deployed);
      return deployed;
    } catch {
      setError("Could not check the Base contract. Please try again.");
      setActive(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void checkContract();
  }, [checkContract]);

  function connectWallet() {
    const baseConnector = connectors.find((connector) =>
      `${connector.id} ${connector.name}`.toLowerCase().includes("base")
    );
    const connector = baseConnector || connectors[0];
    if (!connector) {
      setError("No compatible wallet was found.");
      return;
    }
    connect({ connector });
  }

  async function activate() {
    setError("");
    setHash("");
    setPending(true);
    try {
      if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
      const transactionHash = await writeContractAsync({
        address: CREATE2_DEPLOYER_ADDRESS,
        abi: CREATE2_DEPLOYER_ABI,
        functionName: "deploy",
        args: [BigInt(0), ROUND_ENTRY_SALT, ROUND_ENTRY_CREATION_CODE],
        chainId: base.id,
        dataSuffix: BUILDER_CODE_SUFFIX,
      });
      setHash(transactionHash);
      await publicClient.waitForTransactionReceipt({ hash: transactionHash });
      const deployed = await checkContract();
      if (!deployed) throw new Error("The contract was not found after deployment.");
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "Activation failed";
      const rejected = /rejected|denied|declined|cancelled|canceled/i.test(message);
      setError(rejected ? "Transaction cancelled. No changes were made." : message.slice(0, 180));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="entry-activation-page">
      <section className="entry-activation-card" aria-labelledby="activation-title">
        <Image src="/favicon.svg" alt="Base Quiz" width={72} height={72} priority />
        <p className="entry-activation-kicker">Base Quiz setup</p>
        <h1 id="activation-title">Activate the round contract</h1>
        <p className="entry-activation-copy">
          This one-time Base transaction deploys the small contract used by Start Round.
          It does not change scores, streaks, badges, or transfer ETH.
        </p>

        {active === null ? (
          <p className="entry-activation-status">Checking contract…</p>
        ) : active ? (
          <div className="entry-activation-success" role="status">
            <span aria-hidden="true">✓</span>
            Round contract is active
          </div>
        ) : !isConnected ? (
          <button type="button" className="entry-activation-primary" onClick={connectWallet}>
            Connect Base Wallet
          </button>
        ) : (
          <>
            <p className="entry-activation-wallet">Connected: {address?.slice(0, 6)}…{address?.slice(-4)}</p>
            <button
              type="button"
              className="entry-activation-primary"
              onClick={activate}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Confirming on Base…" : "Activate Start Contract"}
            </button>
          </>
        )}

        {hash && !active && (
          <a
            className="entry-activation-link"
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            View pending transaction
          </a>
        )}
        {error && <p className="entry-activation-error" role="alert">{error}</p>}
        <a className="entry-activation-back" href="/">← Back to Base Quiz</a>
      </section>
    </main>
  );
}

