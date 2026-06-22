import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  EyeOff,
  X,
  Loader2,
  User,
  Mail,
  Phone,
  Key,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useModal } from '../../contexts/ModalContext';
import userService from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  const { success, error, warning } = useModal();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await userService.getUsers({
      page: currentPage,
      limit: 12,
      search: searchTerm
    });
    
    if (result.success) {
      setUsers(result.data.data);
      setTotalPages(result.data.last_page);
      setTotalUsers(result.data.total);
    } else {
      error('Gagal', result.message);
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
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'customer'
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      role: user.role
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    warning(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus user "${user.name}"?`,
      async () => {
        setDeletingId(user.id);
        const result = await userService.deleteUser(user.id);
        if (result.success) {
          success('Berhasil', result.message);
          fetchUsers();
        } else {
          error('Gagal', result.message);
        }
        setDeletingId(null);
      }
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Nama wajib diisi';
    if (!formData.email) errors.email = 'Email wajib diisi';
    if (modalMode === 'create' && !formData.password) errors.password = 'Password wajib diisi';
    if (formData.password && formData.password.length < 6) errors.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Konfirmasi password tidak cocok';
    if (!formData.role) errors.role = 'Role wajib dipilih';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role
    };
    
    if (formData.password) {
      submitData.password = formData.password;
    }
    
    let result;
    if (modalMode === 'create') {
      result = await userService.createUser(submitData);
    } else {
      result = await userService.updateUser(selectedUser.id, submitData);
    }
    
    if (result.success) {
      success('Berhasil', result.message);
      setIsModalOpen(false);
      fetchUsers();
    } else {
      error('Gagal', result.message);
    }
    
    setIsSubmitting(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'kepala_produksi':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'customer':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'kepala_produksi':
        return 'Kepala Produksi';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'kepala_produksi':
        return <User className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Manajemen Pengguna</h1>
            <p className="text-slate-400 mt-1 text-sm md:text-base">
              Kelola semua pengguna sistem dengan mudah
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleOpenCreateModal} 
            className="flex items-center gap-2 w-full md:w-auto justify-center"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna berdasarkan nama, email, atau telepon..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition text-center"
            />
          </div>
          <div className="flex items-center justify-center md:justify-end gap-2 text-slate-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>{totalUsers} pengguna ditemukan</span>
          </div>
        </div>
      </Card>

      {/* Users Grid - Card View dengan Text Center */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <div className="animate-pulse space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-32 mx-auto"></div>
                  <div className="h-3 bg-slate-700 rounded w-24 mx-auto"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-40 mx-auto"></div>
                  <div className="h-3 bg-slate-700 rounded w-32 mx-auto"></div>
                </div>
                <div className="flex justify-center gap-2 pt-4">
                  <div className="h-8 bg-slate-700 rounded w-20"></div>
                  <div className="h-8 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Tidak Ada Data</h3>
            <p className="text-slate-400">Belum ada pengguna yang terdaftar</p>
            <Button 
              variant="primary" 
              onClick={handleOpenCreateModal} 
              className="mt-4 mx-auto"
            >
              Tambah Pengguna Pertama
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
              <Card 
                key={user.id} 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] group text-center"
              >
                <div className="space-y-4">
                  {/* Header - Avatar & Name - Center */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center shrink-0
                      ${user.role === 'admin' ? 'bg-red-500/20' : 
                        user.role === 'kepala_produksi' ? 'bg-yellow-500/20' : 'bg-green-500/20'}
                    `}>
                      <User className={`w-8 h-8 ${
                        user.role === 'admin' ? 'text-red-400' : 
                        user.role === 'kepala_produksi' ? 'text-yellow-400' : 'text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg leading-tight">
                        {user.name}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getRoleBadgeColor(user.role)} mt-1`}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information - Center */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-300 truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-slate-300">
                        {user.phone || <span className="text-slate-500">-</span>}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Only Edit & Delete */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(user)} 
                        className="flex-1 py-2 text-green-400 hover:text-white hover:bg-green-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                        title="Edit"
                        disabled={deletingId === user.id}
                      >
                        <Edit2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)} 
                        className="flex-1 py-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
                        title="Hapus"
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? (
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
              <div className="text-sm text-slate-400 text-center sm:text-left order-2 sm:order-1">
                Menampilkan {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, totalUsers)} dari {totalUsers} data
              </div>
              <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
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
                          ${currentPage === pageNum 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                {modalMode === 'create' && 'Tambah Pengguna Baru'}
                {modalMode === 'edit' && 'Edit Pengguna'}
                {modalMode === 'view' && 'Detail Pengguna'}
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
              {modalMode === 'view' ? (
                <div className="space-y-4 text-center">
                  <div className="text-center">
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3
                      ${selectedUser?.role === 'admin' ? 'bg-red-500/20' : 
                        selectedUser?.role === 'kepala_produksi' ? 'bg-yellow-500/20' : 'bg-green-500/20'}
                    `}>
                      <User className={`w-10 h-10 ${
                        selectedUser?.role === 'admin' ? 'text-red-400' : 
                        selectedUser?.role === 'kepala_produksi' ? 'text-yellow-400' : 'text-green-400'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{selectedUser?.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border mt-2 ${getRoleBadgeColor(selectedUser?.role)}`}>
                      {getRoleIcon(selectedUser?.role)}
                      {getRoleLabel(selectedUser?.role)}
                    </span>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center justify-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <Mail className="w-5 h-5 text-slate-400" />
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="text-white">{selectedUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-3 bg-slate-700/30 rounded-xl">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Nomor Telepon</p>
                        <p className="text-white">{selectedUser?.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Name Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="Masukkan nama lengkap"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.name && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.name}</p>}
                  </div>
                  
                  {/* Email Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="user@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.email && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.email}</p>}
                  </div>
                  
                  {/* Phone Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Nomor Telepon <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="0812-3456-7890"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  {/* Password Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Password {modalMode === 'create' && <span className="text-red-400">*</span>}
                      {modalMode === 'edit' && <span className="text-slate-500 text-xs"> (kosongkan jika tidak ingin mengubah)</span>}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder={modalMode === 'create' ? "Minimal 6 karakter" : "Password baru (opsional)"}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                      </button>
                    </div>
                    {formErrors.password && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.password}</p>}
                  </div>
                  
                  {/* Confirm Password Field - Center */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                        placeholder="Ketik ulang password"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.confirmPassword}</p>}
                  </div>
                  
                  {/* Role Selection */}
                  <div>
                    <label className="block text-center text-sm font-medium text-slate-300 mb-2">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'customer', label: 'Customer', color: 'green' },
                        { value: 'kepala_produksi', label: 'Kepala Produksi', color: 'yellow' },
                        { value: 'admin', label: 'Admin', color: 'red' }
                      ].map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({...formData, role: role.value})}
                          disabled={isSubmitting}
                          className={`
                            py-2 px-3 rounded-xl border-2 transition-all font-medium text-sm
                            ${formData.role === role.value 
                              ? `border-${role.color}-500 bg-${role.color}-500/20 text-${role.color}-400`
                              : 'border-slate-600 text-slate-400 hover:border-slate-500'
                            }
                          `}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                    {formErrors.role && <p className="mt-1 text-xs text-red-400 text-center">{formErrors.role}</p>}
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
                {modalMode === 'view' ? 'Tutup' : 'Batal'}
              </Button>
              {modalMode !== 'view' && (
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
                  ) : (
                    modalMode === 'create' ? 'Simpan' : 'Update'
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

export default Users;