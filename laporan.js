// ===============================
// 📊 DATA MASTER (BISA EDIT)
// ===============================
const DATA_SPPG = {
  nama: "Yayasan Pangan Mandiri Barokah Dapur Cicadas 01",
  lokasi: "Jalan Brigjen Katamso RT.10 RW.13 Kel.Cicadas Kec.Cibeunying Kidul Kota Bandung",
  kepala: "Tata Dhea Wimala/087892330960",
  gizi: "Aliyah Khairunnisa Syafitri/089664825252",
  akuntan: "Febrianto/082121312500",
  karyawan: 44
};

// ===============================
// 📊 JUMLAH PENERIMA DEFAULT
// ===============================
const DEFAULT_PENERIMA = {
  balita: 211,
  bumil: 125,
  sdyas: 186,
  smp: 630,
  sma: 534,
  awig: 1015,
  guru_sd: 17,
  guru_smp: 35,
  guru_sma: 37,
  guru_awig: 62,
  posyandu: 5
};

// ===============================
// 📅 FORMAT TANGGAL
// ===============================
function getTanggalFull() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ===============================
// 🧠 HITUNG DENGAN LOGIKA LIBUR
// ===============================
function getPenerimaFix() {
  const l = window.liburKategori;
  const d = { ...DEFAULT_PENERIMA };

  if (l.balita || l.bumil) {
    d.balita = 0;
    d.bumil = 0;
    d.posyandu = 0;
  }

  if (l.sd) {
    d.sdyas = 0;
    d.guru_sd = 0;
  }

  if (l.smp) {
    d.smp = 0;
    d.guru_smp = 0;
  }

  if (l.sma) {
    d.sma = 0;
    d.guru_sma = 0;
  }

  if (l.awig) {
    d.awig = 0;
    d.guru_awig = 0;
  }

  return d;
}

// ===============================
// 📊 HITUNG TOTAL
// ===============================
function hitungTotal(d) {
  const penerima =
    d.sdyas + d.smp + d.sma + d.awig;

  const makan =
    Object.values(d).reduce((a, b) => a + b, 0);

  return { penerima, makan };
}

// ===============================
// 📊 GENERATE LAPORAN HARIAN
// ===============================
function generateLaporanHarian() {
  const d = getPenerimaFix();
  const total = hitungTotal(d);
  const menu = getMenuList();

  let teks = `
Yth. Dandim 0618/Kota Bandung
Cc. Pasiter Kodim 0618/Kota Bandung

Selamat Pagi Komandan,
Izin melaporkan, pada hari ${getTanggalFull()} telah dilaksanakan kegiatan Pembagian Makan Bergizi Gratis operasional Unit SPPG Khusus/Hybrid.

A. SPPG : ${DATA_SPPG.nama}
B. Lokasi : ${DATA_SPPG.lokasi}
C. Personel :
1. Kepala SPPG/No tlp : ${DATA_SPPG.kepala}
2. Ahli Gizi/No tlp : ${DATA_SPPG.gizi}
3. Akuntan/No tlp : ${DATA_SPPG.akuntan}
4. Jml Karyawan : ${DATA_SPPG.karyawan}

D. Jumlah penerima sebanyak *${total.penerima}* orang.
1. BALITA = ${d.balita}
2. BUMIL & BUSUI = ${d.bumil}
3. SD YAS = ${d.sdyas}
4. SMP YAS = ${d.smp}
5. SMA YAS = ${d.sma}
6. SDN Awi Gombong = ${d.awig}
7. Guru & Tendik SD YAS = ${d.guru_sd}
8. Guru & Tendik SMP YAS = ${d.guru_smp}
9. Guru & Tendik SMA YAS = ${d.guru_sma}
10. Guru & Tendik SD Awi Gombong = ${d.guru_awig}
11. PIC POSYANDU = ${d.posyandu}

Jumlah makan : *${total.makan}* porsi.

E. Menu Makan hari ini ${getTanggalFull()}
${menu.map((m,i)=>`${i+1}. ${m}`).join("\n")}

Demikian kami laporkan.
Dokumentasi terlampir.
`;

  return teks;
}

// ===============================
// 🎯 HANDLER + MODAL LIBUR
// ===============================
function bukaModalLiburGenerate(type) {
  window.generateType = type;
  document.getElementById("modalLibur").style.display = "flex";
}

function lanjutkanGenerate() {
  syncLiburDariModal();

  let hasil = "";

  if (window.generateType === "harian") {
    hasil = generateLaporanHarian();
  } else if (window.generateType === "gizi") {
    hasil = generateLaporanGizi();
  }

  document.getElementById("captionOutput").value = hasil;
  tutupModalLibur();
}

// ===============================
// 🔄 SYNC LIBUR (PENTING)
// ===============================
function syncLiburDariModal() {
  window.liburKategori = {
    balita: document.getElementById("libur_balita").checked,
    bumil: document.getElementById("libur_bumil").checked,
    sd: document.getElementById("libur_sdyas").checked,
    smp: document.getElementById("libur_smpyas").checked,
    sma: document.getElementById("libur_smayas").checked,
    awig: document.getElementById("libur_awig").checked
  };
}

function generateLaporanGizi() {
  const gizi = window.hasilGiziPerKategori || {};
  const menu = getMenuList();
  const tgl = getTanggalFull();

  let teks = `Assalamualaikum wr.wb, Selamat Pagi.
Izin menginformasikan, untuk menu hari ini.
Tanggal : ${tgl}

*Menu:* 
${menu.map((m, i) => `${i + 1}. ${m}`).join("\n")}
`;

  // ===============================
  // 🔥 BLOK PER KATEGORI (AUTO SKIP LIBUR)
  // ===============================
  if (!window.liburKategori.balita && gizi.BALITA) {
    teks += blokGizi("Balita", gizi.BALITA);
  }

  if (!window.liburKategori.bumil && gizi.BUMIL) {
    teks += blokGizi("Bumil & Busui", gizi.BUMIL);
  }

  if (!window.liburKategori.sd && gizi.ANAK) {
    teks += blokGizi("SD 1-3", gizi.ANAK);
    teks += blokGizi("SD 4-6", gizi.ANAK);
  }

  if (!window.liburKategori.smp && gizi.REMAJA) {
    teks += blokGizi("SMP", gizi.REMAJA);
  }

  if (!window.liburKategori.sma && gizi.DEWASA) {
    teks += blokGizi("SMA", gizi.DEWASA);
  }

  return teks;
}

function blokGizi(nama, g) {
  return `

*🥗 Analisis Nilai Gizi ${nama} 🥗*
 • Energi: ${g.ENERGI} kkal
 • Protein: ${g.PROTEIN} gr
 • Lemak: ${g.LEMAK} gr
 • Karbohidrat: ${g.KARBOHIDRAT} gr
 • Zat Besi: ${g.ZAT_BESI || 0} mg
 • Serat: ${g.SERAT} gr
`;
}
