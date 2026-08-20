"use client";

import { useState } from "react";
import { Search, Loader2, AlertTriangle } from "lucide-react";
import { checkAccount } from "@/lib/api";
import { CheckResult, ApiRawResponse } from "@/lib/types";

interface CheckFormProps {
  onResult: (result: CheckResult) => void;
  apiKey?: string;
  apiSecret?: string;
  proxy?: string;
  disabled?: boolean;
}

export default function CheckForm({ onResult, apiKey, apiSecret, proxy, disabled }: CheckFormProps) {
  const [tk, setTk] = useState("");
  const [mk, setMk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (value: string) => {
    const sep = value.includes(":") ? ":" : value.includes("|") ? "|" : null;
    if (sep) {
      const [parsedTk, parsedMk] = value.split(sep).map((s) => s.trim());
      if (parsedTk && parsedMk) {
        setTk(parsedTk);
        setMk(parsedMk);
        return;
      }
    }
    setTk(value);
  };

  const handleCheck = async () => {
    if (!tk || !mk) {
      setError("Vui lòng nhập tài khoản và mật khẩu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: ApiRawResponse = await checkAccount(tk, mk, apiKey, apiSecret, proxy);

      if (data.error) {
        setError(data.error);
        onResult({
          tk,
          mk,
          status: "error",
          raw: data,
        });
        return;
      }

      const result: CheckResult = {
        tk,
        mk,
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

      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && !disabled) {
      handleCheck();
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Check Đơn
      </h2>

      {disabled && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Vui lòng nhập API Username và Password ở trên để sử dụng
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Tài Khoản
            </label>
            <input
              type="text"
              value={tk}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Email, SĐT hoặc tk:mk"
              disabled={disabled}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Mật Khẩu
            </label>
            <input
              type="password"
              value={mk}
              onChange={(e) => setMk(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mật khẩu"
              disabled={disabled}
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading || !tk || !mk || disabled}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang check...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Check Ngay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
