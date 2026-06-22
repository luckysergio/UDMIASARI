import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Receipt,
  BarChart3,
  Calendar,
  TrendingDown,
} from "lucide-react";
import dashboardService from "../../services/dashboardService";

const Dashboard = () => {
  const { user, getUserRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);

  const userRole = getUserRole();
  const isAdmin = userRole === "admin";
  const isKepalaProduksi = userRole === "kepala_produksi";
  const canAccessDashboard = isAdmin || isKepalaProduksi;

  useEffect(() => {
    if (canAccessDashboard) {
      fetchDashboardData();
      if (isAdmin) {
        fetchMonthlyChartData();
      }
    } else {
      setLoading(false);
    }
  }, [selectedYear, canAccessDashboard, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const result = await dashboardService.getDashboardData();
    if (result.success) {
      setDashboardData(result.data);
    }
    setLoading(false);
  };

  const fetchMonthlyChartData = async () => {
    const result = await dashboardService.getMonthlyRevenue(selectedYear);
    if (result.success) {
      setMonthlyChartData(result.data);
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

  const formatNumber = (num) => {
    if (!num) return 0;
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 0) return "text-green-400";
    if (percentage < 0) return "text-red-400";
    return "text-slate-400";
  };

  const getGrowthIcon = (percentage) => {
    if (percentage > 0) return <ArrowUp className="w-3 h-3" />;
    if (percentage < 0) return <ArrowDown className="w-3 h-3" />;
    return null;
  };

  const getTransactionStatusColor = (status) => {
    const colors = {
      dipesan: "bg-yellow-500/20 text-yellow-400",
      diproses: "bg-blue-500/20 text-blue-400",
      dikirim: "bg-purple-500/20 text-purple-400",
      siap_ambil: "bg-indigo-500/20 text-indigo-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getReturStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-blue-500/20 text-blue-400",
      replacement_sent: "bg-purple-500/20 text-purple-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'kepala_produksi':
        return 'Kepala Produksi';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  // Calculate max value for chart scaling
  const revenues = monthlyChartData.map(d => d.revenue || 0);
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues, 1) : 1;

  // Jika bukan admin dan bukan kepala produksi, tampilkan pesan akses ditolak
  if (!canAccessDashboard) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full min-h-100">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center max-w-md mx-auto">
            <div className="p-8">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
              <p className="text-slate-400">
                Halaman dashboard hanya dapat diakses oleh Administrator dan Kepala Produksi.
                <br />
                Role Anda saat ini: <span className="text-yellow-400">{getRoleLabel(userRole)}</span>
              </p>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Selamat Datang, {user?.name}!
            </h1>
            <p className="text-slate-400">
              Berikut adalah ringkasan performa inventory Anda.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              fetchDashboardData();
              if (isAdmin) fetchMonthlyChartData();
            }}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 🔥 HANYA ADMIN: Stats Cards (semua card stats) */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Produk Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Produk</p>
                {loading ? (
                  <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData?.statistics?.total_products)}
                  </p>
                )}
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </Card>

          {/* Total Transaksi Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Transaksi</p>
                {loading ? (
                  <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData?.statistics?.total_transactions)}
                  </p>
                )}
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Total Revenue Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Pendapatan</p>
                {loading ? (
                  <div className="w-24 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-emerald-400">
                    {formatRupiah(dashboardData?.statistics?.total_revenue_all_time)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Total Retur Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Retur</p>
                {loading ? (
                  <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData?.statistics?.total_returs)}
                  </p>
                )}
              </div>
              <div className="bg-rose-500/20 p-3 rounded-xl">
                <RefreshCw className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 🔥 KHUSUS KEPALA PRODUKSI: Hanya menampilkan Total Produk dan Total Transaksi (tanpa uang) */}
      {isKepalaProduksi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {/* Total Produk Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Produk</p>
                {loading ? (
                  <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData?.statistics?.total_products)}
                  </p>
                )}
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </Card>

          {/* Total Transaksi Card */}
          <Card className="bg-linear-to-br from-slate-800 to-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Transaksi</p>
                {loading ? (
                  <div className="w-16 h-8 bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(dashboardData?.statistics?.total_transactions)}
                  </p>
                )}
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 🔥 HANYA ADMIN: Revenue & Retur Overview */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Pendapatan</h3>
                  <p className="text-slate-400 text-sm">Perbandingan bulan ini vs bulan lalu</p>
                </div>
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-slate-700 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{formatRupiah(dashboardData?.revenue?.current_month)}</span>
                    <span className="text-slate-400 text-sm">{dashboardData?.revenue?.current_month_label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Bulan lalu:</span>
                    <span className="text-white">{formatRupiah(dashboardData?.revenue?.last_month)}</span>
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData?.revenue?.growth_percentage)}`}>
                      {getGrowthIcon(dashboardData?.revenue?.growth_percentage)}
                      <span>{Math.abs(dashboardData?.revenue?.growth_percentage)}%</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Pendapatan</span>
                      <span className="text-emerald-400 font-semibold">{formatRupiah(dashboardData?.statistics?.total_revenue_all_time)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Pendapatan Bulan Ini</span>
                      <span className="text-white">{formatRupiah(dashboardData?.statistics?.this_month_revenue)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Retur Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">Retur</h3>
                  <p className="text-slate-400 text-sm">Perbandingan bulan ini vs bulan lalu</p>
                </div>
                <div className="bg-rose-500/20 p-2 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-slate-700 rounded animate-pulse w-1/4"></div>
                  <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{formatNumber(dashboardData?.retur?.current_month)}</span>
                    <span className="text-slate-400 text-sm">retur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Bulan lalu:</span>
                    <span className="text-white">{formatNumber(dashboardData?.retur?.last_month)} retur</span>
                    <div className={`flex items-center gap-1 text-sm ${getGrowthColor(dashboardData?.retur?.growth_percentage)}`}>
                      {getGrowthIcon(dashboardData?.retur?.growth_percentage)}
                      <span>{Math.abs(dashboardData?.retur?.growth_percentage)}%</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Retur</span>
                      <span className="text-white font-semibold">{formatNumber(dashboardData?.statistics?.total_returs)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Retur Selesai</span>
                      <span className="text-green-400">{formatNumber(dashboardData?.statistics?.completed_returs)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-400">Retur Pending</span>
                      <span className="text-yellow-400">{formatNumber(dashboardData?.statistics?.pending_returs)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 🔥 HANYA ADMIN: Monthly Revenue Chart */}
      {isAdmin && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-8">
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-white font-semibold text-lg">Grafik Pendapatan Tahunan</h3>
                <p className="text-slate-400 text-sm">Pendapatan per bulan dalam setahun</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Chart Container */}
            <div className="relative" style={{ height: "300px" }}>
              {monthlyChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400">Belum ada data pendapatan</p>
                </div>
              ) : (
                <div className="flex items-end justify-between h-full gap-2">
                  {monthlyChartData.map((data, index) => {
                    const revenue = data.revenue || 0;
                    const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 90 : 0;
                    const isHovered = hoveredBar === index;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1 flex flex-col items-center gap-2 h-full group"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div className="relative w-full flex-1 flex flex-col justify-end">
                          <div 
                            className="w-full bg-indigo-500/50 hover:bg-indigo-400 transition-all duration-300 rounded-t-lg cursor-pointer"
                            style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                          />
                          {isHovered && revenue > 0 && (
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs text-white whitespace-nowrap z-10 shadow-lg pointer-events-none">
                              {formatRupiah(revenue)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 text-center">
                          {data.month_name?.substring(0, 3) || ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Chart Legend */}
            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500/50 rounded"></div>
                <span className="text-xs text-slate-400">Pendapatan (Rp)</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Products Section - Semua role bisa lihat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products This Month */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold text-lg">Produk Terlaris Bulan Ini</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.top_products?.current_month?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data produk terlaris</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.top_products?.current_month?.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <span className="text-indigo-400 font-semibold text-sm">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{product.product_name}</p>
                        <p className="text-xs text-slate-400">{product.product_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold text-sm">{formatNumber(product.total_qty_sold)} terjual</p>
                      <p className="text-xs text-slate-400">{formatRupiah(product.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Top Products All Time */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold text-lg">Produk Terlaris Sepanjang Masa</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.top_products?.all_time?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada data produk terlaris</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.top_products?.all_time?.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-purple-400 font-semibold text-sm">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{product.product_name}</p>
                        <p className="text-xs text-slate-400">{product.product_code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold text-sm">{formatNumber(product.total_qty_sold)} terjual</p>
                      <p className="text-xs text-slate-400">{formatRupiah(product.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Active Transactions & Active Returs - Semua role bisa lihat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Transactions */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold text-lg">Transaksi Aktif</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.active_transactions?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada transaksi aktif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.active_transactions?.map((transaction) => (
                  <div key={transaction.id} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{transaction.invoice_no}</p>
                        <p className="text-xs text-slate-400">{transaction.customer_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                        {transaction.status_label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-400 font-semibold">{formatRupiah(transaction.grand_total)}</span>
                      <span className="text-xs text-slate-400">Sisa: {formatRupiah(transaction.remaining_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Active Returs */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw className="w-5 h-5 text-rose-400" />
              <h3 className="text-white font-semibold text-lg">Retur Aktif</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.active_returs?.length ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada retur aktif</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.active_returs?.map((retur) => (
                  <div key={retur.id} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium text-sm">{retur.return_no}</p>
                        <p className="text-xs text-slate-400">Invoice: {retur.invoice_no}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getReturStatusColor(retur.status)}`}>
                        {retur.status_label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-rose-400 font-semibold">{formatRupiah(retur.total_refund)}</span>
                      <span className="text-xs text-slate-400">{retur.type_label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;