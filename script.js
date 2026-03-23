//Masih Error

const AppState = {
  mode: "OMPRENGAN",

  bahan: {
    OMPRENGAN: [],
    SNACK: []
  },

  hasilGizi: {
    OMPRENGAN: {},
    SNACK: {}
  },

  menu: [],

  libur: {
    balita: false,
    bumil: false,
    awig: false,
    sdyas: false,
    smpyas: false,
    smayas: false
  }
};

let bahanMaster = {
  OMPRENGAN: {
    gizi: {},
    detail: []
  },
  SNACK: {
    gizi: {},
    detail: []
  }
};

window.dataSpreadsheet = {
  OMPRENGAN: {
    gizi: {},
    detail: []
  },
  SNACK: {
    gizi: {},
    detail: []
  }
};

window.hasilGizi = {
  OMPRENGAN: {},
  SNACK: {}
};

const STATE = {
  modeKategori:"SEMUA",
  mainTab:"laporan",
  subTab:"harian",
  subTabCaption:"omprengan"
}
let modeGenerate = null;
let autocompleteInitialized = false;
let modeMenu = "OMPRENGAN";
let kategoriLibur = {};
let jenisGenerate = "";

const MAP_KATEGORI = {
  BALITA: "Balita",
  BUMIL: "Bumil & Busui",
  SD1: "SD 1-3",
  SD2: "SD 4-6",
  SMP: "SMP",
  SMA: "SMA"
};

const mapLibur = {
  "Balita": "libur_balita",
  "Bumil & Busui": "libur_bumil",
  "SD Awi Gombong": "libur_awig",
  "SD YAS": "libur_sdyas",
  "SMP YAS": "libur_smpyas",
  "SMA YAS": "libur_smayas"
};
let kategoriData = {
  OMPRENGAN: {},
  SNACK: {}
};

let database = [];
let databaseLoaded = false;
let pendingNama = null;
let pendingBerat = null;
let menuHarian = [""];
let modeKategori = "SEMUA";
let modeMenuLaporan = "semua"; 
let menuSemua = [""];
let menuBalita = [""];
let menuSekolah = [""];
let liburLaporan = {};
let subTabAktif = "harian"; // default
let mainTabAktif = "laporan";
let subTabCaptionAktif = "omprengan";

const MAP_POPUP_TO_GIZI = {
  "Balita": ["Balita"],
  "Bumil & Busui": ["Bumil & Busui"],
  "SD Awi Gombong": ["SD 1-3","SD 4-6"],
  "SD YAS": ["SD 1-3","SD 4-6"],
  "SMP YAS": ["SMP"],
  "SMA YAS": ["SMA"]
};

// ================= DATA PENERIMA =================
const PENERIMA_DEFAULT = {
  "BALITA": 211,
  "BUMIL & BUSUI": 125,

  "SD Awi Gombong": 1015,
  "SD YAS": 186,

  "SMP YAS": 630,
  "SMA YAS": 534,

  "Guru & Tendik SD Awi Gombong": 62,
  "Guru & Tendik SD YAS": 17,
  "Guru & Tendik SMP YAS": 35,
  "Guru & Tendik SMA YAS": 37,

  "PIC POSYANDU": 5
};

const KATEGORI_SEKOLAH = {
  SD_AWI: "SD Awi Gombong",
  SD_YAS: "SD YAS",
  SMP: "SMP YAS",
  SMA: "SMA YAS"
};

function setModeMenu(menu) {
  modeMenu = menu;

  renderKategori();

  document.getElementById("btnOmprengan").classList.remove("active-omprengan");
  document.getElementById("btnSnack").classList.remove("active-snack");

  if (menu === "OMPRENGAN") {
    document.getElementById("btnOmprengan").classList.add("active-omprengan");
  } else {
    document.getElementById("btnSnack").classList.add("active-snack");
  }

  renderList();
  generateLaporan();
}

function getNamaBahan(obj) {
  const key = Object.keys(obj).find(k =>
    k.toLowerCase().replace(/\s/g, "") === "namabahan"
  );
  return key ? String(obj[key]).toLowerCase().trim() : "";
}

function setModeKategori(value) {
  modeKategori = value;
}

// =====================
// MODAL FUNCTION
// =====================
function showModal(nama) {
  pendingNama = nama;

  document.getElementById("modalTitle").innerText =
    "Tambah Gizi: " + nama;

  document.getElementById("modalGizi").style.display = "flex";

  setTimeout(() => {
    document.getElementById("mEnergi").focus();
  }, 100);
}

function tutupModal() {
  const modal = document.getElementById("modalGizi");
  modal.style.opacity = "0";

  setTimeout(() => {
    modal.style.display = "none";
    modal.style.opacity = "1";
  }, 200);
}

window.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("modalGizi");
  if (modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === this) {
        tutupModal();
      }
    });
  }
});

function simpanGizi() {
  const btn = document.querySelector(".btn-save");
if (btn) {
  btn.innerText = "Menyimpan...";
  btn.disabled = true;
}
  const newItem = {
  "nama bahan": pendingNama.toLowerCase().trim(),
  ENERGI: Number(document.getElementById("mEnergi").value) || 0,
  PROTEIN: Number(document.getElementById("mProtein").value) || 0,
  LEMAK: Number(document.getElementById("mLemak").value) || 0,
  KARBOHIDRAT: Number(document.getElementById("mKarbo").value) || 0,
  KALSIUM: Number(document.getElementById("mKalsium").value) || 0,
  SERAT: Number(document.getElementById("mSerat").value) || 0
};

  const namaBaru = pendingNama;
  const beratBaru = pendingBerat;

  // ✅ simpan ke local database
  database.push(newItem);
  database = [...database]; // trigger refresh reference
  saveCache();

  // ✅ TAMBAHKAN KE SPREADSHEET (INI TEMPATNYA)
  fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({
    nama: newItem["nama bahan"],
    ENERGI: newItem.ENERGI,
    PROTEIN: newItem.PROTEIN,
    LEMAK: newItem.LEMAK,
    KARBOHIDRAT: newItem.KARBOHIDRAT,
    KALSIUM: newItem.KALSIUM,
    SERAT: newItem.SERAT
  })
})
.then(res => res.json())
.then(res => console.log("Sync sukses:", res))
.catch(err => console.error("Sync gagal:", err));

// ✅ lanjut logic biasa
bahanMaster[modeMenu].detail.push({
  nama: namaBaru,
  berat: beratBaru,
  satuan: document.getElementById("satuanBahan")?.value || "GRAM"
});

