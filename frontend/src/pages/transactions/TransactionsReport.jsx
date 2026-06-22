// src/pages/transactions/TransactionsReport.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Loader2,
  Package,
  User,
  Calendar,
  DollarSign,
  Receipt,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Filter,
  XCircle as XCircleIcon,
  Printer,
  Download,
  FileText,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import transactionService from "../../services/transactionService";
import { Link } from "react-router-dom";
import { printInvoice, printStruk } from "../../components/PrintInvoice";
import { printLaporanTransaksi } from "../../components/PrintLaporan";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionsReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
  });
  
  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { success, error, warning } = useModal();

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    // 🔥 FIX: Pastikan price adalah number
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numericPrice);
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

  useEffect(() => {
    fetchReportTransactions();
  }, [currentPage, searchTerm, startDate, endDate]);

  const fetchReportTransactions = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: 15,
      search: searchTerm,
      start_date: startDate,
      end_date: endDate,
      status: "selesai",
    };
    
    const result = await transactionService.getTransactions(params);

    if (result.success) {
      const filteredTransactions = (result.data.data || []).filter(
        (transaction) => transaction.status === "selesai"
      );
      
      setTransactions(filteredTransactions);
      setTotalPages(result.data.last_page || 1);
      setTotalTransactions(filteredTransactions.length);
      calculateSummary(filteredTransactions);
    } else {
      error("Gagal", result.message);
      setTransactions([]);
    }
    setLoading(false);
  };

  // 🔥 FIX: Perbaiki perhitungan summary
  const calculateSummary = (data) => {
    let totalRevenue = 0;
    
    data.forEach(transaction => {
      // 🔥 Pastikan grand_total adalah number
      let amount = transaction.grand_total;
      if (typeof amount === 'string') {
        amount = parseFloat(amount);
      }
      if (typeof amount === 'number' && !isNaN(amount)) {
        totalRevenue += amount;
      }
    });
    
    const totalTransactionsCount = data.length;
    const averageTransaction = totalTransactionsCount > 0 ? totalRevenue / totalTransactionsCount : 0;
    
    setSummary({
      totalRevenue: totalRevenue,
      totalTransactions: totalTransactionsCount,
      averageTransaction: averageTransaction,
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenViewModal = async (transaction) => {
    const result = await transactionService.getTransactionDetail(transaction.id);
    if (result.success) {
      setSelectedTransaction(result.data);
      setIsModalOpen(true);
    } else {
      error("Gagal", result.message);
    }
  };

  const handleResetFilters = () => {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setSearchTerm("");
    setCurrentPage(1);
    setTimeout(() => fetchReportTransactions(), 0);
  };

  const handlePrintReport = () => {
    if (transactions.length === 0) {
      warning("Informasi", "Tidak ada data untuk dicetak");
      return;
    }
    
    const printSummary = {
      totalRevenue: summary.totalRevenue,
      totalTransactions: summary.totalTransactions,
      averageTransaction: summary.averageTransaction,
      completedCount: summary.totalTransactions,
      cancelledCount: 0,
    };
    
    printLaporanTransaksi(transactions, startDate, endDate, printSummary);
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      warning("Informasi", "Tidak ada data untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      const excelData = [
        ['LAPORAN TRANSAKSI SELESAI'],
        [`Periode: ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`],
        [''],
        ['RINGKASAN'],
        [`Total Pendapatan: ${formatRupiahDisplay(summary.totalRevenue)}`],
        [`Total Transaksi: ${summary.totalTransactions}`],
        [`Rata-rata Transaksi: ${formatRupiahDisplay(summary.averageTransaction)}`],
        [''],
        ['DETAIL TRANSAKSI'],
        ['No', 'No. Invoice', 'Tanggal', 'Customer', 'Jumlah Item', 'Total']
      ];

      transactions.forEach((transaction, index) => {
        excelData.push([
          index + 1,
          transaction.invoice_no,
          formatDateOnly(transaction.created_at),
          transaction.customer_name || 'Umum',
          transaction.details?.length || 0,
          transaction.grand_total || 0,
        ]);
      });

      excelData.push(['']);
      excelData.push([`Dicetak: ${new Date().toLocaleString('id-ID')}`]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      ws['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 15 },
        { wch: 25 },
        { wch: 12 },
        { wch: 18 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Transaksi Selesai');
      XLSX.writeFile(wb, `laporan_transaksi_selesai_${formatDateOnly(startDate)}_${formatDateOnly(endDate)}.xlsx`);
      success("Berhasil", "Laporan berhasil diekspor ke Excel");
    } catch (err) {
      console.error("Export error:", err);
      error("Gagal", "Terjadi kesalahan saat mengekspor laporan");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      warning("Informasi", "Tidak ada data untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      doc.setFontSize(16);
      doc.text('UD. MIA SARI', 105, 15, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Jl. Cut Nyak Dien, Kedaung Bar., Kec. Sepatan Tim., Kabupaten Tangerang, Banten 15520', 105, 22, { align: 'center' });
      doc.text('Telp: +62 85886682496 | Email: baksomiasari@gmail.com', 105, 28, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('LAPORAN TRANSAKSI SELESAI', 105, 38, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Periode: ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`, 105, 45, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text(`Total Pendapatan: ${formatRupiahDisplay(summary.totalRevenue)}`, 20, 55);
      doc.text(`Total Transaksi: ${summary.totalTransactions}`, 20, 61);
      doc.text(`Rata-rata: ${formatRupiahDisplay(summary.averageTransaction)}`, 20, 67);
      
      const tableData = transactions.map((transaction, index) => [
        (index + 1).toString(),
        transaction.invoice_no,
        formatDateOnly(transaction.created_at),
        transaction.customer_name || 'Umum',
        (transaction.details?.length || 0).toString(),
        formatRupiahDisplay(transaction.grand_total || 0),
      ]);
      
      autoTable(doc, {
        startY: 80,
        head: [['No', 'No. Invoice', 'Tanggal', 'Customer', 'Item', 'Total']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 42 },
          2: { cellWidth: 22 },
          3: { cellWidth: 42 },
          4: { cellWidth: 12 },
          5: { cellWidth: 35 },
        }
      });
      
      const finalY = doc.lastAutoTable.finalY || 180;
      doc.setFontSize(8);
      doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 105, finalY + 10, { align: 'center' });
      
      doc.save(`laporan_transaksi_selesai_${formatDateOnly(startDate)}_${formatDateOnly(endDate)}.pdf`);
      success("Berhasil", "Laporan PDF berhasil diekspor");
    } catch (err) {
      console.error("Export PDF error:", err);
      error("Gagal", "Terjadi kesalahan saat mengekspor laporan PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "selesai") {
      return { color: "bg-emerald-500/20 text-emerald-400", icon: <CheckCircle className="w-3 h-3" />, label: "Selesai" };
    }
    return { color: "bg-gray-500/20 text-gray-400", icon: null, label: status };
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="p-2 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Laporan Transaksi Selesai
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Rekap pendapatan dari transaksi yang telah selesai
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/transactions">
              <Button variant="secondary" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Transaksi Aktif
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={fetchReportTransactions}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-linear-to-br from-emerald-900/20 to-emerald-800/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Pendapatan</p>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white truncate">
            {formatRupiahDisplay(summary.totalRevenue)}
          </p>
        </div>
        
        <div className="bg-linear-to-br from-cyan-900/20 to-cyan-800/10 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Transaksi</p>
            <Receipt className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {summary.totalTransactions}
          </p>
        </div>
        
        <div className="bg-linear-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Rata-rata Transaksi</p>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white truncate">
            {formatRupiahDisplay(summary.averageTransaction)}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 mb-6 overflow-hidden">
        <div className="p-5">
          <div className="relative flex-1 mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor invoice atau customer..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                <Calendar className="w-3 h-3 inline mr-1" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                <Calendar className="w-3 h-3 inline mr-1" />
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
              />
            </div>
          </div>

          {(searchTerm || startDate !== new Date(new Date().setDate(1)).toISOString().split('T')[0] || endDate !== new Date().toISOString().split('T')[0]) && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2 text-sm"
              >
                <XCircleIcon className="w-4 h-4" />
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-3 justify-end mb-6">
        <button
          onClick={handlePrintReport}
          disabled={transactions.length === 0}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </button>
        <button
          onClick={handleExportExcel}
          disabled={isExporting || transactions.length === 0}
          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export Excel
        </button>
      </div>

      {/* Info Periode */}
      <div className="text-center mb-4">
        <p className="text-xs text-slate-400 bg-slate-800/30 inline-block px-4 py-1.5 rounded-full">
          Periode Laporan: {formatDateOnly(startDate)} - {formatDateOnly(endDate)}
        </p>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-2xl border border-slate-700 animate-pulse">
              <div className="p-5">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-700 rounded w-40"></div>
                    <div className="h-3 bg-slate-700 rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-28"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 text-center py-16">
          <CheckCircle className="w-20 h-20 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Tidak Ada Data Transaksi Selesai
          </h3>
          <p className="text-slate-400">
            {searchTerm
              ? "Tidak ditemukan transaksi dengan filter yang dipilih"
              : `Tidak ditemukan transaksi selesai pada periode ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-5 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600/30 transition-all duration-300"
          >
            Ubah Filter
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {transactions.map((transaction, idx) => {
              const status = getStatusBadge(transaction.status);
              return (
                <div
                  key={transaction.id}
                  className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                            <Receipt className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg truncate">
                              {transaction.invoice_no}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(transaction.created_at)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                                {status.icon}
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              Customer: {transaction.customer_name || "Umum"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatRupiahDisplay(transaction.grand_total)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {transaction.details?.length || 0} produk
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenViewModal(transaction)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-all duration-300 rounded-xl hover:bg-slate-700"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => printInvoice(transaction)}
                            className="p-2 text-gray-400 hover:text-gray-300 transition-all duration-300 rounded-xl hover:bg-slate-700"
                            title="Cetak Invoice"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Menampilkan {(currentPage - 1) * 15 + 1} -{" "}
                {Math.min(currentPage * 15, totalTransactions)} dari{" "}
                {totalTransactions} data
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-xl bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? "bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="p-2 rounded-xl bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Transaksi */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex-1 text-center">
                Detail Transaksi
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">
                  {selectedTransaction.invoice_no}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {formatDate(selectedTransaction.created_at)}
                </p>
                <div className="flex justify-center mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    Selesai
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl text-center sm:text-left">
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="text-white font-medium">
                    {selectedTransaction.customer_name ||
                      selectedTransaction.customer?.name ||
                      "Umum"}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center sm:text-left">
                  <p className="text-xs text-slate-400">Kasir</p>
                  <p className="text-white font-medium">
                    {selectedTransaction.creator?.name || "-"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-125">
                  <thead className="bg-slate-700/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs text-slate-400">Produk</th>
                      <th className="px-4 py-2 text-center text-xs text-slate-400">Qty</th>
                      <th className="px-4 py-2 text-right text-xs text-slate-400">Harga</th>
                      <th className="px-4 py-2 text-right text-xs text-slate-400">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.details?.map((detail) => (
                      <tr key={detail.id} className="border-b border-slate-700">
                        <td className="px-4 py-2 text-white">
                          {detail.product?.name}
                          <p className="text-xs text-slate-400">{detail.product?.code}</p>
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-center">{detail.qty}</td>
                        <td className="px-4 py-2 text-slate-300 text-right">{formatRupiahDisplay(detail.price)}</td>
                        <td className="px-4 py-2 text-white text-right font-medium">{formatRupiahDisplay(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 border-t border-slate-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{formatRupiahDisplay(selectedTransaction.subtotal)}</span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Diskon</span>
                    <span className="text-red-400">-{formatRupiahDisplay(selectedTransaction.discount)}</span>
                  </div>
                )}
                {selectedTransaction.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pajak</span>
                    <span className="text-yellow-400">+{formatRupiahDisplay(selectedTransaction.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">{formatRupiahDisplay(selectedTransaction.grand_total)}</span>
                </div>
              </div>

              {selectedTransaction.note && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Catatan</p>
                  <p className="text-white text-sm">{selectedTransaction.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 p-5 border-t border-slate-700 bg-slate-800 rounded-b-2xl flex-wrap">
              <Button
                variant="secondary"
                onClick={() => printInvoice(selectedTransaction)}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Invoice
              </Button>
              <Button
                variant="secondary"
                onClick={() => printStruk(selectedTransaction)}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TransactionsReport;