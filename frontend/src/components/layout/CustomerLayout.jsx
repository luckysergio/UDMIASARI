import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";
import { Package, ShoppingCart, RefreshCw, LogOut, User, Menu, X, UserCircle } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// Logo Component
const Logo = ({ size = "md", showText = true }) => {
  const logoUrl = '/logo.jpg';
  const sizeClasses = {
    sm: { container: "w-8 h-8", text: "text-base md:text-lg", icon: "w-4 h-4" },
    md: { container: "w-10 h-10", text: "text-lg md:text-xl", icon: "w-5 h-5" },
    lg: { container: "w-12 h-12", text: "text-xl md:text-2xl", icon: "w-6 h-6" },
  };

  return (
    <div className="flex items-center gap-2 group">
      <div className={`${sizeClasses[size].container} rounded-xl overflow-hidden shadow-lg transition-all duration-300 bg-linear-to-r from-indigo-600 to-purple-600 flex items-center justify-center shrink-0`}>
        <img 
          src={logoUrl} 
          alt="UD. Mia Sari Logo" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            if (parent) {
              parent.innerHTML = `<svg class="${sizeClasses[size].icon} text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`;
            }
          }}
        />
      </div>
      {showText && (
        <div className="shrink-0">
          <h1 className={`font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent ${sizeClasses[size].text}`}>
            UD. Mia Sari
          </h1>
          <p className="text-[10px] text-slate-400">Bakso Rumahan Berkualitas</p>
        </div>
      )}
    </div>
  );
};

const CustomerLayout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, warning } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // data-aos rawan memicu scroll horizontal pada device mobile jika durasi terlalu lama / tanpa pembatasan overflow
    AOS.init({
      duration: 600, 
      once: true,
      easing: "ease-out",
    });
  }, []);

  const handleLogout = () => {
    warning(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      async () => {
        setIsLoggingOut(true);
        const result = await logout();
        if (result.success) {
          success("Logout Berhasil", "Anda telah keluar dari aplikasi.", () => {
            navigate("/");
          });
        } else {
          error("Logout Gagal", result.message || "Terjadi kesalahan saat logout.");
        }
        setIsLoggingOut(false);
      },
      () => {
        console.log("Logout dibatalkan");
      },
      "Ya, Keluar",
      "Batal"
    );
  };

  const navLinks = [
    { path: "/", label: "Beranda", icon: Package },
    { path: "/customer/transactions", label: "Transaksi", icon: ShoppingCart },
    { path: "/customer/returs", label: "Retur", icon: RefreshCw },
    { path: "/customer/profile", label: "Profile", icon: UserCircle },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Logo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm ${
                      active
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">
                    {user?.name?.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-slate-700/50 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-700/50">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-300 truncate max-w-37.5">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800/50 mt-auto shrink-0">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div data-aos="fade-up" data-aos-delay="50">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-indigo-600 p-1.5 rounded-xl">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white text-sm font-semibold">UD. Mia Sari</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Produsen bakso rumahan asal Tangerang yang berkomitmen menyajikan bakso berkualitas tinggi, halal, dan higienis.
              </p>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="100">
              <h4 className="text-white text-xs md:text-sm font-semibold mb-3">Tautan Cepat</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/" className="text-slate-400 hover:text-indigo-400 transition">Beranda</Link></li>
                <li><Link to="/customer/transactions" className="text-slate-400 hover:text-indigo-400 transition">Transaksi Saya</Link></li>
                <li><Link to="/customer/returs" className="text-slate-400 hover:text-indigo-400 transition">Retur Saya</Link></li>
                <li><Link to="/customer/profile" className="text-slate-400 hover:text-indigo-400 transition">Profil Saya</Link></li>
              </ul>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="150">
              <h4 className="text-white text-xs md:text-sm font-semibold mb-3">Kontak</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Tangerang, Banten, Indonesia</li>
                <li>+62 85886682496</li>
                <li>baksomiasari@gmail.com</li>
              </ul>
            </div>
            
            <div data-aos="fade-up" data-aos-delay="200">
              <h4 className="text-white text-xs md:text-sm font-semibold mb-3">Jam Operasional</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>Senin - Jumat: 08:00 - 17:00</li>
                <li>Sabtu: 08:00 - 12:00</li>
                <li>Minggu: Tutup</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800/60 mt-6 pt-6 text-center">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} UD. Mia Sari. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;