// src/utils/exportUtils.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format Rupiah
const formatRupiah = (price) => {
  if (!price && price !== 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Format tanggal
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Export ke Excel
export const exportToExcel = (transactions, startDate, endDate, summary) => {
  // Prepare data for Excel
  const excelData = [
    ['LAPORAN TRANSAKSI'],
    [`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`],
    [''],
    ['RINGKASAN'],
    [`Total Pendapatan: ${formatRupiah(summary.totalRevenue)}`],
    [`Total Transaksi: ${summary.totalTransactions}`],
    [`Rata-rata Transaksi: ${formatRupiah(summary.averageTransaction)}`],
    [`Selesai: ${summary.completedCount} | Dibatalkan: ${summary.cancelledCount}`],
    [''],
    ['DETAIL TRANSAKSI'],
    ['No', 'No. Invoice', 'Tanggal', 'Customer', 'Jumlah Item', 'Total', 'Status']
  ];

  // Add transaction data
  transactions.forEach((transaction, index) => {
    excelData.push([
      index + 1,
      transaction.invoice_no,
      formatDate(transaction.created_at),
      transaction.customer_name || 'Umum',
      transaction.details?.length || 0,
      transaction.grand_total,
      getStatusLabel(transaction.status)
    ]);
  });

  // Add footer
  excelData.push(['']);
  excelData.push([`Dicetak: ${new Date().toLocaleString('id-ID')}`]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // No. Invoice
    { wch: 12 },  // Tanggal
    { wch: 20 },  // Customer
    { wch: 12 },  // Jumlah Item
    { wch: 15 },  // Total
    { wch: 12 }   // Status
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Laporan Transaksi');

  // Generate Excel file
  XLSX.writeFile(wb, `laporan_transaksi_${formatDate(startDate)}_${formatDate(endDate)}.xlsx`);
};

// Export ke PDF
export const exportToPDF = (transactions, startDate, endDate, summary) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Header
  doc.setFontSize(16);
  doc.text('UD. MIA SARI', 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Jl. Cut Nyak Dien, Kedaung Bar., Kec. Sepatan Tim., Kabupaten Tangerang', 105, 22, { align: 'center' });
  doc.text('Telp: +62 85886682496 | Email: baksomiasari@gmail.com', 105, 28, { align: 'center' });
  
  // Title
  doc.setFontSize(14);
  doc.text('LAPORAN TRANSAKSI', 105, 38, { align: 'center' });
  
  // Period
  doc.setFontSize(10);
  doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 105, 45, { align: 'center' });
  
  // Summary
  doc.setFontSize(10);
  doc.text(`Total Pendapatan: ${formatRupiah(summary.totalRevenue)}`, 20, 55);
  doc.text(`Total Transaksi: ${summary.totalTransactions}`, 20, 61);
  doc.text(`Rata-rata: ${formatRupiah(summary.averageTransaction)}`, 20, 67);
  doc.text(`Selesai: ${summary.completedCount} | Dibatalkan: ${summary.cancelledCount}`, 20, 73);
  
  // Table
  const tableData = transactions.map((transaction, index) => [
    index + 1,
    transaction.invoice_no,
    formatDate(transaction.created_at),
    transaction.customer_name || 'Umum',
    transaction.details?.length || 0,
    formatRupiah(transaction.grand_total),
    getStatusLabel(transaction.status)
  ]);
  
  autoTable(doc, {
    startY: 80,
    head: [['No', 'No. Invoice', 'Tanggal', 'Customer', 'Item', 'Total', 'Status']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 15 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 }
    }
  });
  
  // Footer
  const finalY = doc.lastAutoTable.finalY || 180;
  doc.setFontSize(8);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 105, finalY + 10, { align: 'center' });
  
  // Save PDF
  doc.save(`laporan_transaksi_${formatDate(startDate)}_${formatDate(endDate)}.pdf`);
};

// Helper untuk status label
const getStatusLabel = (status) => {
  const labels = {
    dipesan: "Dipesan",
    diproses: "Diproses",
    dikirim: "Dikirim",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
  };
  return labels[status] || status;
};