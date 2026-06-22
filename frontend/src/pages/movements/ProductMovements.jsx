import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  FolderTree,
  Tags,
  Eye,
  X,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Download,
  RefreshCw,
  FileText,
  Truck,
  ShoppingCart,
  RefreshCw as ReturIcon,
  User,
  Clock,
  Hash,
  Info,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import movementService from "../../services/movementService";
import categoryService from "../../services/categoryService";
import jenisService from "../../services/jenisService";

const ProductMovements = () => {
  const [movements, setMovements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMovements, setTotalMovements] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { success, error } = useModal();

  useEffect(() => {
    fetchMovements();
    fetchCategories();
    fetchJenis();
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    selectedJenis,
    selectedType,
    dateFrom,
    dateTo,
  ]);

  const fetchMovements = async () => {
    setLoading(true);
    const result = await movementService.getMovements({
      page: currentPage,
      limit: 12,
      search: searchTerm,
      category_id: selectedCategory,
      jenis_id: selectedJenis,
      type: selectedType,
      date_from: dateFrom,
      date_to: dateTo,
    });

    if (result.success) {
      setMovements(result.data.data || []);
      setTotalPages(result.data.last_page || 1);
      setTotalMovements(result.data.total || 0);
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

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedJenis("");
    setSelectedType("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenViewModal = (movement) => {
    setSelectedMovement(movement);
    setIsModalOpen(true);
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

  const getTypeBadge = (type) => {
    if (type === "in") {
      return {
        icon: <ArrowUpCircle className="w-4 h-4" />,
        label: "Barang Masuk",
        color: "bg-green-500/20 text-green-400",
        borderColor: "border-green-500/30",
      };
    }
    return {
      icon: <ArrowDownCircle className="w-4 h-4" />,
      label: "Barang Keluar",
      color: "bg-red-500/20 text-red-400",
      borderColor: "border-red-500/30",
    };
  };

  const getReferenceIcon = (referenceLabel) => {
    switch (referenceLabel) {
      case "Transaksi":
        return <ShoppingCart className="w-4 h-4" />;
      case "Retur":
        return <ReturIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getReferenceColor = (referenceLabel) => {
    switch (referenceLabel) {
      case "Transaksi":
        return "bg-blue-500/20 text-blue-400";
      case "Retur":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const formatRupiah = (price) => {
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

  // Summary data
  const summary = {
    totalIn: movements.reduce(
      (sum, m) => sum + (m.type === "in" ? m.qty : 0),
      0,
    ),
    totalOut: movements.reduce(
      (sum, m) => sum + (m.type === "out" ? m.qty : 0),
      0,
    ),
    totalTransactions: movements.length,
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Riwayat Movement Produk
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Monitor semua pergerakan barang masuk dan keluar
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchMovements}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-linear-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700 text-center group hover:border-indigo-500/50 transition-all duration-300">
          <div className="p-4">
            <p className="text-slate-400 text-sm">Total Transaksi</p>
            <p className="text-3xl font-bold text-white mt-2">
              {summary.totalTransactions}
            </p>
          </div>
        </Card>
        <Card className="bg-linear-to-br from-green-900/20 to-green-800/10 backdrop-blur-sm border border-green-500/20 text-center group hover:border-green-500/50 transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center justify-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
              <p className="text-slate-400 text-sm">Barang Masuk</p>
            </div>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {summary.totalIn}
            </p>
          </div>
        </Card>
        <Card className="bg-linear-to-br from-red-900/20 to-red-800/10 backdrop-blur-sm border border-red-500/20 text-center group hover:border-red-500/50 transition-all duration-300">
          <div className="p-4">
            <div className="flex items-center justify-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-red-400" />
              <p className="text-slate-400 text-sm">Barang Keluar</p>
            </div>
            <p className="text-3xl font-bold text-red-400 mt-2">
              {summary.totalOut}
            </p>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="flex flex-col gap-4 p-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama produk atau kode..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 rounded-xl text-slate-300 hover:bg-slate-600 transition-all duration-300 md:hidden"
          >
            <Filter className="w-4 h-4" />
            {isFilterOpen ? "Tutup Filter" : "Buka Filter"}
          </button>

          {/* Filter Dropdowns */}
          <div
            className={`${isFilterOpen ? "flex" : "hidden"} md:flex flex-col gap-4 transition-all duration-300`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  <FolderTree className="w-3 h-3 inline mr-1" />
                  Filter Kategori
                </label>
                <div className="relative">
                  <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryFilter}
                    className="w-full pl-10 pr-8 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer"
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

              {/* Jenis Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  <Tags className="w-3 h-3 inline mr-1" />
                  Filter Jenis
                </label>
                <div className="relative">
                  <Tags className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={selectedJenis}
                    onChange={handleJenisFilter}
                    className="w-full pl-10 pr-8 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  Tipe Movement
                </label>
                <select
                  value={selectedType}
                  onChange={handleTypeFilter}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">Semua Tipe</option>
                  <option value="in">Barang Masuk</option>
                  <option value="out">Barang Keluar</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Tanggal Dari
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={handleDateFromChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center md:text-left">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Tanggal Sampai
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={handleDateToChange}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Reset Filter Button */}
            {(searchTerm ||
              selectedCategory ||
              selectedJenis ||
              selectedType ||
              dateFrom ||
              dateTo) && (
              <div className="flex justify-center">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Movements Table */}
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
      ) : movements.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Data Movement
            </h3>
            <p className="text-slate-400">
              {searchTerm ||
              selectedCategory ||
              selectedJenis ||
              selectedType ||
              dateFrom ||
              dateTo
                ? "Tidak ada movement yang sesuai dengan filter yang dipilih."
                : "Belum ada riwayat pergerakan barang"}
            </p>
            {(searchTerm ||
              selectedCategory ||
              selectedJenis ||
              selectedType ||
              dateFrom ||
              dateTo) && (
              <Button
                variant="secondary"
                onClick={resetFilters}
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
            {movements.map((movement) => {
              const product = movement.product;
              const typeBadge = getTypeBadge(movement.type);
              const user = movement.user;
              const referenceIcon = getReferenceIcon(movement.reference_label);
              const referenceColor = getReferenceColor(movement.reference_label);

              return (
                <Card
                  key={movement.id}
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 group overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">
                              {product?.name || "-"}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {product?.code || "-"}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {product?.category?.name && (
                                <span className="inline-flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                  <FolderTree className="w-3 h-3" />
                                  {product.category.name}
                                </span>
                              )}
                              {product?.jenis?.name && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <Tags className="w-3 h-3" />
                                  {product.jenis.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Section - Movement Info */}
                      <div className="flex-1 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/30">
                          {typeBadge.icon}
                          <span
                            className={`text-sm font-medium ${typeBadge.color}`}
                          >
                            {typeBadge.label}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-white mt-2">
                          {movement.qty}{" "}
                          <span className="text-sm text-slate-400">unit</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Harga: {formatRupiah(product?.price)}
                        </p>
                      </div>

                      {/* Right Section - Reference & User */}
                      <div className="flex-1 text-right">
                        {/* Reference Badge */}
                        {movement.reference_label && (
                          <div className="mb-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${referenceColor}`}
                            >
                              {referenceIcon}
                              <span>{movement.reference_label}</span>
                              {movement.reference_code && (
                                <span className="font-mono ml-1">
                                  : {movement.reference_code}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        <p className="text-sm text-white">
                          {formatDate(movement.created_at)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          <User className="w-3 h-3 inline mr-1" />
                          {user?.name || "System"}
                        </p>
                        <button
                          onClick={() => handleOpenViewModal(movement)}
                          className="mt-2 text-blue-400 hover:text-blue-300 transition-all duration-300 flex items-center justify-end gap-1 text-sm group/btn"
                        >
                          <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Detail
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    {movement.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Catatan: {movement.notes}
                        </p>
                      </div>
                    )}
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
                {Math.min(currentPage * 12, totalMovements)} dari{" "}
                {totalMovements} data
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
                            ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
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

      {/* Modal Detail - Enhanced */}
      {isModalOpen && selectedMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-r from-slate-800 to-slate-800/95 backdrop-blur-sm flex items-center justify-between p-5 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">
                  Detail Movement
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type Badge */}
              <div className="text-center">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getTypeBadge(selectedMovement.type).color} border ${getTypeBadge(selectedMovement.type).borderColor}`}
                >
                  {getTypeBadge(selectedMovement.type).icon}
                  {getTypeBadge(selectedMovement.type).label}
                </span>
              </div>

              {/* Product Info */}
              <div className="text-center border-b border-slate-700 pb-4">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-indigo-400" />
                </div>
                <h4 className="text-xl font-bold text-white">
                  {selectedMovement.product?.name}
                </h4>
                <p className="text-slate-400 text-sm mt-1">
                  Kode: {selectedMovement.product?.code}
                </p>
                <div className="flex justify-center gap-3 mt-2">
                  {selectedMovement.product?.category?.name && (
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                      <FolderTree className="w-3 h-3" />
                      {selectedMovement.product.category.name}
                    </span>
                  )}
                  {selectedMovement.product?.jenis?.name && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Tags className="w-3 h-3" />
                      {selectedMovement.product.jenis.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity & Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-linear-to-br from-emerald-900/20 to-emerald-800/10 rounded-xl text-center border border-emerald-500/20">
                  <p className="text-xs text-slate-400">Jumlah</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {selectedMovement.qty}
                  </p>
                  <p className="text-xs text-slate-500">unit</p>
                </div>
                <div className="p-4 bg-linear-to-br from-blue-900/20 to-blue-800/10 rounded-xl text-center border border-blue-500/20">
                  <p className="text-xs text-slate-400">Harga per Unit</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatRupiah(selectedMovement.product?.price)}
                  </p>
                </div>
              </div>

              {/* Total Value */}
              <div className="p-4 bg-linear-to-br from-indigo-900/20 to-purple-800/10 rounded-xl text-center border border-indigo-500/20">
                <p className="text-xs text-slate-400">Total Nilai</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {formatRupiah(
                    selectedMovement.qty *
                      (selectedMovement.product?.price || 0),
                  )}
                </p>
              </div>

              {/* Reference Info */}
              {selectedMovement.reference_label && (
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getReferenceIcon(selectedMovement.reference_label)}
                    <span
                      className={`text-sm font-medium ${getReferenceColor(selectedMovement.reference_label)}`}
                    >
                      Referensi: {selectedMovement.reference_label}
                    </span>
                  </div>
                  {selectedMovement.reference_code && (
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-1">Nomor Referensi</p>
                      <p className="text-white font-mono text-sm bg-slate-800/50 inline-block px-3 py-1 rounded-lg">
                        {selectedMovement.reference_code}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedMovement.notes && (
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <p className="text-xs text-yellow-400 text-center mb-2">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Catatan
                  </p>
                  <p className="text-white text-center text-sm">
                    {selectedMovement.notes}
                  </p>
                </div>
              )}

              {/* User & Date Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <User className="w-3 h-3" />
                    Dibuat Oleh
                  </p>
                  <p className="text-white font-medium mt-1">
                    {selectedMovement.user?.name || "System"}
                  </p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tanggal
                  </p>
                  <p className="text-white text-sm mt-1">
                    {formatDate(selectedMovement.created_at)}
                  </p>
                </div>
              </div>

              {/* Stock Info */}
              {selectedMovement.stock_before !== undefined && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                    <p className="text-xs text-slate-400">Stok Sebelum</p>
                    <p className="text-white font-semibold text-lg">
                      {selectedMovement.stock_before}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-xl text-center">
                    <p className="text-xs text-slate-400">Stok Sesudah</p>
                    <p className="text-white font-semibold text-lg">
                      {selectedMovement.stock_after}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-center p-5 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </MainLayout>
  );
};

export default ProductMovements;