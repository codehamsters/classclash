import { connection } from "next/server";

/**
 * Short-lived TURN credentials, so peers that can't reach each other directly
 * (phone data vs Wi-Fi, client-isolated school Wi-Fi) can still connect through a relay.
 *
 * Uses Cloudflare Realtime TURN, which has no spending cap of its own, so this route is the cap:
 * it hands out credentials only while the last 30 days of TURN traffic is under TURN_CAP_GB,
 * and once it isn't, deletes the TURN key so even credentials already handed out stop working.
 * Missing config or a failed usage check means no TURN, never uncapped TURN.
 *
 * Env: CF_TURN_KEY_ID, CF_TURN_API_TOKEN (the TURN key and its token),
 * CF_ACCOUNT_ID, CF_API_TOKEN (account token: Account Analytics read + Realtime/Calls edit),
 * TURN_CAP_GB (optional, default 800; Cloudflare's free tier is 1,000 GB a month).
 */
const TTL_SECONDS = 2 * 60 * 60;
const CHECK_EVERY_MS = 5 * 60 * 1000;
const RETRY_FAILED_CHECK_MS = 60 * 1000;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

let checked: { ok: boolean; until: number } | null = null;
let killed = false;

export async function GET() {
  await connection();
  const { CF_TURN_KEY_ID: keyId, CF_TURN_API_TOKEN: keyToken, CF_ACCOUNT_ID: account, CF_API_TOKEN: apiToken } = process.env;
  if (!keyId || !keyToken || !account || !apiToken) {
    console.error("TURN disabled: missing CF_TURN_KEY_ID, CF_TURN_API_TOKEN, CF_ACCOUNT_ID or CF_API_TOKEN");
    return json([]);
  }
  if (killed) return json([]);
  if (!(await underCap(account, apiToken, keyId))) return json([]);
  try {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${keyToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: TTL_SECONDS }),
    });
    if (!res.ok) {
      console.error(`TURN credentials failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
      return json([]);
    }
    const { iceServers } = (await res.json()) as { iceServers: RTCIceServer | RTCIceServer[] };
    // browsers block port 53, and stun entries are already covered by Trystero's defaults
    const turn = [iceServers].flat()
      .map((s) => ({ ...s, urls: [s.urls].flat().filter((u) => u.startsWith("turn") && !/:53\b/.test(u)) }))
      .filter((s) => s.urls.length);
    return json(turn);
  } catch (e) {
    console.error("TURN credentials failed", e);
    return json([]);
  }
}

async function underCap(account: string, apiToken: string, keyId: string) {
  if (checked && Date.now() < checked.until) return checked.ok;
  const capBytes = (Number(process.env.TURN_CAP_GB) || 800) * 1e9;
  const used = await usedBytes(account, apiToken);
  if (used === null) {
    checked = { ok: false, until: Date.now() + RETRY_FAILED_CHECK_MS };
    return false;
  }
  const ok = used < capBytes;
  checked = { ok, until: Date.now() + CHECK_EVERY_MS };
  if (!ok) await deleteKey(account, apiToken, keyId);
  return ok;
}

/** TURN egress (what Cloudflare bills) over the last 30 days, or null if the check failed */
async function usedBytes(account: string, apiToken: string): Promise<number | null> {
  const query = `query ($account: string!, $since: Time!) {
    viewer { accounts(filter: { accountTag: $account }) {
      callsTurnUsageAdaptiveGroups(filter: { datetimeMinute_gt: $since }, limit: 1) { sum { egressBytes } }
    } }
  }`;
  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { account, since: new Date(Date.now() - WINDOW_MS).toISOString() } }),
    });
    const body = await res.json().catch(() => null);
    const groups = body?.data?.viewer?.accounts?.[0]?.callsTurnUsageAdaptiveGroups;
    if (!res.ok || body?.errors?.length || !Array.isArray(groups)) {
      console.error(`TURN usage check failed: ${res.status} ${JSON.stringify(body?.errors ?? body).slice(0, 300)}`);
      return null;
    }
    return groups.reduce((n: number, g: { sum?: { egressBytes?: number } }) => n + (g.sum?.egressBytes ?? 0), 0);
  } catch (e) {
    console.error("TURN usage check failed", e);
    return null;
  }
}

async function deleteKey(account: string, apiToken: string, keyId: string) {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/calls/turn_keys/${keyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiToken}` },
    });
    if (res.ok) killed = true;
    console.error(`TURN cap reached; deleting TURN key ${res.ok ? "succeeded" : `failed (${res.status})`}`);
  } catch (e) {
    console.error("TURN cap reached; deleting TURN key failed", e);
  }
}

const json = (iceServers: RTCIceServer[]) => Response.json({ iceServers }, { headers: { "Cache-Control": "no-store" } });
