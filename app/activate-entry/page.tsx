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
import { useI18n } from "../i18n/context";
import { LanguageMenu } from "@/components/ui/language-menu";

const BUILDER_CODE_SUFFIX = "0x62635f74616a686b6174730b0080218021802180218021802180218021" as const;

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

export default function ActivateEntryContract() {
  const { t } = useI18n();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [active, setActive] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [hash, setHash] = useState("");

  const checkContract = useCallback(async (retries = 0) => {
    try {
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        const code = await publicClient.getCode({ address: ROUND_ENTRY_ADDRESS });
        const deployed = Boolean(code && code !== "0x");
        if (deployed) {
          setActive(true);
          return true;
        }
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
      setActive(false);
      return false;
    } catch {
      setError(t("activation.errorCheck"));
      setActive(false);
      return false;
    }
  }, [t]);

  useEffect(() => {
    void checkContract();
  }, [checkContract]);

  function connectWallet() {
    const baseConnector = connectors.find((connector) =>
      `${connector.id} ${connector.name}`.toLowerCase().includes("base")
    );
    const connector = baseConnector || connectors[0];
    if (!connector) {
      setError(t("activation.errorWallet"));
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
      const deployed = await checkContract(6);
      if (!deployed) throw new Error("The contract was not found after deployment.");
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : "";
      const rejected = /rejected|denied|declined|cancelled|canceled/i.test(message);
      setError(rejected ? t("activation.errorCancelled") : t("activation.errorFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="base-quiz-app entry-activation-page">
      <div className="entry-activation-language">
        <LanguageMenu />
      </div>
      <section className="entry-activation-card" aria-labelledby="activation-title">
        <Image src="/favicon.svg" alt="Base Quiz" width={72} height={72} priority />
        <p className="entry-activation-kicker">{t("activation.kicker")}</p>
        <h1 id="activation-title">{t("activation.title")}</h1>
        <p className="entry-activation-copy">
          {t("activation.copy")}
        </p>

        {active === null ? (
          <p className="entry-activation-status">{t("activation.checking")}</p>
        ) : active ? (
          <div className="entry-activation-success" role="status">
            <span aria-hidden="true">✓</span>
            {t("activation.active")}
          </div>
        ) : !isConnected ? (
          <button type="button" className="entry-activation-primary" onClick={connectWallet}>
            {t("common.connectBaseWallet")}
          </button>
        ) : (
          <>
            <p className="entry-activation-wallet">
              {t("activation.connected", { address: `${address?.slice(0, 6)}…${address?.slice(-4)}` })}
            </p>
            <button
              type="button"
              className="entry-activation-primary"
              onClick={activate}
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? t("activation.confirming") : t("activation.activate")}
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
            {t("activation.pendingTransaction")}
          </a>
        )}
        {error && <p className="entry-activation-error" role="alert">{error}</p>}
        <a className="entry-activation-back" href="/">← {t("activation.back")}</a>
      </section>
    </main>
  );
}
