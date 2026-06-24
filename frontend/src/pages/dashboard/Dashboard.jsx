import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import MainLayout from "../../components/layout/MainLayout";
import Card from "../../components/common/Card";
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Receipt,
  BarChart3,
  Calendar,
  XCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import dashboardService from "../../services/dashboardService";
import echo from "../../services/echo";

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon, 
  bgColor = "bg-emerald-500/20", 
  loading, 
  textColor = "text-white",
  gradient = "from-slate-800 to-slate-800/50",
  showIcon = true
}) => {
  const hasIcon = showIcon && icon;
  
  return (
    <Card className={`bg-linear-to-br ${gradient} backdrop-blur-sm border border-slate-700 hover:border-indigo-500/50 hover:scale-[1.02] transition-all duration-300 group list-none`}>
      <div className="p-4 sm:p-5">
        <div className={`flex items-center ${hasIcon ? 'justify-between' : 'justify-start'}`}>
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1.5 tracking-wide">{title}</p>
            {loading ? (
              <div className="w-20 h-7 sm:h-9 bg-slate-700 rounded animate-pulse"></div>
            ) : (
              <p className={`font-bold ${textColor} text-base sm:text-xl lg:text-2xl xl:text-3xl whitespace-nowrap leading-tight tracking-tight`}>
                {value}
              </p>
            )}
          </div>
          {hasIcon && (
            <div className={`${bgColor} p-3 rounded-xl shrink-0 ml-3 group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Small Stat Card
const SmallStatCard = ({ title, value, icon, loading }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-3 hover:border-indigo-500/50 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-500/20 p-2 rounded-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-[10px] font-medium">{title}</p>
          {loading ? (
            <div className="w-12 h-5 bg-slate-700 rounded animate-pulse mt-0.5"></div>
          ) : (
            <p className="text-white font-bold text-sm whitespace-nowrap truncate">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, getUserRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  
  // Real-time states
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const channelRef = useRef(null);

  const userRole = getUserRole();
  const isAdmin = userRole === "admin";
  const isKepalaProduksi = userRole === "kepala_produksi";
  const canAccessDashboard = isAdmin || isKepalaProduksi;

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const result = await dashboardService.getDashboardData();
    if (result.success) {
      setDashboardData(result.data);
      setLastUpdate(new Date());
    }
    if (showLoading) setLoading(false);
  }, []);

  // Fetch monthly chart data
  const fetchMonthlyChartData = useCallback(async () => {
    const result = await dashboardService.getMonthlyRevenue(selectedYear);
    if (result.success) {
      setMonthlyChartData(result.data);
    }
  }, [selectedYear]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!canAccessDashboard) {
      setLoading(false);
      return;
    }

    fetchDashboardData(true);
    if (isAdmin) {
      fetchMonthlyChartData();
    }

    try {
      const channel = echo.channel('dashboard');
      channelRef.current = channel;

      channel.subscribed(() => {
        setIsConnected(true);
      });

      channel.listen('.stats.updated', (event) => {
        if (event.stats) {
          setIsUpdating(true);
          setDashboardData(event.stats);
          setLastUpdate(new Date());
          
          setTimeout(() => {
            setIsUpdating(false);
          }, 800);
        }
      });

      channel.error(() => {
        setIsConnected(false);
      });

    } catch (error) {
      setIsConnected(false);
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.stopListening('.stats.updated');
          echo.leaveChannel('dashboard');
          channelRef.current = null;
        } catch (error) {}
      }
      setIsConnected(false);
    };
  }, [canAccessDashboard, isAdmin, fetchDashboardData, fetchMonthlyChartData]);

  // Format helpers
  const formatRupiah = (price) => {
    if (!price && price !== 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace(/\s/g, '').replace('Rp', 'Rp ');
  };

  const formatNumber = (num) => {
    if (!num) return 0;
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const formatLastUpdate = (date) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getGrowthColor = (percentage) => {
    if (percentage > 0) return "text-emerald-400";
    if (percentage < 0) return "text-rose-400";
    return "text-slate-400";
  };

  const getGrowthBg = (percentage) => {
    if (percentage > 0) return "bg-emerald-500/10";
    if (percentage < 0) return "bg-rose-500/10";
    return "bg-slate-500/10";
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
      case 'admin': return 'Administrator';
      case 'kepala_produksi': return 'Kepala Produksi';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  // Calculate max value for chart
  const revenues = monthlyChartData.map(d => d.revenue || 0);
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues, 1) : 1;

  // Access denied
  if (!canAccessDashboard) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-center max-w-md w-full">
            <div className="p-8">
              <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
              <p className="text-slate-400 text-sm">
                Halaman dashboard hanya dapat diakses oleh Administrator dan Kepala Produksi.
                <br />
                Role Anda saat ini: <span className="text-yellow-400 font-medium">{getRoleLabel(userRole)}</span>
              </p>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Section with Connection Status */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Selamat Datang, {user?.name}!
              </h1>
              {isUpdating && (
                <div className="relative">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full relative"></div>
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Berikut adalah ringkasan performa inventory Anda secara real-time
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              isConnected 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></div>
              <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
              {lastUpdate && (
                <span className="text-[10px] text-slate-400 ml-1 hidden sm:inline">
                  • {formatLastUpdate(lastUpdate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Admin */}
      {isAdmin && (
        <>
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 sm:mb-8">
            <StatCard
              title="Total Produk"
              value={formatNumber(dashboardData?.statistics?.total_products)}
              icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />}
              bgColor="bg-emerald-500/20"
              loading={loading}
              gradient="from-emerald-900/20 to-slate-800/50"
            />
            <StatCard
              title="Total Transaksi"
              value={formatNumber(dashboardData?.statistics?.total_transactions)}
              icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
              bgColor="bg-blue-500/20"
              loading={loading}
              gradient="from-blue-900/20 to-slate-800/50"
            />
            <StatCard
              title="Total Pendapatan"
              value={formatRupiah(dashboardData?.statistics?.total_revenue_all_time)}
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />}
              bgColor="bg-emerald-500/20"
              loading={loading}
              textColor="text-emerald-400"
              gradient="from-emerald-900/20 to-slate-800/50"
              showIcon={false}
            />
            <StatCard
              title="Total Retur"
              value={formatNumber(dashboardData?.statistics?.total_returs)}
              icon={<RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />}
              bgColor="bg-rose-500/20"
              loading={loading}
              gradient="from-rose-900/20 to-slate-800/50"
            />
          </div>

          {/* Mobile: 2x2 grid */}
          <div className="grid grid-cols-2 gap-3 sm:hidden mb-6">
            <SmallStatCard
              title="Produk"
              value={formatNumber(dashboardData?.statistics?.total_products)}
              icon={<Package className="w-4 h-4 text-emerald-400" />}
              loading={loading}
            />
            <SmallStatCard
              title="Transaksi"
              value={formatNumber(dashboardData?.statistics?.total_transactions)}
              icon={<ShoppingCart className="w-4 h-4 text-blue-400" />}
              loading={loading}
            />
            <SmallStatCard
              title="Pendapatan"
              value={formatRupiah(dashboardData?.statistics?.total_revenue_all_time)}
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              loading={loading}
            />
            <SmallStatCard
              title="Retur"
              value={formatNumber(dashboardData?.statistics?.total_returs)}
              icon={<RefreshCw className="w-4 h-4 text-rose-400" />}
              loading={loading}
            />
          </div>
        </>
      )}

      {/* Stats Cards - Kepala Produksi */}
      {isKepalaProduksi && (
        <div className="grid grid-cols-2 gap-4 md:gap-5 mb-6 sm:mb-8">
          <StatCard
            title="Total Produk"
            value={formatNumber(dashboardData?.statistics?.total_products)}
            icon={<Package className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />}
            bgColor="bg-emerald-500/20"
            loading={loading}
            gradient="from-emerald-900/20 to-slate-800/50"
          />
          <StatCard
            title="Total Transaksi"
            value={formatNumber(dashboardData?.statistics?.total_transactions)}
            icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
            bgColor="bg-blue-500/20"
            loading={loading}
            gradient="from-blue-900/20 to-slate-800/50"
          />
        </div>
      )}

      {/* Revenue & Retur Overview - Admin Only */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Revenue Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/30 transition-all duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Pendapatan</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Perbandingan bulan ini vs bulan lalu</p>
                </div>
                <div className="bg-emerald-500/20 p-2.5 rounded-xl">
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
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap">
                      {formatRupiah(dashboardData?.revenue?.current_month)}
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm">
                      {dashboardData?.revenue?.current_month_label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 text-xs sm:text-sm">Bulan lalu:</span>
                    <span className="text-white text-sm sm:text-base whitespace-nowrap">
                      {formatRupiah(dashboardData?.revenue?.last_month)}
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getGrowthBg(dashboardData?.revenue?.growth_percentage)} ${getGrowthColor(dashboardData?.revenue?.growth_percentage)}`}>
                      {getGrowthIcon(dashboardData?.revenue?.growth_percentage)}
                      <span>{Math.abs(dashboardData?.revenue?.growth_percentage)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                      <span className="text-slate-400">Total Pendapatan</span>
                      <span className="text-emerald-400 font-semibold whitespace-nowrap">
                        {formatRupiah(dashboardData?.statistics?.total_revenue_all_time)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm mt-1">
                      <span className="text-slate-400">Pendapatan Bulan Ini</span>
                      <span className="text-white whitespace-nowrap">
                        {formatRupiah(dashboardData?.statistics?.this_month_revenue)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Retur Card */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-rose-500/30 transition-all duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Retur</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Perbandingan bulan ini vs bulan lalu</p>
                </div>
                <div className="bg-rose-500/20 p-2.5 rounded-xl">
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
                  <div className="flex flex-wrap items-baseline gap-2 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white whitespace-nowrap">
                      {formatNumber(dashboardData?.retur?.current_month)}
                    </span>
                    <span className="text-slate-400 text-xs sm:text-sm">retur</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400 text-xs sm:text-sm">Bulan lalu:</span>
                    <span className="text-white text-sm sm:text-base whitespace-nowrap">
                      {formatNumber(dashboardData?.retur?.last_month)} retur
                    </span>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getGrowthBg(dashboardData?.retur?.growth_percentage)} ${getGrowthColor(dashboardData?.retur?.growth_percentage)}`}>
                      {getGrowthIcon(dashboardData?.retur?.growth_percentage)}
                      <span>{Math.abs(dashboardData?.retur?.growth_percentage)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm">
                      <span className="text-slate-400">Total Retur</span>
                      <span className="text-white font-semibold whitespace-nowrap">
                        {formatNumber(dashboardData?.statistics?.total_returs)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm mt-1">
                      <span className="text-slate-400">Retur Selesai</span>
                      <span className="text-emerald-400 whitespace-nowrap">
                        {formatNumber(dashboardData?.statistics?.completed_returs)}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm mt-1">
                      <span className="text-slate-400">Retur Pending</span>
                      <span className="text-yellow-400 whitespace-nowrap">
                        {formatNumber(dashboardData?.statistics?.pending_returs)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Revenue Chart - Admin Only */}
      {isAdmin && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 mb-6 sm:mb-8 hover:border-indigo-500/30 transition-all duration-300">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-white font-semibold text-base sm:text-lg">Grafik Pendapatan Tahunan</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Pendapatan per bulan dalam setahun</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                >
                  {[2023, 2024, 2025, 2026].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Chart Container */}
            <div className="relative" style={{ height: "280px", minHeight: "200px" }}>
              {monthlyChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-400 text-sm">Belum ada data pendapatan</p>
                </div>
              ) : (
                <div className="flex items-end justify-between h-full gap-1 sm:gap-2">
                  {monthlyChartData.map((data, index) => {
                    const revenue = data.revenue || 0;
                    const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 85 : 0;
                    const isHovered = hoveredBar === index;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1 flex flex-col items-center gap-1.5 h-full group"
                        onMouseEnter={() => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div className="relative w-full flex-1 flex flex-col justify-end">
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                              isHovered ? 'bg-indigo-400' : 'bg-indigo-500/60'
                            } hover:bg-indigo-400`}
                            style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                          />
                          {isHovered && revenue > 0 && (
                            <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded-md text-xs text-white whitespace-nowrap z-10 shadow-lg pointer-events-none">
                              {formatRupiah(revenue)}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-400 text-center font-medium">
                          {data.month_name?.substring(0, 3) || ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Chart Legend */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500/60 rounded"></div>
                <span className="text-xs text-slate-400">Pendapatan (Rp)</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Top Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Top Products This Month */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-emerald-500/30 transition-all duration-300">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Produk Terlaris Bulan Ini</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.top_products?.current_month?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data produk terlaris</p>
              </div>
            ) : (
              <div className="space-y-2.5 list-none">
                {dashboardData?.top_products?.current_month?.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-yellow-500/20' :
                        idx === 1 ? 'bg-slate-400/20' :
                        idx === 2 ? 'bg-amber-600/20' :
                        'bg-indigo-500/20'
                      }`}>
                        <span className={`text-xs font-bold ${
                          idx === 0 ? 'text-yellow-400' :
                          idx === 1 ? 'text-slate-400' :
                          idx === 2 ? 'text-amber-400' :
                          'text-indigo-400'
                        }`}>{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{product.product_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{product.product_code}</p>
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-emerald-400 font-semibold text-sm whitespace-nowrap">{formatNumber(product.total_qty_sold)} terjual</p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatRupiah(product.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Top Products All Time */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-purple-500/30 transition-all duration-300">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Produk Terlaris Sepanjang Masa</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.top_products?.all_time?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data produk terlaris</p>
              </div>
            ) : (
              <div className="space-y-2.5 list-none">
                {dashboardData?.top_products?.all_time?.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-yellow-500/20' :
                        idx === 1 ? 'bg-slate-400/20' :
                        idx === 2 ? 'bg-amber-600/20' :
                        'bg-purple-500/20'
                      }`}>
                        <span className={`text-xs font-bold ${
                          idx === 0 ? 'text-yellow-400' :
                          idx === 1 ? 'text-slate-400' :
                          idx === 2 ? 'text-amber-400' :
                          'text-purple-400'
                        }`}>{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{product.product_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{product.product_code}</p>
                      </div>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-emerald-400 font-semibold text-sm whitespace-nowrap">{formatNumber(product.total_qty_sold)} terjual</p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatRupiah(product.total_revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Active Transactions & Active Returs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Active Transactions */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-blue-500/30 transition-all duration-300">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Transaksi Aktif</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.active_transactions?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada transaksi aktif</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dashboardData?.active_transactions?.map((transaction) => (
                  <div key={transaction.id} className="p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
                      <div>
                        <p className="text-white font-medium text-sm">{transaction.invoice_no}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-36 sm:max-w-48">{transaction.customer_name}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getTransactionStatusColor(transaction.status)}`}>
                        {transaction.status_label}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-1 text-sm">
                      <span className="text-emerald-400 font-semibold whitespace-nowrap">{formatRupiah(transaction.grand_total)}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Sisa: {formatRupiah(transaction.remaining_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Active Returs */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-rose-500/30 transition-all duration-300">
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-rose-500/20 p-2 rounded-lg">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
              </div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Retur Aktif</h3>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : !dashboardData?.active_returs?.length ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada retur aktif</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dashboardData?.active_returs?.map((retur) => (
                  <div key={retur.id} className="p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-200">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
                      <div>
                        <p className="text-white font-medium text-sm">{retur.return_no}</p>
                        <p className="text-[10px] text-slate-400">Invoice: {retur.invoice_no}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getReturStatusColor(retur.status)}`}>
                        {retur.status_label}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-1 text-sm">
                      <span className="text-rose-400 font-semibold whitespace-nowrap">{formatRupiah(retur.total_refund)}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{retur.type_label}</span>
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