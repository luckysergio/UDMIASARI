import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";

// Schema validasi untuk customer
const schema = yup
  .object({
    name: yup
      .string()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter")
      .required("Nama wajib diisi"),
    email: yup
      .string()
      .email("Format email tidak valid")
      .required("Email wajib diisi"),
    phone: yup
      .string()
      .nullable()
      .matches(/^[0-9+\-\s]+$/, "Format nomor telepon tidak valid")
      .max(20, "Nomor telepon maksimal 20 karakter"),
    password: yup
      .string()
      .min(6, "Password minimal 6 karakter")
      .required("Password wajib diisi"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Konfirmasi password tidak cocok")
      .required("Konfirmasi password wajib diisi"),
  })
  .required();

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const { success, error } = useModal();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/customer/transactions");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    if (isRegistering) return;
    
    setIsRegistering(true);
    const { confirmPassword, ...userData } = data;
    const registerData = {
      ...userData,
      role: "customer",
    };
    
    const result = await registerUser(registerData);

    if (result.success) {
      success(
        "Registrasi Berhasil!",
        `Selamat datang ${userData.name}! Akun customer Anda telah berhasil dibuat.\n\nSilakan klik OK untuk melanjutkan ke halaman login.`,
        () => {
          navigate("/login");
        }
      );
    } else {
      error(
        "Registrasi Gagal",
        result.message || "Terjadi kesalahan saat registrasi. Silakan coba lagi."
      );
    }
    setIsRegistering(false);
  };

  // Benefits data
  const benefits = [
    {
      icon: <CheckBadgeIcon className="w-5 h-5" />,
      title: "Akses Produk Lengkap",
      description: "Lihat semua produk bakso"
    },
    {
      icon: <CheckBadgeIcon className="w-5 h-5" />,
      title: "Tracking Pesanan",
      description: "Pantau status pesanan"
    },
    {
      icon: <CheckBadgeIcon className="w-5 h-5" />,
      title: "Riwayat Transaksi",
      description: "Lihat semua pembelian"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side - Brand Info */}
        <div className="hidden lg:block space-y-8 sticky top-12">
          {/* Logo & Brand */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center p-2">
                <img 
                  src="/images/logo.png" 
                  alt="UD. Mia Sari Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/80?text=Logo";
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  UD. Mia Sari
                </h1>
                <p className="text-slate-400 text-sm">Produsen Bakso Rumahan</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Bergabung Menjadi
              <br />
              <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Customer Setia Kami
              </span>
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Daftar sekarang dan nikmati kemudahan berbelanja bakso berkualitas 
              langsung dari produsennya. Kami siap melayani kebutuhan kuliner Anda!
            </p>
            
            {/* Benefits Grid */}
            <div className="space-y-4 mt-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className="text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative Element */}
          <div className="absolute bottom-10 left-10 opacity-10">
            <SparklesIcon className="w-40 h-40 text-indigo-500" />
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 p-2">
              <img 
                src="/images/logo.png" 
                alt="UD. Mia Sari Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/96?text=Logo";
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Daftar Akun</h2>
            <p className="text-slate-400">Daftar gratis dan mulai berbelanja dengan mudah</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nama Lengkap Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...register("name")}
                    className={`
                      block w-full pl-10 pr-3 py-3 bg-slate-700/50 border rounded-xl 
                      text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.name 
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                        : "border-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }
                    `}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    className={`
                      block w-full pl-10 pr-3 py-3 bg-slate-700/50 border rounded-xl 
                      text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.email 
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                        : "border-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }
                    `}
                    placeholder="masukkan@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Nomor Telepon Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nomor Telepon <span className="text-slate-500 text-xs">(opsional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    {...register("phone")}
                    className={`
                      block w-full pl-10 pr-3 py-3 bg-slate-700/50 border rounded-xl 
                      text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.phone 
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                        : "border-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }
                    `}
                    placeholder="0812-3456-7890"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>

              {/* Password Field with Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`
                      block w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-xl 
                      text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.password 
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                        : "border-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }
                    `}
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field with Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Konfirmasi Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    className={`
                      block w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-xl 
                      text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.confirmPassword 
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                        : "border-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500"
                      }
                    `}
                    placeholder="Masukkan ulang password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Info Role Customer */}
              <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-indigo-400 font-semibold">
                      Registrasi sebagai Customer
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Sebagai customer, Anda dapat melihat produk, melakukan transaksi, 
                      dan melacak status pesanan dengan mudah.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading || isRegistering}
                className={`
                  w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200
                  flex items-center justify-center gap-2 group
                  ${(isSubmitting || loading || isRegistering)
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl transform hover:scale-[1.02]"
                  }
                `}
              >
                {(isSubmitting || loading || isRegistering) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </div>
          
          {/* Stats Section Sama seperti Login */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-white">500+</div>
              <div className="text-xs text-slate-400">Pelanggan Puas</div>
            </div>
            <div className="text-center p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-white">50+</div>
              <div className="text-xs text-slate-400">Mitra Bisnis</div>
            </div>
            <div className="text-center p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm">
              <div className="text-xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400">Halal Certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;