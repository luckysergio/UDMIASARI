// src/pages/TransactionsHistory.jsx
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
  PackageCheck,
  MapPin,
  Phone,
  User as UserIcon,
  Image as ImageIcon,
  Filter,
  XCircle as XCircleIcon,
  Printer,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import transactionService from "../../services/transactionService";
import { Link } from "react-router-dom";
import { printInvoice, printStruk } from "../../components/PrintInvoice";

const TransactionsHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Filter tanggal state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const { success, error } = useModal();

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    fetchHistoryTransactions();
  }, [currentPage, searchTerm, startDate, endDate]);

  const fetchHistoryTransactions = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
    };
    
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }
    
    const result = await transactionService.getTransactions(params);

    if (result.success) {
      const filteredTransactions = (result.data.data || []).filter(
        (transaction) => 
          transaction.status === "selesai" || 
          transaction.status === "dibatalkan"
      );
      setTransactions(filteredTransactions);
      setTotalPages(result.data.last_page || 1);
      setTotalTransactions(result.data.total || 0);
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
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

  const handleOpenViewModal = async (transaction) => {
    const result = await transactionService.getTransactionDetail(transaction.id);
    if (result.success) {
      setSelectedTransaction(result.data);
      setIsModalOpen(true);
    } else {
      error("Gagal", result.message);
    }
  };

  const handleResetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
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

  const getStatusBadge = (status) => {
    const statuses = {
      selesai: {
        color: "bg-green-500/20 text-green-400",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Selesai",
      },
      dibatalkan: {
        color: "bg-red-500/20 text-red-400",
        icon: <XCircle className="w-3 h-3" />,
        label: "Dibatalkan",
      },
    };
    return (
      statuses[status] || {
        color: "bg-gray-500/20 text-gray-400",
        icon: null,
        label: status,
      }
    );
  };

  const getPaymentMethodBadge = (method) => {
    const methods = {
      cash: { color: "bg-green-500/20 text-green-400", label: "Tunai" },
      transfer: {
        color: "bg-blue-500/20 text-blue-400",
        label: "Transfer Bank",
      },
      qris: { color: "bg-purple-500/20 text-purple-400", label: "QRIS" },
      debit: { color: "bg-yellow-500/20 text-yellow-400", label: "Debit" },
      credit_card: {
        color: "bg-orange-500/20 text-orange-400",
        label: "Kartu Kredit",
      },
    };
    return (
      methods[method] || {
        color: "bg-gray-500/20 text-gray-400",
        label: method,
      }
    );
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const baseUrlWithoutApi = baseUrl.replace("/api", "");
    return `${baseUrlWithoutApi}/storage/${path}`;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Riwayat Transaksi
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Menampilkan transaksi yang sudah selesai atau dibatalkan
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/transactions">
              <Button variant="secondary" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Transaksi Aktif
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={fetchHistoryTransactions}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="flex flex-col gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor invoice..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
            />
          </div>

          {/* Tombol Toggle Filter Tanggal */}
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition md:w-auto"
          >
            <Filter className="w-4 h-4" />
            {showDateFilter ? "Sembunyikan Filter Tanggal" : "Tampilkan Filter Tanggal"}
          </button>

          {/* Filter Tanggal */}
          {showDateFilter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-xl">
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
              {(startDate || endDate) && (
                <div className="md:col-span-2 flex justify-center">
                  <button
                    onClick={handleResetDateFilter}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Reset Filter Tanggal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Filters Display */}
          {(searchTerm || startDate || endDate) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-700">
              <span className="text-xs text-slate-400">Filter aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                  Search: {searchTerm}
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Dari: {new Date(startDate).toLocaleDateString("id-ID")}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Sampai: {new Date(endDate).toLocaleDateString("id-ID")}
                </span>
              )}
              <span className="text-xs text-slate-400">
                Menampilkan {transactions.length} transaksi
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <div className="animate-pulse p-4">
                <div className="flex justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-700 rounded w-32"></div>
                    <div className="h-3 bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Riwayat
            </h3>
            <p className="text-slate-400">
              {searchTerm || startDate || endDate
                ? "Tidak ditemukan transaksi dengan filter yang dipilih"
                : "Belum ada transaksi yang selesai atau dibatalkan"}
            </p>
            {(searchTerm || startDate || endDate) && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                }} 
                className="mt-4 mx-auto"
              >
                Hapus Filter
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const status = getStatusBadge(transaction.status);
              const totalPaid = transaction.payments?.reduce(
                (sum, p) => sum + (Number(p.total_paid) || 0), 0
              ) || 0;
              const grandTotal = Number(transaction.grand_total) || 0;

              return (
                <Card
                  key={transaction.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300"
                >
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {transaction.invoice_no}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(transaction.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatRupiahDisplay(grandTotal)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Dibayar: {formatRupiahDisplay(totalPaid)}
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <button
                            onClick={() => handleOpenViewModal(transaction)}
                            className="text-blue-400 hover:text-blue-300 transition"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => printInvoice(transaction)}
                            className="text-gray-400 hover:text-gray-300 transition"
                            title="Cetak Invoice"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Menampilkan {(currentPage - 1) * 10 + 1} -{" "}
                {Math.min(currentPage * 10, totalTransactions)} dari{" "}
                {totalTransactions} data
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
                        className={`w-9 h-9 rounded-xl font-medium transition ${currentPage === pageNum ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
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

      {/* Modal Detail Transaksi */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Detail Transaksi
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Invoice Info */}
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">
                  {selectedTransaction.invoice_no}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {formatDate(selectedTransaction.created_at)}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedTransaction.status).color}`}
                  >
                    {getStatusBadge(selectedTransaction.status).icon}
                    {getStatusBadge(selectedTransaction.status).label}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Customer</p>
                      <p className="text-white font-medium">
                        {selectedTransaction.customer_name ||
                          selectedTransaction.customer?.name ||
                          "Umum"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Kasir</p>
                      <p className="text-white font-medium">
                        {selectedTransaction.creator?.name || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedTransaction.customer_phone && (
                  <div className="p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Telepon</p>
                        <p className="text-white">
                          {selectedTransaction.customer_phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTransaction.delivery_type && (
                  <div className="p-3 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      {selectedTransaction.delivery_type === "delivery" ? (
                        <Truck className="w-4 h-4 text-slate-400" />
                      ) : (
                        <PackageCheck className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <p className="text-xs text-slate-400">Pengiriman</p>
                        <p className="text-white">
                          {selectedTransaction.delivery_type === "delivery"
                            ? "Dikirim"
                            : "Ambil Sendiri"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              {selectedTransaction.delivery_address && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">
                        Alamat Pengiriman
                      </p>
                      <p className="text-white text-sm">
                        {selectedTransaction.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs text-slate-400">
                        Produk
                      </th>
                      <th className="px-4 py-2 text-center text-xs text-slate-400">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-400">
                        Harga
                      </th>
                      <th className="px-4 py-2 text-right text-xs text-slate-400">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.details?.map((detail) => (
                      <tr key={detail.id} className="border-b border-slate-700">
                        <td className="px-4 py-2 text-white">
                          {detail.product?.name}
                          <p className="text-xs text-slate-400">
                            {detail.product?.code}
                          </p>
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-center">
                          {detail.qty}
                        </td>
                        <td className="px-4 py-2 text-slate-300 text-right">
                          {formatRupiahDisplay(detail.price)}
                        </td>
                        <td className="px-4 py-2 text-white text-right font-medium">
                          {formatRupiahDisplay(detail.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-slate-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">
                    {formatRupiahDisplay(selectedTransaction.subtotal)}
                  </span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Diskon</span>
                    <span className="text-red-400">
                      -{formatRupiahDisplay(selectedTransaction.discount)}
                    </span>
                  </div>
                )}
                {selectedTransaction.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pajak</span>
                    <span className="text-yellow-400">
                      +{formatRupiahDisplay(selectedTransaction.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-700">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">
                    {formatRupiahDisplay(selectedTransaction.grand_total)}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Riwayat Pembayaran</h4>
                  <div className="space-y-2">
                    {selectedTransaction.payments.map((payment) => {
                      const totalPaid = payment.details?.reduce(
                        (sum, d) => sum + (Number(d.amount) || 0), 0
                      ) || Number(payment.total_paid) || 0;
                      return (
                        <div key={payment.id} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm font-medium">
                                {formatDate(payment.paid_at || payment.created_at)}
                              </p>
                              <p className="text-xs text-slate-400">
                                Status: {payment.status === "paid" ? "Lunas" : payment.status === "partial" ? "Sebagian" : "Pending"}
                              </p>
                            </div>
                            <p className="text-emerald-400 font-semibold">{formatRupiahDisplay(totalPaid)}</p>
                          </div>
                          {payment.details && payment.details.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-600 space-y-2">
                              {payment.details.map((detail, idx) => {
                                const methodBadge = getPaymentMethodBadge(detail.method);
                                return (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${methodBadge.color}`}>
                                        {methodBadge.label}
                                      </span>
                                      {detail.reference_no && (
                                        <span className="text-xs text-slate-400">Ref: {detail.reference_no}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-white">{formatRupiahDisplay(detail.amount)}</span>
                                      {detail.proof_image && (
                                        <button
                                          onClick={() => window.open(getImageUrl(detail.proof_image), "_blank")}
                                          className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-slate-600 rounded"
                                          title="Lihat Bukti Pembayaran"
                                        >
                                          <ImageIcon className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {payment.note && <p className="text-xs text-slate-400 mt-2">Catatan: {payment.note}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.note && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400">Catatan</p>
                  <p className="text-white text-sm mt-1">{selectedTransaction.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
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

export default TransactionsHistory;