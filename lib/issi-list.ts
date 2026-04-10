/**
 * ISSI (Indeks Saham Syariah Indonesia) — Daftar saham syariah BEI
 * Update berkala setiap 6 bulan dari: https://www.idx.co.id/id/data-pasar/data-saham/indeks-saham/
 * Last updated: Desember 2024 (Periode II)
 */
export const ISSI_STOCKS = new Set([
  "AALI","ABBA","ABDA","ABMM","ACES","ACST","ADHI","ADMF","ADRO","AGII",
  "AGRO","AGRS","AHAP","AIMS","AISA","AKPI","AKRA","ALDO","ALII","ALKA",
  "ALMI","ALTO","AMAG","AMFG","AMRT","ANJT","ANTM","APIC","APII","APLN",
  "ARCI","ARGO","ARII","ARKO","ARNA","ARWI","ASGR","ASIA","ASII","ASJN",
  "ASRM","ATAP","AUTO","BABP","BAJA","BALI","BAPA","BATA","BAYU","BCIP",
  "BFIN","BHIT","BIKA","BIMA","BISI","BJBR","BKDP","BKSL","BLTZ","BLUE",
  "BMSR","BOBA","BOLT","BPII","BRAM","BRIS","BRMS","BRPT","BSSR","BSWD",
  "BTPN","BTPS","BUDI","BWPT","CAKK","CANI","CARS","CASA","CASS","CITA",
  "CLEO","CLPI","CMRY","CNTX","COCO","CPIN","CPRI","CSAP","CTRA","DADA",
  "DART","DAYA","DCII","DEWA","DILD","DKFT","DMAS","DNAR","DPNS","DSNG",
  "DSSA","DUTI","DVLA","ECII","EKAD","ELSA","EMAS","EMDE","EMTK","ENRG",
  "EPMT","ERAA","ESSA","ETWA","EXCL","FAST","FITT","FLMC","FMII","FOOD",
  "FPNI","FREN","GAMA","GEMS","GGRM","GIAA","GJTL","GLOB","GMTD","GOLD",
  "GOTO","GPRA","GSMF","GWSA","HEAL","HERO","HITA","HMSP","HOKI","HRUM",
  "IATA","IBST","ICBP","IDEA","IDPR","IFII","IGAR","IIKP","IKBI","IMAS",
  "IMJS","IMPC","INAF","INAI","INCI","INCO","INDF","INDS","INDX","INDY",
  "INKP","INPP","INRU","INTA","INTD","INTP","IPCM","IPOL","IPCC","IPTV",
  "IRRA","ISAP","ISSP","ISSL","ITMA","ITMG","JAWA","JGLE","JIHD","JKON",
  "JKSE","JPFA","JRPT","JSPT","JTPE","KAEF","KARW","KBAG","KBLF","KBLM",
  "KBRI","KCKS","KDSI","KEJU","KIJA","KINO","KLBF","KMTR","KOBX","KONI",
  "KPIG","KRAS","KREN","KSEI","LCKM","LION","LMAS","LMPI","LMSH","LPGI",
  "LPIN","LPKR","LPPF","LPPS","LSIP","LTLS","LUCK","MABA","MAIN","MAPA",
  "MAPI","MASA","MAYA","MBAP","MDKI","MDLN","MEDC","MFIN","MFMI","MGRO",
  "MIDI","MIKA","MKNT","MLBI","MLPL","MMLP","MNCN","MOLI","MPOW","MPPA",
  "MPXL","MRAT","MREI","MSKY","MTEL","MTLA","MYOH","NELY","NETV","NFCX",
  "NICL","NISP","NKYA","NOBU","NRCA","NTBK","NUSA","OCAP","OILS","OKAS",
  "OMRE","PADI","PALM","PANR","PARA","PGAS","PGEO","PGLI","PHEI","PICO",
  "PJAA","PKPK","PLAS","PLTM","PMJS","PMMP","PNBS","PNGO","PNIN","PNLF",
  "POLU","POOL","POSA","POWR","PPRE","PPRO","PTBA","PTIS","PTPP","PTRO",
  "PTSP","PTUN","PUDP","PURE","PZZA","RAJA","RANC","RDTX","RELI","RGAS",
  "RIMO","RMBA","ROTI","RUIS","SAGE","SAME","SAPX","SBIA","SBTM","SCCO",
  "SCMA","SDMU","SDPC","SDRA","SGER","SGRO","SHIP","SIDO","SILO","SIMA",
  "SIMM","SMBR","SMCB","SMDR","SMGR","SMKL","SMMT","SMSM","SNLK","SOCI",
  "SOHO","SRAJ","SRSN","SRTG","SSIA","SSMS","SSTM","STAR","STTP","SUGI",
  "SUPR","SURE","SWAT","TALF","TARA","TBIG","TBLA","TELE","TGRA","TIFA",
  "TINS","TKIM","TLKM","TMAS","TMPO","TOPS","TOTL","TOWR","TPIA","TPMA",
  "TRIL","TRIM","TRIO","TRJA","TRST","TSPC","TUGU","UANG","UCID","UNIC",
  "UNIT","UNSP","UNVR","URBN","UVCR","VINS","VKTR","VOKS","VRNA","WAPO",
  "WEGE","WIFI","WIIM","WIKA","WINS","WOOD","WSBP","WSKT","WTON","YELO",
  "YULE","ZBRA","ZINC",
]);

/** Cek apakah sebuah ticker masuk ISSI */
export function isIssi(ticker: string): boolean {
  return ISSI_STOCKS.has(ticker.toUpperCase());
}
