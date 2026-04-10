/**
 * Screener Utility Functions
 * Kalkulasi indikator teknikal: EMA, DEMA, MA, serta deteksi crossover
 */

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ScreenerResult {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  volumeYesterday: number;
  valueToday: number; // dalam rupiah
  issi: boolean;
  crossType: "golden" | "death"; // golden = bullish (DEMA cross above MA)
  dema: number;
  ma: number;
  scannedAt: string;
}

/** Hitung EMA (Exponential Moving Average) */
export function calcEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];

  // Seed dengan SMA pertama
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i];
  let ema = sum / period;
  result.push(ema);

  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

/** Hitung DEMA (Double EMA) = 2*EMA(n) - EMA(EMA(n)) */
export function calcDEMA(data: number[], period: number): number[] {
  const ema1 = calcEMA(data, period);
  if (ema1.length < period) return [];
  const ema2 = calcEMA(ema1, period);

  // Panjang DEMA = panjang ema2
  const dema: number[] = [];
  const offset = ema1.length - ema2.length;
  for (let i = 0; i < ema2.length; i++) {
    dema.push(2 * ema1[offset + i] - ema2[i]);
  }
  return dema;
}

/** Hitung MA sederhana (Simple Moving Average) */
export function calcMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j];
    result.push(sum / period);
  }
  return result;
}

/**
 * Deteksi crossover DEMA vs MA pada bar terakhir
 * golden = DEMA cross above MA (bullish)
 * death  = DEMA cross below MA (bearish)
 */
export function detectCross(
  dema: number[],
  ma: number[]
): "golden" | "death" | null {
  const len = Math.min(dema.length, ma.length);
  if (len < 2) return null;

  const d0 = dema[len - 2]; // sebelumnya
  const d1 = dema[len - 1]; // sekarang
  const m0 = ma[len - 2];
  const m1 = ma[len - 1];

  if (d0 < m0 && d1 >= m1) return "golden";
  if (d0 > m0 && d1 <= m1) return "death";
  return null;
}

/** Format angka ke Rupiah singkat (misal: 2.5M, 1.2B) */
export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

/** Ticker BEI universe (IDX80 + saham liquid lain) */
export const BEI_UNIVERSE = [
  "AALI","ABMM","ACES","ACST","ADHI","ADMF","ADRO","AGII","AGRO","AKPI",
  "AKRA","ALKA","AMRT","ANTM","APLN","ARCI","ARNA","ASGR","ASII","AUTO",
  "BAJA","BALI","BBCA","BBNI","BBRI","BBTN","BCIP","BFIN","BHIT","BJBR",
  "BKSL","BMRI","BMSR","BOBA","BOLT","BRAM","BRIS","BRMS","BRPT","BSSR",
  "BTPS","BUDI","BWPT","CLEO","CPIN","CSAP","CTRA","DCII","DILD","DMAS",
  "DSNG","DSSA","DUTI","DVLA","EKAD","ELSA","EMTK","ERAA","ESSA","EXCL",
  "FAST","GEMS","GGRM","GIAA","GJTL","GOTO","GPRA","GWSA","HEAL","HMSP",
  "HRUM","ICBP","IGAR","IMAS","INCO","INDF","INDS","INDY","INKP","INTP",
  "ITMG","JPFA","JRPT","JSPT","KAEF","KBLI","KBLF","KIJA","KINO","KLBF",
  "LPPF","LSIP","LTLS","MAPA","MAPI","MASA","MBAP","MDLN","MEDC","MFIN",
  "MIDI","MIKA","MLBI","MNCN","MPPA","MTEL","MTLA","MYOH","NRCA","PGAS",
  "PGEO","PJAA","PLTM","POWR","PTBA","PTPP","PTRO","ROTI","SCCO","SCMA",
  "SGRO","SIDO","SILO","SMBR","SMDR","SMGR","SMSM","SOCI","SSIA","SSMS",
  "STTP","TBIG","TBLA","TELE","TINS","TKIM","TLKM","TOWR","TPIA","TRIM",
  "TRST","TSPC","UNSP","UNVR","WEGE","WIFI","WIIM","WIKA","WINS","WOOD",
  "WSKT","WTON",
];
