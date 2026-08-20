import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://lol.nhatminh301.com";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    console.log("API received:", JSON.stringify(body));

    const { tk, mk, username, password, proxy } = body || {};

    if (!tk || !mk) {
      console.log("Missing tk or mk:", { tk, mk });
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
    console.log("Calling:", url);

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