const selected = ambilKategoriDipilih();

if (selected.includes("SEMUA") || selected.length === 0) {

  getKategoriAktif().forEach(k => {
    const berat = pendingBerat;
const satuan = document.getElementById("satuanBahan")?.value || "GRAM";

kategoriData[modeMenu][k].push({
  nama: namaBaru.trim(),
  berat,
  satuan
});
  });

} else {

  selected.forEach(k => {
  kategoriData[modeMenu][k].push({
    nama: namaBaru.trim(),
    berat,
    satuan
  });
});

}

tutupModal();

pendingNama = null;
pendingBerat = null;

renderList();
generateLaporan();
initAutocomplete();

// ❌ HAPUS loadDatabase()
}
function toggleLibur(kategori, status) {
  window.statusLibur = window.statusLibur || {};
  window.statusLibur[kategori] = status;

  renderHasilGizi(window.hasilGiziPerKategori);
}

function syncLiburModal(){
  Object.keys(mapLibur).forEach(kat=>{
    const el = document.getElementById(mapLibur[kat]);
    if(el){
      el.checked = kategoriLibur[kat] || false;
    }
  });
}

const KATEGORI = {
OMPRENGAN: [
"Balita",
"Bumil & Busui",
"SD 1-3",
"SD 4-6",
"SMP",
"SMA"
],
SNACK: [
"Balita",
"Bumil & Busui",
"Keringan Porsi Kecil",
"Keringan Porsi Besar"
]
};

const kategoriOmprengan = KATEGORI.OMPRENGAN;
const kategoriSnack = KATEGORI.SNACK;

function getKategoriAktif() {
  return modeMenu === "OMPRENGAN"
    ? kategoriOmprengan
    : kategoriSnack;
}

function initKategoriLogic(){

const semua = document.getElementById("kategoriSemua");
const kategori = document.querySelectorAll(".kategori-check");

if(!semua) return;

/* default */
semua.checked = true;
kategori.forEach(k => k.checked = false);

/* klik semua */

semua.addEventListener("change", function(){

if(this.checked){
kategori.forEach(k => k.checked = false);
}

});

/* klik kategori lain */

kategori.forEach(k=>{

k.addEventListener("change", function(){

if(this.checked){
semua.checked = false;
}

const adaYangDipilih = [...kategori].some(cb => cb.checked);

if(!adaYangDipilih){
semua.checked = true;
}

});

});

}

function cekKategoriKosong(){

const kategori = document.querySelectorAll(".kategori-check:checked");
const semua = document.getElementById("kategoriSemua");

if(kategori.length === 0){
semua.checked = true;
}

}

// ================= AKG TARGET =================
const AKG = {
  "Balita": {
    Energi: 343.75,
    Protein: 5.75,
    Lemak: 12,
    Karbohidrat: 54.5,
    Kalsium: 206.25,
    Serat: 5
  },

  "Bumil & Busui": {
    Energi: 712.5,
    Protein: 21,
    Lemak: 23.4,
    Karbohidrat: 105,
    Kalsium: 360,
    Serat: 9.9
  },

  "SD 1-3": {
    Energi: 412.5,
    Protein: 10,
    Lemak: 13.75,
    Karbohidrat: 62.5,
    Kalsium: 250,
    Serat: 5.75
  },

  "SD 4-6": {
    Energi: 585,
    Protein: 15.9,
    Lemak: 19.5,
    Karbohidrat: 87,
    Kalsium: 360,
    Serat: 8.1
  },

  "SMP": {
    Energi: 667.5,
    Protein: 20.4,
    Lemak: 22.5,
    Karbohidrat: 97.5,
    Kalsium: 360,
    Serat: 9.6
  },

  "SMA": {
    Energi: 712.5,
    Protein: 21,
    Lemak: 23.4,
    Karbohidrat: 105,
    Kalsium: 360,
    Serat: 9.9
  }
};

// ================= MAPPING AKG SNACK =================
AKG["Keringan Porsi Kecil"] = AKG["SD 1-3"];
AKG["Keringan Porsi Besar"] = AKG["SMP"];

// ================= LOAD DATABASE =================
async function loadDatabase() {
  try {

    console.log("Loading database dari API...");

    const res = await fetch(API_URL);

    database = await res.json();
    databaseLoaded = true;

    console.log("Database loaded:", database.length);

    initKategori();
    renderKategori();
    initAutocomplete();
    saveCache();

  } catch (err) {
    console.error("Gagal load database:", err);
    alert("Database gagal dimuat. Cek Apps Script.");
  }
}

function resetCache() {
  localStorage.removeItem("dbGizi");
  location.reload();
}

// ================= INIT KATEGORI =================
function initKategori() {
  ["OMPRENGAN", "SNACK"].forEach(menu => {
    const list = menu === "OMPRENGAN"
      ? kategoriOmprengan
      : kategoriSnack;

    list.forEach(k => {
      if (!kategoriData[menu][k]) {
        kategoriData[menu][k] = [];
      }
    });
  });
}

// ================= CACHE =================
function saveCache() {
  localStorage.setItem("dbGizi", JSON.stringify(database));
}

function loadCache() {

  const cache = localStorage.getItem("dbGizi");

  if (!cache) return false;

  database = JSON.parse(cache);
  databaseLoaded = true;

  console.log("Database dari cache:", database.length);

  initKategori();
  renderKategori();
  initAutocomplete();

  return true;
}

// ================= TAMBAH BAHAN =================
function tambahBahan() {
  if (!databaseLoaded) {
    alert("Tunggu database selesai load dulu");
    return;
  }

  const nama = document.getElementById("namaBahan").value.trim();
  const berat = parseFloat(document.getElementById("beratBahan").value);
  const satuan = document.getElementById("satuanBahan").value.toUpperCase();

  if (!nama || !berat) return;

  const namaFix = nama.trim().toLowerCase();

let db = database.find(d =>
  getNamaBahan(d) === namaFix
);


  // ❗ JIKA BELUM ADA → MUNCUL MODAL
  if (!db) {
  pendingNama = namaFix;
  pendingBerat = berat;
  showModal(namaFix);
  return;
}

  // ✅ MASUKKAN DATA
  bahanMaster[modeMenu].detail.push({ 
  nama: nama.trim().toLowerCase(),
  berat,
  satuan
});

  const selected = ambilKategoriDipilih();

if (selected.includes("SEMUA") || selected.length === 0) {

  getKategoriAktif().forEach(k => {
    kategoriData[modeMenu][k].push({
      nama: nama.trim(),
      berat,
      satuan
    });
  });

} else {

  selected.forEach(k => {
    if (!kategoriData[modeMenu][k]) {
      kategoriData[modeMenu][k] = [];
    }

    kategoriData[modeMenu][k].push({
      nama: nama.trim(),
      berat,
      satuan
    });
  });

}

  renderList();

  document.getElementById("namaBahan").value = "";
  document.getElementById("beratBahan").value = "";
}
// ================= RENDER LIST =================
function renderList() {
  const ul = document.getElementById("listBahan");
  ul.innerHTML = "";

  bahanMaster[modeMenu].detail.forEach(b => {
    ul.innerHTML += `<li>${b.nama} - ${b.berat} ${formatSatuan(b.satuan)}</li>`;
  });
}

