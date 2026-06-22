import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import CustomerLayout from "../../components/layout/CustomerLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { 
  Eye, 
  Calendar, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  CreditCard,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Printer,
  Upload,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Receipt,
  Wallet,
  Banknote,
  QrCode,
} from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import transactionService from "../../services/transactionService";
import paymentService from "../../services/paymentService";
import { printInvoice, printStruk } from "../../components/PrintInvoice";

const CustomerTransactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { success, error, warning } = useModal();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedPayments, setExpandedPayments] = useState({});
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);
  
  // Checkout form
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    delivery_type: "pickup",
    delivery_address: "",
    note: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Payment state - Hanya Transfer dengan upload bukti
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTransactionForPayment, setSelectedTransactionForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState({});
  const fileInputRef = useRef(null);

  // Informasi Rekening Tujuan
  const bankInfo = {
    bank: "BCA",
    accountNumber: "1082503506",
    accountName: "Muhamad Alfarel Julianto",
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchTransactions();
    loadCartFromStorage();
  }, [isAuthenticated, navigate, location]);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("customerCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (newCart) => {
    localStorage.setItem("customerCart", JSON.stringify(newCart));
    setCart(newCart);
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 500);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await transactionService.getTransactions({ limit: 100 });
      if (result.success) {
        const userTransactions = result.data.data?.filter(
          (t) => t.customer_id === user?.id || t.customer_name === user?.name
        ) || [];
        // Urutkan dari yang terbaru
        setTransactions(userTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
    setLoading(false);
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
      dipesan: { color: "bg-yellow-500/20 text-yellow-400", icon: <Clock className="w-3 h-3" />, label: "Dipesan" },
      diproses: { color: "bg-blue-500/20 text-blue-400", icon: <Package className="w-3 h-3" />, label: "Diproses" },
      dikirim: { color: "bg-purple-500/20 text-purple-400", icon: <Truck className="w-3 h-3" />, label: "Dikirim" },
      selesai: { color: "bg-green-500/20 text-green-400", icon: <CheckCircle className="w-3 h-3" />, label: "Selesai" },
      dibatalkan: { color: "bg-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" />, label: "Dibatalkan" },
    };
    return statuses[status] || { color: "bg-gray-500/20 text-gray-400", icon: null, label: status };
  };

  const getPaymentStatusBadge = (status) => {
    const statuses = {
      paid: { color: "bg-green-500/20 text-green-400", label: "Lunas" },
      partial: { color: "bg-yellow-500/20 text-yellow-400", label: "Sebagian" },
      pending: { color: "bg-red-500/20 text-red-400", label: "Pending" },
    };
    return statuses[status] || statuses.pending;
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'transfer': return <CreditCard className="w-4 h-4" />;
      case 'qris': return <QrCode className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return "Tunai";
      case 'transfer': return "Transfer Bank";
      case 'qris': return "QRIS";
      default: return method;
    }
  };

  const handleViewDetail = async (transaction) => {
    const result = await transactionService.getTransactionDetail(transaction.id);
    if (result.success) {
      setSelectedTransaction(result.data);
      setShowModal(true);
    } else {
      error("Gagal", "Tidak dapat memuat detail transaksi");
    }
  };

  const handleOpenPaymentModal = (transaction) => {
    const totalPaid = transaction.payments?.reduce((sum, p) => sum + (p.total_paid || 0), 0) || 0;
    const remainingAmount = transaction.grand_total - totalPaid;
    
    if (remainingAmount <= 0) {
      error("Informasi", "Transaksi ini sudah lunas");
      return;
    }
    
    setSelectedTransactionForPayment(transaction);
    setPaymentAmount("");
    setPaymentReference("");
    setPaymentNote("");
    setProofImage(null);
    setProofImagePreview(null);
    setPaymentErrors({});
    setPaymentModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        error("Validasi", "File harus berupa gambar (JPG, PNG, WEBP)");
        setPaymentErrors({ ...paymentErrors, proof_image: "Format file tidak didukung" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        error("Validasi", "Ukuran file maksimal 2MB");
        setPaymentErrors({ ...paymentErrors, proof_image: "Ukuran file maksimal 2MB" });
        return;
      }
      setProofImage(file);
      setPaymentErrors({ ...paymentErrors, proof_image: null });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProofImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPaymentErrors({ ...paymentErrors, proof_image: null });
  };

  const formatRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0;
    return parseInt(rupiahString.replace(/[^0-9]/g, "")) || 0;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    const formattedValue = numericValue ? `Rp ${parseInt(numericValue).toLocaleString('id-ID')}` : "";
    setPaymentAmount(formattedValue);
    if (paymentErrors.amount) {
      setPaymentErrors({ ...paymentErrors, amount: null });
    }
  };

  const validatePaymentForm = () => {
    const errors = {};
    const amountNumber = formatRupiahToNumber(paymentAmount);
    const remainingAmount = (selectedTransactionForPayment?.grand_total || 0) - 
      (selectedTransactionForPayment?.payments?.reduce((sum, p) => sum + (p.total_paid || 0), 0) || 0);
    
    if (!amountNumber || amountNumber <= 0) {
      errors.amount = "Jumlah pembayaran harus lebih dari 0";
    } else if (amountNumber > remainingAmount) {
      errors.amount = `Jumlah pembayaran melebihi sisa tagihan (${formatRupiah(remainingAmount)})`;
    }
    
    if (!proofImage) {
      errors.proof_image = "Bukti pembayaran wajib diupload";
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitPayment = async () => {
    if (!validatePaymentForm()) return;
    
    setIsPaymentSubmitting(true);
    
    const amountNumber = formatRupiahToNumber(paymentAmount);
    
    const submitData = {
      transaction_id: selectedTransactionForPayment.id,
      note: paymentNote || null,
      details: [
        {
          method: "transfer",
          amount: amountNumber,
          reference_no: paymentReference || null,
          proof_image: proofImage,
        }
      ],
    };
    
    const result = await paymentService.createPayment(submitData);
    
    if (result.success) {
      success("Berhasil", "Pembayaran berhasil dilakukan. Admin akan segera memverifikasi pembayaran Anda.");
      setPaymentModalOpen(false);
      await fetchTransactions();
      if (showModal && selectedTransaction?.id === selectedTransactionForPayment.id) {
        const updatedDetail = await transactionService.getTransactionDetail(selectedTransactionForPayment.id);
        if (updatedDetail.success) {
          setSelectedTransaction(updatedDetail.data);
        }
      }
    } else {
      error("Gagal", result.message || "Terjadi kesalahan saat memproses pembayaran");
    }
    
    setIsPaymentSubmitting(false);
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.product_id === productId
        ? { ...item, qty: newQty, subtotal: newQty * item.price }
        : item
    );
    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    saveCartToStorage(updatedCart);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  const validateCheckoutForm = () => {
    const errors = {};
    if (checkoutData.delivery_type === "delivery" && !checkoutData.delivery_address) {
      errors.delivery_address = "Alamat pengiriman wajib diisi";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      error("Keranjang Kosong", "Silakan tambahkan produk ke keranjang terlebih dahulu");
      return;
    }
    
    if (!validateCheckoutForm()) return;
    
    setIsSubmitting(true);
    
    const items = cart.map(item => ({
      product_id: item.product_id,
      qty: item.qty
    }));
    
    const submitData = {
      items: items,
      delivery_type: checkoutData.delivery_type,
      delivery_address: checkoutData.delivery_address || null,
      discount: 0,
      tax: 0,
      note: checkoutData.note || null,
    };
    
    const result = await transactionService.createTransaction(submitData);
    
    if (result.success) {
      success("Berhasil", "Transaksi berhasil dibuat!");
      localStorage.removeItem("customerCart");
      setCart([]);
      setShowCart(false);
      setShowCheckoutForm(false);
      await fetchTransactions();
    } else {
      error("Gagal", result.message);
    }
    
    setIsSubmitting(false);
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      error("Keranjang Kosong", "Silakan tambahkan produk ke keranjang terlebih dahulu");
      return;
    }
    setCheckoutData({
      delivery_type: "pickup",
      delivery_address: "",
      note: "",
    });
    setShowCheckoutForm(true);
  };

  // 🔥 FIX: Fungsi untuk menghitung total dibayar dengan aman
  const getTotalPaid = (transaction) => {
    if (!transaction.payments || transaction.payments.length === 0) return 0;
    return transaction.payments.reduce((sum, p) => {
      const paidAmount = p.total_paid || 0;
      return sum + (typeof paidAmount === 'number' ? paidAmount : parseFloat(paidAmount) || 0);
    }, 0);
  };

  // 🔥 FIX: Fungsi untuk menghitung sisa tagihan dengan aman
  const getRemainingAmount = (transaction) => {
    const totalPaid = getTotalPaid(transaction);
    const grandTotal = transaction.grand_total || 0;
    const remaining = grandTotal - totalPaid;
    return remaining > 0 ? remaining : 0;
  };

  // 🔥 FIX: Cek apakah transaksi sudah lunas
  const isFullyPaid = (transaction) => {
    return getRemainingAmount(transaction) <= 0;
  };

  const togglePaymentExpand = (paymentId) => {
    setExpandedPayments(prev => ({
      ...prev,
      [paymentId]: !prev[paymentId]
    }));
  };

  // 🔥 FIX: Fungsi untuk navigasi ke halaman landing page
  const handleContinueShopping = () => {
    setShowCart(false);
    navigate("/");
  };

  return (
    <CustomerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6" data-aos="fade-down">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaksi Saya</h1>
          <p className="text-slate-400">Lihat riwayat transaksi dan kelola keranjang belanja Anda</p>
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-500/25"
        >
          <ShoppingBag className="w-5 h-5" />
          Keranjang
          {getCartItemCount() > 0 && (
            <span className={`absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transition-all duration-300 ${cartAnimating ? 'scale-125' : 'scale-100'}`}>
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Transactions List */}
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
      ) : transactions.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Belum Ada Transaksi</h3>
            <p className="text-slate-400">Anda belum memiliki riwayat transaksi</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition"
            >
              Mulai Belanja
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, idx) => {
            const status = getStatusBadge(transaction.status);
            const remainingAmount = getRemainingAmount(transaction);
            const fullyPaid = isFullyPaid(transaction);
            const totalPaid = getTotalPaid(transaction);
            
            return (
              <Card 
                key={transaction.id} 
                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 overflow-hidden"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left - Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{transaction.invoice_no}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(transaction.created_at)}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Center - Amount */}
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatRupiah(transaction.grand_total)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {transaction.details?.length || 0} produk
                      </p>
                      {!fullyPaid && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Sisa: {formatRupiah(remainingAmount)}
                        </p>
                      )}
                      {fullyPaid && (
                        <p className="text-xs text-green-400 mt-1">
                          Lunas
                        </p>
                      )}
                    </div>
                    
                    {/* Right - Actions */}
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => printInvoice(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-300 transition rounded-lg hover:bg-slate-700"
                          title="Cetak Invoice"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => printStruk(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-300 transition rounded-lg hover:bg-slate-700"
                          title="Cetak Struk"
                        >
                          <Receipt className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleViewDetail(transaction)}
                          className="p-2 text-blue-400 hover:text-blue-300 transition rounded-lg hover:bg-slate-700"
                          title="Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {/* Button Bayar hanya muncul jika belum lunas dan status bukan dibatalkan */}
                        {!fullyPaid && transaction.status !== 'dibatalkan' && (
                          <button
                            onClick={() => handleOpenPaymentModal(transaction)}
                            className="p-2 text-green-400 hover:text-green-300 transition rounded-lg hover:bg-slate-700"
                            title="Bayar"
                          >
                            <CreditCard className="w-5 h-5" />
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
      )}

      {/* Cart Modal - DIPERBAIKI */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">Keranjang Belanja</h3>
              <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Keranjang Kosong</h3>
                  <p className="text-slate-400">Belum ada produk di keranjang Anda</p>
                  {/* 🔥 FIX: Tombol Lanjut Belanja mengarah ke halaman landing page */}
                  <button
                    onClick={handleContinueShopping}
                    className="mt-4 px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition"
                  >
                    Lanjut Belanja
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                        <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.product_name}</h4>
                          <p className="text-xs text-slate-400">{item.product_code}</p>
                          <p className="text-emerald-400 text-sm font-semibold mt-1">{formatRupiah(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartQty(item.product_id, item.qty - 1)} className="p-1 rounded bg-slate-600 hover:bg-slate-500 transition">
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-white w-8 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product_id, item.qty + 1)} className="p-1 rounded bg-slate-600 hover:bg-slate-500 transition">
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="text-right min-w-25">
                          <p className="text-white font-semibold">{formatRupiah(item.subtotal)}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.product_id)} className="p-2 text-red-400 hover:text-red-300 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400">Total</span>
                      <span className="text-2xl font-bold text-emerald-400">{formatRupiah(getCartTotal())}</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleContinueShopping}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                      >
                        Lanjut Belanja
                      </button>
                      <button onClick={openCheckout} className="flex-1 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">Detail Pengiriman</h3>
              <button onClick={() => setShowCheckoutForm(false)} className="text-slate-400 hover:text-white transition shrink-0" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-white font-medium mb-2 text-center">Informasi Customer</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">{user?.name}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Metode Pengiriman</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setCheckoutData({ ...checkoutData, delivery_type: "pickup", delivery_address: "" })} className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${checkoutData.delivery_type === "pickup" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`} disabled={isSubmitting}>
                    <Package className="w-4 h-4 inline mr-2" />
                    Ambil Sendiri
                  </button>
                  <button type="button" onClick={() => setCheckoutData({ ...checkoutData, delivery_type: "delivery" })} className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${checkoutData.delivery_type === "delivery" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`} disabled={isSubmitting}>
                    <Truck className="w-4 h-4 inline mr-2" />
                    Dikirim
                  </button>
                </div>
              </div>
              {checkoutData.delivery_type === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Alamat Pengiriman <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea value={checkoutData.delivery_address} onChange={(e) => setCheckoutData({ ...checkoutData, delivery_address: e.target.value })} rows="3" className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none" placeholder="Masukkan alamat lengkap" disabled={isSubmitting} />
                  </div>
                  {formErrors.delivery_address && <p className="mt-1 text-xs text-red-400">{formErrors.delivery_address}</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Catatan <span className="text-slate-500 text-xs">(opsional)</span></label>
                <textarea value={checkoutData.note} onChange={(e) => setCheckoutData({ ...checkoutData, note: e.target.value })} rows="2" className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none" placeholder="Catatan untuk pesanan..." disabled={isSubmitting} />
              </div>
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                <h4 className="text-white font-medium mb-2 text-center">Ringkasan Pesanan</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Jumlah Item</span>
                    <span className="text-white">{getCartItemCount()} produk</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-500/30">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">{formatRupiah(getCartTotal())}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowCheckoutForm(false)} disabled={isSubmitting} fullWidth>Batal</Button>
                <Button variant="primary" onClick={handleCheckout} disabled={isSubmitting} fullWidth>
                  {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal - Transfer dengan Upload Bukti */}
      {paymentModalOpen && selectedTransactionForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">Pembayaran Transfer Bank</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-white transition shrink-0" disabled={isPaymentSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Informasi Transaksi */}
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{selectedTransactionForPayment.invoice_no}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-300">
                      Total Tagihan: <span className="text-emerald-400 font-semibold">{formatRupiah(selectedTransactionForPayment.grand_total)}</span>
                    </p>
                    <p className="text-sm text-slate-300">
                      Telah Dibayar: <span className="text-blue-400 font-semibold">
                        {formatRupiah(getTotalPaid(selectedTransactionForPayment))}
                      </span>
                    </p>
                    <p className="text-sm text-slate-300">
                      Sisa Tagihan: <span className="text-yellow-400 font-semibold">
                        {formatRupiah(getRemainingAmount(selectedTransactionForPayment))}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Informasi Rekening Tujuan */}
              <div className="bg-linear-to-r from-blue-600/20 to-indigo-600/20 rounded-xl p-5 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h4 className="text-white font-semibold text-lg">Informasi Rekening Tujuan</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Bank</span>
                    <span className="text-white font-mono font-semibold">{bankInfo.bank}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Nomor Rekening</span>
                    <span className="text-white font-mono font-bold text-lg tracking-wider">{bankInfo.accountNumber}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-400 text-sm">Atas Nama</span>
                    <span className="text-white font-medium">{bankInfo.accountName}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-400">
                    Silakan transfer sesuai dengan jumlah tagihan yang tertera. Setelah transfer, upload bukti pembayaran di bawah ini.
                  </p>
                </div>
              </div>

              {/* Form Pembayaran */}
              <div className="bg-slate-700/30 rounded-xl p-5">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Detail Pembayaran
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Jumlah Transfer <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      className={`w-full px-4 py-3 bg-slate-700 border rounded-xl text-white text-lg focus:outline-none focus:border-indigo-500 text-center font-semibold ${
                        paymentErrors.amount ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Rp 0"
                      disabled={isPaymentSubmitting}
                    />
                    {paymentErrors.amount && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {paymentErrors.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nomor Referensi / No. Transfer <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: BCA-20231201-001"
                      disabled={isPaymentSubmitting}
                    />
                    <p className="text-xs text-slate-500 mt-1">Masukkan nomor referensi dari transfer Anda untuk memudahkan verifikasi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bukti Transfer <span className="text-red-400">* (Wajib)</span>
                    </label>
                    <div className={`mt-1 ${paymentErrors.proof_image ? 'border-2 border-red-500 rounded-xl' : ''}`}>
                      {proofImagePreview ? (
                        <div className="relative inline-block">
                          <img 
                            src={proofImagePreview} 
                            alt="Bukti Transfer" 
                            className="w-40 h-40 object-cover rounded-xl border-2 border-slate-600" 
                          />
                          <button
                            type="button"
                            onClick={removeProofImage}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 transition bg-slate-700/30 hover:bg-slate-700/50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 text-slate-400 mb-3" />
                            <p className="text-sm text-slate-400">Klik untuk upload bukti transfer</p>
                            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (Max 2MB)</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileChange}
                            disabled={isPaymentSubmitting}
                          />
                        </label>
                      )}
                    </div>
                    {paymentErrors.proof_image && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {paymentErrors.proof_image}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      ⚠️ Bukti transfer wajib diupload untuk verifikasi pembayaran. Pastikan bukti terbaca jelas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Catatan <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <textarea
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                      placeholder="Catatan tambahan untuk pembayaran..."
                      disabled={isPaymentSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Informasi Verifikasi */}
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">Informasi Penting</p>
                    <p className="text-xs text-yellow-400/80 mt-1">
                      Setelah Anda mengupload bukti transfer, admin akan melakukan verifikasi pembayaran. 
                      Status pembayaran akan diperbarui setelah verifikasi selesai. Mohon menunggu konfirmasi dari admin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={isPaymentSubmitting}
                  fullWidth
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitPayment}
                  disabled={isPaymentSubmitting || !proofImage || !paymentAmount}
                  fullWidth
                  className="bg-linear-to-r from-indigo-600 to-purple-600"
                >
                  {isPaymentSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    "Kirim Pembayaran"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Transaksi */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">Detail Transaksi</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Header Invoice */}
              <div className="text-center border-b border-slate-700 pb-4">
                <h4 className="text-2xl font-bold text-white">{selectedTransaction.invoice_no}</h4>
                <p className="text-slate-400 text-sm mt-1">{formatDate(selectedTransaction.created_at)}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedTransaction.status).color}`}>
                    {getStatusBadge(selectedTransaction.status).icon}
                    {getStatusBadge(selectedTransaction.status).label}
                  </span>
                </div>
              </div>
              
              {/* Informasi Customer & Pengiriman */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-white font-medium">Informasi Customer</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">Nama: {selectedTransaction.customer_name || user?.name}</p>
                    {user?.phone && <p className="text-slate-300">Telepon: {user.phone}</p>}
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-white font-medium">Informasi Pengiriman</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      Metode: {selectedTransaction.delivery_type === 'pickup' ? 'Ambil Sendiri' : 'Dikirim'}
                    </p>
                    {selectedTransaction.delivery_address && (
                      <p className="text-slate-300">Alamat: {selectedTransaction.delivery_address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Produk yang Dipesan */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" />
                  Produk yang Dipesan
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
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
                          <td className="px-4 py-3 text-white">
                            {detail.product?.name}
                            <p className="text-xs text-slate-400">{detail.product?.code}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-300 text-center">{detail.qty}</td>
                          <td className="px-4 py-3 text-slate-300 text-right">{formatRupiah(detail.price)}</td>
                          <td className="px-4 py-3 text-white text-right font-medium">{formatRupiah(detail.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ringkasan Total */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white">{formatRupiah(selectedTransaction.subtotal)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Diskon</span>
                      <span className="text-red-400">-{formatRupiah(selectedTransaction.discount)}</span>
                    </div>
                  )}
                  {selectedTransaction.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Pajak</span>
                      <span className="text-yellow-400">+{formatRupiah(selectedTransaction.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-600">
                    <span className="text-white">Grand Total</span>
                    <span className="text-emerald-400">{formatRupiah(selectedTransaction.grand_total)}</span>
                  </div>
                </div>
              </div>

              {/* Riwayat Pembayaran */}
              {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    Riwayat Pembayaran
                  </h4>
                  <div className="space-y-3">
                    {selectedTransaction.payments.map((payment, idx) => {
                      const totalPaid = payment.total_paid || 0;
                      const paymentStatus = getPaymentStatusBadge(payment.payment_status || (totalPaid >= selectedTransaction.grand_total ? 'paid' : 'partial'));
                      const isExpanded = expandedPayments[payment.id];
                      
                      return (
                        <div key={payment.id} className="bg-slate-700/30 rounded-xl overflow-hidden">
                          <div 
                            className="p-4 cursor-pointer hover:bg-slate-700/50 transition-all duration-200"
                            onClick={() => togglePaymentExpand(payment.id)}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                  <Wallet className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    Pembayaran #{selectedTransaction.payments.length - idx}
                                  </p>
                                  <p className="text-xs text-slate-400">{formatDate(payment.paid_at || payment.created_at)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${paymentStatus.color}`}>
                                  {paymentStatus.label}
                                </span>
                                <span className="text-emerald-400 font-bold">{formatRupiah(totalPaid)}</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>
                          </div>
                          
                          {isExpanded && payment.details && payment.details.length > 0 && (
                            <div className="border-t border-slate-600 bg-slate-800/50 p-4 space-y-3">
                              {payment.details.map((detail, dIdx) => (
                                <div key={dIdx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-slate-800 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodIcon(detail.method)}
                                    <span className="text-white text-sm font-medium">
                                      {getPaymentMethodLabel(detail.method)}
                                    </span>
                                    {detail.reference_no && (
                                      <span className="text-xs text-slate-400 ml-2">
                                        Ref: {detail.reference_no}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-white font-semibold">{formatRupiah(detail.amount)}</span>
                                    {detail.proof_image && (
                                      <button
                                        onClick={() => window.open(getImageUrl(detail.proof_image), "_blank")}
                                        className="p-1.5 text-blue-400 hover:text-blue-300 transition rounded-lg hover:bg-slate-700"
                                        title="Lihat Bukti Pembayaran"
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {payment.note && (
                                <div className="mt-2 p-2 bg-slate-800 rounded-lg">
                                  <p className="text-xs text-slate-400">Catatan:</p>
                                  <p className="text-white text-sm">{payment.note}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Ringkasan Total Pembayaran */}
                    <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Total Tagihan</span>
                          <span className="text-white font-medium">{formatRupiah(selectedTransaction.grand_total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Total Dibayar</span>
                          <span className="text-emerald-400 font-medium">
                            {formatRupiah(getTotalPaid(selectedTransaction))}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-indigo-500/30">
                          <span className="text-white">Sisa Tagihan</span>
                          <span className={`font-bold ${getRemainingAmount(selectedTransaction) <= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {formatRupiah(getRemainingAmount(selectedTransaction))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan */}
              {selectedTransaction.note && (
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">Catatan Transaksi</p>
                  <p className="text-white text-sm">{selectedTransaction.note}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl flex-wrap">
              <button
                onClick={() => printInvoice(selectedTransaction)}
                className="px-5 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Invoice
              </button>
              <button
                onClick={() => printStruk(selectedTransaction)}
                className="px-5 py-2 bg-purple-600/20 text-purple-400 rounded-xl hover:bg-purple-600 hover:text-white transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Struk
              </button>
              {/* Button Bayar hanya muncul jika belum lunas */}
              {getRemainingAmount(selectedTransaction) > 0 && selectedTransaction.status !== 'dibatalkan' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleOpenPaymentModal(selectedTransaction);
                  }}
                  className="px-5 py-2 bg-green-600/20 text-green-400 rounded-xl hover:bg-green-600 hover:text-white transition flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Bayar Sekarang
                </button>
              )}
              <button onClick={() => setShowModal(false)} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

// Helper function untuk mendapatkan URL gambar
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/storage")) return `http://localhost:8000${path}`;
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const baseUrlWithoutApi = baseUrl.replace("/api", "");
  return `${baseUrlWithoutApi}/storage/${path}`;
};

export default CustomerTransactions;