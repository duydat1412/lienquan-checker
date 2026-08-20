import { CheckResponse } from "./types";

export async function checkAccount(
  tk: string,
  mk: string,
  apiKey?: string,
  apiSecret?: string,
  proxy?: string
): Promise<CheckResponse> {
  const response = await fetch("/api/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tk,
      mk,
      username: apiKey || "",
      password: apiSecret || "",
      proxy,
    }),
  });

  if (!response.ok) {
    let errorMsg = "Check failed";
    try {
      const error = await response.json();
      errorMsg = error.error || errorMsg;
    } catch {
      errorMsg = `API error: ${response.status}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
