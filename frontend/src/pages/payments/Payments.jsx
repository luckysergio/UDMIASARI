// src/pages/payments/Payments.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Loader2,
  Receipt,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Image as ImageIcon,
  Filter,
  XCircle,
  FolderTree,
  Tag,
  Trash2,
  Shield,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import paymentService from "../../services/paymentService";
import transactionService from "../../services/transactionService";

const Payments = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  const { success, error, warning } = useModal();

  // Payment status options
  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "paid", label: "Lunas" },
    { value: "partial", label: "Sebagian" },
    { value: "pending", label: "Pending" },
  ];

  // Payment method options
  const methodOptions = [
    { value: "", label: "Semua Metode" },
    { value: "cash", label: "Tunai" },
    { value: "transfer", label: "Transfer Bank" },
    { value: "qris", label: "QRIS" },
    { value: "debit", label: "Debit" },
    { value: "credit_card", label: "Kartu Kredit" },
  ];

  useEffect(() => {
    fetchPayments();
    fetchTransactions();
  }, [currentPage, searchTerm, selectedStatus, selectedMethod, startDate, endDate, selectedTransactionId]);

  const fetchPayments = async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
    };
    
    if (selectedStatus) params.status = selectedStatus;
    if (selectedMethod) params.method = selectedMethod;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (selectedTransactionId) params.transaction_id = selectedTransactionId;
    
    const result = await paymentService.getPayments(params);

    if (result.success) {
      setPayments(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalPayments(result.data.total || 0);
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    const result = await transactionService.getTransactions({ limit: 100 });
    if (result.success) {
      setTransactions(result.data.data || []);
    }
    setLoadingTransactions(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenViewModal = async (payment) => {
    const result = await paymentService.getPaymentDetail(payment.id);
    if (result.success) {
      setSelectedPayment(result.data);
      setIsModalOpen(true);
    } else {
      error("Gagal", result.message);
    }
  };

  // 🔥 Fungsi untuk menghapus pembayaran
  const handleDeletePayment = (payment) => {
    warning(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus pembayaran untuk transaksi ${payment.transaction?.invoice_no || 'Unknown'} sebesar ${formatRupiah(payment.total_paid)}?`,
      async () => {
        setDeletingId(payment.id);
        const result = await paymentService.deletePayment(payment.id);
        
        if (result.success) {
          success("Berhasil", "Pembayaran berhasil dihapus");
          fetchPayments();
          // Jika modal detail terbuka, tutup
          if (isModalOpen && selectedPayment?.id === payment.id) {
            setIsModalOpen(false);
            setSelectedPayment(null);
          }
        } else {
          error("Gagal", result.message);
        }
        setDeletingId(null);
      },
      () => {
        console.log("Delete dibatalkan");
      },
      "Ya, Hapus",
      "Batal"
    );
  };

  const resetFilters = () => {
    setSelectedStatus("");
    setSelectedMethod("");
    setStartDate("");
    setEndDate("");
    setSelectedTransactionId("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // 🔥 FIX: Format Rupiah dengan validasi number
  const formatRupiah = (price) => {
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

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return { color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-3 h-3" />, label: "Lunas" };
      case "partial":
        return { color: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" />, label: "Sebagian" };
      case "pending":
        return { color: "bg-red-500/20 text-red-400", icon: <AlertCircle className="w-3 h-3" />, label: "Pending" };
      default:
        return { color: "bg-gray-500/20 text-gray-400", icon: null, label: status };
    }
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      cash: { color: "bg-green-500/20 text-green-400", label: "Tunai", icon: "💰" },
      transfer: { color: "bg-blue-500/20 text-blue-400", label: "Transfer Bank", icon: "🏦" },
      qris: { color: "bg-purple-500/20 text-purple-400", label: "QRIS", icon: "📱" },
      debit: { color: "bg-yellow-500/20 text-yellow-400", label: "Debit", icon: "💳" },
      credit_card: { color: "bg-orange-500/20 text-orange-400", label: "Kartu Kredit", icon: "💳" },
    };
    return methods[method] || { color: "bg-gray-500/20 text-gray-400", label: method, icon: "❓" };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";
    return `${baseUrl}/storage/${imagePath}`;
  };

  // 🔥 FIX: Group payments dengan validasi number
  const groupPaymentsByTransaction = () => {
    const grouped = {};
    payments.forEach(payment => {
      const transactionId = payment.transaction?.id;
      const invoiceNo = payment.transaction?.invoice_no;
      if (transactionId) {
        if (!grouped[transactionId]) {
          grouped[transactionId] = {
            invoice_no: invoiceNo,
            payments: [],
            total_paid: 0,
            grand_total: payment.transaction?.grand_total || 0,
          };
        }
        // 🔥 Validasi total_paid
        let paidAmount = payment.total_paid;
        if (typeof paidAmount === 'string') {
          paidAmount = parseFloat(paidAmount);
        }
        if (typeof paidAmount === 'number' && !isNaN(paidAmount)) {
          grouped[transactionId].total_paid += paidAmount;
        }
        grouped[transactionId].payments.push(payment);
      }
    });
    return grouped;
  };

  const groupedPayments = groupPaymentsByTransaction();

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Manajemen Pembayaran
              </h1>
              {isAdmin && (
                <div className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin Access
                </div>
              )}
            </div>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Kelola semua pembayaran transaksi
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchPayments}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan invoice atau kasir..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition md:w-auto"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Status Pembayaran</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Metode Pembayaran</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                >
                  {methodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Filter Transaksi</label>
                <select
                  value={selectedTransactionId}
                  onChange={(e) => setSelectedTransactionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                  disabled={loadingTransactions}
                >
                  <option value="">Semua Transaksi</option>
                  {transactions.map((transaction) => (
                    <option key={transaction.id} value={transaction.id}>
                      {transaction.invoice_no} - {formatRupiah(transaction.grand_total)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {(selectedStatus || selectedMethod || startDate || endDate || selectedTransactionId || searchTerm) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-700">
              <span className="text-xs text-slate-400">Filter aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                  Search: {searchTerm}
                </span>
              )}
              {selectedStatus && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedMethod && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                  Metode: {methodOptions.find(m => m.value === selectedMethod)?.label}
                </span>
              )}
              {selectedTransactionId && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                  Transaksi: {transactions.find(t => t.id === parseInt(selectedTransactionId))?.invoice_no}
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                  Dari: {new Date(startDate).toLocaleDateString("id-ID")}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                  Sampai: {new Date(endDate).toLocaleDateString("id-ID")}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Payments Display - Grouped by Transaction */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <div className="animate-pulse p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 bg-slate-700 rounded w-32"></div>
                  <div className="h-6 bg-slate-700 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Data
            </h3>
            <p className="text-slate-400">Belum ada pembayaran yang tercatat</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {Object.entries(groupedPayments).map(([transactionId, group]) => {
              // 🔥 FIX: Validasi untuk isFullyPaid dan remainingAmount
              const totalPaid = typeof group.total_paid === 'number' && !isNaN(group.total_paid) ? group.total_paid : 0;
              const grandTotal = typeof group.grand_total === 'number' && !isNaN(group.grand_total) ? group.grand_total : 0;
              const isFullyPaid = totalPaid >= grandTotal && grandTotal > 0;
              const remainingAmount = grandTotal - totalPaid;
              
              return (
                <Card
                  key={transactionId}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Transaction Header */}
                  <div className="bg-slate-800 p-4 border-b border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{group.invoice_no}</h3>
                          <p className="text-xs text-slate-400">
                            Total Tagihan: {formatRupiah(grandTotal)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total Dibayar</p>
                        <p className={`text-xl font-bold ${isFullyPaid ? "text-green-400" : "text-yellow-400"}`}>
                          {formatRupiah(totalPaid)}
                        </p>
                        {!isFullyPaid && remainingAmount > 0 && (
                          <p className="text-xs text-red-400">Sisa: {formatRupiah(remainingAmount)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Items */}
                  <div className="p-4 space-y-3">
                    {group.payments.map((payment) => {
                      const statusBadge = getPaymentStatusBadge(payment.status);
                      return (
                        <div
                          key={payment.id}
                          className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1 cursor-pointer" onClick={() => handleOpenViewModal(payment)}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(payment.created_at)}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                  <User className="w-3 h-3" />
                                  {payment.creator?.name || "-"}
                                </span>
                              </div>
                              {payment.note && (
                                <p className="text-xs text-slate-400 mt-2">{payment.note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-400">
                                  {formatRupiah(payment.total_paid)}
                                </p>
                              </div>
                              {/* 🔥 Tombol Hapus - Hanya untuk Admin */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeletePayment(payment)}
                                  disabled={deletingId === payment.id}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition opacity-0 group-hover:opacity-100 duration-200 disabled:opacity-50"
                                  title="Hapus Pembayaran"
                                >
                                  {deletingId === payment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Payment Methods */}
                          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-600">
                            {payment.details?.map((detail, idx) => {
                              const methodBadge = getPaymentMethodBadge(detail.method);
                              return (
                                <div
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${methodBadge.color}`}
                                >
                                  <span>{methodBadge.icon}</span>
                                  <span>{methodBadge.label}</span>
                                  <span className="font-semibold">{formatRupiah(detail.amount)}</span>
                                  {detail.reference_no && (
                                    <span className="text-slate-400 ml-1">(Ref: {detail.reference_no})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Menampilkan {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalPayments)} dari {totalPayments} data
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-2 rounded-xl bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
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
                        className={`w-9 h-9 rounded-xl font-medium transition ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white"
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
                  className="p-2 rounded-xl bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Pembayaran - Dengan Tombol Hapus untuk Admin */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Detail Pembayaran
              </h3>
              <div className="flex items-center gap-2">
                {/* 🔥 Tombol Hapus di Modal - Hanya untuk Admin */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      handleDeletePayment(selectedPayment);
                    }}
                    disabled={deletingId === selectedPayment.id}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                    title="Hapus Pembayaran"
                  >
                    {deletingId === selectedPayment.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Invoice Info */}
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">
                  {selectedPayment.transaction?.invoice_no}
                </h4>
                <p className="text-slate-400 text-sm mt-1">{formatDate(selectedPayment.created_at)}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getPaymentStatusBadge(selectedPayment.status).color} mt-2`}>
                  {getPaymentStatusBadge(selectedPayment.status).icon}
                  {getPaymentStatusBadge(selectedPayment.status).label}
                </span>
              </div>

              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Total Tagihan</p>
                  <p className="text-white font-semibold">{formatRupiah(selectedPayment.transaction?.grand_total)}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Total Dibayar</p>
                  <p className="text-emerald-400 font-semibold">{formatRupiah(selectedPayment.total_paid)}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Kasir</p>
                  <p className="text-white">{selectedPayment.creator?.name || "-"}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400">Tanggal</p>
                  <p className="text-white">{formatDate(selectedPayment.created_at)}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="text-white font-medium mb-2">Detail Pembayaran</h4>
                <div className="space-y-3">
                  {selectedPayment.details?.map((detail, idx) => {
                    const methodBadge = getPaymentMethodBadge(detail.method);
                    const proofImageUrl = getImageUrl(detail.proof_image);
                    
                    return (
                      <div key={idx} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${methodBadge.color}`}>
                            <span>{methodBadge.icon}</span>
                            {methodBadge.label}
                          </span>
                          <p className="text-white font-semibold">{formatRupiah(detail.amount)}</p>
                        </div>
                        {detail.reference_no && (
                          <p className="text-xs text-slate-400 mt-1">Referensi: {detail.reference_no}</p>
                        )}
                        {proofImageUrl && (
                          <div className="mt-3">
                            <label className="block text-xs text-slate-400 mb-2">Bukti Pembayaran</label>
                            <img
                              src={proofImageUrl}
                              alt="Bukti Pembayaran"
                              className="w-full max-h-48 object-cover rounded-lg border border-slate-600"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "";
                                e.target.alt = "Gambar tidak tersedia";
                              }}
                            />
                            <button
                              onClick={() => window.open(proofImageUrl, '_blank')}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
                            >
                              <ImageIcon className="w-3 h-3" />
                              Buka gambar baru
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedPayment.note && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400">Catatan</p>
                  <p className="text-white text-sm mt-1">{selectedPayment.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              {/* 🔥 Tombol Hapus di Footer Modal */}
              {isAdmin && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsModalOpen(false);
                    handleDeletePayment(selectedPayment);
                  }}
                  className="flex items-center gap-2"
                  disabled={deletingId === selectedPayment.id}
                >
                  {deletingId === selectedPayment.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Hapus
                </Button>
              )}
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

export default Payments;