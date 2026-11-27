// Dompet Keluarga — data + penyimpanan (data.js)
// JavaScript polos, tanpa library luar, tanpa network.
// Mata uang: rupiah. Periode contoh: November 2026.

var STORAGE_KEY = 'dompetKeluarga.v1';

var CATEGORIES = [
  { id: 'makan',       label: 'Makan',       color: '#e74c3c' },
  { id: 'transport',   label: 'Transport',   color: '#3498db' },
  { id: 'listrik',     label: 'Listrik',     color: '#f1c40f' },
  { id: 'air',         label: 'Air',         color: '#1abc9c' },
  { id: 'internet',    label: 'Internet',    color: '#9b59b6' },
  { id: 'belanja',     label: 'Belanja',     color: '#e67e22' },
  { id: 'pendidikan',  label: 'Pendidikan',  color: '#2ecc71' },
  { id: 'kesehatan',   label: 'Kesehatan',   color: '#e84393' },
  { id: 'hiburan',     label: 'Hiburan',     color: '#fd79a8' },
  { id: 'lain-lain',   label: 'Lain-lain',   color: '#636e72' }
];

var DEFAULT_BUDGETS = {
  'makan': 2000000,
  'transport': 700000,
  'listrik': 400000,
  'air': 150000,
  'internet': 300000,
  'belanja': 1500000,
  'pendidikan': 800000,
  'kesehatan': 400000,
  'hiburan': 300000,
  'lain-lain': 250000
};

