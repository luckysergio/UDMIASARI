// src/pages/RetursHistory.jsx
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
  User as UserIcon,
  Image as ImageIcon,
  AlertCircle,
  Printer,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import returService from "../../services/returService";
import { Link } from "react-router-dom";
import { printReturInvoice, printReturStruk } from "../../components/PrintRetur";

const RetursHistory = () => {
  const [returs, setReturs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturs, setTotalReturs] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetur, setSelectedRetur] = useState(null);

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
    fetchHistoryReturs();
  }, [currentPage, searchTerm]);

  const fetchHistoryReturs = async () => {
    setLoading(true);
    const result = await returService.getReturs({
      page: currentPage,
      limit: 10,
      search: searchTerm,
    });

    if (result.success) {
      // 🔥 Filter hanya retur dengan status rejected atau completed
      const historyReturs = (result.data.data || []).filter(
        (retur) => retur.status === "rejected" || retur.status === "completed",
      );
      setReturs(historyReturs);
      setTotalPages(result.data.last_page || 1);
      setTotalReturs(result.data.total || 0);
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

  const handleOpenViewModal = async (retur) => {
    const result = await returService.getReturDetail(retur.id);
    if (result.success) {
      setSelectedRetur(result.data);
      setIsModalOpen(true);
    } else {
      error("Gagal", result.message);
    }
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
      rejected: {
        color: "bg-red-500/20 text-red-400",
        icon: <XCircle className="w-3 h-3" />,
        label: "Ditolak",
      },
      completed: {
        color: "bg-green-500/20 text-green-400",
        icon: <CheckCircle className="w-3 h-3" />,
        label: "Selesai",
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

  const getTypeBadge = (type) => {
    const types = {
      refund: {
        color: "bg-orange-500/20 text-orange-400",
        label: "Retur Barang (Refund)",
      },
      exchange: {
        color: "bg-indigo-500/20 text-indigo-400",
        label: "Tukar Barang",
      },
    };
    return (
      types[type] || { color: "bg-gray-500/20 text-gray-400", label: type }
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
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Riwayat Retur
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Menampilkan retur yang sudah selesai atau ditolak
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/returs">
              <Button variant="secondary" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Retur Aktif
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={fetchHistoryReturs}
              className="flex items-center gap-2"
              disabled={loading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor retur atau invoice..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
          />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
              >
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
      ) : returs.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Riwayat Retur
            </h3>
            <p className="text-slate-400">
              Belum ada retur yang selesai atau ditolak
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {returs.map((retur) => {
              const status = getStatusBadge(retur.status);
              const type = getTypeBadge(retur.type);
              return (
                <Card
                  key={retur.id}
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
                              {retur.return_no}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Calendar className="w-3 h-3" />
                                {formatDate(retur.created_at)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${type.color}`}
                              >
                                {type.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-emerald-400">
                          {formatRupiahDisplay(retur.total_refund)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Invoice: {retur.transaction?.invoice_no || "-"}
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
                            onClick={() => handleOpenViewModal(retur)}
                            className="text-blue-400 hover:text-blue-300 transition p-1"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => printReturInvoice(retur)}
                            className="text-gray-400 hover:text-gray-300 transition p-1"
                            title="Cetak Invoice Retur"
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
                {Math.min(currentPage * 10, totalReturs)} dari {totalReturs}{" "}
                data
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
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
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

      {/* Modal Detail Retur (View Only with Print) */}
      {isModalOpen && selectedRetur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Detail Retur
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">
                  {selectedRetur.return_no}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  {formatDate(selectedRetur.created_at)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedRetur.status).color}`}
                  >
                    {getStatusBadge(selectedRetur.status).icon}
                    {getStatusBadge(selectedRetur.status).label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeBadge(selectedRetur.type).color}`}
                  >
                    {getTypeBadge(selectedRetur.type).label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Invoice</p>
                      <p className="text-white font-medium">
                        {selectedRetur.transaction?.invoice_no || "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Customer</p>
                      <p className="text-white font-medium">
                        {selectedRetur.transaction?.customer_name || "Umum"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Alasan Retur</p>
                    <p className="text-white text-sm">{selectedRetur.reason}</p>
                  </div>
                </div>
              </div>
              {selectedRetur.reject_reason && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-red-400">Alasan Penolakan</p>
                      <p className="text-red-300 text-sm">
                        {selectedRetur.reject_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {selectedRetur.replacement_resi && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">
                        Nomor Resi Pengganti
                      </p>
                      <p className="text-white text-sm">
                        {selectedRetur.replacement_resi}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-white font-medium mb-2">
                  Produk yang Diretur
                </h4>
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
                      {selectedRetur.details?.map((detail) => (
                        <tr
                          key={detail.id}
                          className="border-b border-slate-700"
                        >
                          <td className="px-4 py-2 text-white">
                            {detail.product?.name}
                            <p className="text-xs text-slate-400">
                              {detail.product?.code}
                            </p>
                            {detail.note && (
                              <p className="text-xs text-yellow-400 mt-1">
                                Catatan: {detail.note}
                              </p>
                            )}
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
                    {selectedRetur.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          window.open(getImageUrl(image.image), "_blank")
                        }
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600 hover:border-indigo-500 transition"
                      >
                        <img
                          src={getImageUrl(image.image)}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
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

export default RetursHistory;