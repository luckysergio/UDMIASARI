import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X,
  Loader2,
  FolderTree,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useModal } from "../../contexts/ModalContext";
import categoryService from "../../services/categoryService";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { success, error, warning } = useModal();

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    const result = await categoryService.getCategories({
      page: currentPage,
      limit: 12,
      search: searchTerm,
    });

    if (result.success) {
      setCategories(result.data.data);
      setTotalPages(result.data.last_page);
      setTotalCategories(result.data.total);
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setFormErrors({});
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedCategory(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (category) => {
    setModalMode("view");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    warning(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`,
      async () => {
        setDeletingId(category.id);
        const result = await categoryService.deleteCategory(category.id);
        if (result.success) {
          success("Berhasil", result.message);
          fetchCategories();
        } else {
          error("Gagal", result.message);
        }
        setDeletingId(null);
      },
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Nama kategori wajib diisi";
    if (formData.name && formData.name.length > 100)
      errors.name = "Nama kategori maksimal 100 karakter";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    let result;
    if (modalMode === "create") {
      result = await categoryService.createCategory(formData);
    } else {
      result = await categoryService.updateCategory(
        selectedCategory.id,
        formData,
      );
    }

    if (result.success) {
      success("Berhasil", result.message);
      setIsModalOpen(false);
      fetchCategories();
    } else {
      error("Gagal", result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Manajemen Kategori
            </h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Kelola kategori produk dengan mudah
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 w-full md:w-auto justify-center"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kategori berdasarkan nama..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
          />
        </div>
        <div className="flex items-center justify-end gap-2 text-slate-400 text-sm mt-2">
          <Filter className="w-4 h-4" />
          <span>{totalCategories} kategori ditemukan</span>
        </div>
      </Card>

      {/* Categories Grid */}
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
      ) : categories.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <FolderTree className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Tidak Ada Data
            </h3>
            <p className="text-slate-400">Belum ada kategori yang terdaftar</p>
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="mt-4 mx-auto"
            >
              Tambah Kategori Pertama
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] group text-center"
              >
                <div className="space-y-4">
                  {/* Header - Name */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <FolderTree className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description - Wrap text center */}
                  <div className="pt-2 px-2">
                    <div className="flex items-start justify-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm text-center wrap-break-word whitespace-normal">
                        {category.description || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Only Edit & Delete */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(category)}
                        className="flex-1 py-2 text-green-400 hover:text-white hover:bg-green-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                        title="Edit"
                        disabled={deletingId === category.id}
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="flex-1 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                        title="Hapus"
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id ? (
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
            ))}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-400 text-center sm:text-left">
                Menampilkan {(currentPage - 1) * 12 + 1} -{" "}
                {Math.min(currentPage * 12, totalCategories)} dari{" "}
                {totalCategories} data
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
                        className={`
                          w-9 h-9 rounded-xl font-medium transition
                          ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }
                        `}
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
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white flex-1 text-center">
                {modalMode === "create" && "Tambah Kategori Baru"}
                {modalMode === "edit" && "Edit Kategori"}
                {modalMode === "view" && "Detail Kategori"}
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
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3">
                      <FolderTree className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedCategory?.name}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-start justify-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <FileText className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Deskripsi</p>
                        <p className="text-white wrap-break-word whitespace-normal">
                          {selectedCategory?.description || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Dibuat Pada</p>
                        <p className="text-white">
                          {selectedCategory?.created_at
                            ? new Date(
                                selectedCategory.created_at,
                              ).toLocaleString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Name Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Nama Kategori <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <FolderTree className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="Masukkan nama kategori"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-400 text-center">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Deskripsi{" "}
                      <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition resize-none"
                        placeholder="Masukkan deskripsi kategori (opsional)"
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

export default Categories;
