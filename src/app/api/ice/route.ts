import { connection } from "next/server";

/**
 * Short-lived TURN credentials, so peers that can't reach each other directly
 * (phone data vs Wi-Fi, client-isolated school Wi-Fi) can still connect through a relay.
 * Uses Cloudflare Realtime TURN when CF_TURN_KEY_ID and CF_TURN_API_TOKEN are set;
 * otherwise returns no servers and peers fall back to direct connections only.
 */
export async function GET() {
  await connection();
  const id = process.env.CF_TURN_KEY_ID;
  const token = process.env.CF_TURN_API_TOKEN;
  if (!id || !token) return json([]);
  try {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${id}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl: 86400 }),
    });
    if (!res.ok) return json([]);
    const { iceServers } = (await res.json()) as { iceServers: RTCIceServer | RTCIceServer[] };
    // browsers block port 53, and stun entries are already covered by Trystero's defaults
    const turn = [iceServers].flat()
      .map((s) => ({ ...s, urls: [s.urls].flat().filter((u) => u.startsWith("turn") && !/:53\b/.test(u)) }))
      .filter((s) => s.urls.length);
    return json(turn);
  } catch {
    return json([]);
  }
}

const json = (iceServers: RTCIceServer[]) => Response.json({ iceServers }, { headers: { "Cache-Control": "no-store" } });
