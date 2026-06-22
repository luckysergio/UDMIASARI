import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  FolderTree,
  Tags,
  DollarSign,
  Barcode,
  CheckCircle,
  Upload,
  Trash2 as TrashIcon,
  XCircle,
  Box,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import jenisService from "../../services/jenisService";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category_id: "",
    jenis_id: "",
    code: "",
    name: "",
    price: "",
    description: "",
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { success, error, warning } = useModal();

  // Get base URL safely
  const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      console.warn("VITE_API_URL is not defined, using default http://localhost:8000");
      return "http://localhost:8000";
    }
    return apiUrl.replace("/api", "");
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchJenis();
  }, [currentPage, searchTerm, selectedCategory, selectedJenis]);

  const fetchProducts = async () => {
    setLoading(true);
    const result = await productService.getProducts({
      page: currentPage,
      limit: 12,
      search: searchTerm,
      category_id: selectedCategory,
      jenis_id: selectedJenis,
    });

    if (result.success) {
      setProducts(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalProducts(result.data.total || 0);
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
    setSelectedJenis("");
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
      category_id: "",
      jenis_id: "",
      code: "",
      name: "",
      price: "",
      description: "",
      is_active: true,
    });
    setFormErrors({});
    setImagePreview(null);
    setImageFile(null);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const parsePriceFromBackend = (price) => {
    if (!price && price !== 0) return 0;
    if (typeof price === "string") {
      const numericValue = parseFloat(price);
      return Math.floor(numericValue);
    }
    return price;
  };

  const handleOpenEditModal = (product) => {
    setModalMode("edit");
    setSelectedProduct(product);

    const originalPrice = product?.price;
    const parsedPrice = parsePriceFromBackend(originalPrice);
    const priceAsString = parsedPrice.toString();

    setFormData({
      category_id: product?.category_id || "",
      jenis_id: product?.jenis_id || "",
      code: product?.code || "",
      name: product?.name || "",
      price: priceAsString,
      description: product?.description || "",
      is_active: true,
    });

    if (product?.image) {
      const baseUrl = getBaseUrl();
      setImagePreview(`${baseUrl}/storage/${product.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (product) => {
    setModalMode("view");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    warning(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus produk "${product?.name || "produk ini"}"?\n\nProduk akan dihapus beserta data inventory terkait.`,
      async () => {
        setDeletingId(product.id);
        const result = await productService.deleteProduct(product.id);
        if (result.success) {
          success("Berhasil", result.message);
          fetchProducts();
        } else {
          error("Gagal", result.message);
        }
        setDeletingId(null);
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const formatRupiahDisplay = (price) => {
    if (!price && price !== 0) return "Rp 0";
    let num;
    if (typeof price === "string") {
      num = parseFloat(price);
    } else {
      num = price;
    }
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.floor(num));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData({ ...formData, price: numericValue });
  };

  const formatPriceForInput = (price) => {
    if (!price) return "";
    const cleanNumber = price.toString().replace(/[^0-9]/g, "");
    if (!cleanNumber) return "";
    const num = parseInt(cleanNumber, 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category_id) errors.category_id = "Kategori wajib dipilih";
    if (!formData.jenis_id) errors.jenis_id = "Jenis wajib dipilih";
    if (!formData.code) errors.code = "Kode produk wajib diisi";
    if (!formData.name) errors.name = "Nama produk wajib diisi";

    const priceNumber = parseInt(formData.price.replace(/[^0-9]/g, "") || "0");
    if (!formData.price) errors.price = "Harga wajib diisi";
    if (priceNumber <= 0) errors.price = "Harga harus lebih dari 0";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const priceNumber = parseInt(formData.price.replace(/[^0-9]/g, "") || "0");

    const submitData = new FormData();
    submitData.append("category_id", formData.category_id);
    submitData.append("jenis_id", formData.jenis_id);
    submitData.append("code", formData.code);
    submitData.append("name", formData.name);
    submitData.append("price", priceNumber);
    submitData.append("description", formData.description || "");
    submitData.append("is_active", "1");

    if (imageFile) {
      submitData.append("image", imageFile);
    }

    let result;
    if (modalMode === "create") {
      result = await productService.createProduct(submitData);
    } else {
      result = await productService.updateProduct(selectedProduct.id, submitData);
    }

    if (result.success) {
      success("Berhasil", result.message);
      setIsModalOpen(false);
      fetchProducts();
    } else {
      error("Gagal", result.message);
    }

    setIsSubmitting(false);
  };

  const getStatusBadge = () => {
    return {
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Aktif",
      color: "bg-green-500/20 text-green-400",
    };
  };

  const getStockBadge = (stock) => {
    if (!stock && stock !== 0) return { color: "bg-gray-500/20 text-gray-400", label: "Tidak tersedia" };
    if (stock <= 0) return { color: "bg-red-500/20 text-red-400", label: "Habis" };
    if (stock < 10) return { color: "bg-yellow-500/20 text-yellow-400", label: "Menipis" };
    return { color: "bg-green-500/20 text-green-400", label: "Tersedia" };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") {
      return null;
    }
    if (imagePath.trim() === "") {
      return null;
    }

    try {
      const baseUrl = getBaseUrl();
      return `${baseUrl}/storage/${imagePath}`;
    } catch (error) {
      console.error("Error constructing image URL:", error);
      return null;
    }
  };

  const status = getStatusBadge();
  const filteredJenis = selectedCategory
    ? jenisList.filter((jenis) => jenis.category_id === parseInt(selectedCategory))
    : jenisList;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Manajemen Produk
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Kelola produk inventory dengan mudah
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
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

          <div className={`${isFilterOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row gap-4 mt-2`}>
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
              {selectedCategory && filteredJenis.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1 text-center">
                  Tidak ada jenis untuk kategori ini
                </p>
              )}
            </div>

            {(searchTerm || selectedCategory || selectedJenis) && (
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2 text-sm"
                >
                  <XCircle className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {(selectedCategory || selectedJenis || searchTerm) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-700">
              <span className="text-xs text-slate-400">Filter aktif:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">
                  Search: {searchTerm}
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Kategori: {categories.find((c) => c.id === parseInt(selectedCategory))?.name}
                </span>
              )}
              {selectedJenis && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                  Jenis: {jenisList.find((j) => j.id === parseInt(selectedJenis))?.name}
                </span>
              )}
              <span className="text-xs text-slate-400">
                Menampilkan {totalProducts} produk
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <div className="animate-pulse space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-slate-700 rounded-lg"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-32 mx-auto"></div>
                  <div className="h-3 bg-slate-700 rounded w-24 mx-auto"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-40 mx-auto"></div>
                </div>
                <div className="flex justify-center gap-2 pt-4">
                  <div className="h-8 bg-slate-700 rounded w-20"></div>
                  <div className="h-8 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm || selectedCategory || selectedJenis ? "Tidak Ada Produk yang Sesuai" : "Tidak Ada Data"}
            </h3>
            <p className="text-slate-400">
              {searchTerm || selectedCategory || selectedJenis
                ? "Tidak ditemukan produk dengan filter yang dipilih."
                : "Belum ada produk yang terdaftar"}
            </p>
            {(searchTerm || selectedCategory || selectedJenis) && (
              <Button variant="secondary" onClick={resetFilters} className="mt-4 mx-auto">
                Hapus Filter
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const productImage = getImageUrl(product?.image);
              const categoryName = product?.category?.name || "-";
              const jenisName = product?.jenis?.name || "-";
              const stock = product?.inventory?.stock ?? 0;
              const stockBadge = getStockBadge(stock);

              return (
                <Card
                  key={product.id}
                  className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] group text-center"
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name || "Product"}
                          className="w-24 h-24 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Package className="w-12 h-12 text-slate-500" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {product.name || "-"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{product.code || "-"}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <FolderTree className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-300 text-xs">{categoryName}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Tags className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-300 text-xs">{jenisName}</span>
                      </div>
                    </div>

                    {/* Price & Stock */}
                    <div>
                      <p className="text-emerald-400 font-bold">{formatRupiahDisplay(product.price)}</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Box className="w-3 h-3 text-slate-400" />
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${stockBadge.color}`}>
                          Stok: {stock} ({stockBadge.label})
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color} mt-1`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    {/* Action Buttons - Only Edit & Delete */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="flex-1 py-2 text-green-400 hover:text-white hover:bg-green-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                          title="Edit"
                          disabled={deletingId === product.id}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="flex-1 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                          title="Hapus"
                          disabled={deletingId === product.id}
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
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
                Menampilkan {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, totalProducts)} dari {totalProducts} data
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isSubmitting}
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
                  disabled={currentPage === totalPages || isSubmitting}
                  className="p-2 rounded-xl bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                {modalMode === "create" && "Tambah Produk Baru"}
                {modalMode === "edit" && "Edit Produk"}
                {modalMode === "view" && "Detail Produk"}
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
              {modalMode === "view" ? (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    {selectedProduct?.image ? (
                      <img
                        src={getImageUrl(selectedProduct.image)}
                        alt={selectedProduct.name}
                        className="w-32 h-32 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedProduct?.name || "-"}</h3>
                    <p className="text-slate-400 text-sm">{selectedProduct?.code || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Kategori</p>
                      <p className="text-white">{selectedProduct?.category?.name || "-"}</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Jenis</p>
                      <p className="text-white">{selectedProduct?.jenis?.name || "-"}</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Harga</p>
                      <p className="text-emerald-400 font-semibold">{formatRupiahDisplay(selectedProduct?.price)}</p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-xl">
                    <p className="text-xs text-slate-400 text-center">Deskripsi</p>
                    <p className="text-white text-center wrap-break-word whitespace-normal">
                      {selectedProduct?.description || "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Gambar Produk <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <div className="flex flex-col items-center gap-3">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-32 h-32 rounded-lg bg-slate-700 border-2 border-dashed border-slate-500 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-xs text-slate-400 mt-1">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Kategori <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: parseInt(e.target.value),
                            jenis_id: "",
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition appearance-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formErrors.category_id && (
                      <p className="mt-1 text-xs text-red-400 text-center">{formErrors.category_id}</p>
                    )}
                  </div>

                  {/* Jenis Select */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Jenis <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <select
                        value={formData.jenis_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenis_id: parseInt(e.target.value),
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition appearance-none cursor-pointer"
                        disabled={isSubmitting}
                      >
                        <option value="">Pilih Jenis</option>
                        {jenisList
                          .filter((jenis) => !formData.category_id || jenis.category_id === formData.category_id)
                          .map((jenis) => (
                            <option key={jenis.id} value={jenis.id}>
                              {jenis.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    {formErrors.jenis_id && (
                      <p className="mt-1 text-xs text-red-400 text-center">{formErrors.jenis_id}</p>
                    )}
                  </div>

                  {/* Code Field */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Kode Produk <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition uppercase"
                        placeholder="Masukkan kode produk"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.code && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.code}</p>}
                  </div>

                  {/* Name Field */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Nama Produk <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="Masukkan nama produk"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.name && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.name}</p>}
                  </div>

                  {/* Price Field */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Harga <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formatPriceForInput(formData.price)}
                        onChange={handlePriceChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.price && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.price}</p>}
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Deskripsi <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition resize-none"
                        placeholder="Masukkan deskripsi produk (opsional)"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-3 p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                {modalMode === "view" ? "Tutup" : "Batal"}
              </Button>
              {modalMode !== "view" && (
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
                  ) : modalMode === "create" ? (
                    "Simpan"
                  ) : (
                    "Update"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Products;