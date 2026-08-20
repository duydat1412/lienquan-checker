"use client";

import { useState } from "react";
import { Swords, Settings, Search, Upload, Key, Heart } from "lucide-react";
import CheckForm from "@/components/CheckForm";
import BulkUpload from "@/components/BulkUpload";
import ResultTable from "@/components/ResultTable";
import { CheckResult } from "@/lib/types";

export default function Home() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [apiKey, setApiKey] = useState("thaituduc");
  const [apiSecret, setApiSecret] = useState("thaituduc");
  const [proxy, setProxy] = useState("");
  const [tab, setTab] = useState<"single" | "bulk">("single");

  const hasCredentials = apiKey.trim() !== "" && apiSecret.trim() !== "";

  const handleResult = (result: CheckResult) => {
    setResults((prev) => [result, ...prev]);
  };

  const handleClear = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Swords className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">LQ Checker</h1>
              <p className="text-xs text-zinc-500">Check tài khoản Liên Quân Mobile</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* API Credentials - Always visible */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          hasCredentials
            ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
        }`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Credentials
            {!hasCredentials && (
              <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                (Bắt buộc)
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Tài khoản API"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Mật khẩu API"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Proxy <span className="text-zinc-400 font-normal">(tuỳ chọn)</span>
              </label>
              <input
                type="text"
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
                placeholder="http://ip:port hoặc socks5://ip:port"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
          <button
            onClick={() => setTab("single")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-colors ${
              tab === "single"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Search className="w-4 h-4" />
            Check Đơn
          </button>
          <button
            onClick={() => setTab("bulk")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-colors ${
              tab === "bulk"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Upload className="w-4 h-4" />
            Check Hàng Loạt
          </button>
        </div>

        {/* Forms */}
        {tab === "single" ? (
          <CheckForm
            onResult={handleResult}
            apiKey={apiKey}
            apiSecret={apiSecret}
            proxy={proxy}
            disabled={!hasCredentials}
          />
        ) : (
          <BulkUpload
            onResult={handleResult}
            apiKey={apiKey}
            apiSecret={apiSecret}
            proxy={proxy}
            disabled={!hasCredentials}
          />
        )}

        {/* Results */}
        <ResultTable results={results} onClear={handleClear} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1.5">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by <strong className="text-zinc-700 dark:text-zinc-300">Duy Dat</strong>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://fb.com/duydat141207"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                Contact: fb.com/duydat141207
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
