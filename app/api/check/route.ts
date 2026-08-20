import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://lol.nhatminh301.com";

export async function POST(request: NextRequest) {
  const start = Date.now();
  let tk = "";
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      console.log("[CHECK] ❌ Invalid JSON body");
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { tk: _tk, mk, username, password, proxy } = body || {};
    tk = _tk;

    if (!tk || !mk) {
      console.log("[CHECK] ❌ Missing tk or mk:", { tk, mk });
      return NextResponse.json(
        { error: "Missing tk or mk", received: body },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      username: username || "",
      password: password || "",
      tk,
      mk,
    });

    if (proxy) {
      params.append("proxy", proxy);
    }

    const url = `${API_BASE}/api/lienquan?${params.toString()}`;
    console.log(`[CHECK] 🔄 ${tk} → calling API...`);

    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
    });

    const elapsed = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[CHECK] ❌ ${tk} → HTTP ${response.status} (${elapsed}ms) body: ${errorText.slice(0, 200)}`);
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const rawText = await response.text();
    console.log(`[CHECK] ✅ ${tk} → ${response.status} (${elapsed}ms) len=${rawText.length}`);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.log(`[CHECK] ❌ ${tk} → Response is not JSON: ${rawText.slice(0, 300)}`);
      return NextResponse.json(
        { error: "API returned non-JSON", details: rawText.slice(0, 500) },
        { status: 502 }
      );
    }

    console.log(`[CHECK] 📋 ${tk} → status=${data.status} name=${data.aov_name || "?"} rank=${data.aov_rank || "?"}`);
    return NextResponse.json(data);
  } catch (error) {
    const elapsed = Date.now() - start;
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`[CHECK] 💥 ${tk || "?"} → ${msg} (${elapsed}ms)`);
    return NextResponse.json(
      { error: "Internal server error", details: msg },
      { status: 500 }
    );
  }
}
