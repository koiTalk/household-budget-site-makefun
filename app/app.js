// Dompet Keluarga — logika aplikasi (app.js)
// JavaScript polos, tanpa library, tanpa network.
// Render ke <main id="app">, navigasi lewat hash.

(function () {
  'use strict';

  var state = loadState();
  var editingId = null;
  var chartCanvas = null;
  var chartItems = null;

  // ---------- Util ----------

  function rupiah(n) {
    var num = Math.round(Number(n) || 0);
    var sign = num < 0 ? '-' : '';
    var digits = String(Math.abs(num)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return sign + 'Rp' + digits;
  }

  // Bentuk singkat untuk label di atas batang saat ruang sempit.
  function rupiahSingkat(n) {
    var num = Math.round(Number(n) || 0);
    if (num >= 1000000) {
      return 'Rp' + (num / 1000000).toFixed(2).replace('.', ',') + ' jt';
    }
    if (num >= 1000) {
      return 'Rp' + String(Math.round(num / 1000)) + ' rb';
    }
    return 'Rp' + String(num);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function categoryLabel(id) {
    if (id === 'gaji') { return 'Gaji'; }
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) { return CATEGORIES[i].label; }
    }
    return id;
  }

  function totalByType(type) {
    var sum = 0;
    for (var i = 0; i < state.transactions.length; i++) {
      if (state.transactions[i].type === type) { sum += Number(state.transactions[i].amount) || 0; }
    }
    return sum;
  }

  function spentByCategory() {
    var spent = {};
    for (var i = 0; i < CATEGORIES.length; i++) { spent[CATEGORIES[i].id] = 0; }
    for (var j = 0; j < state.transactions.length; j++) {
      var t = state.transactions[j];
      if (t.type === 'pengeluaran' && spent.hasOwnProperty(t.category)) {
        spent[t.category] += Number(t.amount) || 0;
      }
    }
    return spent;
  }

  function sortedTransactions() {
    return state.transactions.slice().sort(function (a, b) {
      if (a.date < b.date) { return 1; }
      if (a.date > b.date) { return -1; }
      if (a.id < b.id) { return 1; }
      if (a.id > b.id) { return -1; }
      return 0;
    });
  }

  function persist() { saveState(state); }

  // ---------- Chart batang (canvas, gambar sendiri) ----------

  function drawBarChart(canvas, items) {
    chartCanvas = canvas;
    chartItems = items;
    var container = canvas.parentElement;
    var w = canvas.clientWidth || (container ? container.clientWidth - 36 : 800);
    if (!w || w < 120) { w = 800; }
    var horizontal = w < 600;
    var rowH = 28;
    var h = horizontal ? 24 + items.length * rowH + 10 : 320;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    ctx.clearRect(0, 0, w, h);

    var max = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].value > max) { max = items[i].value; }
    }
    if (max <= 0) { max = 1; }
    ctx.font = '11px system-ui, sans-serif';

    if (horizontal) {
      // Batang horizontal (phone): label kiri, batang dari x=90, nilai di ujung kanan.
      var labelW = 80, barX = 90, topPad = 24;
      var valPad = 4, plotW = Math.max(20, w - barX - 66);
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var cy = topPad + k * rowH;
        var barLen = (it.value / max) * plotW;
        // Label kategori rata kiri, disingkat agar muat 80px.
        var lab = it.label;
        while (lab.length > 1 && ctx.measureText(lab).width > labelW - 4) {
          lab = lab.slice(0, -1);
        }
        ctx.fillStyle = '#424242';
        ctx.textAlign = 'left';
        ctx.fillText(lab, 0, cy + 14);
        ctx.fillStyle = it.color;
        ctx.fillRect(barX, cy + 4, Math.max(it.value > 0 ? 2 : 0, barLen), rowH - 10);
        // Nilai singkat di ujung kanan batang, dijepit di dalam canvas.
        var vText = rupiahSingkat(it.value);
        var vW = ctx.measureText(vText).width;
        var vx = barX + barLen + valPad;
        if (vx + vW > w - 6) { vx = Math.max(barX + 2, w - 6 - vW); }
        ctx.fillStyle = '#212121';
        ctx.textAlign = 'left';
        ctx.fillText(vText, vx, cy + 14);
      }
      return;
    }

    var padTop = 30, padBottom = 36, padLeft = 70, padRight = 8;
    var plotH = h - padTop - padBottom;
    var baseY = h - padBottom;

    // Sumbu + garis bantu.
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop - 8);
    ctx.lineTo(padLeft, baseY);
    ctx.lineTo(w - padRight, baseY);
    ctx.stroke();
    ctx.strokeStyle = '#e0e0e0';
    ctx.fillStyle = '#757575';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    var ticks = [0, 0.5, 1];
    for (var t = 0; t < ticks.length; t++) {
      var y = baseY - ticks[t] * plotH;
      if (ticks[t] > 0) {
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();
      }
      ctx.fillText(rupiahSingkat(Math.round(max * ticks[t])), padLeft - 6, y + 4);
    }

    var slot = (w - padLeft - padRight) / items.length;
    var barW = Math.min(52, slot * 0.62);
    var narrow = slot < 64;
    ctx.textAlign = 'center';
    for (var j = 0; j < items.length; j++) {
      var item = items[j];
      var barH = (item.value / max) * plotH;
      var x = padLeft + slot * j + (slot - barW) / 2;
      var yTop = baseY - barH;
      ctx.fillStyle = item.color;
      ctx.fillRect(x, yTop, barW, barH);
      // Nilai singkat di atas batang, dijepit agar tidak melewati tepi atas.
      ctx.fillStyle = '#212121';
      ctx.font = '11px system-ui, sans-serif';
      var valText = rupiahSingkat(item.value);
      ctx.fillText(valText, x + barW / 2, Math.max(12, yTop - 6));
      // Label kategori di bawah batang.
      var label = item.label;
      if (narrow && label.length > 3) { label = label.slice(0, 3); }
      ctx.fillStyle = '#424242';
      ctx.fillText(label, x + barW / 2, baseY + 18);
    }
  }

  function chartSection(title, items) {
    var legend = items.map(function (item) {
      return '<li><span class="swatch" style="background:' + item.color + '"></span>' +
        escapeHtml(item.label) + ' — ' + rupiah(item.value) + '</li>';
    }).join('');
    return '<section><h2>' + escapeHtml(title) + '</h2>' +
      '<div class="chart-container"><canvas></canvas>' +
      '<ul class="legend">' + legend + '</ul></div></section>';
  }

  function mountChart(items) {
    var canvas = document.querySelector('#app .chart-container canvas');
    if (canvas) { drawBarChart(canvas, items); }
  }

  function expenseChartItems() {
    var spent = spentByCategory();
    return CATEGORIES.map(function (c) {
      return { label: c.label, color: c.color, value: spent[c.id] || 0 };
    });
  }

  // ---------- Potongan tampilan bersama ----------

  function summaryCards() {
    var income = totalByType('pemasukan');
    var expense = totalByType('pengeluaran');
    var balance = income - expense;
    return '<section class="summary-cards">' +
      '<div class="card income"><div class="card-label">Total Pemasukan November 2026</div>' +
      '<div class="amount">' + rupiah(income) + '</div></div>' +
      '<div class="card expense"><div class="card-label">Total Pengeluaran November 2026</div>' +
      '<div class="amount">' + rupiah(expense) + '</div></div>' +
      '<div class="card balance"><div class="card-label">Sisa Uang November 2026</div>' +
      '<div class="amount">' + rupiah(balance) + '</div></div>' +
      '</section>';
  }

  function transactionRows(list, withActions) {
    return list.map(function (t) {
      var cls = t.type === 'pemasukan' ? 'income' : 'expense';
      var sign = t.type === 'pemasukan' ? '+' : '-';
      var row = '<tr><td>' + escapeHtml(t.date) + '</td>' +
        '<td>' + escapeHtml(t.description) + '</td>' +
        '<td>' + escapeHtml(categoryLabel(t.category)) + '</td>' +
        '<td>' + escapeHtml(t.type) + '</td>' +
        '<td class="amount ' + cls + '">' + sign + ' ' + rupiah(t.amount) + '</td>';
      if (withActions) {
        row += '<td><button type="button" class="btn-edit" data-edit="' + escapeHtml(t.id) + '">Edit</button>' +
          '<button type="button" class="btn-delete" data-delete="' + escapeHtml(t.id) + '">Hapus</button></td>';
      }
      return row + '</tr>';
    }).join('');
  }

  // ---------- Halaman ----------

  function renderHome(app) {
    var latest = sortedTransactions().slice(0, 5);
    app.innerHTML = '<h2>Beranda</h2>' + summaryCards() +
      chartSection('Pengeluaran per Kategori — November 2026', expenseChartItems()) +
      '<section><h2>5 Transaksi Terbaru</h2><div class="table-wrap"><table>' +
      '<thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th></tr></thead>' +
      '<tbody>' + transactionRows(latest, false) + '</tbody></table></div></section>';
    mountChart(expenseChartItems());
  }

  function categoryOptions(type, selected) {
    var opts = '';
    if (type === 'pemasukan') {
      opts = '<option value="gaji"' + (selected === 'gaji' ? ' selected' : '') + '>Gaji</option>';
    } else {
      opts = CATEGORIES.map(function (c) {
        return '<option value="' + c.id + '"' + (selected === c.id ? ' selected' : '') + '>' +
          escapeHtml(c.label) + '</option>';
      }).join('');
    }
    return opts;
  }

  function renderTransactions(app) {
    var all = sortedTransactions();
    var editing = null;
    if (editingId) {
      for (var i = 0; i < state.transactions.length; i++) {
        if (state.transactions[i].id === editingId) { editing = state.transactions[i]; }
      }
    }
    var today = '2026-11-27';
    var defDate = editing ? editing.date : today;
    var defType = editing ? editing.type : 'pengeluaran';
    var defCat = editing ? editing.category : 'makan';
    var defDesc = editing ? editing.description : '';
    var defAmount = editing ? editing.amount : '';

    app.innerHTML = '<h2>Transaksi</h2>' +
      '<section><form class="transaction-form" id="tx-form">' +
      '<div class="form-row"><label for="f-date">Tanggal</label>' +
      '<input type="date" id="f-date" value="' + escapeHtml(defDate) + '" required></div>' +
      '<div class="form-row"><label for="f-type">Jenis</label>' +
      '<select id="f-type"><option value="pengeluaran"' + (defType === 'pengeluaran' ? ' selected' : '') + '>Pengeluaran</option>' +
      '<option value="pemasukan"' + (defType === 'pemasukan' ? ' selected' : '') + '>Pemasukan</option></select></div>' +
      '<div class="form-row"><label for="f-category">Kategori</label>' +
      '<select id="f-category">' + categoryOptions(defType, defCat) + '</select></div>' +
      '<div class="form-row"><label for="f-description">Keterangan</label>' +
      '<input type="text" id="f-description" value="' + escapeHtml(defDesc) + '" required></div>' +
      '<div class="form-row"><label for="f-amount">Jumlah (Rp)</label>' +
      '<input type="number" id="f-amount" min="1" step="1" value="' + escapeHtml(String(defAmount)) + '" required></div>' +
      '<div class="form-actions">' +
      '<button type="submit" class="btn-primary" id="f-submit">' + (editing ? 'Simpan Perubahan' : 'Tambah Transaksi') + '</button>' +
      (editing ? '<button type="button" class="btn-cancel" id="f-cancel">Batal</button>' : '') +
      '</div></form></section>' +
      '<section><h2>Semua Transaksi</h2><div class="table-wrap"><table>' +
      '<thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th><th>Aksi</th></tr></thead>' +
      '<tbody>' + transactionRows(all, true) + '</tbody></table></div></section>';

    var typeSel = document.getElementById('f-type');
    var catSel = document.getElementById('f-category');
    typeSel.addEventListener('change', function () {
      catSel.innerHTML = categoryOptions(typeSel.value, typeSel.value === 'pemasukan' ? 'gaji' : 'makan');
    });

    document.getElementById('tx-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var amount = Math.round(Number(document.getElementById('f-amount').value) || 0);
      var desc = document.getElementById('f-description').value.trim();
      var date = document.getElementById('f-date').value;
      if (!date || !desc || amount <= 0) { return; }
      var data = {
        date: date,
        type: typeSel.value,
        category: catSel.value,
        description: desc,
        amount: amount
      };
      if (editing) {
        editing.date = data.date;
        editing.type = data.type;
        editing.category = data.category;
        editing.description = data.description;
        editing.amount = data.amount;
        editingId = null;
      } else {
        data.id = 't' + Date.now().toString(36);
        state.transactions.push(data);
      }
      persist();
      render();
    });

    var cancelBtn = document.getElementById('f-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        editingId = null;
        render();
      });
    }

    var editBtns = app.querySelectorAll('[data-edit]');
    for (var a = 0; a < editBtns.length; a++) {
      editBtns[a].addEventListener('click', function () {
        editingId = this.getAttribute('data-edit');
        render();
        var form = document.getElementById('tx-form');
        if (form) { form.scrollIntoView(); }
      });
    }
    var delBtns = app.querySelectorAll('[data-delete]');
    for (var b = 0; b < delBtns.length; b++) {
      delBtns[b].addEventListener('click', function () {
        var id = this.getAttribute('data-delete');
        if (!window.confirm('Hapus transaksi ini?')) { return; }
        state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
        if (editingId === id) { editingId = null; }
        persist();
        render();
      });
    }
  }

  function renderBudget(app) {
    var spent = spentByCategory();
    var items = CATEGORIES.map(function (c) {
      var target = Number(state.budgets[c.id]) || 0;
      var used = spent[c.id] || 0;
      var pct = target > 0 ? (used / target) * 100 : (used > 0 ? 100 : 0);
      var over = used > target;
      var remaining = target - used;
      var remainingText = over
        ? 'Lebih ' + rupiah(Math.abs(remaining))
        : 'Sisa ' + rupiah(remaining);
      return '<div class="budget-item' + (over ? ' over' : '') + '">' +
        '<h3>' + escapeHtml(c.label) + '</h3>' +
        '<div class="budget-bar' + (over ? ' over' : '') + '">' +
        '<div class="budget-fill' + (over ? ' over' : '') + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></div></div>' +
        '<div class="budget-meta"><span>Terpakai ' + rupiah(used) + ' dari target ' + rupiah(target) +
        ' (' + pct.toFixed(0) + '%)</span>' +
        '<span class="remaining">' + remainingText + '</span></div>' +
        '<div class="form-row" style="margin-top:12px"><label for="budget-' + c.id + '">Target anggaran ' + escapeHtml(c.label) + ' (Rp)</label>' +
        '<input type="number" id="budget-' + c.id + '" min="0" step="1000" value="' + target + '"></div>' +
        '<div class="form-actions"><button type="button" class="btn-primary" data-budget-save="' + c.id + '">Simpan</button></div>' +
        '</div>';
    }).join('');
    app.innerHTML = '<h2>Anggaran</h2><section>' + items + '</section>';

    var saveBtns = app.querySelectorAll('[data-budget-save]');
    for (var i = 0; i < saveBtns.length; i++) {
      saveBtns[i].addEventListener('click', function () {
        var catId = this.getAttribute('data-budget-save');
        var input = document.getElementById('budget-' + catId);
        var val = Math.round(Number(input.value) || 0);
        if (val < 0) { val = 0; }
        state.budgets[catId] = val;
        persist();
        render();
      });
    }
  }

  function renderReport(app) {
    var spent = spentByCategory();
    var totalSpent = 0, totalTarget = 0;
    var rows = CATEGORIES.map(function (c) {
      var target = Number(state.budgets[c.id]) || 0;
      var used = spent[c.id] || 0;
      var remaining = target - used;
      var pct = target > 0 ? (used / target) * 100 : (used > 0 ? 100 : 0);
      totalSpent += used;
      totalTarget += target;
      return '<tr><td>' + escapeHtml(c.label) + '</td>' +
        '<td class="amount expense">' + rupiah(used) + '</td>' +
        '<td class="amount">' + rupiah(target) + '</td>' +
        '<td class="amount">' + rupiah(remaining) + '</td>' +
        '<td class="amount">' + pct.toFixed(0) + '%</td></tr>';
    }).join('');
    var totalRemaining = totalTarget - totalSpent;
    var totalPct = totalTarget > 0 ? (totalSpent / totalTarget) * 100 : 0;
    app.innerHTML = '<h2>Laporan</h2>' + summaryCards() +
      '<section><h2>Ringkasan per Kategori — November 2026</h2><div class="table-wrap"><table>' +
      '<thead><tr><th>Kategori</th><th>Total Pengeluaran</th><th>Target</th><th>Sisa</th><th>% Terpakai</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td><strong>Total Keseluruhan</strong></td>' +
      '<td class="amount expense"><strong>' + rupiah(totalSpent) + '</strong></td>' +
      '<td class="amount"><strong>' + rupiah(totalTarget) + '</strong></td>' +
      '<td class="amount"><strong>' + rupiah(totalRemaining) + '</strong></td>' +
      '<td class="amount"><strong>' + totalPct.toFixed(0) + '%</strong></td></tr></tfoot>' +
      '</table></div></section>' +
      chartSection('Pengeluaran per Kategori — November 2026', expenseChartItems());
    mountChart(expenseChartItems());
  }

  function renderCalculator(app) {
    var income = totalByType('pemasukan');
    var expense = totalByType('pengeluaran');
    app.innerHTML = '<h2>Kalkulator</h2>' +
      '<section class="calculator"><div class="calculator-inputs">' +
      '<div class="form-row"><label for="calc-income">Pemasukan bulanan (Rp)</label>' +
      '<input type="number" id="calc-income" min="0" step="1000" value="' + income + '"></div>' +
      '<div class="form-row"><label for="calc-expense">Pengeluaran bulanan (Rp)</label>' +
      '<input type="number" id="calc-expense" min="0" step="1000" value="' + expense + '"></div>' +
      '</div>' +
      '<div class="form-actions"><button type="button" class="btn-primary" id="calc-run">Hitung</button></div>' +
      '<div class="calculator-result" id="calc-result"></div>' +
      '</section>';

    function calculate() {
      var inc = Number(document.getElementById('calc-income').value) || 0;
      var exp = Number(document.getElementById('calc-expense').value) || 0;
      var sisa = Math.round(inc - exp);
      var result = document.getElementById('calc-result');
      var advice = sisa >= 0
        ? 'Sisa ini bisa ditabung.'
        : 'Pengeluaran melebihi pemasukan, kurangi kategori terbesar.';
      result.className = 'calculator-result' + (sisa < 0 ? ' negative' : '');
      result.innerHTML = 'Sisa uang Anda: <span class="result-value">' + rupiah(sisa) + ' per bulan</span>' +
        '<p>' + advice + '</p>';
    }
    document.getElementById('calc-run').addEventListener('click', calculate);
    calculate();
  }

  // ---------- Router ----------

  function currentRoute() {
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash === '' || hash === '/') { return '/'; }
    return hash;
  }

  function render() {
    var app = document.getElementById('app');
    if (!app) { return; }
    chartCanvas = null;
    chartItems = null;
    var route = currentRoute();
    if (route === '/transaksi') {
      renderTransactions(app);
    } else if (route === '/anggaran') {
      renderBudget(app);
    } else if (route === '/laporan') {
      renderReport(app);
    } else if (route === '/kalkulator') {
      renderCalculator(app);
    } else {
      renderHome(app);
    }
    // Tandai link nav yang aktif.
    var links = document.querySelectorAll('header nav a');
    if (!links.length) { links = document.querySelectorAll('nav a'); }
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      var linkRoute = href.replace(/^#/, '') || '/';
      if (linkRoute === route || (route === '/' && (linkRoute === '/' || linkRoute === ''))) {
        links[i].classList.add('active');
      } else {
        links[i].classList.remove('active');
      }
    }
  }

  window.addEventListener('hashchange', function () {
    editingId = null;
    render();
  });

  window.addEventListener('resize', function () {
    if (chartCanvas && chartItems && document.body.contains(chartCanvas)) {
      drawBarChart(chartCanvas, chartItems);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
