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
    const error = await response.json();
    throw new Error(error.error || "Check failed");
  }

  return response.json();
}