// Data contoh November 2026.
// Pemasukan: Rp9.250.000 (gaji 8.500.000 + tambahan 750.000).
// Pengeluaran: 35 transaksi, total Rp6.125.000, tersebar di 10 kategori.
var SEED_TRANSACTIONS = [
  { id: 't001', date: '2026-11-01', type: 'pemasukan',   category: 'gaji',       description: 'Gaji bulanan November',          amount: 8500000 },
  { id: 't002', date: '2026-11-02', type: 'pengeluaran', category: 'makan',      description: 'Belanja pasar',                  amount: 320000 },
  { id: 't003', date: '2026-11-03', type: 'pengeluaran', category: 'transport',  description: 'Bensin motor',                   amount: 50000 },
  { id: 't004', date: '2026-11-04', type: 'pengeluaran', category: 'listrik',    description: 'Token listrik',                  amount: 200000 },
  { id: 't005', date: '2026-11-05', type: 'pengeluaran', category: 'makan',      description: 'Makan siang keluarga',           amount: 145000 },
  { id: 't006', date: '2026-11-05', type: 'pengeluaran', category: 'pendidikan', description: 'SPP anak',                      amount: 500000 },
  { id: 't007', date: '2026-11-06', type: 'pengeluaran', category: 'air',        description: 'Bayar air PDAM',                 amount: 135000 },
  { id: 't008', date: '2026-11-07', type: 'pengeluaran', category: 'internet',   description: 'Langganan internet',             amount: 300000 },
  { id: 't009', date: '2026-11-08', type: 'pengeluaran', category: 'belanja',    description: 'Belanja bulanan supermarket',    amount: 650000 },
  { id: 't010', date: '2026-11-08', type: 'pengeluaran', category: 'transport',  description: 'Servis motor',                   amount: 180000 },
  { id: 't011', date: '2026-11-09', type: 'pengeluaran', category: 'makan',      description: 'Belanja pasar mingguan',         amount: 285000 },
  { id: 't012', date: '2026-11-10', type: 'pengeluaran', category: 'transport',  description: 'Bensin motor',                   amount: 55000 },
  { id: 't013', date: '2026-11-11', type: 'pengeluaran', category: 'makan',      description: 'Belanja pasar',                  amount: 275000 },
  { id: 't014', date: '2026-11-11', type: 'pengeluaran', category: 'kesehatan',  description: 'Obat flu',                       amount: 85000 },
  { id: 't015', date: '2026-11-12', type: 'pengeluaran', category: 'pendidikan', description: 'Buku dan alat tulis',            amount: 145000 },
  { id: 't016', date: '2026-11-13', type: 'pengeluaran', category: 'hiburan',    description: 'Langganan streaming film',       amount: 65000 },
  { id: 't017', date: '2026-11-14', type: 'pengeluaran', category: 'makan',      description: 'Makan malam warteg',             amount: 95000 },
  { id: 't018', date: '2026-11-15', type: 'pemasukan',   category: 'gaji',       description: 'Tambahan penghasilan freelance', amount: 750000 },
  { id: 't019', date: '2026-11-15', type: 'pengeluaran', category: 'belanja',    description: 'Beli sabun dan deterjen',        amount: 125000 },
  { id: 't020', date: '2026-11-16', type: 'pengeluaran', category: 'lain-lain',  description: 'Sedekah',                        amount: 100000 },
  { id: 't021', date: '2026-11-17', type: 'pengeluaran', category: 'transport',  description: 'Ojek online',                    amount: 75000 },
  { id: 't022', date: '2026-11-17', type: 'pengeluaran', category: 'kesehatan',  description: 'Vitamin',                        amount: 95000 },
  { id: 't023', date: '2026-11-18', type: 'pengeluaran', category: 'makan',      description: 'Belanja pasar',                  amount: 310000 },
  { id: 't024', date: '2026-11-18', type: 'pengeluaran', category: 'belanja',    description: 'Beli perlengkapan rumah',        amount: 230000 },
  { id: 't025', date: '2026-11-19', type: 'pengeluaran', category: 'pendidikan', description: 'Les tambahan anak',              amount: 150000 },
  { id: 't026', date: '2026-11-20', type: 'pengeluaran', category: 'listrik',    description: 'Token listrik',                  amount: 150000 },
  { id: 't027', date: '2026-11-20', type: 'pengeluaran', category: 'lain-lain',  description: 'Iuran RT',                       amount: 50000 },
  { id: 't028', date: '2026-11-21', type: 'pengeluaran', category: 'belanja',    description: 'Beli baju anak',                 amount: 280000 },
  { id: 't029', date: '2026-11-21', type: 'pengeluaran', category: 'hiburan',    description: 'Nonton bioskop keluarga',        amount: 180000 },
  { id: 't030', date: '2026-11-22', type: 'pengeluaran', category: 'kesehatan',  description: 'Periksa ke dokter',              amount: 250000 },
  { id: 't031', date: '2026-11-23', type: 'pengeluaran', category: 'makan',      description: 'Jajan anak sekolah',             amount: 60000 },
  { id: 't032', date: '2026-11-24', type: 'pengeluaran', category: 'transport',  description: 'Bensin motor',                   amount: 50000 },
  { id: 't033', date: '2026-11-24', type: 'pengeluaran', category: 'transport',  description: 'Parkir dan tol',                 amount: 85000 },
  { id: 't034', date: '2026-11-24', type: 'pengeluaran', category: 'lain-lain',  description: 'Potong rambut',                  amount: 45000 },
  { id: 't035', date: '2026-11-26', type: 'pengeluaran', category: 'makan',      description: 'Makan siang',                    amount: 120000 },
  { id: 't036', date: '2026-11-26', type: 'pengeluaran', category: 'belanja',    description: 'Belanja kebutuhan dapur',        amount: 210000 },
  { id: 't037', date: '2026-11-26', type: 'pengeluaran', category: 'lain-lain',  description: 'Pulsa HP',                       amount: 75000 }
];

function getInitialState() {
  return {
    transactions: JSON.parse(JSON.stringify(SEED_TRANSACTIONS)),
    budgets: JSON.parse(JSON.stringify(DEFAULT_BUDGETS))
  };
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getInitialState();
    }
    var parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.budgets || typeof parsed.budgets !== 'object') {
      return getInitialState();
    }
    return {
      transactions: JSON.parse(JSON.stringify(parsed.transactions)),
      budgets: JSON.parse(JSON.stringify(parsed.budgets))
    };
  } catch (e) {
    return getInitialState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Tersedia sebagai global (bukan module).
if (typeof window !== 'undefined') {
  window.CATEGORIES = CATEGORIES;
  window.DEFAULT_BUDGETS = DEFAULT_BUDGETS;
  window.SEED_TRANSACTIONS = SEED_TRANSACTIONS;
  window.loadState = loadState;
  window.saveState = saveState;
}
