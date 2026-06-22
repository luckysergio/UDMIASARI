import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { KeyIcon, EnvelopeIcon, ArrowRightIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authService from "../../services/authService";
import { useModal } from "../../contexts/ModalContext";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Format email tidak valid")
      .required("Email wajib diisi"),
    password: yup
      .string()
      .min(6, "Password minimal 6 karakter")
      .required("Password wajib diisi"),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref("password"), null], "Konfirmasi password tidak cocok")
      .required("Konfirmasi password wajib diisi"),
  })
  .required();

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
    }
    
    // Pre-fill email if provided in URL
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    if (!token) {
      error("Error", "Token reset password tidak valid atau sudah kadaluarsa");
      return;
    }
    
    setIsSubmitting(true);
    const result = await authService.resetPassword({
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      token: token,
    });
    
    if (result.success) {
      setIsSuccess(true);
      success("Berhasil", result.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } else {
      error("Gagal", result.message);
    }
    
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Password Berhasil Diubah!
              </h3>
              <p className="text-slate-400">
                Password Anda telah berhasil direset. Silakan login dengan password baru Anda.
              </p>
            </div>

            <div className="animate-pulse">
              <p className="text-sm text-slate-500">
                Mengarahkan ke halaman login...
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <KeyIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-slate-400">
            Masukkan email dan password baru Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password Baru <span className="text-red-400">*</span>
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Konfirmasi Password Baru <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("password_confirmation")}
                  className={`
                    block w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-xl 
                    text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200
                    ${errors.password_confirmation 
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
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-400">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
              <p className="text-xs text-yellow-400 text-center">
                ⚠️ Pastikan password baru Anda minimal 6 karakter dan mudah diingat
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200
                flex items-center justify-center gap-2 group
                ${isSubmitting
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl transform hover:scale-[1.02]"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Kembali ke Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;