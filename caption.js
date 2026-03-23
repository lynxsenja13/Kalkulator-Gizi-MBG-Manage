// ===============================
// 🧠 FILTER LIBUR
// ===============================
function isAktif(kategori) {
  return !AppState.libur[kategori];
}

// ===============================
// 🍱 CAPTION OMPRENGAN
// ===============================
function generateCaptionOmprengan() {
  AppState.mode = "OMPRENGAN"; // ✅ penting

  const gizi = getGiziAktif();
  const menu = getMenu();

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
 • Energi: ${g.ENERGI || 0} kkal
 • Protein: ${g.PROTEIN || 0} gr
 • Lemak: ${g.LEMAK || 0} gr
 • Karbohidrat: ${g.KARBOHIDRAT || 0} gr
 • Serat: ${g.SERAT || 0} gr
`;
}

function generateCaptionSnack() {
  AppState.mode = "SNACK"; // ✅ penting

  const gizi = getGiziAktif();

  let teks = "";

  if (isAktif("balita"))
    teks += blokSnack("Balita", gizi.BALITA);

  if (isAktif("bumil"))
    teks += blokSnack("Bumil & Busui", gizi.BUMIL);

  teks += blokSnack("Porsi Kecil", gizi.ANAK);
  teks += blokSnack("Porsi Besar", gizi.DEWASA);

  teks += `
🌿 “Makan bergizi, tubuh berenergi!”

#SPPGCicadas01 #MBG`;

  return teks;
}

function blokSnack(nama, g) {
  if (!g) return "";

  return `
Analisis Nilai Gizi Menu Keringan ${nama}
 • Energi: ${g.ENERGI || 0} kkal
 • Protein: ${g.PROTEIN || 0} gr
 • Lemak: ${g.LEMAK || 0} gr
 • Karbohidrat: ${g.KARBOHIDRAT || 0} gr
 • Serat: ${g.SERAT || 0} gr

`;
}
