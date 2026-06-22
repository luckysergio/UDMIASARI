import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  FolderTree,
  Tags,
  Plus,
  Minus,
  X,
  Loader2,
  RefreshCw,
  Shield,
  AlertCircle,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../hooks/useAuth";
import inventoryService from "../../services/inventoryService";
import categoryService from "../../services/categoryService";
import jenisService from "../../services/jenisService";

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInventory, setTotalInventory] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state untuk movement
  const [formData, setFormData] = useState({
    product_id: "",
    type: "in",
    qty: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const { success, error, warning } = useModal();
  
  // 🔥 Cek apakah user adalah admin atau kepala produksi
  const isAdmin = user?.role === "admin";
  const isKepalaProduksi = user?.role === "kepala_produksi";
  const canManageStock = isAdmin || isKepalaProduksi;

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchJenis();
  }, [currentPage, searchTerm, selectedCategory, selectedJenis]);

  const fetchInventory = async () => {
    setLoading(true);
    const result = await inventoryService.getInventory({
      page: currentPage,
      limit: 12,
      search: searchTerm,
      category_id: selectedCategory,
      jenis_id: selectedJenis,
    });

    if (result.success) {
      setInventory(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalInventory(result.data.total || 0);
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const result = await categoryService.getCategories({ limit: 100 });
    if (result.success) {
      setCategories(result.data.data || []);
    }
  };

  const fetchJenis = async () => {
    const result = await jenisService.getJenis({ limit: 100 });
    if (result.success) {
      setJenisList(result.data.data || []);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleJenisFilter = (e) => {
    setSelectedJenis(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedJenis("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      type: "in",
      qty: "",
      notes: "",
    });
    setFormErrors({});
  };

  const handleOpenMovementModal = (inventoryItem, type) => {
    // 🔥 CEK HAK AKSES - Admin dan Kepala Produksi bisa mengelola stok
    if (!canManageStock) {
      warning("Akses Dibatasi", "Hanya admin dan kepala produksi yang dapat mengubah stok produk");
      return;
    }
    
    setModalMode(type === "in" ? "stock_in" : "stock_out");
    setSelectedInventory(inventoryItem);
    setFormData({
      product_id: inventoryItem.product_id,
      type: type,
      qty: "",
      notes: "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.qty) errors.qty = "Jumlah wajib diisi";
    if (formData.qty && parseInt(formData.qty) <= 0)
      errors.qty = "Jumlah harus lebih dari 0";
    if (formData.type === "out" && selectedInventory) {
      if (parseInt(formData.qty) > selectedInventory.stock) {
        errors.qty = `Stok tidak mencukupi. Stok tersedia: ${selectedInventory.stock}`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const submitData = {
      product_id: formData.product_id,
      type: formData.type,
      qty: parseInt(formData.qty),
      notes: formData.notes || null,
    };

    const result = await inventoryService.createMovement(submitData);

    if (result.success) {
      const message =
        formData.type === "in"
          ? `Berhasil menambah stok ${formData.qty} item`
          : `Berhasil mengurangi stok ${formData.qty} item`;
      success("Berhasil", message);
      setIsModalOpen(false);
      fetchInventory();
    } else {
      error("Gagal", result.message);
    }

    setIsSubmitting(false);
  };

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter jenis berdasarkan kategori yang dipilih
  const filteredJenis = selectedCategory
    ? jenisList.filter(
        (jenis) => jenis.category_id === parseInt(selectedCategory),
      )
    : jenisList;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Manajemen Inventory
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Kelola stok produk dengan mudah
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {/* Badge Role */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              isAdmin 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                : isKepalaProduksi
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-700 text-slate-400 border border-slate-600"
            }`}>
              <Shield className="w-3 h-3" />
              {isAdmin ? "Administrator" : isKepalaProduksi ? "Kepala Produksi" : "Read Only"}
            </div>
            <Button
              variant="secondary"
              onClick={fetchInventory}
              className="flex items-center gap-2 w-full md:w-auto justify-center"
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama atau kode..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition md:hidden"
          >
            <Filter className="w-4 h-4" />
            {isFilterOpen ? "Tutup Filter" : "Buka Filter"}
          </button>

          <div
            className={`${isFilterOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-4 mt-2`}
          >
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1 text-center md:text-center">
                Filter Kategori
              </label>
              <div className="relative">
                <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={handleCategoryFilter}
                  className="w-full pl-10 pr-8 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer text-center"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1 text-center md:text-center">
                Filter Jenis
              </label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedJenis}
                  onChange={handleJenisFilter}
                  className="w-full pl-10 pr-8 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer text-center"
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
            </div>

            {(searchTerm || selectedCategory || selectedJenis) && (
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Inventory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700"
              >
                <div className="animate-pulse space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-32 mx-auto"></div>
                    <div className="h-3 bg-slate-700 rounded w-24 mx-auto"></div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-24 mx-auto"></div>
                  <div className="flex justify-center gap-2 pt-4">
                    <div className="h-8 bg-slate-700 rounded w-20"></div>
                    <div className="h-8 bg-slate-700 rounded w-20"></div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ) : inventory.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Data
            </h3>
            <p className="text-slate-400">Belum ada produk yang terdaftar</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventory.map((item) => {
              const product = item.product;
              const productImage = product?.image
                ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000"}/storage/${product.image}`
                : null;

              return (
                <Card
                  key={item.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] group text-center"
                >
                  <div className="space-y-4">
                    {/* Product Image/Icon */}
                    <div className="flex justify-center">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <Package className="w-10 h-10 text-indigo-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {product?.name || "-"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {product?.code || "-"}
                      </p>
                    </div>

                    {/* Category & Jenis */}
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <FolderTree className="w-3 h-3 text-slate-400" />
                        {product?.category?.name || "-"}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1">
                        <Tags className="w-3 h-3 text-slate-400" />
                        {product?.jenis?.name || "-"}
                      </span>
                    </div>

                    {/* Stock Info - Large & Center */}
                    <div className="py-3">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-white">
                          {item.stock}
                        </span>
                        <span className="text-sm text-slate-400"></span>
                      </div>
                    </div>

                    {/* Price */}
                    <p className="text-emerald-400 font-semibold">
                      {formatRupiahDisplay(product?.price)}
                    </p>

                    {/* Action Buttons - Untuk Admin dan Kepala Produksi */}
                    <div className="pt-4 border-t border-slate-700">
                      {canManageStock ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenMovementModal(item, "in")}
                            className="flex-1 py-2 text-green-400 hover:text-white hover:bg-green-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                            title="Tambah Stok"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah</span>
                          </button>
                          <button
                            onClick={() => handleOpenMovementModal(item, "out")}
                            className="flex-1 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                            title="Kurangi Stok"
                          >
                            <Minus className="w-4 h-4" />
                            <span className="hidden sm:inline">Kurangi</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-xs text-slate-500">
                            <Shield className="w-3 h-3 inline mr-1" />
                            Anda tidak memiliki akses untuk mengelola stok
                          </p>
                        </div>
                      )}
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
                Menampilkan {(currentPage - 1) * 12 + 1} -{" "}
                {Math.min(currentPage * 12, totalInventory)} dari{" "}
                {totalInventory} data
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

      {/* Modal Form - Tambah/Kurang Stok (Untuk Admin dan Kepala Produksi) */}
      {isModalOpen && canManageStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                {modalMode === "stock_in" && "Tambah Stok"}
                {modalMode === "stock_out" && "Kurangi Stok"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition disabled:opacity-50 shrink-0"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Product Info */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-white font-semibold text-lg">
                  {selectedInventory?.product?.name}
                </p>
                <p className="text-xs text-slate-400">
                  Kode: {selectedInventory?.product?.code}
                </p>
                <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xs text-slate-400">Stok Saat Ini</p>
                  <p className="text-2xl font-bold text-white">
                    {selectedInventory?.stock}
                  </p>
                </div>
              </div>

              {/* Quantity Field */}
              <div>
                <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                  Jumlah <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({ ...formData, qty: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                    placeholder="Masukkan jumlah"
                    disabled={isSubmitting}
                    min="1"
                  />
                </div>
                {formErrors.qty && (
                  <p className="mt-1 text-xs text-red-400 text-center">
                    {formErrors.qty}
                  </p>
                )}
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                  Catatan{" "}
                  <span className="text-slate-500 text-xs">(opsional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition resize-none"
                  placeholder="Masukkan catatan (opsional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : modalMode === "stock_in" ? (
                  "Tambah Stok"
                ) : (
                  "Kurangi Stok"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Inventory;