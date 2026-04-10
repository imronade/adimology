"use client";

/**
 * Halaman Screener — /screener
 * Screener saham BEI: DEMA(20) × MA(20) TF 3 menit
 * Syarat: Harga 50–1000, ISSI opsional, Vol↑, Value ≥ 2.5B
 */

import { useState, useCallback } from "react";
import { Search, RefreshCw, TrendingUp, TrendingDown, Filter, ShieldCheck, Activity } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  volumeYesterday: number;
  valueToday: number;
  issi: boolean;
  crossType: "golden" | "death";
  dema: number;
  ma: number;
  scannedAt: string;
}

interface ScreenerResponse {
  ok: boolean;
  count: number;
  scannedAt: string;
  results: ScreenerResult[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

function fmtValue(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return fmt(v);
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScreenerPage() {
  // Filter state
  const [onlyIssi, setOnlyIssi] = useState(false);
  const [crossFilter, setCrossFilter] = useState<"golden" | "death" | "both">("golden");

  // Screener state
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScreenerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const runScreener = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setProgress(0);

    // Simulasi progress (karena proses backend bisa 30–120 detik)
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 90));
    }, 1000);

    try {
      const params = new URLSearchParams({
        issi: String(onlyIssi),
        cross: crossFilter,
      });

      const res = await fetch(`/api/screener?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ScreenerResponse = await res.json();
      setData(json);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menjalankan screener");
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
    }
  }, [onlyIssi, crossFilter]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-emerald-400" size={28} />
          <h1 className="text-2xl font-bold tracking-tight">
            Screener — DEMA × MA
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          TF 3 Menit · Harga Rp50–1.000 · Volume↑ · Value ≥ 2.5B
        </p>
      </div>

      {/* Filter Panel */}
      <div className="rounded-xl border border-gray-700 bg-gray-900/60 backdrop-blur p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-300">
          <Filter size={14} />
          <span>Filter Screener</span>
        </div>

        <div className="flex flex-wrap gap-6 items-end">
          {/* ISSI Toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              Label ISSI (Syariah)
            </label>
            <button
              onClick={() => setOnlyIssi((v) => !v)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none
                ${onlyIssi ? "bg-emerald-500" : "bg-gray-600"}`}
              aria-pressed={onlyIssi}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
                  ${onlyIssi ? "translate-x-8" : "translate-x-1"}`}
              />
            </button>
            <span className="text-xs text-gray-500">
              {onlyIssi ? "Hanya saham ISSI" : "Semua saham BEI"}
            </span>
          </div>

          {/* Cross Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">
              Arah Crossover
            </label>
            <div className="flex gap-2">
              {(["golden", "death", "both"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setCrossFilter(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${crossFilter === v
                      ? v === "golden"
                        ? "bg-emerald-500 text-white"
                        : v === "death"
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  {v === "golden" ? "🟢 Bullish" : v === "death" ? "🔴 Bearish" : "⚡ Keduanya"}
                </button>
              ))}
            </div>
          </div>

          {/* Info readonly */}
          <div className="flex flex-col gap-2 opacity-60">
            <label className="text-xs text-gray-400 font-medium">Rentang Harga</label>
            <div className="text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
              Rp 50 — Rp 1.000
            </div>
          </div>

          <div className="flex flex-col gap-2 opacity-60">
            <label className="text-xs text-gray-400 font-medium">Nilai Transaksi Min</label>
            <div className="text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
              ≥ Rp 2,5 Miliar
            </div>
          </div>

          <div className="flex flex-col gap-2 opacity-60">
            <label className="text-xs text-gray-400 font-medium">Timeframe</label>
            <div className="text-sm font-mono bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
              3 Menit
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={runScreener}
            disabled={loading}
            className={`ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
              }`}
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {loading ? "Scanning..." : "Jalankan Screener"}
          </button>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Memindai saham BEI...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Proses ini dapat memakan 30–120 detik tergantung jumlah saham
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/20 p-4 mb-6 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Ditemukan{" "}
              <span className="font-bold text-white">{data.count}</span> saham
            </div>
            <div className="text-gray-500">
              Scan selesai: {fmtTime(data.scannedAt)}
            </div>
            {onlyIssi && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-900/30 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Filter ISSI aktif
              </div>
            )}
          </div>

          {data.count === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Activity size={40} className="mx-auto mb-3 opacity-30" />
              <p>Tidak ada saham yang memenuhi syarat saat ini.</p>
              <p className="text-xs mt-1">Coba ubah filter atau jalankan kembali di sesi trading.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Saham</th>
                    <th className="text-right px-4 py-3">Harga</th>
                    <th className="text-right px-4 py-3">Change</th>
                    <th className="text-right px-4 py-3">Volume</th>
                    <th className="text-right px-4 py-3">Vol Kmrn</th>
                    <th className="text-right px-4 py-3">Nilai</th>
                    <th className="text-center px-4 py-3">Cross</th>
                    <th className="text-right px-4 py-3">DEMA</th>
                    <th className="text-right px-4 py-3">MA</th>
                    <th className="text-center px-4 py-3">ISSI</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((r, i) => (
                    <tr
                      key={r.ticker}
                      className={`border-t border-gray-800 hover:bg-gray-800/40 transition-colors
                        ${i % 2 === 0 ? "bg-gray-900/20" : "bg-transparent"}`}
                    >
                      {/* Ticker */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{r.ticker}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[140px]">
                          {r.name}
                        </div>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        {fmt(Math.round(r.price))}
                      </td>

                      {/* Change */}
                      <td
                        className={`px-4 py-3 text-right font-mono text-xs
                          ${r.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        <div>{r.change >= 0 ? "+" : ""}{fmt(Math.round(r.change))}</div>
                        <div className="opacity-70">
                          {r.changePct >= 0 ? "+" : ""}
                          {r.changePct.toFixed(2)}%
                        </div>
                      </td>

                      {/* Volume hari ini */}
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-300">
                        {fmtValue(r.volume)}
                      </td>

                      {/* Volume kemarin */}
                      <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                        {fmtValue(r.volumeYesterday)}
                      </td>

                      {/* Nilai transaksi */}
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-yellow-400">
                        {fmtValue(r.valueToday)}
                      </td>

                      {/* Cross type */}
                      <td className="px-4 py-3 text-center">
                        {r.crossType === "golden" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                            <TrendingUp size={14} />
                            Golden
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                            <TrendingDown size={14} />
                            Death
                          </span>
                        )}
                      </td>

                      {/* DEMA */}
                      <td className="px-4 py-3 text-right font-mono text-xs text-purple-400">
                        {r.dema.toFixed(0)}
                      </td>

                      {/* MA */}
                      <td className="px-4 py-3 text-right font-mono text-xs text-blue-400">
                        {r.ma.toFixed(0)}
                      </td>

                      {/* ISSI badge */}
                      <td className="px-4 py-3 text-center">
                        {r.issi ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
                            <ShieldCheck size={13} />
                            <span className="hidden sm:inline">ISSI</span>
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer note */}
          <p className="text-xs text-gray-600 mt-3">
            * Volume dibandingkan dengan total volume hari kemarin (proksi; untuk &quot;volume beli&quot; akurat gunakan data broker dari Stockbit).
            Data intraday 3 menit via Twelve Data API.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="text-center py-20 text-gray-600">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-1">Siap untuk scan</p>
          <p className="text-sm">
            Atur filter di atas, lalu klik{" "}
            <span className="text-emerald-400 font-semibold">Jalankan Screener</span>
          </p>
        </div>
      )}
    </div>
  );
}
