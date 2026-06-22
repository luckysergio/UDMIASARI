// src/components/PrintLaporan.jsx
import React from "react";

const formatRupiahDisplay = (price) => {
  if (!price && price !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDateOnly = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getStatusLabel = (status) => {
  const labels = {
    selesai: "Selesai",
  };
  return labels[status] || status;
};

// Fungsi untuk render logo
const renderLogoHTML = () => {
  return `
    <div style="display: inline-block;">
      <img 
        src="/images/logo.png" 
        alt="UD. Mia Sari Logo" 
        style="width: 80px; height: auto; object-fit: contain; display: block;"
        onerror="this.onerror=null; this.style.display='none'"
      />
    </div>
  `;
};

// Fungsi untuk mencetak laporan transaksi (hanya SELESAI)
export const printLaporanTransaksi = (transactions, startDate, endDate, summary) => {
  const printWindow = window.open('', '_blank');
  
  // Filter hanya transaksi yang statusnya "selesai"
  const completedTransactions = transactions.filter(t => t.status === "selesai");
  
  const laporanHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Transaksi Selesai ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          background: white;
          padding: 20px;
          color: #333;
        }
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border: 1px solid #ddd;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-left {
          flex: 1;
          display: flex;
          justify-content: flex-start;
        }
        .header-center {
          flex: 2;
          text-align: center;
        }
        .header-center h1 {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .header-center p {
          font-size: 11px;
          color: #666;
          line-height: 1.4;
        }
        .header-right {
          flex: 1;
          text-align: right;
        }
        .report-title {
          text-align: center;
          margin: 20px 0;
        }
        .report-title h2 {
          font-size: 20px;
          border-bottom: 1px solid #333;
          display: inline-block;
          padding-bottom: 5px;
        }
        .period-info {
          text-align: center;
          margin: 10px 0 20px;
          font-size: 12px;
          color: #666;
        }
        .summary-section {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 25px;
        }
        .summary-card {
          flex: 1;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .summary-card h4 {
          font-size: 11px;
          color: #666;
          margin-bottom: 8px;
        }
        .summary-card .value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          position: sticky;
          top: 0;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          background: #d4edda;
          color: #155724;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
        }
        .footer-note {
          margin-top: 15px;
          font-size: 9px;
          color: #999;
          text-align: left;
        }
        @media print {
          body {
            padding: 0;
          }
          .report-container {
            border: none;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="header-left">
            ${renderLogoHTML()}
          </div>
          <div class="header-center">
            <h1>UD MIA SARI</h1>
            <p>Jl. Cut Nyak Dien, Kedaung Bar., Kec. Sepatan Tim., Kabupaten Tangerang, Banten 15520</p>
            <p>Telp: +62 85886682496 | Email: baksomiasari@gmail.com</p>
          </div>
          <div class="header-right">
            <div style="font-size: 10px; color: #666;">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
        
        <div class="report-title">
          <h2>LAPORAN TRANSAKSI SELESAI</h2>
        </div>
        
        <div class="period-info">
          Periode: ${formatDateOnly(startDate)} s/d ${formatDateOnly(endDate)}
        </div>
        
        <div class="summary-section">
          <div class="summary-card">
            <h4>Total Pendapatan</h4>
            <div class="value">${formatRupiahDisplay(summary.totalRevenue)}</div>
          </div>
          <div class="summary-card">
            <h4>Total Transaksi</h4>
            <div class="value">${summary.totalTransactions}</div>
          </div>
          <div class="summary-card">
            <h4>Rata-rata Transaksi</h4>
            <div class="value">${formatRupiahDisplay(summary.averageTransaction)}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>No. Invoice</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th class="text-center">Item</th>
              <th class="text-right">Total</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${completedTransactions.map((transaction, index) => {
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${transaction.invoice_no}</td>
                  <td class="text-center">${formatDateOnly(transaction.created_at)}</td>
                  <td>${transaction.customer_name || 'Umum'}</td>
                  <td class="text-center">${transaction.details?.length || 0}</td>
                  <td class="text-right">${formatRupiahDisplay(transaction.grand_total)}</td>
                  <td class="text-center">
                    <span class="status-badge">Selesai</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer-note">
          <p><strong>Catatan:</strong></p>
          <p>- Laporan ini mencakup transaksi yang telah SELESAI dari periode ${formatDateOnly(startDate)} hingga ${formatDateOnly(endDate)}</p>
          <p>- Total Pendapatan dihitung dari total seluruh transaksi yang selesai</p>
          <p>- Laporan ini dibuat secara otomatis oleh sistem</p>
        </div>
        
        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda kepada UD. Mia Sari</p>
          <p>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div class="no-print" style="text-align:center; margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 20px; margin:5px; cursor:pointer;">Cetak Laporan</button>
        <button onclick="window.close()" style="padding:10px 20px; margin:5px; cursor:pointer;">Tutup</button>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(laporanHTML);
  printWindow.document.close();
};

// Fungsi untuk mencetak laporan retur
export const printLaporanRetur = (returs, startDate, endDate, summary) => {
  const printWindow = window.open('', '_blank');
  
  const getTypeLabel = (type) => {
    const labels = {
      refund: "Retur Barang (Refund)",
      exchange: "Tukar Barang",
    };
    return labels[type] || type;
  };
  
  const getStatusLabelRetur = (status) => {
    const labels = {
      pending: "Pending",
      approved: "Disetujui",
      rejected: "Ditolak",
      replacement_sent: "Pengganti Dikirim",
      completed: "Selesai",
    };
    return labels[status] || status;
  };
  
  const laporanHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Retur ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          background: white;
          padding: 20px;
          color: #333;
        }
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border: 1px solid #ddd;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header-left {
          flex: 1;
          display: flex;
          justify-content: flex-start;
        }
        .header-center {
          flex: 2;
          text-align: center;
        }
        .header-center h1 {
          font-size: 20px;
          margin-bottom: 5px;
        }
        .header-center p {
          font-size: 11px;
          color: #666;
          line-height: 1.4;
        }
        .header-right {
          flex: 1;
          text-align: right;
        }
        .report-title {
          text-align: center;
          margin: 20px 0;
        }
        .report-title h2 {
          font-size: 20px;
          border-bottom: 1px solid #333;
          display: inline-block;
          padding-bottom: 5px;
        }
        .period-info {
          text-align: center;
          margin: 10px 0 20px;
          font-size: 12px;
          color: #666;
        }
        .summary-section {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 25px;
        }
        .summary-card {
          flex: 1;
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .summary-card h4 {
          font-size: 11px;
          color: #666;
          margin-bottom: 8px;
        }
        .summary-card .value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .summary-card .sub-value {
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-approved { background: #d1ecf1; color: #0c5460; }
        .status-rejected { background: #f8d7da; color: #721c24; }
        .status-completed { background: #d4edda; color: #155724; }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
          .report-container {
            border: none;
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <div class="header-left">
            ${renderLogoHTML()}
          </div>
          <div class="header-center">
            <h1>UD MIA SARI</h1>
            <p>Jl. Cut Nyak Dien, Kedaung Bar., Kec. Sepatan Tim., Kabupaten Tangerang, Banten 15520</p>
            <p>Telp: +62 85886682496 | Email: baksomiasari@gmail.com</p>
          </div>
          <div class="header-right">
            <div style="font-size: 10px; color: #666;">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
        
        <div class="report-title">
          <h2>LAPORAN RETUR</h2>
        </div>
        
        <div class="period-info">
          Periode: ${formatDateOnly(startDate)} s/d ${formatDateOnly(endDate)}
        </div>
        
        <div class="summary-section">
          <div class="summary-card">
            <h4>Total Refund</h4>
            <div class="value">${formatRupiahDisplay(summary.totalRefund)}</div>
          </div>
          <div class="summary-card">
            <h4>Total Retur</h4>
            <div class="value">${summary.totalReturs}</div>
            <div class="sub-value">Refund: ${summary.refundCount} | Exchange: ${summary.exchangeCount}</div>
          </div>
          <div class="summary-card">
            <h4>Status Retur</h4>
            <div class="sub-value">Pending: ${summary.pendingCount} | Disetujui: ${summary.approvedCount} | Selesai: ${summary.completedCount} | Ditolak: ${summary.rejectedCount}</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>No. Retur</th>
              <th>Tanggal</th>
              <th>No. Invoice</th>
              <th>Tipe</th>
              <th class="text-right">Total Refund</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${returs.map((retur, index) => {
              let statusClass = '';
              switch(retur.status) {
                case 'pending': statusClass = 'status-pending'; break;
                case 'approved': statusClass = 'status-approved'; break;
                case 'rejected': statusClass = 'status-rejected'; break;
                case 'completed': statusClass = 'status-completed'; break;
                default: statusClass = '';
              }
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${retur.return_no}</td>
                  <td class="text-center">${formatDateOnly(retur.created_at)}</td>
                  <td>${retur.transaction?.invoice_no || '-'}</td>
                  <td class="text-center">${getTypeLabel(retur.type)}</td>
                  <td class="text-right">${formatRupiahDisplay(retur.total_refund)}</td>
                  <td class="text-center">
                    <span class="status-badge ${statusClass}">${getStatusLabelRetur(retur.status)}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda kepada UD. Mia Sari</p>
          <p>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div class="no-print" style="text-align:center; margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 20px; margin:5px; cursor:pointer;">Cetak Laporan</button>
        <button onclick="window.close()" style="padding:10px 20px; margin:5px; cursor:pointer;">Tutup</button>
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(laporanHTML);
  printWindow.document.close();
};