// ================= HITUNG TOTAL =================
function hitungTotal(list) {
  let total = {
    Energi: 0,
    Protein: 0,
    Lemak: 0,
    Karbohidrat: 0,
    Kalsium: 0,
    Serat: 0
  };

  list.forEach(item => {

   const db = database.find(d =>
  getNamaBahan(d) === item.nama.toLowerCase().trim()
);

    if (!db) return;

    let faktor = 0;

    if (item.satuan === "GRAM") {
      faktor = item.berat / 100;
    } else {
      faktor = item.berat;
    }

    total.Energi += faktor * Number(db["ENERGI"] ?? db["energi"] ?? 0);
    total.Protein += faktor * Number(db["PROTEIN"] ?? db["protein"] ?? 0);
    total.Lemak += faktor * Number(db["LEMAK"] ?? db["lemak"] ?? 0);
    total.Karbohidrat += faktor * Number(db["KARBOHIDRAT"] ?? db["karbohidrat"] ?? 0);
    total.Kalsium += faktor * Number(db["KALSIUM"] ?? db["kalsium"] ?? 0);
    total.Serat += faktor * Number(db["SERAT"] ?? db["serat"] ?? 0);

  });

  return total;
}

function hitungGizi() {

  const hasil = {};

  const kategoriList = getKategoriAktif();

  kategoriList.forEach(kat => {

    const listBahan = kategoriData[modeMenu][kat] || [];

    const total = hitungTotal(listBahan);

    hasil[kat] = {
      ENERGI: total.Energi || 0,
      PROTEIN: total.Protein || 0,
      LEMAK: total.Lemak || 0,
      KARBOHIDRAT: total.Karbohidrat || 0,
      KALSIUM: total.Kalsium || 0,
      SERAT: total.Serat || 0
    };

  });

  return hasil;
}

function renderTabelKategori(menu, kat, dataBahan, standar) {

  // 🔧 PERBAIKAN ERROR
  if (!Array.isArray(dataBahan)) {
    console.warn("dataBahan bukan array:", dataBahan);
    dataBahan = [];
  }
  
  let total = {
    energi: 0,
    protein: 0,
    lemak: 0,
    karbo: 0,
    kalsium: 0,
    serat: 0
  };

  let html = `
  <div class="table-wrapper">
    <table class="tabel-gizi">
      <thead>
        <tr>
          <th>Nama Bahan</th>
          <th>Berat (g)</th>
          <th>Energi</th>
          <th>Protein</th>
          <th>Lemak</th>
          <th>Karbo</th>
          <th>Kalsium</th>
          <th>Serat</th>
        </tr>
      </thead>
      <tbody>
  `;

  dataBahan.forEach(item => {
    total.energi += item.energi;
    total.protein += item.protein;
    total.lemak += item.lemak;
    total.karbo += item.karbo;
    total.kalsium += item.kalsium;
    total.serat += item.serat;

    html += `
      <tr>
        <td>${item.nama}</td>
        <td>${item.berat}</td>
        <td>${item.energi.toFixed(1)}</td>
        <td>${item.protein.toFixed(1)}</td>
        <td>${item.lemak.toFixed(1)}</td>
        <td>${item.karbo.toFixed(1)}</td>
        <td>${item.kalsium.toFixed(1)}</td>
        <td>${item.serat.toFixed(1)}</td>
      </tr>
    `;
  });

  // cek kecukupan
  const cukup =
    total.energi >= standar.energi &&
    total.protein >= standar.protein &&
    total.lemak >= standar.lemak &&
    total.karbo >= standar.karbo &&
    total.kalsium >= standar.kalsium &&
    total.serat >= standar.serat;

  html += `
<tr class="total-row">
  <td colspan="2"><b>TOTAL</b></td>

  <td class="${total.energi >= standar.energi ? 'total-ok' : 'total-bad'}">
    <b>${total.energi.toFixed(1)}</b>
  </td>

  <td class="${total.protein >= standar.protein ? 'total-ok' : 'total-bad'}">
    <b>${total.protein.toFixed(1)}</b>
  </td>

  <td class="${total.lemak >= standar.lemak ? 'total-ok' : 'total-bad'}">
    <b>${total.lemak.toFixed(1)}</b>
  </td>

  <td class="${total.karbo >= standar.karbo ? 'total-ok' : 'total-bad'}">
    <b>${total.karbo.toFixed(1)}</b>
  </td>

  <td class="${total.kalsium >= standar.kalsium ? 'total-ok' : 'total-bad'}">
    <b>${total.kalsium.toFixed(1)}</b>
  </td>

  <td class="${total.serat >= standar.serat ? 'total-ok' : 'total-bad'}">
    <b>${total.serat.toFixed(1)}</b>
  </td>
</tr>
`;

  html += `
    </tbody>
    </table>
  </div>
`;
  return html;
}

function renderAKG(nutrien, total, kategori) {
  const nilai = total[nutrien] || 0;
  const target = AKG[kategori][nutrien] || 1;
  const persen = (nilai / target) * 100;

  return `
    <p>
      ${nutrien}: ${nilai.toFixed(1)}
      <span style="color:#2b7cff">
        (${persen.toFixed(1)}%)
      </span>
    </p>
  `;
}

