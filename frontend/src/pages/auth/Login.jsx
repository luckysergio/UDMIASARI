import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  EnvelopeIcon, 
  KeyIcon, 
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Format email tidak valid")
      .required("Email wajib diisi"),
    password: yup.string().required("Password wajib diisi"),
  })
  .required();

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, getUserRole } = useAuth();
  const { success, error } = useModal();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      
      if (userRole === "admin" || userRole === "kepala_produksi") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, getUserRole]);

  const onSubmit = async (data) => {
    // Cegah multiple submission
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    
    try {
      const result = await login(data);
      
      if (result.success) {
        const userRole = result.user?.role;
        const redirectPath = (userRole === "admin" || userRole === "kepala_produksi") ? "/dashboard" : "/";
        
        success(
          "Login Berhasil!",
          `Selamat datang kembali, ${result.user?.name}!`,
          () => {
            navigate(redirectPath);
          }
        );
      } else {
        // Tampilkan error tanpa reload
        error(
          "Login Gagal",
          result.message || "Email atau password yang Anda masukkan salah. Silakan coba lagi."
        );
      }
    } catch (err) {
      error(
        "Login Gagal",
        "Terjadi kesalahan saat login. Silakan coba lagi."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Features data
  const features = [
    {
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      title: "Halal & Higienis",
      description: "Terjamin kehalalannya"
    },
    {
      icon: <TruckIcon className="w-5 h-5" />,
      title: "Pengiriman Cepat",
      description: "Seluruh area Tangerang"
    },
    {
      icon: <HeartIcon className="w-5 h-5" />,
      title: "Rasa Tradisional",
      description: "Resep turun temurun"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Brand Info */}
        <div className="hidden lg:block space-y-8">
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
              Kehangatan Rasa Bakso
              <br />
              <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Tradisional dan Higienis
              </span>
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              UD. Mia Sari adalah produsen bakso rumahan asal Tangerang yang berkomitmen menyajikan 
              bakso berkualitas tinggi, halal, dan higienis.
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-white font-semibold text-sm">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Decorative Element */}
          <div className="absolute bottom-10 left-10 opacity-10">
            <SparklesIcon className="w-40 h-40 text-indigo-500" />
          </div>
        </div>

        {/* Right Side - Login Form */}
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
            <h2 className="text-2xl font-bold text-white mb-2">Selamat Datang</h2>
            <p className="text-slate-400">Silakan login untuk melanjutkan</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
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

              {/* Password Field with Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
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
                    placeholder="Masukkan password"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center
                      ${rememberMe 
                        ? "bg-indigo-500 border-indigo-500" 
                        : "bg-slate-700/50 border-slate-600 group-hover:border-indigo-400"
                      }
                    `}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Ingat saya
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading || isLoggingIn}
                className={`
                  w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200
                  flex items-center justify-center gap-2 group
                  ${(isSubmitting || loading || isLoggingIn)
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl transform hover:scale-[1.02]"
                  }
                `}
              >
                {(isSubmitting || loading || isLoggingIn) ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
          
          {/* Stats Section */}
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

export default Login;