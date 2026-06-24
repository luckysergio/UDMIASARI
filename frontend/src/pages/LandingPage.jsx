import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Package,
  ShoppingCart,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Truck,
  Shield,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Heart,
  Zap,
  CheckCircle,
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";
import landingPageService from "../services/landingPageService";
import AOS from "aos";
import "aos/dist/aos.css";

// ============================================================
// HERO CAROUSEL
// ============================================================
const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const images = [
    { src: "/images/1.jpeg", alt: "Bakso UD. Mia Sari - Produk Unggulan" },
    { src: "/images/2.jpeg", alt: "Bakso Segar UD. Mia Sari" },
    { src: "/images/3.jpeg", alt: "Proses Produksi Bakso Higienis" },
    { src: "/images/4.jpeg", alt: "Bakso Rumahan Berkualitas" },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="relative w-full h-75 sm:h-100 md:h-125 lg:h-150 xl:h-175 overflow-hidden group">
      <div
        className="relative w-full h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="relative w-full h-full shrink-0">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-linear-to-trom-black/70 via-black/30 to-black/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-white"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 z-20 backdrop-blur-sm"
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : (
          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
      </button>

      {/* Hero Text */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-6" data-aos="fade-down">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className="text-white text-[10px] sm:text-xs md:text-sm font-medium">
                Produsen Bakso Terpercaya di Tangerang
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-6 leading-tight" data-aos="fade-up">
              Kehangatan Rasa Bakso
              <br />
              <span className="bg-linear-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Tradisional dan Higienis
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-8 max-w-2xl mx-auto px-2" data-aos="fade-up" data-aos-delay="100">
              UD. Mia Sari adalah produsen bakso rumahan asal Tangerang yang
              berkomitmen menyajikan bakso berkualitas tinggi, halal, dan
              higienis.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4" data-aos="fade-up" data-aos-delay="200">
              <button
                onClick={() => {
                  const productsSection = document.getElementById("products");
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="group px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg shadow-orange-500/25 hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
              >
                Lihat Produk
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LOGO COMPONENT
// ============================================================
const Logo = ({ size = "md", showText = true, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const logoUrl = "/images/logo.png";

  const sizeClasses = {
    sm: {
      container: "w-7 h-7 sm:w-8 sm:h-8",
      text: "text-base sm:text-lg",
      tagline: "text-[8px] sm:text-[10px]",
      icon: "w-4 h-4 sm:w-5 sm:h-5",
    },
    md: {
      container: "w-8 h-8 sm:w-10 sm:h-10",
      text: "text-lg sm:text-xl",
      tagline: "text-[10px] sm:text-xs",
      icon: "w-5 h-5 sm:w-6 sm:h-6",
    },
    lg: {
      container: "w-10 h-10 sm:w-12 sm:h-12",
      text: "text-xl sm:text-2xl",
      tagline: "text-xs sm:text-sm",
      icon: "w-6 h-6 sm:w-7 sm:h-7",
    },
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 group ${className}`}>
      <div
        className={`
        ${sizeClasses[size].container} 
        rounded-xl overflow-hidden 
        shadow-lg transition-all duration-500 
        group-hover:scale-105 group-hover:shadow-indigo-500/30 
        bg-linear-to-br from-indigo-600 to-purple-600 
        flex items-center justify-center
        shrink-0
      `}
      >
        {!imgError ? (
          <img
            src={logoUrl}
            alt="UD. Mia Sari Logo"
            className="w-full h-full object-contain p-1 sm:p-1.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`${sizeClasses[size].icon} text-white font-bold`}>
            MS
          </span>
        )}
      </div>
      {showText && (
        <div className="shrink-0 min-w-0">
          <h1
            className={`font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent ${sizeClasses[size].text} whitespace-nowrap`}
          >
            UD. Mia Sari
          </h1>
          <p
            className={`text-slate-400 ${sizeClasses[size].tagline} whitespace-nowrap`}
          >
            Bakso Rumahan Berkualitas
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SOCIAL ICONS
// ============================================================
const FacebookIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17" y1="7" x2="17" y2="7" stroke="none" />
  </svg>
);

const Target = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ============================================================
// LANDING PAGE
// ============================================================
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [landingData, setLandingData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);

  const userRole = user?.role;
  const isAdminOrProduksi = userRole === "admin" || userRole === "kepala_produksi";
  const isCustomer = userRole === "customer";

  useEffect(() => {
    if (isAuthenticated() && isAdminOrProduksi) {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [isAuthenticated, isAdminOrProduksi, navigate]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
    fetchLandingData();
    loadCartFromStorage();
  }, [
    selectedCategory,
    selectedJenis,
    searchTerm,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("customerCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (newCart) => {
    localStorage.setItem("customerCart", JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (product, qty = 1) => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { redirectTo: "/", product } });
      return;
    }

    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 500);

    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      const updatedCart = cart.map((item) =>
        item.product_id === product.id
          ? {
              ...item,
              qty: item.qty + qty,
              subtotal: (item.qty + qty) * item.price,
            }
          : item,
      );
      saveCartToStorage(updatedCart);
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        price: product.price,
        qty: qty,
        subtotal: product.price * qty,
        image: product.image,
        stock: product.stock,
      };
      saveCartToStorage([...cart, newItem]);
    }
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product_id === productId
        ? { ...item, qty: newQty, subtotal: newQty * item.price }
        : item,
    );
    saveCartToStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.product_id !== productId);
    saveCartToStorage(updatedCart);
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.subtotal, 0);
  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/customer/transactions", { state: { cart } });
  };

  const fetchLandingData = async () => {
    setLoading(true);
    const params = {
      category_id: selectedCategory,
      jenis_id: selectedJenis,
      search: searchTerm,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: currentPage,
      limit: 12,
    };

    const result = await landingPageService.getLandingData(params);
    if (result.success) {
      setLandingData(result.data);
      setProducts(result.data.all_products?.data || []);
      setCategories(result.data.categories || []);
      setJenisList(result.data.jenis || []);
      setTotalPages(result.data.all_products?.last_page || 1);
    }
    setLoading(false);
  };

  const formatRupiah = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({
        top: document.getElementById("products")?.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedJenis("");
    setSearchTerm("");
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const statistics = [
    {
      icon: Package,
      value: landingData?.statistics?.total_products || 0,
      label: "Produk Tersedia",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: ShoppingCart,
      value: landingData?.statistics?.total_transactions || 0,
      label: "Produk Terjual",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Package,
      value: landingData?.statistics?.total_customers || 0,
      label: "Customer Aktif",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Package,
      value: `${landingData?.statistics?.satisfied_clients || 0}%`,
      label: "Kepuasan Customer",
      gradient: "from-yellow-500 to-orange-500",
    },
  ];

  const sortOptions = [
    { value: "created_at", label: "Terbaru" },
    { value: "name", label: "Nama Produk" },
    { value: "price_asc", label: "Harga Terendah" },
    { value: "price_desc", label: "Harga Tertinggi" },
  ];

  const handleSortChange = (value) => {
    if (value === "price_asc") {
      setSortBy("price");
      setSortOrder("asc");
    } else if (value === "price_desc") {
      setSortBy("price");
      setSortOrder("desc");
    } else {
      setSortBy(value);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const features = [
    {
      icon: Truck,
      title: "Pengiriman Cepat",
      description: "Proses pengiriman yang cepat dan aman ke seluruh Tangerang",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Garansi Halal",
      description: "100% halal dengan sertifikasi resmi",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Berkualitas",
      description: "Bahan baku pilihan dengan kualitas terjamin",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* ============================================================
          NAVBAR
          ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg shadow-slate-900/50 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Logo size="md" showText={true} className="shrink-0" />

            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated() && isCustomer && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative p-2 sm:p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300 group"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:scale-110 transition-transform" />
                  {getCartItemCount() > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 min-w-4 sm:min-w-5 h-4 sm:h-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center px-1 transition-all duration-300 ${cartAnimating ? "scale-125" : "scale-100"}`}
                    >
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              )}

              {isAuthenticated() ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden xs:block">
                    <p className="text-slate-400 text-[10px] sm:text-xs">Halo,</p>
                    <p className="text-white text-xs sm:text-sm font-medium">
                      {user?.name?.split(" ")[0]}
                    </p>
                  </div>
                  {isAdminOrProduksi ? (
                    <Link
                      to="/dashboard"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-[11px] sm:text-sm font-medium shadow-lg shadow-indigo-500/25"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/customer/transactions"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-[11px] sm:text-sm font-medium shadow-lg shadow-indigo-500/25"
                    >
                      Transaksi Saya
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-[11px] sm:text-sm font-medium shadow-lg shadow-indigo-500/25"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden xs:inline-flex px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-all duration-300 text-[11px] sm:text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 sm:pt-20">
        <HeroCarousel />
      </div>

      {/* ============================================================
          STATISTICS SECTION
          ============================================================ */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {statistics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="relative group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-slate-800/50 to-slate-800/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-3 sm:p-6 text-center border border-slate-700/50 group-hover:border-indigo-500/30 transition-all duration-300">
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br ${stat.gradient} bg-opacity-20 flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg`}
                    >
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-[10px] sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          TOP PRODUCTS SECTION
          ============================================================ */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3 sm:mb-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-indigo-400 text-[10px] sm:text-sm font-medium">
                Best Seller
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Produk Terlaris
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
              Produk-produk terbaik pilihan pelanggan kami
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse overflow-hidden"
                  >
                    <div className="w-full h-36 sm:h-48 bg-slate-700" />
                    <div className="p-3 sm:p-4">
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4 mb-2" />
                      <div className="h-2 sm:h-3 bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                ))
            ) : !landingData?.top_products?.length ? (
              <div className="col-span-full text-center text-slate-400 py-8">
                Belum ada data produk terlaris
              </div>
            ) : (
              landingData.top_products.slice(0, 4).map((product, idx) => (
                <div
                  key={product.id}
                  className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div className="relative h-36 sm:h-48 overflow-hidden bg-linear-to-br from-slate-700 to-slate-800">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600" />
                      </div>
                    )}
                    {product.total_sold > 0 && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shadow-lg">
                        Terjual {product.total_sold}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-slate-400 mb-2 sm:mb-3">
                      {product.code}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-emerald-400 font-bold text-base sm:text-xl">
                        {formatRupiah(product.price)}
                      </p>
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 text-[10px] sm:text-sm font-medium"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          ALL PRODUCTS SECTION
          ============================================================ */}
      <section id="products" className="py-12 sm:py-20 bg-slate-800/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3 sm:mb-4">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-indigo-400 text-[10px] sm:text-sm font-medium">
                Katalog Produk
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Semua Produk
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
              Temukan berbagai produk berkualitas dari kami
            </p>
          </div>

          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
            data-aos="fade-up"
          >
            <div className="flex-1 relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm sm:text-base placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base ${showFilters ? "bg-indigo-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"}`}
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                Filter
              </button>

              <select
                value={
                  sortBy === "price" && sortOrder === "asc"
                    ? "price_asc"
                    : sortBy === "price" && sortOrder === "desc"
                      ? "price_desc"
                      : sortBy
                }
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 cursor-pointer transition-all duration-300"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? "max-h-96 opacity-100 mb-6 sm:mb-8" : "max-h-0 opacity-0"}`}
          >
            <div className="bg-slate-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Jenis
                  </label>
                  <select
                    value={selectedJenis}
                    onChange={(e) => setSelectedJenis(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all duration-300"
                  >
                    <option value="">Semua Jenis</option>
                    {jenisList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(selectedCategory || selectedJenis || searchTerm) && (
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <button
                    onClick={resetFilters}
                    className="px-4 sm:px-5 py-1.5 sm:py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 rounded-2xl border border-slate-700 animate-pulse overflow-hidden"
                  >
                    <div className="w-full h-36 sm:h-48 bg-slate-700" />
                    <div className="p-3 sm:p-4">
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4 mb-2" />
                      <div className="h-2 sm:h-3 bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Package className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                Tidak Ada Produk
              </h3>
              <p className="text-slate-400 text-sm">
                Produk yang Anda cari tidak ditemukan
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product, idx) => (
                  <div
                    key={product.id}
                    className="group bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-500 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10"
                    data-aos="fade-up"
                    data-aos-delay={(idx % 8) * 50}
                  >
                    <div
                      className="relative h-36 sm:h-48 overflow-hidden bg-linear-to-br from-slate-700 to-slate-800 cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600" />
                        </div>
                      )}
                      {!product.is_available && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium">
                            Stok Habis
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-white font-semibold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-slate-400 mb-1.5 sm:mb-2">
                        {product.code}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                        {product.category_name && (
                          <span className="text-[8px] sm:text-xs text-indigo-400 bg-indigo-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                            {product.category_name}
                          </span>
                        )}
                        {product.jenis_name && (
                          <span className="text-[8px] sm:text-xs text-emerald-400 bg-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                            {product.jenis_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-400 font-bold text-base sm:text-xl">
                            {formatRupiah(product.price)}
                          </p>
                          <p className="text-[8px] sm:text-xs text-slate-500">
                            Stok: {product.stock}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 text-[10px] sm:text-sm font-medium"
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  className="mt-8 sm:mt-12 flex justify-center gap-1.5 sm:gap-2 flex-wrap"
                  data-aos="fade-up"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-700/50 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
                          currentPage === pageNum
                            ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-700/50 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-all duration-300 flex items-center justify-center text-sm"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ============================================================
          ABOUT & CONTACT SECTION
          ============================================================ */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div data-aos="fade-right">
              <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3 sm:mb-4">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                <span className="text-indigo-400 text-[10px] sm:text-sm font-medium">
                  Tentang Kami
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Tentang UD. Mia Sari
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                UD. Mia Sari adalah produsen bakso rumahan asal Tangerang yang
                berkomitmen menyajikan bakso berkualitas tinggi, halal, dan
                higienis. Mengkombinasikan resep tradisional dengan proses
                produksi modern, kami siap memenuhi kebutuhan pasokan bakso
                untuk konsumsi harian, mitra warung retail, hingga pedagang
                kuliner keliling.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">
                      Visi
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm">
                      Menjadi produsen bakso pilihan utama di Tangerang dan
                      sekitarnya yang dikenal karena kualitas rasa, kebersihan,
                      dan pelayanan terbaik.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">
                      Misi
                    </h4>
                    <ul className="text-slate-400 text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          Memproduksi bakso dengan bahan baku daging pilihan
                          yang segar dan berkualitas.
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          Menjaga standar kebersihan dan higienitas yang tinggi
                          di setiap tahapan produksi.
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span>
                          Memberikan kemudahan akses pemesanan bagi pelanggan
                          retail maupun mitra bisnis.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-linear-to-br from-slate-800/40 to-slate-800/20 rounded-2xl border border-slate-700/50 p-4 sm:p-6 backdrop-blur-sm"
              data-aos="fade-left"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  Informasi Kontak
                </h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-700/30">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  <span className="text-slate-300 text-sm sm:text-base">
                    Tangerang, Banten, Indonesia
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-700/30">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  <span className="text-slate-300 text-sm sm:text-base">
                    +62 85886682496
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-700/30">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  <span className="text-slate-300 text-sm sm:text-base">
                    baksomiasari@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-700/30">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  <span className="text-slate-300 text-sm sm:text-base">
                    Didirikan tahun 2024
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700">
                <h4 className="text-white font-medium mb-3 text-sm sm:text-base">
                  Ikuti Kami
                </h4>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/udmiasari.bakso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-700/50 flex items-center justify-center hover:bg-indigo-600 transition-all duration-300 group"
                  >
                    <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-white" />
                  </a>
                  <a
                    href="https://instagram.com/udmiasari.bakso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-700/50 flex items-center justify-center hover:bg-indigo-600 transition-all duration-300 group"
                  >
                    <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES SECTION
          ============================================================ */}
      <section className="py-12 sm:py-20 bg-slate-800/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-3 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-indigo-400 text-[10px] sm:text-sm font-medium">
                Keunggulan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto px-2">
              Kami memberikan solusi terbaik untuk kebutuhan bakso Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group text-center p-4 sm:p-6 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <Logo size="sm" showText={false} className="justify-center mb-3 sm:mb-4" />
          <p className="text-slate-400 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} UD. Mia Sari. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ============================================================
          PRODUCT DETAIL MODAL - KONSISTEN DENGAN CUSTOMER TRANSACTIONS
          ============================================================ */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-slate-700/50 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/95">
              <h3 className="text-lg font-semibold text-white flex-1 text-center">Detail Produk</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-slate-700 to-slate-800 rounded-xl overflow-hidden h-48 flex items-center justify-center">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-slate-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-0.5">{selectedProduct.name}</h2>
                  <p className="text-slate-400 text-xs mb-2">Kode: {selectedProduct.code}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedProduct.category_name && (
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                        {selectedProduct.category_name}
                      </span>
                    )}
                    {selectedProduct.jenis_name && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {selectedProduct.jenis_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-emerald-400 mb-2">
                    {formatRupiah(selectedProduct.price)}
                  </p>
                  <div className="mb-2">
                    <p className="text-slate-300 text-xs mb-0.5">Deskripsi:</p>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {selectedProduct.description || "Tidak ada deskripsi untuk produk ini."}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="text-slate-300 text-xs">
                      Stok: <span className={selectedProduct.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                        {selectedProduct.stock} {selectedProduct.stock > 0 ? "tersedia" : "habis"}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedProduct.is_available ? (
                      <button
                        onClick={() => {
                          if (!isAuthenticated()) {
                            setShowProductModal(false);
                            navigate("/login");
                          } else {
                            addToCart(selectedProduct, 1);
                            setShowProductModal(false);
                          }
                        }}
                        className="flex-1 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isAuthenticated() && isCustomer ? "Tambah ke Keranjang" : "Login"}
                      </button>
                    ) : (
                      <button disabled className="flex-1 py-2 bg-slate-600 text-slate-400 rounded-xl cursor-not-allowed text-sm">
                        Stok Habis
                      </button>
                    )}
                  </div>
                  {(!isAuthenticated() || !isCustomer) && selectedProduct.is_available && (
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      {!isAuthenticated() ? "Silakan login terlebih dahulu untuk melakukan pemesanan" : "Anda tidak dapat melakukan pemesanan"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CART MODAL - KONSISTEN DENGAN CUSTOMER TRANSACTIONS
          ============================================================ */}
      {showCart && isCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700/50">
            {/* Header */}
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm flex items-center justify-between p-4 border-b border-slate-700 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Keranjang</h3>
                {cart.length > 0 && (
                  <span className="text-xs text-slate-400">({cart.length})</span>
                )}
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-all duration-300 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-white mb-1">Keranjang Kosong</h3>
                  <p className="text-slate-400 text-sm">Belum ada produk di keranjang Anda</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 px-5 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 text-sm font-medium"
                  >
                    Lanjut Belanja
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scroll">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                        <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-xs truncate">{item.product_name}</h4>
                          <p className="text-[10px] text-slate-400">{item.product_code}</p>
                          <p className="text-emerald-400 text-xs font-semibold">{formatRupiah(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateCartQty(item.product_id, item.qty - 1)} className="w-6 h-6 rounded-lg bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition">
                            <Minus className="w-2.5 h-2.5 text-white" />
                          </button>
                          <span className="text-white w-6 text-center text-xs font-medium">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.product_id, item.qty + 1)} className="w-6 h-6 rounded-lg bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition">
                            <Plus className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                        <div className="text-right min-w-16">
                          <p className="text-white font-semibold text-xs">{formatRupiah(item.subtotal)}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.product_id)} className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Total</span>
                      <span className="text-lg font-bold text-emerald-400">{formatRupiah(getCartTotal())}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button onClick={() => setShowCart(false)} className="flex-1 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl text-sm font-medium transition">
                        Lanjut Belanja
                      </button>
                      <button onClick={handleCheckout} className="flex-1 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium text-sm shadow-lg shadow-indigo-500/25 transition">
                        <ShoppingCart className="w-4 h-4" />
                        Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          STYLES
          ============================================================ */}
      <style>{`
        @media (min-width: 480px) {
          .xs\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .xs\\:block { display: block; }
          .xs\\:inline-flex { display: inline-flex; }
        }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: #1e293b; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn; }
        
        * { max-width: 100vw; box-sizing: border-box; }
        img, svg, video, canvas, iframe { max-width: 100%; }
        .container { max-width: 100%; }
      `}</style>
    </div>
  );
};

export default LandingPage;