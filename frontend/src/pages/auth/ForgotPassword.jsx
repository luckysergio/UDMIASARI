import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EnvelopeIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
  })
  .required();

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { success, error } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const result = await authService.sendResetLink(data.email);
    
    if (result.success) {
      setIsSent(true);
      success("Berhasil", result.message);
    } else {
      error("Gagal", result.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <EnvelopeIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Lupa Password?</h2>
          <p className="text-slate-400">
            {!isSent 
              ? "Masukkan email Anda, kami akan mengirimkan link reset password"
              : "Cek email Anda untuk link reset password"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700 p-8">
          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Link Reset</span>
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
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-400" />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Cek Email Anda
                </h3>
                <p className="text-slate-400">
                  Kami telah mengirimkan link reset password ke email Anda. 
                  Silakan cek inbox atau folder spam.
                </p>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-sm text-slate-300">
                  Belum menerima email?{" "}
                  <button
                    onClick={() => setIsSent(false)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Kirim ulang
                  </button>
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
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Link reset password akan kadaluarsa dalam 60 menit.
            Pastikan Anda menggunakan email yang terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;