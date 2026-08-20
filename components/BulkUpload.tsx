"use client";

import { useState, useRef } from "react";
import { Upload, Play, Pause, Loader2, FileText } from "lucide-react";
import { checkAccount } from "@/lib/api";
import { CheckResult, ApiRawResponse } from "@/lib/types";

interface BulkUploadProps {
  onResult: (result: CheckResult) => void;
  onAllDone?: (results: CheckResult[]) => void;
  apiKey?: string;
  apiSecret?: string;
  proxy?: string;
  disabled?: boolean;
}

export default function BulkUpload({
  onResult,
  onAllDone,
  apiKey,
  apiSecret,
  proxy,
  disabled,
}: BulkUploadProps) {
  const [accounts, setAccounts] = useState<{ tk: string; mk: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [delay, setDelay] = useState(500);
  const [concurrency, setConcurrency] = useState(2);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  const resultsRef = useRef<CheckResult[]>([]);
  const completedRef = useRef(0);

  const parseFile = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const parsed: { tk: string; mk: string }[] = [];

    for (const line of lines) {
      const sep = line.includes("|") ? "|" : line.includes(":") ? ":" : null;
      if (!sep) continue;
      const idx = line.indexOf(sep);
      const tk = line.slice(0, idx).trim();
      const mk = line.slice(idx + 1).trim();
      if (tk && mk) parsed.push({ tk, mk });
    }

    return parsed;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseFile(text);
      setAccounts(parsed);
      setCurrentIndex(0);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseFile(text);
      setAccounts(parsed);
      setCurrentIndex(0);
    };
    reader.readAsText(file);
  };

  const checkOne = async (tk: string, mk: string, retries = 3): Promise<CheckResult> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const data: ApiRawResponse = await checkAccount(tk, mk, apiKey, apiSecret, proxy);

        if (data.error) {
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * attempt));
            continue;
          }
          return {
            tk, mk, status: "error",
            error: data.error || data.details || "API error",
          };
        }

        return {
          tk, mk,
          status: data.status === "HIT" ? "live" : "die",
          uid: data.uid,
          username: data.username,
          nickname: data.nickname,
          aov_name: data.aov_name,
          aov_rank: data.aov_rank,
          aov_level: data.aov_level,
          aov_banned: data.aov_banned,
          aov_total_skins: data.aov_total_skins,
          aov_total_champs: data.aov_total_champs,
          aov_ss: data.aov_ss,
          aov_ss_list: data.aov_ss_list,
          aov_sss: data.aov_sss,
          aov_sss_list: data.aov_sss_list,
          aov_anime: data.aov_anime,
          aov_anime_list: data.aov_anime_list,
          region: data.region,
          shells: data.shells,
          email_verified: data.email_verified,
          mobile_bound: data.mobile_bound,
          fb_linked: data.fb_linked,
          account_secured: data.account_secured,
          password_set: data.password_set,
          fc_name: data.fc_name,
          fc_level: data.fc_level,
          garena_created: data.garena_created,
          last_login: data.last_login,
          last_session_ip: data.last_session_ip,
          last_session_country: data.last_session_country,
        };
      } catch (err) {
        if (attempt < retries) {
          const backoff = 2000 * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }
        const msg = err instanceof Error ? err.message : "Unknown error";
        return { tk, mk, status: "error", error: msg };
      }
    }
    return { tk, mk, status: "error", error: "Max retries exceeded" };
  };

  const runCheck = async () => {
    if (accounts.length === 0) return;

    setRunning(true);
    setPaused(false);
    abortRef.current = false;

    if (currentIndex === 0) {
      resultsRef.current = [];
      completedRef.current = 0;
    }

    let nextIndex = currentIndex;
    let activeCount = 0;
    let resolveAll: () => void;
    const allDone = new Promise<void>((r) => { resolveAll = r; });

    const startNext = async () => {
      while (nextIndex < accounts.length && !abortRef.current) {
        if (activeCount >= concurrency) {
          await new Promise((r) => setTimeout(r, 50));
          continue;
        }

        const idx = nextIndex++;
        const { tk, mk } = accounts[idx];
        activeCount++;

        checkOne(tk, mk).then((result) => {
          resultsRef.current.push(result);
          onResult(result);
          completedRef.current++;
          setCurrentIndex(completedRef.current);
          activeCount--;

          if (delay > 0) {
            setTimeout(startNext, delay);
          } else {
            startNext();
          }
        });
      }

      const waitIdle = () => {
        if (activeCount > 0) {
          setTimeout(waitIdle, 50);
        } else {
          resolveAll!();
        }
      };
      waitIdle();
    };

    startNext();
    await allDone;

    setRunning(false);
    setCurrentIndex(accounts.length);
    onAllDone?.(resultsRef.current);
  };

  const handlePause = () => {
    abortRef.current = true;
    setPaused(true);
    setRunning(false);
  };

  const handleResume = () => {
    runCheck();
  };

  const progress = accounts.length > 0 ? Math.min(((currentIndex + 1) / accounts.length) * 100, 100) : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Check Hàng Loạt
      </h2>

      {/* Drop zone */}
      <div
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : (e) => e.preventDefault()}
        onClick={disabled ? undefined : () => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled
            ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 cursor-not-allowed opacity-60"
            : "border-zinc-300 dark:border-zinc-700 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
        }`}
      >
        <FileText className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
        {disabled ? (
          <p className="text-sm text-zinc-500">
            Nhập API Credentials ở trên để sử dụng
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Kéo thả file <strong>.txt</strong> vào đây hoặc{" "}
              <span className="text-blue-600 underline">chọn file</span>
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Định dạng: <code>tk|mk</code> hoặc <code>tk:mk</code> (mỗi dòng 1 tài khoản)
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {/* Config */}
      {accounts.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <span className="text-sm">
              Đã load: <strong>{accounts.length}</strong> tài khoản
            </span>
            <span className="text-sm text-zinc-500">
              Đã check: <strong>{currentIndex}</strong> / {accounts.length}
            </span>
          </div>

          {/* Settings */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Concurrency:</label>
              <input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(Math.max(1, Math.min(20, Number(e.target.value))))}
                min={1}
                max={20}
                className="w-20 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-zinc-500">request song song</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Delay:</label>
              <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(Math.max(0, Number(e.target.value)))}
                min={0}
                step={50}
                className="w-24 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-zinc-500">ms giữa mỗi batch</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${running || paused ? progress : currentIndex >= accounts.length && accounts.length > 0 ? 100 : 0}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!running && !paused && (
              <button
                onClick={runCheck}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Bắt đầu Check
              </button>
            )}

            {running && (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
              >
                <Pause className="w-4 h-4" />
                Tạm Dừng
              </button>
            )}

            {paused && (
              <button
                onClick={handleResume}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Tiếp Tục
              </button>
            )}

            {(running || paused) && (
              <button
                onClick={() => {
                  abortRef.current = true;
                  setRunning(false);
                  setPaused(false);
                  setCurrentIndex(0);
                }}
                className="px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 font-medium rounded-lg transition-colors"
              >
                Dừng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
