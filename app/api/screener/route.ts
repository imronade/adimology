/**
 * API Route: /api/screener
 * Screener saham BEI dengan syarat:
 *  - Harga 50–1000
 *  - [Opsional] Label ISSI
 *  - DEMA(20) cross MA(20) pada TF 3 menit
 *  - Volume hari ini > volume hari kemarin
 *  - Value transaksi >= 2.5 Miliar
 *
 * ENV yang dibutuhkan:
 *  TWELVE_DATA_API_KEY  — https://twelvedata.com/
 */

import { NextRequest, NextResponse } from "next/server";
import { isIssi, ISSI_STOCKS } from "@/lib/issi-list";
import {
  calcDEMA,
  calcMA,
  detectCross,
  BEI_UNIVERSE,
  type ScreenerResult,
  type Candle,
} from "@/lib/screener-utils";

const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY ?? "";
const VALUE_MIN = 2_500_000_000; // 2.5 Miliar
const PRICE_MIN = 50;
const PRICE_MAX = 1000;
const DEMA_PERIOD = 20;
const MA_PERIOD = 20;
const TF = "3min";
const CANDLES_NEEDED = 80; // ambil lebih banyak agar kalkulasi akurat

// ─── Yahoo Finance daily helper ───────────────────────────────────────────────

interface YFDaily {
  price: number;
  change: number;
  changePct: number;
  volume: number;
  volumeYesterday: number;
  valueToday: number;
  name: string;
}

async function fetchYFDaily(ticker: string): Promise<YFDaily | null> {
  try {
    const symbol = `${ticker}.JK`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d&includePrePost=false`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const quotes = result.indicators?.quote?.[0];
    const closes: number[] = quotes?.close ?? [];
    const volumes: number[] = quotes?.volume ?? [];
    const meta = result.meta;

    const len = closes.length;
    if (len < 2) return null;

    const price = closes[len - 1] ?? meta?.regularMarketPrice ?? 0;
    const prevClose = closes[len - 2] ?? closes[len - 1];
    const volumeToday = volumes[len - 1] ?? 0;
    const volumeYesterday = volumes[len - 2] ?? 0;

    return {
      price,
      change: price - prevClose,
      changePct: ((price - prevClose) / prevClose) * 100,
      volume: volumeToday,
      volumeYesterday,
      // Nilai transaksi = harga × volume × 100 lot (setiap lot = 100 lembar)
      // Namun Yahoo volume sudah dalam lembar, jadi cukup price × volume
      valueToday: price * volumeToday,
      name: meta?.longName ?? meta?.shortName ?? ticker,
    };
  } catch {
    return null;
  }
}

// ─── Twelve Data 3-min candles ────────────────────────────────────────────────

async function fetchCandles(ticker: string): Promise<Candle[]> {
  if (!TWELVE_DATA_KEY) return [];

  const symbol = `${ticker}/IDX`;
  const url =
    `https://api.twelvedata.com/time_series` +
    `?symbol=${symbol}&interval=${TF}&outputsize=${CANDLES_NEEDED}` +
    `&apikey=${TWELVE_DATA_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const json = await res.json();
    if (json.status === "error" || !json.values) return [];

    // Twelve Data mengembalikan data terbaru di atas — reverse agar kronologis
    return (json.values as Array<Record<string, string>>)
      .reverse()
      .map((v) => ({
        time: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume ?? "0"),
      }));
  } catch {
    return [];
  }
}

// ─── Analisis sinyal satu saham ───────────────────────────────────────────────

async function analyzeStock(
  ticker: string,
  onlyIssi: boolean
): Promise<ScreenerResult | null> {
  // Filter ISSI lebih awal agar tidak buang kredit API
  if (onlyIssi && !isIssi(ticker)) return null;

  // Step 1: Data harian (Yahoo Finance)
  const daily = await fetchYFDaily(ticker);
  if (!daily) return null;

  const { price, volume, volumeYesterday, valueToday, change, changePct, name } =
    daily;

  // Filter harga
  if (price < PRICE_MIN || price > PRICE_MAX) return null;

  // Filter value transaksi minimal 2.5 Miliar
  if (valueToday < VALUE_MIN) return null;

  // Filter volume hari ini > volume kemarin
  // Catatan: ideally dibandingkan dengan "volume beli" kemarin dari data broker.
  // Karena keterbatasan API publik, di sini menggunakan volume total sebagai proksi.
  if (volume <= volumeYesterday) return null;

  // Step 2: Candle 3 menit via Twelve Data
  const candles = await fetchCandles(ticker);
  if (candles.length < DEMA_PERIOD + MA_PERIOD) return null;

  const closes = candles.map((c) => c.close);
  const demaArr = calcDEMA(closes, DEMA_PERIOD);
  const maArr = calcMA(closes, MA_PERIOD);

  const cross = detectCross(demaArr, maArr);
  if (!cross) return null; // Tidak ada crossover — skip

  return {
    ticker,
    name,
    price,
    change,
    changePct,
    volume,
    volumeYesterday,
    valueToday,
    issi: isIssi(ticker),
    crossType: cross,
    dema: demaArr[demaArr.length - 1],
    ma: maArr[maArr.length - 1],
    scannedAt: new Date().toISOString(),
  };
}

// ─── Util: delay agar tidak rate-limit Twelve Data ──────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const onlyIssi = searchParams.get("issi") === "true";
  const crossFilter = searchParams.get("cross") ?? "golden"; // "golden" | "death" | "both"

  // Pilih universe
  let universe: string[] = BEI_UNIVERSE;
  if (onlyIssi) {
    universe = universe.filter((t) => isIssi(t));
  }

  const results: ScreenerResult[] = [];
  const BATCH = 5; // proses 5 saham sekaligus

  for (let i = 0; i < universe.length; i += BATCH) {
    const batch = universe.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map((t) => analyzeStock(t, false)) // ISSI sudah difilter di universe
    );

    for (const s of settled) {
      if (s.status === "fulfilled" && s.value) {
        const r = s.value;
        const matchCross =
          crossFilter === "both" ||
          (crossFilter === "golden" && r.crossType === "golden") ||
          (crossFilter === "death" && r.crossType === "death");
        if (matchCross) results.push(r);
      }
    }

    // Jeda kecil antar batch agar tidak kena rate limit
    if (i + BATCH < universe.length) await delay(300);
  }

  // Urutkan: value transaksi terbesar dulu
  results.sort((a, b) => b.valueToday - a.valueToday);

  return NextResponse.json({
    ok: true,
    count: results.length,
    scannedAt: new Date().toISOString(),
    results,
  });
}
