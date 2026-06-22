// src/pages/retur/RetursActive.jsx
import React, { useState, useEffect, useRef } from "react";
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
  MapPin,
  Phone,
  User as UserIcon,
  Upload,
  Image as ImageIcon,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Send,
  CheckCheck,
  Plus,
  Trash2,
  AlertCircle,
  Printer,
  Shield,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import returService from "../../services/returService";
import transactionService from "../../services/transactionService";
import { Link } from "react-router-dom";
import { printReturInvoice, printReturStruk } from "../../components/PrintRetur";

const RetursActive = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [returs, setReturs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturs, setTotalReturs] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRetur, setSelectedRetur] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [resiNumber, setResiNumber] = useState("");
  const [actionType, setActionType] = useState(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returItems, setReturItems] = useState([]);
  const [returType, setReturType] = useState("refund");
  const [returReason, setReturReason] = useState("");
  const [returImages, setReturImages] = useState([]);
  const [returImagePreviews, setReturImagePreviews] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const fileInputRef = useRef(null);

  const { success, error, warning } = useModal();

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    fetchActiveReturs();
  }, [currentPage, searchTerm]);

  const fetchActiveReturs = async () => {
    setLoading(true);
    const result = await returService.getReturs({
      page: currentPage,
      limit: 10,
      search: searchTerm,
    });

    if (result.success) {
      const activeReturs = (result.data.data || []).filter(
        (retur) =>
          retur.status === "pending" ||
          retur.status === "approved" ||
          retur.status === "replacement_sent",
      );
      setReturs(activeReturs);
      setTotalPages(result.data.last_page || 1);
      setTotalReturs(result.data.total || 0);
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const result = await transactionService.getTransactions({
        limit: 100,
      });
      if (result.success) {
        const completedTransactions = (result.data.data || []).filter(
          (t) => t.status === "selesai",
        );
        setTransactions(completedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
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

  const handleOpenCreateModal = async () => {
    // 🔥 CEK HAK AKSES - HANYA ADMIN
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat membuat retur baru");
      return;
    }
    
    await fetchTransactions();
    setSelectedTransaction(null);
    setReturItems([]);
    setReturType("refund");
    setReturReason("");
    setReturImages([]);
    setReturImagePreviews([]);
    setCreateModalOpen(true);
  };

  const handleApprove = (retur) => {
    // 🔥 CEK HAK AKSES - HANYA ADMIN
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat menyetujui retur");
      return;
    }
    
    warning(
      "Konfirmasi Approve",
      `Apakah Anda yakin ingin menyetujui retur ${retur.return_no}?`,
      async () => {
        setIsSubmitting(true);
        const result = await returService.approveRetur(retur.id);
        if (result.success) {
          success("Berhasil", result.message);
          await fetchActiveReturs();
          if (isModalOpen) {
            setIsModalOpen(false);
          }
        } else {
          error("Gagal", result.message);
        }
        setIsSubmitting(false);
      },
    );
  };

  const handleReject = (retur) => {
    // 🔥 CEK HAK AKSES - HANYA ADMIN
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat menolak retur");
      return;
    }
    
    setActionType("reject");
    setSelectedRetur(retur);
    setRejectReason("");
  };

  const handleSendReplacement = (retur) => {
    // 🔥 CEK HAK AKSES - HANYA ADMIN
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat mengirim barang pengganti");
      return;
    }
    
    setActionType("replacement");
    setSelectedRetur(retur);
    setResiNumber("");
  };

  const handleComplete = (retur) => {
    // 🔥 CEK HAK AKSES - HANYA ADMIN
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat menyelesaikan retur");
      return;
    }
    
    warning(
      "Konfirmasi Selesai",
      `Apakah Anda yakin ingin menyelesaikan retur ${retur.return_no}?`,
      async () => {
        setIsSubmitting(true);
        const result = await returService.completeRetur(retur.id);
        if (result.success) {
          success("Berhasil", result.message);
          await fetchActiveReturs();
          if (isModalOpen) {
            setIsModalOpen(false);
          }
        } else {
          error("Gagal", result.message);
        }
        setIsSubmitting(false);
      },
    );
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      error("Validasi", "Alasan penolakan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    const result = await returService.rejectRetur(
      selectedRetur.id,
      rejectReason,
    );
    if (result.success) {
      success("Berhasil", result.message);
      setActionType(null);
      setSelectedRetur(null);
      setRejectReason("");
      fetchActiveReturs();
    } else {
      error("Gagal", result.message);
    }
    setIsSubmitting(false);
  };

  const submitSendReplacement = async () => {
    if (!resiNumber.trim()) {
      error("Validasi", "Nomor resi wajib diisi");
      return;
    }

    setIsSubmitting(true);
    const result = await returService.sendReplacement(
      selectedRetur.id,
      resiNumber,
    );
    if (result.success) {
      success("Berhasil", result.message);
      setActionType(null);
      setSelectedRetur(null);
      setResiNumber("");
      await fetchActiveReturs();
      if (isModalOpen) {
        setIsModalOpen(false);
      }
    } else {
      error("Gagal", result.message);
    }
    setIsSubmitting(false);
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setReturItems(
      transaction.details?.map((detail) => ({
        product_id: detail.product_id,
        product_name: detail.product?.name,
        product_code: detail.product?.code,
        price: detail.price,
        max_qty: detail.qty,
        qty: 0,
        note: "",
      })) || [],
    );
  };

  const updateReturItemQty = (index, qty) => {
    const newQty = Math.min(Math.max(0, qty), returItems[index].max_qty);
    const updatedItems = [...returItems];
    updatedItems[index].qty = newQty;
    setReturItems(updatedItems);
  };

  const updateReturItemNote = (index, note) => {
    const updatedItems = [...returItems];
    updatedItems[index].note = note;
    setReturItems(updatedItems);
  };

  const handleReturImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        error("Validasi", "File harus berupa gambar (JPG, PNG, WEBP)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        error("Validasi", "Ukuran file maksimal 2MB");
        return;
      }
    }

    setReturImages([...returImages, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReturImage = (index) => {
    setReturImages(returImages.filter((_, i) => i !== index));
    setReturImagePreviews(returImagePreviews.filter((_, i) => i !== index));
  };

  const submitCreateRetur = async () => {
    const selectedItems = returItems.filter((item) => item.qty > 0);

    if (selectedItems.length === 0) {
      error("Validasi", "Minimal satu produk untuk diretur");
      return;
    }

    if (!returReason.trim()) {
      error("Validasi", "Alasan retur wajib diisi minimal 10 karakter");
      return;
    }

    if (returReason.trim().length < 10) {
      error("Validasi", "Alasan retur minimal 10 karakter");
      return;
    }

    if (returImages.length === 0) {
      error("Validasi", "Minimal satu bukti foto retur");
      return;
    }

    setIsSubmitting(true);

    const formattedItems = selectedItems.map((item) => ({
      product_id: item.product_id,
      qty: item.qty,
      note: item.note || null,
    }));

    const submitData = {
      transaction_id: selectedTransaction.id,
      type: returType,
      reason: returReason,
      items: formattedItems,
    };

    const result = await returService.createRetur(submitData, returImages);

    if (result.success) {
      success("Berhasil", result.message);
      setCreateModalOpen(false);
      fetchActiveReturs();
    } else {
      error("Gagal", result.message);
    }

    setIsSubmitting(false);
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
      pending: {
        color: "bg-yellow-500/20 text-yellow-400",
        icon: <Clock className="w-3 h-3" />,
        label: "Pending",
      },
      approved: {
        color: "bg-blue-500/20 text-blue-400",
        icon: <ThumbsUp className="w-3 h-3" />,
        label: "Disetujui",
      },
      replacement_sent: {
        color: "bg-purple-500/20 text-purple-400",
        icon: <Truck className="w-3 h-3" />,
        label: "Pengganti Dikirim",
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

  const calculateTotalRefund = () => {
    return returItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Retur Aktif
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Menampilkan retur yang sedang diproses (Pending, Disetujui, Pengganti Dikirim)
            </p>
          </div>
          <div className="flex gap-3">
            {/* Badge Role */}
            <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              isAdmin 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                : "bg-slate-700 text-slate-400 border border-slate-600"
            }`}>
              <Shield className="w-3 h-3" />
              {isAdmin ? "Administrator" : "Read Only"}
            </div>
            <Link to="/returs/history">
              <Button variant="secondary" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Riwayat Retur
              </Button>
            </Link>
            {/* 🔥 Tombol Buat Retur - HANYA UNTUK ADMIN */}
            {isAdmin && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Retur
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
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

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={fetchActiveReturs}
          className="flex items-center gap-2"
          disabled={loading}
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Returs List */}
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
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Retur Aktif
            </h3>
            <p className="text-slate-400">
              Semua retur sudah selesai atau ditolak
            </p>
            {isAdmin && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="mt-4 mx-auto"
              >
                Buat Retur Baru
              </Button>
            )}
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
                        <div className="flex items-center justify-end gap-2 mt-2 flex-wrap">
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
                          {/* 🔥 Action Buttons - HANYA UNTUK ADMIN */}
                          {isAdmin && retur.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(retur)}
                                className="text-green-400 hover:text-green-300 transition p-1"
                                title="Setujui"
                                disabled={isSubmitting}
                              >
                                <ThumbsUp className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(retur)}
                                className="text-red-400 hover:text-red-300 transition p-1"
                                title="Tolak"
                                disabled={isSubmitting}
                              >
                                <ThumbsDown className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {isAdmin && retur.status === "approved" &&
                            retur.type === "exchange" && (
                              <button
                                onClick={() => handleSendReplacement(retur)}
                                className="text-purple-400 hover:text-purple-300 transition p-1"
                                title="Kirim Pengganti"
                                disabled={isSubmitting}
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            )}
                          {isAdmin && retur.status === "replacement_sent" && (
                            <button
                              onClick={() => handleComplete(retur)}
                              className="text-emerald-400 hover:text-emerald-300 transition p-1"
                              title="Selesaikan"
                              disabled={isSubmitting}
                            >
                              <CheckCheck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
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

      {/* Modal Detail Retur */}
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
              {/* Header Info */}
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

              {/* Transaction Info */}
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

              {/* Reason */}
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

              {/* Items Table */}
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

              {/* Total Refund */}
              <div className="flex justify-end pt-4 border-t border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total Refund</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatRupiahDisplay(selectedRetur.total_refund)}
                  </p>
                </div>
              </div>

              {/* Images */}
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

              {/* Action Buttons in Modal - HANYA UNTUK ADMIN */}
              {isAdmin && (
                <div className="flex justify-center gap-3 pt-4 border-t border-slate-700 flex-wrap">
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
                  {selectedRetur.status === "pending" && (
                    <>
                      <Button
                        variant="success"
                        onClick={() => {
                          setIsModalOpen(false);
                          handleApprove(selectedRetur);
                        }}
                        className="flex items-center gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Setujui
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          setIsModalOpen(false);
                          handleReject(selectedRetur);
                        }}
                        className="flex items-center gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Tolak
                      </Button>
                    </>
                  )}
                  {selectedRetur.status === "approved" &&
                    selectedRetur.type === "exchange" && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setIsModalOpen(false);
                          handleSendReplacement(selectedRetur);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Kirim Pengganti
                      </Button>
                    )}
                  {selectedRetur.status === "replacement_sent" && (
                    <Button
                      variant="success"
                      onClick={() => {
                        setIsModalOpen(false);
                        handleComplete(selectedRetur);
                      }}
                      className="flex items-center gap-2"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Selesaikan
                    </Button>
                  )}
                </div>
              )}

              {/* Print buttons only for non-admin */}
              {!isAdmin && (
                <div className="flex justify-center gap-3 pt-4 border-t border-slate-700 flex-wrap">
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
                </div>
              )}
            </div>
            <div className="flex justify-center p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject - HANYA UNTUK ADMIN */}
      {actionType === "reject" && selectedRetur && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Tolak Retur
              </h3>
              <button
                onClick={() => {
                  setActionType(null);
                  setSelectedRetur(null);
                }}
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-center">
                Apakah Anda yakin ingin menolak retur{" "}
                <span className="font-semibold text-white">
                  {selectedRetur.return_no}
                </span>
                ?
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                  Alasan Penolakan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Masukkan alasan penolakan..."
                />
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="secondary" onClick={() => setActionType(null)}>
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={submitReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Ya, Tolak"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Send Replacement - HANYA UNTUK ADMIN */}
      {actionType === "replacement" && selectedRetur && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Kirim Barang Pengganti
              </h3>
              <button
                onClick={() => {
                  setActionType(null);
                  setSelectedRetur(null);
                }}
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-center">
                Masukkan nomor resi pengiriman untuk retur{" "}
                <span className="font-semibold text-white">
                  {selectedRetur.return_no}
                </span>
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                  Nomor Resi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={resiNumber}
                  onChange={(e) => setResiNumber(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center"
                  placeholder="Masukkan nomor resi"
                />
              </div>
              <div className="flex justify-center gap-3 pt-4">
                <Button variant="secondary" onClick={() => setActionType(null)}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={submitSendReplacement}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Kirim"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Retur - HANYA UNTUK ADMIN */}
      {createModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Buat Retur Baru
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {!selectedTransaction ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                    Pilih Transaksi
                  </label>
                  <select
                    onChange={(e) => {
                      const transaction = transactions.find(
                        (t) => t.id === parseInt(e.target.value),
                      );
                      if (transaction) handleSelectTransaction(transaction);
                    }}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    disabled={loadingTransactions}
                  >
                    <option value="">Pilih Transaksi</option>
                    {transactions.map((transaction) => (
                      <option key={transaction.id} value={transaction.id}>
                        {transaction.invoice_no} -{" "}
                        {formatRupiahDisplay(transaction.grand_total)}
                      </option>
                    ))}
                  </select>
                  {loadingTransactions && (
                    <div className="flex justify-center mt-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-400">Invoice</p>
                        <p className="text-white font-semibold">
                          {selectedTransaction.invoice_no}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="text-emerald-400 font-semibold">
                          {formatRupiahDisplay(selectedTransaction.grand_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                      Tipe Retur
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReturType("refund")}
                        className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${returType === "refund" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`}
                      >
                        Retur Barang (Refund)
                      </button>
                      <button
                        type="button"
                        onClick={() => setReturType("exchange")}
                        className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${returType === "exchange" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`}
                      >
                        Tukar Barang
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2 text-center">
                      Pilih Produk yang Diretur
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {returItems.map((item, index) => (
                        <div
                          key={item.product_id}
                          className="bg-slate-700/30 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.product_code}
                              </p>
                              <p className="text-emerald-400 text-xs mt-1">
                                {formatRupiahDisplay(item.price)}
                              </p>
                              <p className="text-xs text-slate-400">
                                Maks: {item.max_qty}
                              </p>
                            </div>
                            <div className="text-right">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) =>
                                  updateReturItemQty(
                                    index,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                min="0"
                                max={item.max_qty}
                                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <textarea
                              placeholder="Catatan (opsional)"
                              value={item.note || ""}
                              onChange={(e) =>
                                updateReturItemNote(index, e.target.value)
                              }
                              rows="1"
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                      Alasan Retur <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={returReason}
                      onChange={(e) => setReturReason(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                      placeholder="Masukkan alasan retur (minimal 10 karakter)..."
                    />
                    {returReason && returReason.length < 10 && (
                      <p className="text-xs text-red-400 text-center mt-1">
                        Minimal 10 karakter
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                      Bukti Foto <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {returImagePreviews.map((preview, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-20 h-20 rounded-lg object-cover border border-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeReturImage(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 rounded-lg bg-slate-700 border-2 border-dashed border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-400 mt-1">
                          Upload
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleReturImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Maksimal 2MB per file (JPG, PNG, WEBP)
                    </p>
                  </div>
                  {returType === "refund" && (
                    <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30 text-center">
                      <p className="text-sm text-slate-400">Total Refund</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatRupiahDisplay(calculateTotalRefund())}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                {selectedTransaction && (
                  <Button
                    variant="primary"
                    onClick={submitCreateRetur}
                    disabled={isSubmitting}
                    className="min-w-25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Memproses...
                      </>
                    ) : (
                      "Buat Retur"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default RetursActive;