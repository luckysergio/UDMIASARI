// src/pages/customer/CustomerReturs.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../components/layout/CustomerLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import { 
  Eye, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  AlertCircle,
  Plus,
  X,
  Loader2,
  Package,
  User,
  Receipt,
  Upload,
  Trash2,
  Info,
  ShoppingBag,
  Search,
  Printer,
} from "lucide-react";
import returService from "../../services/returService";
import transactionService from "../../services/transactionService";
import { printReturInvoice, printReturStruk } from "../../components/PrintRetur";

const CustomerReturs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useModal();
  
  const [returs, setReturs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRetur, setSelectedRetur] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Create Retur State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returItems, setReturItems] = useState([]);
  const [returType, setReturType] = useState("exchange");
  const [returReason, setReturReason] = useState("");
  const [returImages, setReturImages] = useState([]);
  const [returImagePreviews, setReturImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTransaction, setSearchTransaction] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchReturs();
  }, [user]);

  const fetchReturs = async () => {
    setLoading(true);
    try {
      const result = await returService.getReturs({
        limit: 100,
      });
      if (result.success) {
        const userReturs = result.data.data?.filter(
          (r) => r.transaction?.customer_id === user?.id || 
                 r.transaction?.customer_name === user?.name ||
                 r.customer_id === user?.id
        ) || [];
        setReturs(userReturs);
      }
    } catch (err) {
      console.error("Error fetching returs:", err);
    }
    setLoading(false);
  };

  const fetchCompletedTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const result = await transactionService.getTransactions({
        limit: 100,
        status: "completed",
      });
      if (result.success) {
        const completedTransactions = (result.data.data || []).filter(
          (t) => (t.customer_id === user?.id || t.customer_name === user?.name) && 
                 t.status === "selesai"
        );
        setTransactions(completedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleOpenCreateModal = () => {
    fetchCompletedTransactions();
    setSelectedTransaction(null);
    setReturItems([]);
    setReturType("exchange");
    setReturReason("");
    setReturImages([]);
    setReturImagePreviews([]);
    setSearchTransaction("");
    setCreateModalOpen(true);
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

    if (returImages.length + files.length > 5) {
      error("Validasi", "Maksimal 5 foto bukti retur");
      return;
    }

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

  const calculateTotalExchangeValue = () => {
    return returItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const validateReturForm = () => {
    const selectedItems = returItems.filter((item) => item.qty > 0);
    
    if (selectedItems.length === 0) {
      error("Validasi", "Minimal satu produk untuk diretur");
      return false;
    }
    
    if (!returReason.trim()) {
      error("Validasi", "Alasan retur wajib diisi");
      return false;
    }
    
    if (returReason.trim().length < 10) {
      error("Validasi", "Alasan retur minimal 10 karakter");
      return false;
    }
    
    if (returImages.length === 0) {
      error("Validasi", "Minimal satu bukti foto retur");
      return false;
    }
    
    return true;
  };

  const submitCreateRetur = async () => {
    if (!validateReturForm()) return;
    
    setIsSubmitting(true);
    
    const selectedItems = returItems.filter((item) => item.qty > 0);
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
      fetchReturs();
    } else {
      error("Gagal", result.message);
    }
    
    setIsSubmitting(false);
  };

  const formatRupiah = (price) => {
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

  const getStatusBadge = (status) => {
    const statuses = {
      pending: { color: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" />, label: "Pending" },
      approved: { color: "bg-blue-500/20 text-blue-400", icon: <CheckCircle className="w-3 h-3" />, label: "Disetujui" },
      rejected: { color: "bg-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" />, label: "Ditolak" },
      replacement_sent: { color: "bg-purple-500/20 text-purple-400", icon: <Truck className="w-3 h-3" />, label: "Pengganti Dikirim" },
      completed: { color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-3 h-3" />, label: "Selesai" },
    };
    return statuses[status] || { color: "bg-gray-500/20 text-gray-400", icon: null, label: status };
  };

  const getTypeBadge = (type) => {
    const types = {
      refund: { color: "bg-orange-500/20 text-orange-400", label: "Retur Barang (Refund)" },
      exchange: { color: "bg-indigo-500/20 text-indigo-400", label: "Tukar Barang" },
    };
    return types[type] || { color: "bg-gray-500/20 text-gray-400", label: type };
  };

  const handleViewDetail = (retur) => {
    setSelectedRetur(retur);
    setShowModal(true);
  };

  // 🔥 Fungsi untuk cetak invoice retur
  const handlePrintReturInvoice = (retur) => {
    printReturInvoice(retur);
  };

  // 🔥 Fungsi untuk cetak struk retur
  const handlePrintReturStruk = (retur) => {
    printReturStruk(retur);
  };

  // Filter transaksi berdasarkan pencarian
  const filteredTransactions = transactions.filter(t => 
    t.invoice_no.toLowerCase().includes(searchTransaction.toLowerCase())
  );

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Riwayat Retur</h1>
          <p className="text-slate-400">Lihat dan kelola retur barang Anda</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajukan Tukar Barang
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 animate-pulse">
              <div className="p-4">
                <div className="h-6 bg-slate-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-48"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : returs.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="py-12">
            <RefreshCw className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Retur</h3>
            <p className="text-slate-400">Anda belum memiliki riwayat retur</p>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="mt-4"
            >
              Ajukan Tukar Barang Sekarang
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {returs.map((retur, idx) => {
            const status = getStatusBadge(retur.status);
            const type = getTypeBadge(retur.type);
            return (
              <Card 
                key={retur.id} 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{retur.return_no}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(retur.created_at)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${type.color}`}>
                              {type.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatRupiah(retur.total_refund)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Invoice: {retur.transaction?.invoice_no || "-"}
                      </p>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrintReturInvoice(retur)}
                          className="p-2 text-gray-400 hover:text-gray-300 transition rounded-lg hover:bg-slate-700"
                          title="Cetak Invoice Retur"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintReturStruk(retur)}
                          className="p-2 text-gray-400 hover:text-gray-300 transition rounded-lg hover:bg-slate-700"
                          title="Cetak Struk Retur"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(retur)}
                          className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Detail Retur - Dengan Tombol Cetak */}
      {showModal && selectedRetur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Detail Retur
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">{selectedRetur.return_no}</h4>
                <p className="text-slate-400 text-sm mt-1">{formatDate(selectedRetur.created_at)}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTypeBadge(selectedRetur.type).color}`}>
                    {getTypeBadge(selectedRetur.type).label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedRetur.status).color}`}>
                    {getStatusBadge(selectedRetur.status).icon}
                    {getStatusBadge(selectedRetur.status).label}
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
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Customer</p>
                      <p className="text-white font-medium">
                        {selectedRetur.transaction?.customer_name || user?.name}
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
                      <p className="text-red-300 text-sm">{selectedRetur.reject_reason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedRetur.replacement_resi && (
                <div className="p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Nomor Resi Pengganti</p>
                      <p className="text-white text-sm">{selectedRetur.replacement_resi}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="text-white font-medium">Produk yang Diretur</h4>
                {selectedRetur.details?.map((detail) => (
                  <div key={detail.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                    <div>
                      <p className="text-white">{detail.product?.name}</p>
                      <p className="text-xs text-slate-400">{detail.qty} x {formatRupiah(detail.price)}</p>
                      {detail.note && (
                        <p className="text-xs text-yellow-400 mt-1">Catatan: {detail.note}</p>
                      )}
                    </div>
                    <p className="text-emerald-400 font-semibold">{formatRupiah(detail.subtotal)}</p>
                  </div>
                ))}
              </div>
              
              {selectedRetur.images && selectedRetur.images.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Bukti Foto</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedRetur.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => window.open(
                          image.image?.startsWith('http') ? image.image : 
                          `http://localhost:8000/storage/${image.image}`, 
                          "_blank"
                        )}
                        className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-600 hover:border-indigo-500 transition"
                      >
                        <img
                          src={image.image?.startsWith('http') ? image.image : 
                               `http://localhost:8000/storage/${image.image}`}
                          alt={`Bukti ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100?text=No+Image";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Nilai Barang</span>
                  <span className="text-2xl font-bold text-emerald-400">{formatRupiah(selectedRetur.total_refund)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl flex-wrap">
              <button
                onClick={() => printReturInvoice(selectedRetur)}
                className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Invoice
              </button>
              <button
                onClick={() => printReturStruk(selectedRetur)}
                className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600 hover:text-white transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Retur - Hanya untuk Exchange (Tukar Barang) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Ajukan Tukar Barang
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
              {/* Informasi Customer */}
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span className="text-white font-medium">Informasi Customer</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <span className="text-slate-300 text-sm">Nama: {user?.name}</span>
                  {user?.phone && <span className="text-slate-300 text-sm">Telepon: {user?.phone}</span>}
                </div>
              </div>
              
              {/* Informasi Tipe Retur - Hanya Exchange */}
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Tukar Barang (Exchange)</span>
                </div>
                <p className="text-xs text-slate-300 text-center mt-2">
                  Anda dapat mengajukan penukaran barang yang rusak/cacat dengan barang baru yang sama.
                  Proses penukaran akan diproses setelah retur disetujui.
                </p>
              </div>
              
              {!selectedTransaction ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                    Pilih Transaksi Yang Sudah Selesai
                  </label>
                  
                  {/* Search Transaction */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nomor invoice..."
                      value={searchTransaction}
                      onChange={(e) => setSearchTransaction(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                    />
                  </div>
                  
                  {loadingTransactions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">
                        {searchTransaction ? "Transaksi tidak ditemukan" : "Belum ada transaksi yang selesai"}
                      </p>
                      {!searchTransaction && (
                        <Button
                          variant="secondary"
                          onClick={() => window.location.href = "/customer/transactions"}
                          className="mt-3"
                          size="sm"
                        >
                          Lihat Transaksi Saya
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {filteredTransactions.map((transaction) => (
                        <button
                          key={transaction.id}
                          onClick={() => handleSelectTransaction(transaction)}
                          className="w-full p-3 bg-slate-700/30 rounded-lg text-left hover:bg-slate-700/50 transition border border-slate-600 hover:border-indigo-500"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-medium">{transaction.invoice_no}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400 font-semibold">
                                {formatRupiah(transaction.grand_total)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {transaction.details?.length || 0} produk
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Selected Transaction Info */}
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-400">Invoice</p>
                        <p className="text-white font-semibold">{selectedTransaction.invoice_no}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="text-emerald-400 font-semibold">
                          {formatRupiah(selectedTransaction.grand_total)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTransaction(null)}
                      className="mt-3 text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Ganti Transaksi
                    </button>
                  </div>
                  
                  {/* Pilih Produk */}
                  <div>
                    <h4 className="text-white font-medium mb-2 text-center">
                      Pilih Produk yang Akan Ditukar
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {returItems.map((item, index) => (
                        <div key={item.product_id} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">{item.product_name}</p>
                              <p className="text-xs text-slate-400">{item.product_code}</p>
                              <p className="text-emerald-400 text-xs mt-1">{formatRupiah(item.price)}</p>
                              <p className="text-xs text-slate-400">Maks: {item.max_qty}</p>
                            </div>
                            <div className="text-right">
                              <input
                                type="number"
                                value={item.qty}
                                onChange={(e) => updateReturItemQty(index, parseInt(e.target.value) || 0)}
                                min="0"
                                max={item.max_qty}
                                className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <textarea
                              placeholder="Catatan (opsional) - Misal: produk rusak, cacat, dll"
                              value={item.note || ""}
                              onChange={(e) => updateReturItemNote(index, e.target.value)}
                              rows="1"
                              className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Alasan Retur */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                      Alasan Pengajuan Tukar Barang <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={returReason}
                      onChange={(e) => setReturReason(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                      placeholder="Jelaskan alasan Anda ingin menukar barang (minimal 10 karakter)..."
                      disabled={isSubmitting}
                    />
                    {returReason && returReason.length < 10 && (
                      <p className="text-xs text-red-400 text-center mt-1">Minimal 10 karakter</p>
                    )}
                  </div>
                  
                  {/* Bukti Foto */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-center">
                      Bukti Foto Kerusakan/Cacat Produk <span className="text-red-400">*</span> <span className="text-slate-500 text-xs">(Maks 5 foto)</span>
                    </label>
                    <div className="flex flex-wrap gap-3 mb-2 justify-center">
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
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {returImages.length < 5 && (
                        <label className="w-20 h-20 rounded-lg bg-slate-700 border-2 border-dashed border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                          <Upload className="w-6 h-6 text-slate-400" />
                          <span className="text-xs text-slate-400 mt-1">Upload</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleReturImageChange}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 text-center">Maksimal 2MB per file (JPG, PNG, WEBP)</p>
                  </div>
                  
                  {/* Informasi untuk Exchange */}
                  <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-400">Informasi Tukar Barang</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Barang pengganti akan dikirim setelah retur disetujui oleh admin. 
                      Anda akan menerima notifikasi melalui email atau WhatsApp.
                    </p>
                    <div className="mt-3 pt-2 border-t border-blue-500/30">
                      <p className="text-xs text-slate-400">
                        Total nilai barang yang akan ditukar: <span className="text-emerald-400 font-semibold">{formatRupiah(calculateTotalExchangeValue())}</span>
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {/* Action Buttons */}
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
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Ajukan Tukar Barang"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerReturs;