// ===============================
// 🧠 FILTER LIBUR
// ===============================
function isAktif(kategori) {
  return !window.liburKategori[kategori];
}

// ===============================
// 🍱 CAPTION OMPRENGAN
// ===============================
function generateCaptionOmprengan() {
  const gizi = window.hasilGiziPerKategori;
  const menu = getMenuList();

  let teks = `🍱 Menu Bergizi Gratis\n📅 ${getTanggalFull()}\n\n`;

  teks += "🥗 Menu:\n";
  teks += menu.map(m => ` • ${m}`).join("\n");

  teks += "\n\n⚖️ Kandungan Gizi (per porsi):\n\n";

  if (isAktif("balita")) teks += blok("Balita", gizi.BALITA);
  if (isAktif("bumil")) teks += blok("Bumil & Busui", gizi.BUMIL);
  if (isAktif("sd")) teks += blok("SD", gizi.ANAK);
  if (isAktif("smp")) teks += blok("SMP", gizi.REMAJA);
  if (isAktif("sma")) teks += blok("SMA", gizi.DEWASA);

  teks += `\n🌿 “Makan bergizi, tubuh berenergi!”\n\n#SPPGCicadas01`;

  return teks;
}

// ===============================
// 🔹 BLOK GIZI
// ===============================
function blok(nama, g) {
  if (!g) return "";

  return `
Analisis Nilai Gizi ${nama}
 • Energi: ${g.ENERGI} kkal
 • Protein: ${g.PROTEIN} gr
 • Lemak: ${g.LEMAK} gr
 • Karbohidrat: ${g.KARBOHIDRAT} gr
 • Serat: ${g.SERAT} gr
`;
}
