function updateJumlahLaporan() {

  const textarea = document.getElementById("captionOutput");

  // 🔥 SIMPAN CURSOR SEBELUM UPDATE
  const cursorPos = textarea.selectionStart;

  // 🔥 SIMPAN VALUE LAMA
  const oldValue = textarea.value;

  let text = oldValue;

  // Ambil semua angka dari poin daftar
  const regex = /^\d+\.\s.*?=\s*(\d+)/gm;

  const numbers = [];

  let match;

  while ((match = regex.exec(text)) !== null) {
    numbers.push(parseInt(match[1]) || 0);
  }

  // =========================
  // JUMLAH PENERIMA
  // poin 3 + 4 + 5 + 6
  // =========================
  const jumlahPenerima =
      (numbers[2] || 0) +
      (numbers[3] || 0) +
      (numbers[4] || 0) +
      (numbers[5] || 0);

  // =========================
  // JUMLAH MAKAN
  // semua poin
  // =========================
  const jumlahMakan =
      numbers.reduce((a, b) => a + b, 0);

  // Replace jumlah penerima
  text = text.replace(
    /Jumlah penerima sebanyak \*[\d.]+\* orang\./,
    `Jumlah penerima sebanyak *${jumlahPenerima}* orang.`
  );

  // Replace jumlah makan
  text = text.replace(
    /Jumlah makan : \*[\d.]+\* porsi\./,
    `Jumlah makan : *${jumlahMakan}* porsi.`
  );

  // 🔥 HITUNG SELISIH PANJANG
  const diff = text.length - oldValue.length;

  // 🔥 UPDATE TEXTAREA
  textarea.value = text;

  // 🔥 RESTORE CURSOR
  const newCursor = cursorPos + diff;

  textarea.setSelectionRange(newCursor, newCursor);

}
