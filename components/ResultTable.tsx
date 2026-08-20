"use client";

import { CheckResult } from "@/lib/types";
import { CheckCircle, XCircle, AlertCircle, Download, Table2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ResultTableProps {
  results: CheckResult[];
  onClear: () => void;
}

export default function ResultTable({ results, onClear }: ResultTableProps) {
  if (results.length === 0) return null;

  const liveCount = results.filter((r) => r.status === "live").length;
  const dieCount = results.filter((r) => r.status === "die").length;

  const exportCSV = () => {
    const headers = [
      "Tài Khoản", "Mật Khẩu", "Trạng Thái", "UID", "Tên LQ",
      "Rank", "Level", "Tướng", "Skin", "SS", "SSS", "Anime", "Khu Vực", "Đăng Nhập Cuối"
    ];
    const rows = results.map((r) => [
      r.tk,
      r.mk,
      r.status === "live" ? "LIVE" : "DIE",
      r.uid?.toString() || "",
      r.aov_name || "",
      r.aov_rank || "",
      r.aov_level?.toString() || "",
      r.aov_total_champs?.toString() || "",
      r.aov_total_skins?.toString() || "",
      r.aov_ss?.toString() || "",
      r.aov_sss?.toString() || "",
      r.aov_anime?.toString() || "",
      r.region || "",
      r.last_login || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `check_result_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportExcel = () => {
    const data = results.map((r, i) => ({
      "#": i + 1,
      "Tài Khoản": r.tk,
      "Mật Khẩu": r.mk,
      "Trạng Thái": r.status === "live" ? "LIVE" : "DIE",
      "UID": r.uid || "",
      "Tên LQ": r.aov_name || "",
      "Rank": r.aov_rank || "",
      "Level": r.aov_level || "",
      "Tướng": r.aov_total_champs || "",
      "Skin": r.aov_total_skins || "",
      "Skin SS": r.aov_ss || "",
      "Skin SS List": (r.aov_ss_list || []).join(", ") || "",
      "Skin SSS": r.aov_sss || "",
      "Skin SSS List": (r.aov_sss_list || []).join(", ") || "",
      "Skin Anime": r.aov_anime || "",
      "Skin Anime List": (r.aov_anime_list || []).join(", ") || "",
      "Khu Vực": r.region || "",
      "Garena Shells": r.shells || 0,
      "Email Verified": r.email_verified ? "Yes" : "No",
      "FB Linked": r.fb_linked ? "Yes" : "No",
      "Banned": r.aov_banned || "",
      "Ngày Tạo": r.garena_created || "",
      "Đăng Nhập Cuối": r.last_login || "",
      "Quốc Gia": r.last_session_country || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `check_result_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Kết Quả</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 mr-2">
            <span className="text-green-600 font-medium">{liveCount} LIVE</span>
            {" / "}
            <span className="text-red-600 font-medium">{dieCount} DIE</span>
          </span>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Table2 className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">#</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Tài Khoản</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Trạng Thái</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">UID</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Tên LQ</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Rank</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Lv</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Tướng</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Skin</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">SS</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">SSS</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Anime</th>
              <th className="text-left py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">KV</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={`${result.tk}-${index}`}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="py-3 px-2 text-zinc-500">{index + 1}</td>
                <td className="py-3 px-2 font-mono text-xs">{result.tk}</td>
                <td className="py-3 px-2">
                  {result.status === "live" ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      LIVE
                    </span>
                  ) : result.status === "die" ? (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      DIE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      ERROR
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 font-mono text-xs">{result.uid || "-"}</td>
                <td className="py-3 px-2">{result.aov_name || "-"}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    result.aov_rank?.includes("Đại Cát") ? "bg-yellow-100 text-yellow-800" :
                    result.aov_rank?.includes("Kim") ? "bg-purple-100 text-purple-800" :
                    result.aov_rank?.includes("Bạch") ? "bg-gray-100 text-gray-800" :
                    "bg-zinc-100 text-zinc-800"
                  }`}>
                    {result.aov_rank || "-"}
                  </span>
                </td>
                <td className="py-3 px-2">{result.aov_level || "-"}</td>
                <td className="py-3 px-2">{result.aov_total_champs || "-"}</td>
                <td className="py-3 px-2">{result.aov_total_skins || "-"}</td>
                <td className="py-3 px-2">
                  {result.aov_ss ? (
                    <span title={(result.aov_ss_list || []).join(", ")} className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 cursor-help">{result.aov_ss}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 px-2">
                  {result.aov_sss ? (
                    <span title={(result.aov_sss_list || []).join(", ")} className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 cursor-help">{result.aov_sss}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 px-2">
                  {result.aov_anime ? (
                    <span title={(result.aov_anime_list || []).join(", ")} className="px-2 py-0.5 rounded text-xs font-semibold bg-pink-100 text-pink-800 cursor-help">{result.aov_anime}</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs">{result.region || "-"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chi tiết khi click */}
      <div className="mt-4 space-y-2">
        {results.slice(0, 5).map((result, index) => (
          <details key={`detail-${index}`} className="group">
            <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Chi tiết: {result.tk}
            </summary>
            <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs font-mono space-y-1">
              <p>UID: {result.uid}</p>
              <p>Tên LQ: {result.aov_name}</p>
              <p>Rank: {result.aov_rank}</p>
              <p>Level: {result.aov_level}</p>
              <p>Banned: {result.aov_banned}</p>
              <p>Skin SS: {result.aov_ss} {result.aov_ss ? `(${(result.aov_ss_list || []).join(", ")})` : ""}</p>
              <p>Skin SSS: {result.aov_sss} {result.aov_sss ? `(${(result.aov_sss_list || []).join(", ")})` : ""}</p>
              <p>Skin Anime: {result.aov_anime} {result.aov_anime ? `(${(result.aov_anime_list || []).join(", ")})` : ""}</p>
              <p>Garena Shells: {result.shells}</p>
              <p>Email Verified: {result.email_verified ? "Yes" : "No"}</p>
              <p>FB Linked: {result.fb_linked ? "Yes" : "No"}</p>
              <p>Ngày tạo: {result.garena_created}</p>
              <p>Đăng nhập cuối: {result.last_login}</p>
              <p>Quốc gia: {result.last_session_country}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