// ================= EDITABLE BERAT =================
function renderEditableList(menu, kat) {

  const list = kategoriData[menu][kat] || [];

  let html = `<div class="editable-list">`;

  list.forEach((item,i)=>{

    html += `
      <div class="bahan-row">

        <div class="bahan-nama">
          ${item.nama}
        </div>

        <div class="bahan-edit">

          <input
            type="number"
            value="${item.berat}"
            onchange="editBerat('${menu}','${kat}',${i},this.value)"
          >

          <span>${item.satuan}</span>

          <button
            class="btn-hapus"
            onclick="hapusBahan('${menu}','${kat}',${i})">
            ❌
          </button>

        </div>

      </div>
    `;

  });

  html += `</div>`;

  return html;
}

function editBerat(menu, kat, index, value) {
  kategoriData[menu][kat][index].berat = parseFloat(value) || 0;
  renderList();
  generateLaporan();
}

function hapusBahan(menu, kat, index) {
  const item = kategoriData[menu][kat][index];
  kategoriData[menu][kat].splice(index,1);
  generateLaporan();
}

// ================= AUTOCOMPLETE DROPDOWN =================
function initAutocomplete() {
  if (autocompleteInitialized) return;
  autocompleteInitialized = true;

  const input = document.getElementById("namaBahan");
  const dropdown = document.getElementById("autocomplete-list");

  if (!input || !dropdown) return;

  input.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!keyword) {
      dropdown.style.display = "none";
      return;
    }

    const hasil = database
      .map(d => getNamaBahan(d))
      .filter(n => n && n.includes(keyword))
      .slice(0, 10);

    hasil.forEach(nama => {
      const div = document.createElement("div");
      div.textContent = nama;

      div.onclick = () => {
        input.value = nama;
        dropdown.style.display = "none";
      };

      dropdown.appendChild(div);
    });

    dropdown.style.display = hasil.length ? "block" : "none";
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".autocomplete-wrapper")) {
      dropdown.style.display = "none";
    }
  });
}

function formatTanggalFile() {
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const now = new Date();

  const tgl = String(now.getDate()).padStart(2, "0");
  const namaBulan = bulan[now.getMonth()];
  const tahun = now.getFullYear();

  return `${tgl}_${namaBulan}_${tahun}`;
}

