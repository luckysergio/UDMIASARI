// src/pages/retur/ReturReport.jsx
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
  RefreshCw as ReturIcon,
  ThumbsUp,
  AlertCircle,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import returService from "../../services/returService";
import { Link } from "react-router-dom";
import { printReturInvoice, printReturStruk } from "../../components/PrintRetur";
import { printLaporanRetur } from "../../components/PrintLaporan";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReturReport = () => {
  const [returs, setReturs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturs, setTotalReturs] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetur, setSelectedRetur] = useState(null);
  const [summary, setSummary] = useState({
    totalRefund: 0,
    totalReturs: 0,
    averageRefund: 0,
    refundCount: 0,
    exchangeCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    completedCount: 0,
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
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { success, error, warning } = useModal();

  // 🔥 FIX: Format Rupiah dengan validasi number
  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    // Konversi ke number jika masih string
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
    fetchReturReport();
  }, [currentPage, searchTerm, startDate, endDate, selectedStatus, selectedType]);

  const fetchReturReport = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: 15,
      search: searchTerm,
      start_date: startDate,
      end_date: endDate,
    };
    
    if (selectedStatus) params.status = selectedStatus;
    if (selectedType) params.type = selectedType;
    
    const result = await returService.getReturs(params);

    if (result.success) {
      setReturs(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalReturs(result.data.total || 0);
      calculateSummary(result.data.data || []);
    } else {
      error("Gagal", result.message);
      setReturs([]);
    }
    setLoading(false);
  };

  // 🔥 FIX: Perbaiki perhitungan summary dengan validasi number
  const calculateSummary = (data) => {
    let totalRefund = 0;
    let refundCount = 0;
    let exchangeCount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let completedCount = 0;
    
    data.forEach(retur => {
      // 🔥 Validasi total_refund
      let refundAmount = retur.total_refund;
      if (typeof refundAmount === 'string') {
        refundAmount = parseFloat(refundAmount);
      }
      if (typeof refundAmount === 'number' && !isNaN(refundAmount)) {
        totalRefund += refundAmount;
      }
      
      if (retur.type === "refund") refundCount++;
      if (retur.type === "exchange") exchangeCount++;
      if (retur.status === "pending") pendingCount++;
      if (retur.status === "approved") approvedCount++;
      if (retur.status === "rejected") rejectedCount++;
      if (retur.status === "completed") completedCount++;
    });
    
    const totalRetursCount = data.length;
    const averageRefund = totalRetursCount > 0 ? totalRefund / totalRetursCount : 0;
    
    setSummary({
      totalRefund: totalRefund,
      totalReturs: totalRetursCount,
      averageRefund: averageRefund,
      refundCount: refundCount,
      exchangeCount: exchangeCount,
      pendingCount: pendingCount,
      approvedCount: approvedCount,
      rejectedCount: rejectedCount,
      completedCount: completedCount,
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

  const handleOpenViewModal = async (retur) => {
    const result = await returService.getReturDetail(retur.id);
    if (result.success) {
      setSelectedRetur(result.data);
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
    setSelectedStatus("");
    setSelectedType("");
    setSearchTerm("");
    setCurrentPage(1);
    setTimeout(() => fetchReturReport(), 0);
  };

  const handlePrintReport = () => {
    if (returs.length === 0) {
      warning("Informasi", "Tidak ada data untuk dicetak");
      return;
    }
    
    printLaporanRetur(returs, startDate, endDate, summary);
  };

  const handleExportExcel = () => {
    if (returs.length === 0) {
      warning("Informasi", "Tidak ada数据 untuk diekspor");
      return;
    }

    setIsExporting(true);

    try {
      const excelData = [
        ['LAPORAN RETUR'],
        [`Periode: ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`],
        [''],
        ['RINGKASAN'],
        [`Total Refund: ${formatRupiahDisplay(summary.totalRefund)}`],
        [`Total Retur: ${summary.totalReturs}`],
        [`Rata-rata Refund: ${formatRupiahDisplay(summary.averageRefund)}`],
        [`Refund: ${summary.refundCount} | Exchange: ${summary.exchangeCount}`],
        [`Pending: ${summary.pendingCount} | Disetujui: ${summary.approvedCount} | Selesai: ${summary.completedCount} | Ditolak: ${summary.rejectedCount}`],
        [''],
        ['DETAIL RETUR'],
        ['No', 'No. Retur', 'Tanggal', 'No. Invoice', 'Customer', 'Tipe', 'Total Refund', 'Status']
      ];

      returs.forEach((retur, index) => {
        excelData.push([
          index + 1,
          retur.return_no,
          formatDateOnly(retur.created_at),
          retur.transaction?.invoice_no || '-',
          retur.transaction?.customer_name || 'Umum',
          retur.type === 'refund' ? 'Retur Barang' : 'Tukar Barang',
          retur.total_refund || 0,
          getStatusText(retur.status)
        ]);
      });

      excelData.push(['']);
      excelData.push([`Dicetak: ${new Date().toLocaleString('id-ID')}`]);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      ws['!cols'] = [
        { wch: 6 },   // No
        { wch: 25 },  // No. Retur
        { wch: 12 },  // Tanggal
        { wch: 20 },  // No. Invoice
        { wch: 25 },  // Customer
        { wch: 18 },  // Tipe
        { wch: 18 },  // Total Refund
        { wch: 15 },  // Status
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Retur');
      XLSX.writeFile(wb, `laporan_retur_${formatDateOnly(startDate)}_${formatDateOnly(endDate)}.xlsx`);
      success("Berhasil", "Laporan berhasil diekspor ke Excel");
    } catch (err) {
      console.error("Export error:", err);
      error("Gagal", "Terjadi kesalahan saat mengekspor laporan");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (returs.length === 0) {
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
      doc.text('LAPORAN RETUR', 105, 38, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Periode: ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`, 105, 45, { align: 'center' });
      
      doc.setFontSize(9);
      doc.text(`Total Refund: ${formatRupiahDisplay(summary.totalRefund)}`, 20, 55);
      doc.text(`Total Retur: ${summary.totalReturs}`, 20, 61);
      doc.text(`Rata-rata: ${formatRupiahDisplay(summary.averageRefund)}`, 20, 67);
      doc.text(`Refund: ${summary.refundCount} | Exchange: ${summary.exchangeCount}`, 20, 73);
      doc.text(`Pending: ${summary.pendingCount} | Disetujui: ${summary.approvedCount} | Selesai: ${summary.completedCount} | Ditolak: ${summary.rejectedCount}`, 20, 79);
      
      const tableData = returs.map((retur, index) => [
        (index + 1).toString(),
        retur.return_no,
        formatDateOnly(retur.created_at),
        retur.transaction?.invoice_no || '-',
        retur.transaction?.customer_name || 'Umum',
        retur.type === 'refund' ? 'Retur Barang' : 'Tukar Barang',
        formatRupiahDisplay(retur.total_refund || 0),
        getStatusText(retur.status)
      ]);
      
      autoTable(doc, {
        startY: 90,
        head: [['No', 'No. Retur', 'Tanggal', 'No. Invoice', 'Customer', 'Tipe', 'Total Refund', 'Status']],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 30 },
          2: { cellWidth: 18 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { cellWidth: 22 },
          6: { cellWidth: 25 },
          7: { cellWidth: 18 }
        }
      });
      
      const finalY = doc.lastAutoTable.finalY || 180;
      doc.setFontSize(8);
      doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 105, finalY + 10, { align: 'center' });
      
      doc.save(`laporan_retur_${formatDateOnly(startDate)}_${formatDateOnly(endDate)}.pdf`);
      success("Berhasil", "Laporan PDF berhasil diekspor");
    } catch (err) {
      console.error("Export PDF error:", err);
      error("Gagal", "Terjadi kesalahan saat mengekspor laporan PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { color: "bg-amber-500/20 text-amber-400", icon: <Clock className="w-3 h-3" />, label: "Pending" },
      approved: { color: "bg-blue-500/20 text-blue-400", icon: <ThumbsUp className="w-3 h-3" />, label: "Disetujui" },
      rejected: { color: "bg-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" />, label: "Ditolak" },
      replacement_sent: { color: "bg-purple-500/20 text-purple-400", icon: <Truck className="w-3 h-3" />, label: "Pengganti Dikirim" },
      completed: { color: "bg-emerald-500/20 text-emerald-400", icon: <CheckCircle className="w-3 h-3" />, label: "Selesai" },
    };
    return statuses[status] || { color: "bg-gray-500/20 text-gray-400", icon: null, label: status };
  };

  const getStatusText = (status) => {
    const labels = {
      pending: "Pending",
      approved: "Disetujui",
      rejected: "Ditolak",
      replacement_sent: "Pengganti Dikirim",
      completed: "Selesai",
    };
    return labels[status] || status;
  };

  const getTypeBadge = (type) => {
    if (type === "refund") {
      return { color: "bg-orange-500/20 text-orange-400", label: "Retur Barang (Refund)", icon: "💰" };
    }
    return { color: "bg-indigo-500/20 text-indigo-400", label: "Tukar Barang", icon: "🔄" };
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
    { value: "replacement_sent", label: "Pengganti Dikirim" },
    { value: "completed", label: "Selesai" },
  ];

  const typeOptions = [
    { value: "", label: "Semua Tipe" },
    { value: "refund", label: "Retur Barang (Refund)" },
    { value: "exchange", label: "Tukar Barang" },
  ];

  // 🔥 Advanced Filters Toggle Button
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="p-2 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Laporan Retur
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Rekap dan analisis seluruh retur dalam periode tertentu
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/returs">
              <Button variant="secondary" className="flex items-center gap-2">
                <ReturIcon className="w-4 h-4" />
                Retur Aktif
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={fetchReturReport}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-emerald-900/20 to-emerald-800/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Refund</p>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white truncate">
            {formatRupiahDisplay(summary.totalRefund)}
          </p>
        </div>
        
        <div className="bg-linear-to-br from-cyan-900/20 to-cyan-800/10 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Total Retur</p>
            <Receipt className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {summary.totalReturs}
          </p>
          <div className="flex gap-2 justify-center mt-1">
            <span className="text-xs text-orange-400">Refund: {summary.refundCount}</span>
            <span className="text-xs text-indigo-400">Exchange: {summary.exchangeCount}</span>
          </div>
        </div>
        
        <div className="bg-linear-to-br from-purple-900/20 to-purple-800/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Rata-rata Refund</p>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white truncate">
            {formatRupiahDisplay(summary.averageRefund)}
          </p>
        </div>
        
        <div className="bg-linear-to-br from-amber-900/20 to-amber-800/10 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">Status Retur</p>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex justify-around mt-1">
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{summary.pendingCount}</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{summary.approvedCount}</p>
              <p className="text-xs text-slate-400">Disetujui</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{summary.completedCount}</p>
              <p className="text-xs text-slate-400">Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-400">{summary.rejectedCount}</p>
              <p className="text-xs text-slate-400">Ditolak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 mb-6 overflow-hidden">
        <div className="p-5">
          {/* Search Bar */}
          <div className="relative flex-1 mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor retur atau invoice..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          {/* Date Range */}
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

          {/* Advanced Filters Toggle */}
          <button
            onClick={toggleAdvancedFilters}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-600 transition-all duration-300 mb-4"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? "Sembunyikan Filter Lanjutan" : "Tampilkan Filter Lanjutan"}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-xl mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  Status Retur
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  Tipe Retur
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Reset Filter Button */}
          {(searchTerm || selectedStatus || selectedType || 
            startDate !== new Date(new Date().setDate(1)).toISOString().split('T')[0] || 
            endDate !== new Date().toISOString().split('T')[0]) && (
            <div className="flex justify-center">
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
          disabled={returs.length === 0}
          className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </button>
        <button
          onClick={handleExportExcel}
          disabled={isExporting || returs.length === 0}
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

      {/* Returs List */}
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
      ) : returs.length === 0 ? (
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 text-center py-16">
          <Receipt className="w-20 h-20 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Tidak Ada Data Retur
          </h3>
          <p className="text-slate-400">
            {searchTerm || selectedStatus || selectedType
              ? "Tidak ditemukan retur dengan filter yang dipilih"
              : `Tidak ditemukan retur pada periode ${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`}
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
            {returs.map((retur, idx) => {
              const status = getStatusBadge(retur.status);
              const type = getTypeBadge(retur.type);
              return (
                <div
                  key={retur.id}
                  className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                            <ReturIcon className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-lg truncate">
                              {retur.return_no}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(retur.created_at)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${type.color}`}>
                                <span>{type.icon}</span>
                                {type.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">
                              Invoice: {retur.transaction?.invoice_no || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatRupiahDisplay(retur.total_refund)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {retur.details?.length || 0} produk
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleOpenViewModal(retur)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-all duration-300 rounded-xl hover:bg-slate-700"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => printReturInvoice(retur)}
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Menampilkan {(currentPage - 1) * 15 + 1} -{" "}
                {Math.min(currentPage * 15, totalReturs)} dari{" "}
                {totalReturs} data
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
                            ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
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

      {/* Modal Detail Retur */}
      {isModalOpen && selectedRetur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm flex items-center justify-between p-5 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white flex-1 text-center">
                Detail Retur
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
                  {selectedRetur.return_no}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {formatDate(selectedRetur.created_at)}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedRetur.status).color}`}>
                    {getStatusBadge(selectedRetur.status).icon}
                    {getStatusBadge(selectedRetur.status).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getTypeBadge(selectedRetur.type).color}`}>
                    <span>{getTypeBadge(selectedRetur.type).icon}</span>
                    {getTypeBadge(selectedRetur.type).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl text-center sm:text-left">
                  <p className="text-xs text-slate-400">Invoice</p>
                  <p className="text-white font-medium">
                    {selectedRetur.transaction?.invoice_no || "-"}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center sm:text-left">
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="text-white font-medium">
                    {selectedRetur.transaction?.customer_name || "Umum"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-700/30 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Alasan Retur</p>
                <p className="text-white text-sm">{selectedRetur.reason}</p>
              </div>

              {selectedRetur.reject_reason && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <p className="text-xs text-red-400 mb-1">Alasan Penolakan</p>
                  <p className="text-red-300 text-sm">{selectedRetur.reject_reason}</p>
                </div>
              )}

              {selectedRetur.replacement_resi && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Nomor Resi Pengganti</p>
                  <p className="text-white text-sm">{selectedRetur.replacement_resi}</p>
                </div>
              )}

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
                    {selectedRetur.details?.map((detail) => (
                      <tr key={detail.id} className="border-b border-slate-700">
                        <td className="px-4 py-2 text-white">
                          {detail.product?.name}
                          <p className="text-xs text-slate-400">{detail.product?.code}</p>
                          {detail.note && (
                            <p className="text-xs text-yellow-400 mt-1">Catatan: {detail.note}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-center">{detail.qty}</td>
                        <td className="px-4 py-2 text-slate-300 text-right">{formatRupiahDisplay(detail.price)}</td>
                        <td className="px-4 py-2 text-white text-right font-medium">{formatRupiahDisplay(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Refund</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatRupiahDisplay(selectedRetur.total_refund)}
                  </p>
                </div>
              </div>

              {selectedRetur.images && selectedRetur.images.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Bukti Foto</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedRetur.images.map((image, idx) => {
                      const imageUrl = `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000"}/storage/${image.image}`;
                      return (
                        <button
                          key={idx}
                          onClick={() => window.open(imageUrl, "_blank")}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-600 hover:border-indigo-500 transition"
                        >
                          <img
                            src={imageUrl}
                            alt={`Bukti ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 p-5 border-t border-slate-700 bg-slate-800 rounded-b-2xl flex-wrap">
              <Button
                variant="secondary"
                onClick={() => printReturInvoice(selectedRetur)}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Invoice
              </Button>
              <Button
                variant="secondary"
                onClick={() => printReturStruk(selectedRetur)}
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

export default ReturReport;