import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount, injected } from "wagmi/connectors";

const APP_URL =
  process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "") ||
  "https://basequiz.xyz";

const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
const rpcUrl = apiKey
  ? `https://api.developer.coinbase.com/rpc/v1/base/${apiKey}`
  : undefined;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: "Base Quiz",
      appLogoUrl: `${APP_URL}/icon.png`,
    }),
    injected(),
  ],
  multiInjectedProviderDiscovery: true,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(rpcUrl),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
