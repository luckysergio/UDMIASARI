// src/components/PrintRetur.jsx
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

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    approved: "Disetujui",
    rejected: "Ditolak",
    replacement_sent: "Pengganti Dikirim",
    completed: "Selesai",
  };
  return labels[status] || status;
};

const getTypeLabel = (type) => {
  const labels = {
    refund: "Retur Barang (Refund)",
    exchange: "Tukar Barang",
  };
  return labels[type] || type;
};

// Fungsi untuk render logo tanpa background kotak
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

export const printReturInvoice = (retur) => {
  const printWindow = window.open('', '_blank');
  
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Retur ${retur.return_no}</title>
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
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border: 1px solid #ddd;
        }
        /* Header dengan 3 kolom */
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
        .return-number {
          font-size: 12px;
          font-weight: bold;
          color: #333;
          background: #f5f5f5;
          padding: 6px 12px;
          border-radius: 6px;
          display: inline-block;
        }
        .return-number-label {
          font-size: 10px;
          color: #666;
          margin-bottom: 2px;
        }
        .invoice-title {
          text-align: center;
          margin: 20px 0;
        }
        .invoice-title h2 {
          font-size: 20px;
          border-bottom: 1px solid #333;
          display: inline-block;
          padding-bottom: 5px;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .info-box {
          border: 1px solid #ddd;
          padding: 10px;
          width: 48%;
        }
        .info-box p {
          margin: 5px 0;
        }
        .info-box strong {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
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
        .totals {
          margin-top: 20px;
          text-align: right;
        }
        .totals table {
          width: 300px;
          margin-left: auto;
        }
        .totals td {
          border: none;
          padding: 5px;
        }
        .grand-total {
          font-size: 16px;
          font-weight: bold;
          border-top: 2px solid #333;
          margin-top: 10px;
          padding-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #666;
        }
        .reject-reason {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          text-align: center;
        }
        .reject-reason p {
          color: #dc2626;
          font-size: 12px;
        }
        .replacement-info {
          background-color: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          text-align: center;
        }
        .replacement-info p {
          color: #0284c7;
          font-size: 12px;
        }
        .reason-box {
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          padding: 12px;
          margin: 10px 0;
          border-radius: 5px;
          text-align: center;
        }
        .reason-box p {
          color: #92400e;
          font-size: 12px;
        }
        .reason-box strong {
          color: #b45309;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-container {
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
      <div class="invoice-container">
        <!-- Header dengan 3 kolom: Logo | Info Toko | No Retur -->
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
            <div class="return-number">${retur.return_no}</div>
          </div>
        </div>
        
        <div class="invoice-title">
          <h2>FORM RETUR</h2>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <p><strong>TANGGAL:</strong> ${formatDate(retur.created_at)}</p>
            <p><strong>STATUS:</strong> ${getStatusLabel(retur.status)}</p>
            <p><strong>TIPE:</strong> ${getTypeLabel(retur.type)}</p>
          </div>
          <div class="info-box">
            <p><strong>INVOICE:</strong> ${retur.transaction?.invoice_no || '-'}</p>
            <p><strong>CUSTOMER:</strong> ${retur.transaction?.customer_name || 'Umum'}</p>
            <p><strong>KASIR:</strong> ${retur.creator?.name || '-'}</p>
          </div>
        </div>
        
        ${retur.reject_reason ? `
        <div class="reject-reason">
          <p><strong>⚠️ ALASAN PENOLAKAN:</strong></p>
          <p>${retur.reject_reason}</p>
        </div>
        ` : ''}
        
        ${retur.replacement_resi ? `
        <div class="replacement-info">
          <p><strong>📦 INFORMASI PENGIRIMAN PENGGANTI:</strong></p>
          <p>Nomor Resi: ${retur.replacement_resi}</p>
          <p>Tanggal Kirim: ${formatDate(retur.replacement_sent_at)}</p>
        </div>
        ` : ''}
        
        <div class="reason-box">
          <p><strong>📝 ALASAN RETUR:</strong></p>
          <p>${retur.reason}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Produk</th>
              <th>Kode</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Harga</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${retur.details?.map((detail, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${detail.product?.name || '-'}</td>
                <td>${detail.product?.code || '-'}</td>
                <td class="text-center">${detail.qty}</td>
                <td class="text-right">${formatRupiahDisplay(detail.price)}</td>
                <td class="text-right">${formatRupiahDisplay(detail.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr>
              <td width="70%">Total Refund:</td>
              <td class="text-right"><strong>${formatRupiahDisplay(retur.total_refund)}</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Terima kasih atas kepercayaan Anda!</p>
          <p>Retur akan diproses sesuai dengan kebijakan yang berlaku</p>
          <p>Dokumen dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
      <div class="no-print" style="text-align:center; margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 20px; margin:5px; cursor:pointer;">Cetak Retur</button>
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
  
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

export const printReturStruk = (retur) => {
  const printWindow = window.open('', '_blank');
  
  const strukHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Struk Retur ${retur.return_no}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          background: white;
          padding: 10px;
          width: 300px;
          margin: 0 auto;
        }
        .struk-container {
          width: 100%;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #333;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .header-logo {
          margin-bottom: 8px;
        }
        .header-logo img {
          width: 55px;
          height: auto;
          object-fit: contain;
        }
        .header h2 {
          font-size: 14px;
          margin-bottom: 3px;
        }
        .header p {
          font-size: 9px;
          line-height: 1.3;
        }
        .return-no {
          font-size: 10px;
          font-weight: bold;
          margin: 5px 0;
          padding: 3px;
          background: #f0f0f0;
          border-radius: 3px;
        }
        .info-row {
          margin: 5px 0;
          font-size: 10px;
        }
        .info-row strong {
          font-weight: bold;
        }
        table {
          width: 100%;
          margin: 10px 0;
          font-size: 9px;
        }
        th, td {
          text-align: left;
          padding: 3px 0;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .divider {
          border-top: 1px dashed #333;
          margin: 8px 0;
        }
        .total-row {
          font-weight: bold;
          font-size: 11px;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px dashed #333;
        }
        .footer {
          text-align: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px dashed #333;
          font-size: 8px;
        }
        .reject-reason {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          padding: 5px;
          margin: 10px 0;
          border-radius: 3px;
          text-align: center;
          font-size: 8px;
        }
        .replacement-info {
          background-color: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 5px;
          margin: 10px 0;
          border-radius: 3px;
          text-align: center;
          font-size: 8px;
        }
        .reason-text {
          background-color: #fef3c7;
          padding: 8px;
          margin: 10px 0;
          border-radius: 3px;
          text-align: center;
          font-size: 9px;
        }
        .reason-text strong {
          color: #b45309;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="struk-container">
        <div class="header">
          <div class="header-logo">
            <img 
              src="/images/logo.png" 
              alt="UD. Mia Sari Logo" 
              style="width: 55px; height: auto; object-fit: contain;"
              onerror="this.style.display='none'"
            />
          </div>
          <h2>UD. MIA SARI</h2>
          <p>KOTA TANGERANG, BANTEN</p>
          <p>Telp: 085886682496</p>
          <div class="return-no">No. Retur: ${retur.return_no}</div>
        </div>
        
        <div class="info-row">
          ${formatDate(retur.created_at)}
        </div>
        <div class="info-row">
          Status: ${getStatusLabel(retur.status)}
        </div>
        <div class="info-row">
          Tipe: ${getTypeLabel(retur.type)}
        </div>
        <div class="info-row">
          Invoice: ${retur.transaction?.invoice_no || '-'}
        </div>
        <div class="info-row">
          Customer: ${retur.transaction?.customer_name || 'Umum'}
        </div>
        
        ${retur.reject_reason ? `
        <div class="reject-reason">
          <strong>⚠️ Alasan Ditolak:</strong><br>
          ${retur.reject_reason}
        </div>
        ` : ''}
        
        ${retur.replacement_resi ? `
        <div class="replacement-info">
          <strong>📦 Resi Pengganti:</strong> ${retur.replacement_resi}<br>
          <strong>Tanggal Kirim:</strong> ${formatDate(retur.replacement_sent_at)}
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div class="reason-text">
          <strong>📝 Alasan Retur:</strong><br>
          ${retur.reason}
        </div>
        
        <div class="divider"></div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${retur.details?.map((detail) => `
              <tr>
                <td style="font-size:8px;">${detail.product?.name?.substring(0, 18) || '-'}</td>
                <td class="text-center">${detail.qty}</td>
                <td class="text-right">${formatRupiahDisplay(detail.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="total-row" style="display:flex; justify-content:space-between;">
          <strong>TOTAL REFUND:</strong>
          <strong>${formatRupiahDisplay(retur.total_refund)}</strong>
        </div>
        
        <div class="footer">
          <p>Terima kasih!</p>
          <p>Retur akan diproses sesuai kebijakan</p>
        </div>
      </div>
      <div class="no-print" style="text-align:center; margin-top:20px;">
        <button onclick="window.print()" style="padding:10px 20px; margin:5px; cursor:pointer;">Cetak</button>
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
  
  printWindow.document.write(strukHTML);
  printWindow.document.close();
};