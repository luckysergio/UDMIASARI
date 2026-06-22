// src/pages/TransactionsActive.jsx - Full file dengan metode pembayaran hanya Tunai dan Transfer Bank

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
  Plus,
  Trash2,
  ShoppingCart,
  Minus,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Truck,
  PackageCheck,
  XCircle,
  MapPin,
  Phone,
  User as UserIcon,
  Upload,
  Image as ImageIcon,
  Filter,
  FolderTree,
  Tags,
  ChevronDown,
  Printer,
  Shield,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import transactionService from "../../services/transactionService";
import productService from "../../services/productService";
import paymentService from "../../services/paymentService";
import categoryService from "../../services/categoryService";
import jenisService from "../../services/jenisService";
import { Link } from "react-router-dom";
import { printInvoice, printStruk } from "../../components/PrintInvoice";

const TransactionsActive = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("list");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Payment state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTransactionForPayment, setSelectedTransactionForPayment] =
    useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

  // File upload state
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Cart state
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: null,
    customer_name: "",
    customer_phone: "",
    delivery_type: "pickup",
    delivery_address: "",
    discount: 0,
    tax: 0,
    note: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error, warning } = useModal();

  const formatRupiah = (value) => {
    if (!value && value !== 0) return "";
    const number = value.toString().replace(/[^,\d]/g, "");
    const split = number.split(",");
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? "." : "";
      rupiah += separator + ribuan.join(".");
    }
    return rupiah ? "Rp " + rupiah : "";
  };

  const parseRupiahToNumber = (rupiahString) => {
    if (!rupiahString) return 0;
    const number = parseInt(rupiahString.replace(/[^0-9]/g, "")) || 0;
    return number;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    const formattedValue = formatRupiah(numericValue);
    setPaymentAmount(formattedValue);
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    const formattedValue = formatRupiah(numericValue);
    setFormData({ ...formData, discount: parseRupiahToNumber(formattedValue) });
  };

  const handleTaxChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    const formattedValue = formatRupiah(numericValue);
    setFormData({ ...formData, tax: parseRupiahToNumber(formattedValue) });
  };

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    fetchActiveTransactions();
    fetchCategories();
    fetchJenis();
  }, [currentPage, searchTerm, startDate, endDate]);

  const fetchActiveTransactions = async () => {
    setLoading(true);
    
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: "active",
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
          transaction.status !== "selesai" && 
          transaction.status !== "dibatalkan"
      );
      setTransactions(filteredTransactions);
      setTotalPages(result.data.last_page || 1);
      setTotalTransactions(result.data.total || 0);
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const result = await productService.getProducts({
      limit: 100,
      is_active: true,
    });
    if (result.success) {
      setProducts(result.data.data || []);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await categoryService.getCategories({ limit: 100 });
      if (result.success) {
        setCategories(result.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchJenis = async () => {
    try {
      const result = await jenisService.getJenis({ limit: 100 });
      if (result.success) {
        setJenisList(result.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching jenis:", err);
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

  const handleResetDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleOpenViewModal = async (transaction) => {
    const result = await transactionService.getTransactionDetail(
      transaction.id,
    );
    if (result.success) {
      setSelectedTransaction(result.data);
      setModalMode("view");
      setIsModalOpen(true);
    } else {
      error("Gagal", result.message);
    }
  };

  const handleOpenCreateModal = async () => {
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat membuat transaksi baru");
      return;
    }
    
    setModalMode("create");
    setCart([]);
    setFormData({
      customer_id: null,
      customer_name: "",
      customer_phone: "",
      delivery_type: "pickup",
      delivery_address: "",
      discount: 0,
      tax: 0,
      note: "",
    });
    setFormErrors({});
    setSearchProduct("");
    setSelectedCategory("");
    setSelectedJenis("");
    setShowFilters(false);
    setShowProductList(true);
    await fetchProducts();
    setIsModalOpen(true);
  };

  const handleOpenPaymentModal = (transaction) => {
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat memproses pembayaran");
      return;
    }
    
    setSelectedTransactionForPayment(transaction);
    setPaymentDetails([]);
    setPaymentNote("");
    setPaymentMethod("cash");
    setPaymentAmount("");
    setPaymentReference("");
    setProofImage(null);
    setProofImagePreview(null);
    setPaymentModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        error("Validasi", "File harus berupa gambar (JPG, PNG, WEBP)");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        error("Validasi", "Ukuran file maksimal 2MB");
        return;
      }

      setProofImage(file);
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
  };

  const addPaymentDetail = async () => {
    const amountNumber = parseRupiahToNumber(paymentAmount);

    if (!amountNumber || amountNumber <= 0) {
      error("Validasi", "Jumlah pembayaran harus lebih dari 0");
      return;
    }

    const totalPaidSoFar =
      (selectedTransactionForPayment?.payments?.reduce(
        (sum, p) => sum + (p.total_paid || 0),
        0,
      ) || 0) + paymentDetails.reduce((sum, d) => sum + d.amount, 0);
    const remainingAmount =
      (selectedTransactionForPayment?.grand_total || 0) - totalPaidSoFar;

    if (amountNumber > remainingAmount) {
      error(
        "Validasi",
        `Jumlah pembayaran melebihi sisa tagihan (${formatRupiahDisplay(remainingAmount)})`,
      );
      return;
    }

    const newDetail = {
      method: paymentMethod,
      amount: amountNumber,
      reference_no: paymentReference || null,
      proof_image: proofImage,
      proof_image_preview: proofImagePreview,
    };

    setPaymentDetails([...paymentDetails, newDetail]);

    setPaymentAmount("");
    setPaymentReference("");
    removeProofImage();
  };

  const removePaymentDetail = (index) => {
    setPaymentDetails(paymentDetails.filter((_, i) => i !== index));
  };

  const handleSubmitPayment = async () => {
    if (paymentDetails.length === 0) {
      error("Validasi", "Minimal satu detail pembayaran");
      return;
    }

    setIsPaymentSubmitting(true);

    const submitData = {
      transaction_id: selectedTransactionForPayment.id,
      note: paymentNote || null,
      details: paymentDetails.map((detail) => ({
        method: detail.method,
        amount: detail.amount,
        reference_no: detail.reference_no || null,
        proof_image:
          detail.proof_image instanceof File ? detail.proof_image : null,
      })),
    };

    const result = await paymentService.createPayment(submitData);

    if (result.success) {
      success("Berhasil", result.message);
      setPaymentModalOpen(false);
      fetchActiveTransactions();
    } else {
      error("Gagal", result.message);
    }

    setIsPaymentSubmitting(false);
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    if (!isAdmin) {
      warning("Akses Dibatasi", "Hanya admin yang dapat mengubah status transaksi");
      return;
    }
    
    setUpdatingStatus(true);
    const result = await transactionService.updateStatus(
      transactionId,
      newStatus,
    );
    if (result.success) {
      success(
        "Berhasil",
        `Status transaksi diubah menjadi ${getStatusLabel(newStatus)}`,
      );
      fetchActiveTransactions();
      if (isModalOpen && selectedTransaction?.id === transactionId) {
        const updatedDetail =
          await transactionService.getTransactionDetail(transactionId);
        if (updatedDetail.success) {
          setSelectedTransaction(updatedDetail.data);
        }
      }
    } else {
      error("Gagal", result.message);
    }
    setUpdatingStatus(false);
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          product_code: product.code,
          price: product.price,
          qty: 1,
          subtotal: product.price,
        },
      ]);
    }
    setSearchProduct("");
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            qty: newQty,
            subtotal: item.price * newQty,
          };
        }
        return item;
      }),
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = formData.discount || 0;
    const tax = formData.tax || 0;
    return subtotal - discount + tax;
  };

  const validateForm = () => {
    const errors = {};
    if (cart.length === 0) errors.cart = "Minimal satu produk";
    if (formData.discount < 0) errors.discount = "Diskon tidak boleh negatif";
    if (formData.tax < 0) errors.tax = "Pajak tidak boleh negatif";
    if (formData.delivery_type === "delivery" && !formData.delivery_address) {
      errors.delivery_address = "Alamat pengiriman wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData = {
      items: cart.map((item) => ({
        product_id: item.product_id,
        qty: item.qty,
      })),
      customer_id: formData.customer_id || null,
      customer_name: formData.customer_name || null,
      customer_phone: formData.customer_phone || null,
      delivery_type: formData.delivery_type,
      delivery_address: formData.delivery_address || null,
      discount: formData.discount || 0,
      tax: formData.tax || 0,
      note: formData.note || null,
    };

    const result = await transactionService.createTransaction(submitData);

    if (result.success) {
      success("Berhasil", result.message);
      setIsModalOpen(false);
      fetchActiveTransactions();
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
      dipesan: {
        color: "bg-yellow-500/20 text-yellow-400",
        icon: <Clock className="w-3 h-3" />,
        label: "Dipesan",
      },
      diproses: {
        color: "bg-blue-500/20 text-blue-400",
        icon: <Package className="w-3 h-3" />,
        label: "Diproses",
      },
      dikirim: {
        color: "bg-purple-500/20 text-purple-400",
        icon: <Truck className="w-3 h-3" />,
        label: "Dikirim",
      },
      siap_ambil: {
        color: "bg-indigo-500/20 text-indigo-400",
        icon: <PackageCheck className="w-3 h-3" />,
        label: "Siap Diambil",
      },
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

  const getStatusLabel = (status) => {
    const labels = {
      dipesan: "Dipesan",
      diproses: "Diproses",
      dikirim: "Dikirim",
      siap_ambil: "Siap Diambil",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return labels[status] || status;
  };

  // 🔥 Hanya Tunai dan Transfer Bank
  const getPaymentMethodBadge = (method) => {
    const methods = {
      cash: { color: "bg-green-500/20 text-green-400", label: "Tunai" },
      transfer: {
        color: "bg-blue-500/20 text-blue-400",
        label: "Transfer Bank",
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
    if (path.startsWith("https")) return path;
    if (path.startsWith("/storage")) return `http://localhost:8000${path}`;

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const baseUrlWithoutApi = baseUrl.replace("/api", "");
    return `${baseUrlWithoutApi}/storage/${path}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchProduct || 
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProduct.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === parseInt(selectedCategory);
    const matchesJenis = !selectedJenis || p.jenis_id === parseInt(selectedJenis);
    return matchesSearch && matchesCategory && matchesJenis;
  });

  const resetProductFilters = () => {
    setSearchProduct("");
    setSelectedCategory("");
    setSelectedJenis("");
  };

  const filteredJenis = selectedCategory
    ? jenisList.filter((jenis) => jenis.category_id === parseInt(selectedCategory))
    : jenisList;

  const availableStatuses = [
    { value: "dipesan", label: "Dipesan" },
    { value: "diproses", label: "Diproses" },
    { value: "dikirim", label: "Dikirim" },
    { value: "siap_ambil", label: "Siap Diambil" },
    { value: "selesai", label: "Selesai" },
    { value: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <MainLayout>
      {/* Header - sama seperti sebelumnya */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Transaksi Aktif
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Menampilkan transaksi yang sedang berjalan (dipesan, diproses,
              dikirim, siap diambil)
            </p>
          </div>
          <div className="flex gap-3">
            <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              isAdmin 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                : "bg-slate-700 text-slate-400 border border-slate-600"
            }`}>
              <Shield className="w-3 h-3" />
              {isAdmin ? "Administrator" : "Read Only"}
            </div>
            <Link to="/transactions/history">
              <Button variant="secondary" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Riwayat Transaksi
              </Button>
            </Link>
            {isAdmin && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Transaksi Baru
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter - sama seperti sebelumnya */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="flex flex-col gap-4">
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

          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition md:w-auto"
          >
            <Filter className="w-4 h-4" />
            {showDateFilter ? "Sembunyikan Filter Tanggal" : "Tampilkan Filter Tanggal"}
          </button>

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
                    <XCircle className="w-4 h-4" />
                    Reset Filter Tanggal
                  </button>
                </div>
              )}
            </div>
          )}

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

      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="secondary"
          onClick={fetchActiveTransactions}
          className="flex items-center gap-2"
          disabled={loading}
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Transactions List - sama seperti sebelumnya */}
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
              Tidak Ada Transaksi Aktif
            </h3>
            <p className="text-slate-400">
              {searchTerm || startDate || endDate
                ? "Tidak ditemukan transaksi dengan filter yang dipilih"
                : "Semua transaksi sudah selesai atau dibatalkan"}
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
            {!searchTerm && !startDate && !endDate && isAdmin && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="mt-4 mx-auto"
              >
                Buat Transaksi Baru
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
              const remainingAmount = grandTotal - totalPaid;

              return (
                <Card key={transaction.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 group">
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
                        {remainingAmount > 0 && (
                          <p className="text-xs text-yellow-400">
                            Sisa: {formatRupiahDisplay(remainingAmount)}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
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
                          {isAdmin && remainingAmount > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(transaction)}
                              className="text-green-400 hover:text-green-300 transition"
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
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
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

      {/* Modal Detail Transaksi - sama seperti sebelumnya */}
      {isModalOpen && modalMode === "view" && selectedTransaction && (
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

                <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedTransaction.status).color}`}
                  >
                    {getStatusBadge(selectedTransaction.status).icon}
                    {getStatusBadge(selectedTransaction.status).label}
                  </span>

                  {isAdmin && (
                    <select
                      value={selectedTransaction.status}
                      onChange={(e) =>
                        updateTransactionStatus(
                          selectedTransaction.id,
                          e.target.value,
                        )
                      }
                      disabled={updatingStatus}
                      className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-600 transition"
                    >
                      {availableStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {updatingStatus && (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  )}
                </div>
              </div>

              {/* Customer Info - sama seperti sebelumnya */}
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
                      <p className="text-xs text-slate-400">Pembuat</p>
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

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl flex-wrap">
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
              {isAdmin && selectedTransaction.status !== "selesai" &&
                selectedTransaction.status !== "dibatalkan" && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsModalOpen(false);
                      handleOpenPaymentModal(selectedTransaction);
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bayar
                  </Button>
                )}
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembayaran - HANYA UNTUK ADMIN (dengan metode pembayaran Tunai dan Transfer Bank saja) */}
      {paymentModalOpen && selectedTransactionForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Pembayaran Transaksi
              </h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
                disabled={isPaymentSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info Transaksi */}
              <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    {selectedTransactionForPayment.invoice_no}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Total Tagihan:{" "}
                    <span className="text-emerald-400 font-semibold">
                      {formatRupiahDisplay(selectedTransactionForPayment.grand_total)}
                    </span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Telah Dibayar:{" "}
                    <span className="text-blue-400 font-semibold">
                      {formatRupiahDisplay(
                        selectedTransactionForPayment.payments?.reduce(
                          (sum, p) => sum + (Number(p.total_paid) || 0), 0
                        ) || 0
                      )}
                    </span>
                  </p>
                  <p className="text-sm text-slate-400">
                    Sisa Tagihan:{" "}
                    <span className="text-yellow-400 font-semibold">
                      {formatRupiahDisplay(
                        (Number(selectedTransactionForPayment.grand_total) || 0) -
                          (selectedTransactionForPayment.payments?.reduce(
                            (sum, p) => sum + (Number(p.total_paid) || 0), 0
                          ) || 0)
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {/* Form Tambah Detail Pembayaran */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="text-white font-medium mb-3">
                  Tambah Detail Pembayaran
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Metode Pembayaran
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      disabled={isPaymentSubmitting}
                    >
                      <option value="cash">Tunai</option>
                      <option value="transfer">Transfer Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Jumlah
                    </label>
                    <input
                      type="text"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                      placeholder="Rp 0"
                      disabled={isPaymentSubmitting}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">
                      Referensi (opsional)
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 text-center"
                      placeholder="No. Referensi / No. Transfer"
                      disabled={isPaymentSubmitting}
                    />
                  </div>

                  {/* 🔥 Hanya untuk Transfer Bank yang wajib upload bukti */}
                  {paymentMethod === "transfer" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1">
                        Bukti Pembayaran <span className="text-red-400">*</span>
                      </label>
                      <div className="mt-1">
                        {proofImagePreview ? (
                          <div className="relative inline-block">
                            <img
                              src={proofImagePreview}
                              alt="Bukti Pembayaran"
                              className="w-32 h-32 object-cover rounded-lg border border-slate-600"
                            />
                            <button
                              type="button"
                              onClick={removeProofImage}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-indigo-500 transition bg-slate-700/30">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 text-slate-400 mb-2" />
                              <p className="text-sm text-slate-400">
                                Klik untuk upload bukti transfer
                              </p>
                              <p className="text-xs text-slate-500">
                                JPG, PNG, WEBP (Max 2MB)
                              </p>
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
                      <p className="text-xs text-slate-500 mt-1">
                        ⚠️ Bukti transfer wajib diupload untuk verifikasi pembayaran
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="secondary"
                  onClick={addPaymentDetail}
                  disabled={isPaymentSubmitting || !paymentAmount}
                  className="mt-3 w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Detail
                </Button>
              </div>

              {/* Daftar Detail Pembayaran */}
              {paymentDetails.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2">Detail Pembayaran</h4>
                  <div className="space-y-2">
                    {paymentDetails.map((detail, idx) => {
                      const methodBadge = getPaymentMethodBadge(detail.method);
                      return (
                        <div key={idx} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${methodBadge.color}`}>
                                {methodBadge.label}
                              </span>
                              {detail.reference_no && (
                                <p className="text-xs text-slate-400 mt-1">
                                  Ref: {detail.reference_no}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-semibold">
                                {formatRupiahDisplay(detail.amount)}
                              </span>
                              {detail.proof_image_preview && (
                                <button
                                  onClick={() => window.open(detail.proof_image_preview, "_blank")}
                                  className="text-blue-400 hover:text-blue-300 transition p-1 hover:bg-slate-600 rounded"
                                  title="Lihat Bukti"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => removePaymentDetail(idx)}
                                className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-600 rounded"
                                disabled={isPaymentSubmitting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-right pt-2">
                      <p className="text-sm text-slate-400">
                        Total Dibayar:{" "}
                        <span className="text-white font-semibold">
                          {formatRupiahDisplay(paymentDetails.reduce((sum, d) => sum + d.amount, 0))}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Catatan{" "}
                  <span className="text-slate-500 text-xs">(opsional)</span>
                </label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center resize-none"
                  placeholder="Catatan pembayaran..."
                  disabled={isPaymentSubmitting}
                />
              </div>

              {/* Tombol Submit */}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setPaymentModalOpen(false)}
                  disabled={isPaymentSubmitting}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitPayment}
                  disabled={isPaymentSubmitting || paymentDetails.length === 0}
                  className="min-w-37.5 flex items-center justify-center gap-2"
                >
                  {isPaymentSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Proses Pembayaran"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Transaksi - HANYA UNTUK ADMIN (tetap sama, sudah ada pengecekan di handleOpenCreateModal) */}
      {isModalOpen && modalMode === "create" && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                Transaksi Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition shrink-0"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Panel - Product Search & Cart */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari produk (nama atau kode)..."
                      value={searchProduct}
                      onChange={(e) => {
                        setSearchProduct(e.target.value);
                        setShowProductList(true);
                      }}
                      onFocus={() => setShowProductList(true)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? "Sembunyikan Filter" : "Tampilkan Filter"}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                  </button>

                  {showFilters && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 items-center gap-1">
                          <FolderTree className="w-3 h-3" />
                          Kategori
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedJenis("");
                          }}
                          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Semua Kategori</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 items-center gap-1">
                          <Tags className="w-3 h-3" />
                          Jenis
                        </label>
                        <select
                          value={selectedJenis}
                          onChange={(e) => setSelectedJenis(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                          disabled={!!selectedCategory && filteredJenis.length === 0}
                        >
                          <option value="">Semua Jenis</option>
                          {filteredJenis.map((jenis) => (
                            <option key={jenis.id} value={jenis.id}>
                              {jenis.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {(selectedCategory || selectedJenis || searchProduct) && (
                        <button
                          type="button"
                          onClick={resetProductFilters}
                          className="col-span-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 text-center">
                    Total {filteredProducts.length} produk tersedia
                  </p>

                  <div className="z-10 bg-slate-700 border border-slate-600 rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-sm">
                        Produk tidak ditemukan
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="w-full p-3 text-left hover:bg-slate-600 transition flex justify-between items-center border-b border-slate-600 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">
                              {product.name}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <p className="text-xs text-slate-400">
                                {product.code}
                              </p>
                              {product.category && (
                                <span className="text-xs text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                                  {product.category.name}
                                </span>
                              )}
                              {product.jenis && (
                                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                  {product.jenis.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-emerald-400 text-sm font-semibold ml-3">
                            {formatRupiahDisplay(product.price)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Keranjang Belanja
                      </h4>
                      <span className="text-xs text-slate-400">
                        {cart.length} item
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        Belum ada produk dipilih
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.product_id}
                            className="bg-slate-800 rounded-lg p-3"
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
                              </div>
                              <button
                                onClick={() => removeFromCart(item.product_id)}
                                className="text-red-400 hover:text-red-300"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product_id,
                                      item.qty - 1,
                                    )
                                  }
                                  className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                                  disabled={isSubmitting}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-white text-sm w-8 text-center">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product_id,
                                      item.qty + 1,
                                    )
                                  }
                                  className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600"
                                  disabled={isSubmitting}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-white text-sm font-medium">
                                {formatRupiahDisplay(item.subtotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Transaction Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nama Customer{" "}
                      <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center"
                      placeholder="Nama customer"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      No. Telepon Customer{" "}
                      <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center"
                      placeholder="0812-3456-7890"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Jenis Pengiriman
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            delivery_type: "pickup",
                            delivery_address: "",
                          })
                        }
                        className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${formData.delivery_type === "pickup" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`}
                        disabled={isSubmitting}
                      >
                        <PackageCheck className="w-4 h-4 inline mr-2" /> Ambil
                        Sendiri
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            delivery_type: "delivery",
                          })
                        }
                        className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${formData.delivery_type === "delivery" ? "border-indigo-500 bg-indigo-500/20 text-indigo-400" : "border-slate-600 text-slate-400 hover:border-slate-500"}`}
                        disabled={isSubmitting}
                      >
                        <Truck className="w-4 h-4 inline mr-2" /> Dikirim
                      </button>
                    </div>
                  </div>

                  {formData.delivery_type === "delivery" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Alamat Pengiriman
                      </label>
                      <textarea
                        value={formData.delivery_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            delivery_address: e.target.value,
                          })
                        }
                        rows="2"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center resize-none"
                        placeholder="Masukkan alamat lengkap"
                        disabled={isSubmitting}
                      />
                      {formErrors.delivery_address && (
                        <p className="text-xs text-red-400 mt-1">
                          {formErrors.delivery_address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Diskon
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formatRupiah(formData.discount)}
                          onChange={handleDiscountChange}
                          className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                          placeholder="Rp 0"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pajak
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formatRupiah(formData.tax)}
                          onChange={handleTaxChange}
                          className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:border-indigo-500"
                          placeholder="Rp 0"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Catatan{" "}
                      <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <textarea
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      rows="2"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-center resize-none"
                      placeholder="Catatan transaksi..."
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-white">
                          {formatRupiahDisplay(calculateSubtotal())}
                        </span>
                      </div>
                      {formData.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Diskon</span>
                          <span className="text-red-400">
                            -{formatRupiahDisplay(formData.discount)}
                          </span>
                        </div>
                      )}
                      {formData.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Pajak</span>
                          <span className="text-yellow-400">
                            +{formatRupiahDisplay(formData.tax)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-500/30">
                        <span className="text-white">Total</span>
                        <span className="text-emerald-400">
                          {formatRupiahDisplay(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formErrors.cart && (
                    <p className="text-xs text-red-400 text-center">
                      {formErrors.cart}
                    </p>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || cart.length === 0}
                    fullWidth
                    className="py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                        Memproses...
                      </>
                    ) : (
                      "Proses Transaksi"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TransactionsActive;