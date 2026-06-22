import React, { useState, useEffect } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";
import profileService from "../../services/profileService";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const Profile = () => {
  const { user, updateUser, getUserRole } = useAuth();
  const { success, error } = useModal();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Password form states
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  
  const userRole = getUserRole();
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    setLoading(true);
    const result = await profileService.getProfile();
    if (result.success) {
      setProfile(result.data);
      setFormData({
        name: result.data.name || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
      });
    } else {
      error("Gagal", result.message);
    }
    setLoading(false);
  };
  
  const validateProfileForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nama wajib diisi";
    if (!formData.email.trim()) errors.email = "Email wajib diisi";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    
    setIsSubmitting(true);
    const result = await profileService.updateProfile(formData);
    
    if (result.success) {
      success("Berhasil", "Profile berhasil diperbarui");
      setProfile(result.data);
      if (updateUser) {
        updateUser(result.data);
      }
      setIsEditing(false);
    } else {
      error("Gagal", result.message);
    }
    setIsSubmitting(false);
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.current_password) {
      errors.current_password = "Password saat ini wajib diisi";
    }
    if (!passwordData.new_password) {
      errors.new_password = "Password baru wajib diisi";
    } else if (passwordData.new_password.length < 6) {
      errors.new_password = "Password minimal 6 karakter";
    } else if (passwordData.new_password === passwordData.current_password) {
      errors.new_password = "Password baru harus berbeda dari password saat ini";
    }
    if (!passwordData.confirm_password) {
      errors.confirm_password = "Konfirmasi password wajib diisi";
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Konfirmasi password tidak cocok";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    
    setIsSubmitting(true);
    const result = await profileService.changePassword({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password,
    });
    
    if (result.success) {
      success("Berhasil", "Password berhasil diubah");
      setIsChangingPassword(false);
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } else {
      error("Gagal", result.message);
    }
    setIsSubmitting(false);
  };
  
  const getRoleLabel = (role) => {
    const roles = {
      admin: { label: "Administrator", color: "bg-purple-500/20 text-purple-400", border: "border-purple-500/30" },
      kepala_produksi: { label: "Kepala Produksi", color: "bg-blue-500/20 text-blue-400", border: "border-blue-500/30" },
      customer: { label: "Customer", color: "bg-green-500/20 text-green-400", border: "border-green-500/30" },
    };
    return roles[role] || { label: role, color: "bg-gray-500/20 text-gray-400", border: "border-gray-500/30" };
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  const roleInfo = getRoleLabel(profile?.role);
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6" data-aos="fade-down">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Saya</h1>
          <p className="text-slate-400">Kelola informasi akun Anda</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 overflow-hidden">
              <div className="relative h-24 bg-linear-to-r from-indigo-600 to-purple-600">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                <p className="text-sm text-slate-400 mt-1">{profile?.email}</p>
                
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${roleInfo.color} ${roleInfo.border} border`}>
                    <ShieldCheckIcon className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400">Bergabung sejak</p>
                  <p className="text-sm text-white">
                    {new Date(profile?.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Informasi Profile</h3>
                    <p className="text-sm text-slate-400">Update informasi akun Anda</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors rounded-lg hover:bg-indigo-500/10"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: profile?.name || "",
                            email: profile?.email || "",
                            phone: profile?.phone || "",
                          });
                          setFormErrors({});
                        }}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
                        title="Batal"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isSubmitting}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors rounded-lg hover:bg-green-500/10 disabled:opacity-50"
                        title="Simpan"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400"></div>
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing || isSubmitting}
                        className={`block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          isEditing 
                            ? "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                            : "border-slate-700 cursor-not-allowed opacity-70"
                        } ${formErrors.name ? "border-red-500" : ""}`}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing || isSubmitting}
                        className={`block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          isEditing 
                            ? "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                            : "border-slate-700 cursor-not-allowed opacity-70"
                        } ${formErrors.email ? "border-red-500" : ""}`}
                        placeholder="masukkan@email.com"
                      />
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Nomor Telepon <span className="text-slate-500 text-xs">(opsional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing || isSubmitting}
                        className={`block w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                          isEditing 
                            ? "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                            : "border-slate-700 cursor-not-allowed opacity-70"
                        }`}
                        placeholder="0812-3456-7890"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Change Password Card */}
            {!isChangingPassword ? (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <KeyIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Ubah Password</h3>
                        <p className="text-sm text-slate-400">Perbarui password akun Anda</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition flex items-center gap-2"
                    >
                      <KeyIcon className="w-4 h-4" />
                      Ubah Password
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <KeyIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Ubah Password</h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                        setPasswordErrors({});
                      }}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Password Saat Ini <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className={`block w-full pl-10 pr-12 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            passwordErrors.current_password 
                              ? "border-red-500 focus:ring-red-500/20" 
                              : "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                          placeholder="Masukkan password saat ini"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                        >
                          {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordErrors.current_password && (
                        <p className="mt-1 text-xs text-red-400">{passwordErrors.current_password}</p>
                      )}
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Password Baru <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className={`block w-full pl-10 pr-12 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            passwordErrors.new_password 
                              ? "border-red-500 focus:ring-red-500/20" 
                              : "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                          placeholder="Minimal 6 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                        >
                          {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordErrors.new_password && (
                        <p className="mt-1 text-xs text-red-400">{passwordErrors.new_password}</p>
                      )}
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Konfirmasi Password Baru <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <KeyIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className={`block w-full pl-10 pr-12 py-2.5 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            passwordErrors.confirm_password 
                              ? "border-red-500 focus:ring-red-500/20" 
                              : "border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                          }`}
                          placeholder="Masukkan ulang password baru"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordErrors.confirm_password && (
                        <p className="mt-1 text-xs text-red-400">{passwordErrors.confirm_password}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            current_password: "",
                            new_password: "",
                            confirm_password: "",
                          });
                          setPasswordErrors({});
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleChangePassword}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Memproses..." : "Simpan Password"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;