function formatTanggalIndonesia() {
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const bulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  const now = new Date();

  return `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
}

function getTanggalLengkap() {
  const now = new Date();

  const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = now.getDate();
  const bulan = now.toLocaleDateString("id-ID", { month: "long" });
  const tahun = now.getFullYear();

  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

function setJudulLaporan() {
  const tanggal = getTanggalLengkap();
  document.getElementById("tanggalLaporan").innerText = tanggal;
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") tutupModal();
});

window.onload = function () {

  initKategori();
  renderKategori();

  loadCache();
  loadDatabase();

  showSection("dashboard");
};

function sdSemuaLibur() {
  return kategoriLibur["SD Awi Gombong"] && kategoriLibur["SD YAS"];
}

function hitungPenerimaFinal() {

  let data = {
    "BALITA": kategoriLibur["Balita"] ? 0 : 211,
    "BUMIL & BUSUI": kategoriLibur["Bumil & Busui"] ? 0 : 125,

    "SD Awi Gombong": kategoriLibur["SD Awi Gombong"] ? 0 : 1015,
    "SD YAS": kategoriLibur["SD YAS"] ? 0 : 186,

    "SMP YAS": kategoriLibur["SMP YAS"] ? 0 : 630,
    "SMA YAS": kategoriLibur["SMA YAS"] ? 0 : 534,

    "Guru & Tendik SD Awi Gombong": kategoriLibur["SD Awi Gombong"] ? 0 : 62,
    "Guru & Tendik SD YAS": kategoriLibur["SD YAS"] ? 0 : 17,

    "Guru & Tendik SMP YAS": kategoriLibur["SMP YAS"] ? 0 : 35,
    "Guru & Tendik SMA YAS": kategoriLibur["SMA YAS"] ? 0 : 37
  };

  let picPosyandu = 5;

  if (kategoriLibur["Balita"] && kategoriLibur["Bumil & Busui"]) {
    picPosyandu = 0;
  }

  data["PIC POSYANDU"] = picPosyandu;

  let total = Object.values(data).reduce((a,b)=>a+b,0);

  return { data, total };
}

function toggleLiburLaporan(nama, checked) {
  liburLaporan[nama] = checked;
  generateCaptionHarian();
}

function tambahMenuHarian() {
  menuHarian.push("");
  renderMenuHarian();
}

function editMenuHarian(index, value) {
  menuHarian[index] = value;

  // 🔥 kalau input terakhir diisi → tambah baris baru otomatis
  if (index === menuHarian.length - 1 && value.trim() !== "") {
    menuHarian.push("");
    renderMenuHarian();
  }

  generateCaptionHarian();
}

function renderMenuHarian() {
  const container = document.getElementById("menuContainer");

if(modeMenuLaporan === "semua"){

container.innerHTML = `

<h3>Menu Untuk Semua</h3>

${menuSemua.map((menu,i)=>`
<input type="text"
value="${menu}"
placeholder="Menu ${i+1}"
oninput="menuSemua[${i}] = this.value; generateCaptionHarian()">
`).join("")}

<button onclick="menuSemua.push(''); renderMenuHarian()">
+ Tambah Menu
</button>

<br><br>

<button onclick="modeMenuLaporan='terpisah'; renderMenuHarian()">
Gunakan Menu B3 & Sekolah
</button>

`;

}

else{

container.innerHTML = `

<h3>Menu Balita, Bumil & Busui</h3>

${menuBalita.map((menu,i)=>`
<input type="text"
value="${menu}"
placeholder="Menu Balita ${i+1}"
oninput="menuBalita[${i}] = this.value; generateCaptionHarian()">
`).join("")}

<button onclick="menuBalita.push(''); renderMenuHarian()">
+ Tambah Menu Balita
</button>

<br><br>

<h3>Menu Sekolah</h3>

${menuSekolah.map((menu,i)=>`
<input type="text"
value="${menu}"
placeholder="Menu Sekolah ${i+1}"
oninput="menuSekolah[${i}] = this.value; generateCaptionHarian()">
`).join("")}

<button onclick="menuSekolah.push(''); renderMenuHarian()">
+ Tambah Menu Sekolah
</button>

<br><br>

<button onclick="modeMenuLaporan='semua'; renderMenuHarian()">
Gunakan Menu Universal
</button>
  `;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  renderMenuHarian();
});

/* ===============================
   TAB LEVEL 1
=================================*/
function setMainTab(tab) {
  mainTabAktif = tab;

  // toggle tombol utama
  document.getElementById("tabLaporan")
    ?.classList.toggle("active-tab", tab === "laporan");

  document.getElementById("tabCaption")
    ?.classList.toggle("active-tab", tab === "caption");

  // 🔥 INI YANG PALING PENTING
  const subLap = document.getElementById("subTabLaporan");
  const subCap = document.getElementById("subTabCaption");

  if (tab === "caption") {
    if (subLap) subLap.style.display = "none";
    if (subCap) subCap.style.display = "flex";
  } else {
    if (subLap) subLap.style.display = "flex";
    if (subCap) subCap.style.display = "none";
  }
}

/* ===============================
   SUB TAB
=================================*/
function setSubTab(tab) {
  subTabAktif = tab;

  document
    .querySelectorAll("#subTabLaporan .btn-primary")
    .forEach(btn => btn.classList.remove("active-subtab"));

  if (tab === "harian") {
    document.getElementById("btnLapHarian").classList.add("active-subtab");
  } else {
    document.getElementById("btnLapGizi").classList.add("active-subtab");
  }
}

function copyCaptionWA() {
  const el = document.getElementById("captionOutput");
  if (!el) return;

  const text = el.value;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".btn-copy-wa");
    if (!btn) return;

    const oldText = btn.innerHTML;

    btn.innerHTML = "✅ Tersalin!";
    
    setTimeout(() => {
      btn.innerHTML = oldText;
    }, 2000);
  });
}

function ambilDaftarMenu() {
  const items = document.querySelectorAll(".menu-item-input");
  let teks = "";

  items.forEach((el, i) => {
    if (el.value.trim()) {
      teks += `${i + 1}. ${el.value.trim()}\n`;
    }
  });

  return teks || "-";
}

function copyLaporanWA() {
  if (!window.lastLaporanText) {
    alert("Generate laporan dulu");
    return;
  }

  navigator.clipboard.writeText(window.lastLaporanText);
  alert("Berhasil disalin untuk WhatsApp ✅");
}

function tambahMenuInput() {
  const container = document.getElementById("menuContainer");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nama menu";
  input.className = "menu-item-input";

  container.appendChild(input);
}

// ================= MODAL LIBUR =================
function bukaModalLibur() {

  const modal = document.getElementById("modalLibur");
  if (!modal) return;

  modal.style.display = "flex";

  syncLiburModal(); // 🔥 ini penting

}

function tutupModalLibur(){
  document.getElementById("modalLibur").style.display = "none";
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = (el.scrollHeight) + "px";
}

function ambilDataLibur(){

  kategoriLibur["Balita"] =
  document.getElementById("libur_balita")?.checked || false;

  kategoriLibur["Bumil & Busui"] =
  document.getElementById("libur_bumil")?.checked || false;

  kategoriLibur["SD Awi Gombong"] =
  document.getElementById("libur_awig")?.checked || false;

  kategoriLibur["SD YAS"] =
  document.getElementById("libur_sdyas")?.checked || false;

  kategoriLibur["SMP YAS"] =
  document.getElementById("libur_smpyas")?.checked || false;

  kategoriLibur["SMA YAS"] =
  document.getElementById("libur_smayas")?.checked || false;

}

function updateMenuAwal(value) {
  AppState.menu[0] = value;
}

function tambahMenuBaris() {
  menuHarian.push("");
  renderMenuHarian();
}

// ❌ HAPUS semua beforeunload lama dulu

let isDataChanged = false;

document.addEventListener("input", () => {
  isDataChanged = true;
});

window.addEventListener("beforeunload", function (e) {
  if (!isDataChanged) return;

  e.preventDefault();
  e.returnValue = '';
});

window.addEventListener("load", () => {
  isDataChanged = false;
});

document.addEventListener("DOMContentLoaded", () => {
  isDataChanged = false;
});

function konfirmasiAksi(pesan, callback) {
  const yakin = confirm(pesan);
  if (yakin) callback();
}

function kirimKeSpreadsheet() {

  if (!window.dataSpreadsheet) {
    alert("Generate laporan dulu!");
    return;
  }

  // 🔥 PAKSA GENERATE SEMUA MENU
  const modeBackup = modeMenu;
  generateLaporan();

  modeMenu = modeBackup;

  const formData = new FormData();
  formData.append("data", JSON.stringify(window.dataSpreadsheet));

  fetch(API_URL2, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(text => {
    console.log("RESP:", text);
    alert("Data berhasil dikirim");
  })
  .catch(err => {
    console.error("Fetch error:", err);
    alert("Gagal kirim");
  });

}

function kirimLaporan(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const namaSheet = data.tanggal;

  let sheet = ss.getSheetByName(namaSheet);
  if (!sheet) sheet = ss.insertSheet(namaSheet);

  sheet.clear();

  // =======================
  // 🟦 JUDUL
  // =======================
  sheet.getRange("A1").setValue("LAPORAN MENU MBG SPPG CICADAS 01");
  sheet.getRange("A2").setValue("Tanggal: " + data.tanggal);

  sheet.getRange("A1").setFontSize(14).setFontWeight("bold");
  sheet.getRange("A2").setFontSize(11);

  // =======================
  // 🍽️ MENU
  // =======================
  let row = 4;

  sheet.getRange(row, 1).setValue("MENU HARI INI");
  sheet.getRange(row, 1).setFontWeight("bold");

  row++;

  data.menu.forEach((m, i) => {
    sheet.getRange(row, 1).setValue(`Menu ${i + 1}`);
    sheet.getRange(row, 2).setValue(m);
    row++;
  });

  row += 1;

  // =======================
  // 🧪 HEADER
  // =======================
  const header = [
    "Kategori",
    "Energi",
    "Protein",
    "Lemak",
    "Karbo",
    "Serat"
  ];

  sheet.getRange(row, 1, 1, header.length).setValues([header]);

  sheet.getRange(row, 1, 1, header.length)
    .setFontWeight("bold")
    .setBackground("#2b7cff")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center");

  row++;

  // =======================
  // 🎨 WARNA PER KATEGORI
  // =======================
  const warnaKategori = {
    BALITA: "#d1fae5",
    "BUMIL & BUSUI": "#fef3c7",
    "SD 1-3": "#dbeafe",
    "SD 4-6": "#e9d5ff",
    SMP: "#fee2e2",
    SMA: "#fce7f3"
  };

  // =======================
  // 🧪 DATA + TOTAL
  // =======================
  let total = {
    energi: 0,
    protein: 0,
    lemak: 0,
    karbo: 0,
    serat: 0
  };

  const dataRows = [];

  Object.keys(data.gizi).forEach(k => {
    const g = data.gizi[k];

    total.energi += g.energi;
    total.protein += g.protein;
    total.lemak += g.lemak;
    total.karbo += g.karbo;
    total.serat += g.serat;

    dataRows.push([
      k.toUpperCase(),
      g.energi,
      g.protein,
      g.lemak,
      g.karbo,
      g.serat
    ]);
  });

  // isi data
  sheet.getRange(row, 1, dataRows.length, header.length)
    .setValues(dataRows);

  // =======================
  // 🎨 APPLY WARNA BARIS
  // =======================
  dataRows.forEach((r, i) => {
    const kat = r[0];
    const warna = warnaKategori[kat] || "#ffffff";

    sheet.getRange(row + i, 1, 1, header.length)
      .setBackground(warna);
  });

  row += dataRows.length;

  // =======================
  // 🔥 TOTAL ROW
  // =======================
  sheet.getRange(row, 1).setValue("TOTAL");

  sheet.getRange(row, 2).setValue(total.energi);
  sheet.getRange(row, 3).setValue(total.protein);
  sheet.getRange(row, 4).setValue(total.lemak);
  sheet.getRange(row, 5).setValue(total.karbo);
  sheet.getRange(row, 6).setValue(total.serat);

  const target = AKG["SMA"]; // standar tertinggi

const warnaEnergi = total.energi >= target.Energi ? "#bbf7d0" : "#fecaca";
const warnaProtein = total.protein >= target.Protein ? "#bbf7d0" : "#fecaca";
const warnaLemak = total.lemak >= target.Lemak ? "#bbf7d0" : "#fecaca";
const warnaKarbo = total.karbo >= target.Karbohidrat ? "#bbf7d0" : "#fecaca";
const warnaSerat = total.serat >= target.Serat ? "#bbf7d0" : "#fecaca";

sheet.getRange(row,2).setBackground(warnaEnergi);
sheet.getRange(row,3).setBackground(warnaProtein);
sheet.getRange(row,4).setBackground(warnaLemak);
sheet.getRange(row,5).setBackground(warnaKarbo);
sheet.getRange(row,6).setBackground(warnaSerat);

  sheet.getRange(row, 1, 1, header.length)
    .setFontWeight("bold")
    .setBackground("#111827")
    .setFontColor("#ffffff");

  // =======================
  // 📏 FORMAT ANGKA
  // =======================
  sheet.getRange(6, 2, row, 5)
    .setNumberFormat("0.00");

  // =======================
  // 📦 BORDER
  // =======================
  sheet.getRange(5, 1, row - 4, header.length)
    .setBorder(true, true, true, true, true, true);

  // =======================
  // 📏 AUTO WIDTH
  // =======================
  sheet.autoResizeColumns(1, 6);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function kirimLaporanKeSpreadsheet() {

  const tanggal = formatTanggalIndonesia();
  const menuFix = ambilMenuUntukLaporan();

  const semuaDetail = [];
  const semuaLibur = {};

  // gabungkan semua data spreadsheet
  Object.keys(window.dataSpreadsheet).forEach(mode => {

    const dataMode = window.dataSpreadsheet[mode];

    if (dataMode && dataMode.detail) {
      semuaDetail.push(...dataMode.detail);
    }

  });

  // ambil status libur
  Object.keys(kategoriLibur).forEach(kat => {
    semuaLibur[kat] = kategoriLibur[kat];
  });

  const data = {
    tanggal: tanggal,
    menu: menuFix,
    omprengan: window.dataSpreadsheet.OMPRENGAN,
    snack: window.dataSpreadsheet.SNACK,
    detail: semuaDetail,
    libur: semuaLibur,
    catatan: document.getElementById("note")?.value || ""
  };

  console.log(data);

  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  fetch(API_URL2, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(res => {
    console.log("RESP:", res);
    alert("Berhasil kirim laporan");
  })
  .catch(err => {
    console.error(err);
    alert("Gagal kirim");
  });

}

  function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function ubahKategoriMenu(value){
  menuKategori = value;
  generateCaptionHarian();
}

function ambilMenuUntukLaporan(){

  let hasil = "";

  // ================= UNIVERSAL =================
  if(modeMenuLaporan === "semua"){

    const menu = menuSemua.filter(m => m && m.trim() !== "");

    menu.forEach((m,i)=>{
      hasil += `${i+1}. ${m}\n`;
    });

    return hasil.trim();
  }

  // ================= TERPISAH =================
  if(menuBalita.length){

    hasil += "Menu Balita, Bumil & Busui :\n";

    menuBalita
      .filter(m=>m.trim())
      .forEach((m,i)=>{
        hasil += `${i+1}. ${m}\n`;
      });

    hasil += "\n";
  }

  if(menuSekolah.length){

    hasil += "Menu Sekolah :\n";

    menuSekolah
      .filter(m=>m.trim())
      .forEach((m,i)=>{
        hasil += `${i+1}. ${m}\n`;
      });
  }

  return hasil.trim();
}

function renderKategori(){

const container = document.getElementById("kategoriCheckbox");
if(!container) return;

let kategori =
modeMenu === "SNACK"
? kategoriSnack
: kategoriOmprengan;

let html = "";

/* tombol semua */

html += `
<label class="kategori-chip">
<input type="checkbox" id="kategoriSemua">
<span>Semua</span>
</label>
`;

kategori.forEach(k=>{

html += `
<label class="kategori-chip">
<input type="checkbox" class="kategori-check" value="${k}">
<span>${k}</span>
</label>
`;

});

container.innerHTML = html;

initKategoriLogic();

}

function ambilKategoriDipilih(){

const checkboxes = document.querySelectorAll(".kategori-check:checked");

let list = [];

checkboxes.forEach(cb=>{
list.push(cb.value);
});

if(list.length === 0){
return ["SEMUA"];
}

return list;

}

function initKategoriChip(){

const chips = document.querySelectorAll(".kategori-chip");

chips.forEach(chip => {

chip.addEventListener("click", function(){

const kategori = this.dataset.kategori;

/* klik SEMUA */

if(kategori === "semua"){

chips.forEach(c => c.classList.remove("active"));

this.classList.add("active");

}

/* klik kategori lain */

else{

const semuaChip = document.querySelector('[data-kategori="semua"]');
semuaChip.classList.remove("active");

/* toggle */

this.classList.toggle("active");

}

});

});

}

document.addEventListener("DOMContentLoaded", function(){

initKategoriChip();

let kategoriAktif = [];

document.querySelectorAll(".kategori-chip").forEach(chip=>{

chip.addEventListener("click", function(){

const kategori = this.dataset.kategori;

if(kategori==="semua"){

document.querySelectorAll(".kategori-chip").forEach(c=>{
c.classList.remove("active");
});

this.classList.add("active");

kategoriAktif=["SEMUA"];

return;

}

this.classList.toggle("active");

document.querySelector('[data-kategori="semua"]').classList.remove("active");

kategoriAktif=[];

document.querySelectorAll(".kategori-chip.active").forEach(c=>{
kategoriAktif.push(c.dataset.kategori);
});

});

});

});

function formatSatuan(satuan){

if(!satuan) return "";

satuan = satuan.toUpperCase();

if(satuan === "GRAM") return "Gram";
if(satuan === "PCS") return "Pcs";

return satuan;

}

function exportPDF(){

generateLaporan(); // refresh data terbaru

const container = document.getElementById("pdfArea");
const hasilPDF = document.getElementById("pdfContent");

if(!container || !hasilPDF){
  console.error("Element pdfArea / pdfContent tidak ditemukan");
  return;
}

hasilPDF.innerHTML = "";

// =======================
// Ambil tabel dari web
// =======================

const hasilWeb = document.getElementById("hasilGizi");

const kategoriList = hasilWeb.querySelectorAll(".kategori-card");

kategoriList.forEach(kat => {

  const tabel = kat.querySelector("table");

  if(!tabel) return;

  const rows = tabel.querySelectorAll("tbody tr");

  // jika hanya TOTAL atau kosong → skip
  if(rows.length <= 1) return;

  const clone = kat.cloneNode(true);

  hasilPDF.appendChild(clone);

});

// =======================
// Jenis Menu
// =======================

const jenisMenu = [];

if(bahanMaster.OMPRENGAN.length > 0){
  jenisMenu.push("Menu Omprengan");
}

if(bahanMaster.SNACK.length > 0){
  jenisMenu.push("Menu Snack");
}

document.getElementById("pdfJenisMenu").innerText =
jenisMenu.join(" & ");

// =======================
// Tanggal
// =======================

const elTanggal = document.getElementById("pdfTanggal");

if(elTanggal){
  elTanggal.innerText = getTanggalLengkap();
}

const note = document.getElementById("note").value;

document.getElementById("pdfNote").innerText =
note ? note : "-";

// =======================
// Export PDF
// =======================

container.style.display="block";

const opt = {
  margin:10,
  filename:`laporan_gizi_${formatTanggalFile()}.pdf`,
  image:{
    type:'jpeg',
    quality:1
  },
  html2canvas:{
    scale:3,
    useCORS:true,
    letterRendering:true
  },
  jsPDF:{
    unit:"mm",
    format:"a4",
    orientation:"portrait"
  },
  pagebreak:{
    mode:["css","legacy"]
  }
};

setTimeout(()=>{

html2pdf()
.set(opt)
.from(container)
.save()
.then(()=>{
container.style.display="none";
});

},200);

}

/* ===============================
SIDEBAR NAVIGATION FINAL
================================= */

function toggleSidebar(){

  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");

  if(!sidebar) return;

  sidebar.classList.toggle("hide");

  if(content){
    content.classList.toggle("full");
  }

}

function showSection(menu){

  const input = document.getElementById("input");
  const hasil = document.getElementById("hasil-wrapper");
  const create = document.getElementById("create");
  const caption = document.getElementById("caption");

  if(!input || !hasil || !create || !caption) return;

  // sembunyikan semua
  input.style.display="none";
  hasil.style.display="none";
  create.style.display="none";
  caption.style.display="none";

  if(menu==="dashboard"){
    input.style.display="block";
    hasil.style.display="block";
    create.style.display="block";
    caption.style.display="block";
  }

  if(menu==="input"){
    input.style.display="block";
  }

  if(menu==="hasilGizi"){
    hasil.style.display="block";
  }

  if(menu==="laporan"){
    create.style.display="block";
    caption.style.display="block";
  }

  // auto hide sidebar
  const sidebar = document.querySelector(".sidebar");
  if(sidebar){
    sidebar.classList.add("hide");
  }

}

function showSection(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error("Section tidak ditemukan:", id);
    return;
  }

  document.querySelectorAll(".section").forEach(sec => {
    sec.style.display = "none";
  });

}

function klikGenerate(mode){

modeGenerate = mode;

// reset semua tombol
document.querySelectorAll("#subTabLaporan button").forEach(b=>{
b.classList.remove("btn-mode-active");
});

document.querySelectorAll("#subTabCaption button").forEach(b=>{
b.classList.remove("btn-mode-active");
});

// aktifkan tombol yg diklik
event.target.classList.add("btn-mode-active");

}

function generateDenganLibur(){

  if(!modeGenerate){
    alert("Pilih jenis laporan dulu");
    return;
  }

  bukaModalLibur();

}

function syncLiburModal(){

  for(const kat in mapLibur){
    const el = document.getElementById(mapLibur[kat]);
    if(el){
      el.checked = kategoriLibur[kat] || false;
    }
  }

}

function bukaModalLibur(){
  document.getElementById("modalLibur").style.display = "flex";
}

function klikGenerate(jenis){

  jenisGenerate = jenis;

  bukaModalLibur();

}

function generateKandunganGizi() {
  showSection("hasilSection");

  const hasil = hitungGizi();

  window.hasilGiziPerKategori = hasil; // 🔥 penting

  setGizi(AppState.mode, hasil);

  renderHasilGizi(hasil);
}

function handleGenerate(jenis){
  jenisGenerate = jenis;
  bukaModalLibur();
}

function handleGenerate(mode){
  modeGenerate = mode;
  bukaModalLibur();
}

function lanjutkanGenerate(){

  ambilDataLibur(); // 🔥 ambil checkbox popup
  tutupModalLibur();

  if(modeGenerate === "laporan"){
    prosesLaporan(); // ✅ ini yang generate laporan
  }

  else if(modeGenerate === "gizi"){
    generateLaporanGizi();
  }

  else if(modeGenerate === "caption_omprengan"){
    generateCaptionOmprengan();
  }

  else if(modeGenerate === "caption_snack"){
    generateCaptionSnack();
  }
}

function getMenu() {
  return AppState.menu.filter(x => x.trim());
}

function setMenu(menuArray) {
  AppState.menu = menuArray;
}

function getGiziAktif() {
  return AppState.hasilGizi[AppState.mode] || {};
}

function setGizi(mode, data) {
  AppState.hasilGizi[mode] = data;
}

function generateByTab() {
  const tabLaporan = document.getElementById("subTabLaporan").style.display !== "none";

  if (tabLaporan) {
    // default laporan harian
    handleGenerate("laporan");
  } else {
    // default caption omprengan
    handleGenerate("caption_omprengan");
  }
}

function renderHasilGizi(data) {

  const container = document.getElementById("hasil");
  if (!container) return;

  container.innerHTML = "";

  Object.keys(data).forEach(kat => {

    container.innerHTML += `
      <div class="gizi-card">

        <!-- 🔥 HEADER (INI TEMPAT KODE KAMU MASUK) -->
        <div class="card-header">
          <h3>${kat}</h3>

          <div style="display:flex; gap:10px; align-items:center;">
            <span>GRAM</span>
            <button onclick="clearKategori('${kat}')">❌</button>
          </div>
        </div>

        <!-- 🔥 TABEL -->
        ${renderTabelBahan(kat)}

      </div>
      `;
    });

    const namaAKG = MAP_KATEGORI[kat];
    const akg = AKG[namaAKG] || {};

    const isLibur = window.statusLibur?.[kat] || false;

    // 🔥 HITUNG PERSENTASE AKG
    const persenEnergi = g.ENERGI / (akg.Energi || 1);
    const persenProtein = g.PROTEIN / (akg.Protein || 1);

    const cukup = persenEnergi >= 1 && persenProtein >= 1;

    const statusClass = cukup ? "gizi-ok" : "gizi-kurang";

    container.innerHTML += `
      <div class="card gizi-card ${statusClass}">
        
        <div class="card-header">
          <h3>${namaAKG || kat}</h3>

          <label class="switch">
            <input type="checkbox"
              ${isLibur ? "checked" : ""}
              onchange="toggleLibur('${kat}', this.checked)">
            <span class="slider"></span>
          </label>
        </div>

        ${
          isLibur
          ? `<p class="libur-text">LIBUR</p>`
          : `
          <table class="gizi-table">
            <tr><td>Energi</td><td>${g.ENERGI} / ${akg.Energi || 0}</td></tr>
            <tr><td>Protein</td><td>${g.PROTEIN} / ${akg.Protein || 0}</td></tr>
            <tr><td>Lemak</td><td>${g.LEMAK} / ${akg.Lemak || 0}</td></tr>
            <tr><td>Karbohidrat</td><td>${g.KARBOHIDRAT} / ${akg.Karbohidrat || 0}</td></tr>
            <tr><td>Kalsium</td><td>${g.KALSIUM} / ${akg.Kalsium || 0}</td></tr>
            <tr><td>Serat</td><td>${g.SERAT} / ${akg.Serat || 0}</td></tr>
          </table>

          <p style="margin-top:10px;">
            Energi: ${(persenEnergi * 100).toFixed(0)}% |
            Protein: ${(persenProtein * 100).toFixed(0)}%
          </p>
          `
        }

      </div>
    `;
}

function renderTabelBahan(kategori) {
  const data = window.dataBahanPerKategori[kategori] || [];

  let total = {
    ENERGI: 0,
    PROTEIN: 0,
    LEMAK: 0,
    KARBOHIDRAT: 0,
    KALSIUM: 0,
    SERAT: 0
  };

  let rows = data.map((item, index) => {

    const g = item.gizi;

    // 🔥 AKUMULASI TOTAL
    total.ENERGI += g.ENERGI;
    total.PROTEIN += g.PROTEIN;
    total.LEMAK += g.LEMAK;
    total.KARBOHIDRAT += g.KARBOHIDRAT;
    total.KALSIUM += g.KALSIUM;
    total.SERAT += g.SERAT;

    return `
      <tr>
        <td>${item.nama}</td>

        <td>
          <input type="number"
            value="${item.berat}"
            onchange="updateBerat('${kategori}', ${index}, this.value)"
            class="input-berat"
          >
        </td>

        <td>${g.ENERGI.toFixed(1)}</td>
        <td>${g.PROTEIN.toFixed(1)}</td>
        <td>${g.LEMAK.toFixed(1)}</td>
        <td>${g.KARBOHIDRAT.toFixed(1)}</td>
        <td>${g.KALSIUM.toFixed(1)}</td>
        <td>${g.SERAT.toFixed(1)}</td>

        <td>
          <button onclick="hapusBahan('${kategori}', ${index})">❌</button>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <table class="gizi-table">
      <thead>
        <tr>
          <th>Nama Bahan</th>
          <th>Berat (g)</th>
          <th>Energi</th>
          <th>Protein</th>
          <th>Lemak</th>
          <th>Karbo</th>
          <th>Kalsium</th>
          <th>Serat</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        ${rows}

        <!-- 🔥 TOTAL -->
        <tr class="total-row">
          <td colspan="2"><b>TOTAL</b></td>
          <td>${total.ENERGI.toFixed(1)}</td>
          <td>${total.PROTEIN.toFixed(1)}</td>
          <td>${total.LEMAK.toFixed(1)}</td>
          <td>${total.KARBOHIDRAT.toFixed(1)}</td>
          <td>${total.KALSIUM.toFixed(1)}</td>
          <td>${total.SERAT.toFixed(1)}</td>
          <td></td>
        </tr>

      </tbody>
    </table>
  `;
}

function updateBerat(kategori, index, beratBaru) {
  const item = window.dataBahanPerKategori[kategori][index];

  const rasio = beratBaru / item.berat;

  // 🔥 UPDATE SEMUA GIZI BERDASARKAN RASIO
  Object.keys(item.gizi).forEach(k => {
    item.gizi[k] *= rasio;
  });

  item.berat = Number(beratBaru);

  // 🔥 RE-RENDER
  renderSemuaKategori();
}

function hapusBahan(kategori, index) {
  window.dataBahanPerKategori[kategori].splice(index, 1);
  renderSemuaKategori();
}

function renderSemuaKategori() {
  renderHasilGizi(window.hasilGiziPerKategori);
}

function clearKategori(kategori) {
  window.dataBahanPerKategori[kategori] = [];
  renderHasilGizi(window.hasilGiziPerKategori);
}
