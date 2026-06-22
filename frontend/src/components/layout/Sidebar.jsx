import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Package,
  Loader2,
  FolderTree,
  Tags,
  Box,
  Truck,
  Receipt,
  CreditCard,
  ChevronDown,
  History,
  RefreshCw,
  UserCircle,
  FileText, // 🔥 Tambahkan import FileText untuk icon laporan
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../contexts/ModalContext";
import Logo from "../common/Logo";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getUserRole } = useAuth();
  const { success, error, warning } = useModal();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const userRole = getUserRole();
  const isAdmin = userRole === "admin";
  const isKepalaProduksi = userRole === "kepala_produksi";
  const isCustomer = userRole === "customer";

  // 🔥 Fungsi untuk mengecek apakah suatu path adalah submenu dari menu tertentu
  const isSubmenuActive = (menu) => {
    return menu.subItems?.some(item => location.pathname === item.path);
  };

  // 🔥 Effect untuk membuka menu secara otomatis jika submenu aktif
  useEffect(() => {
    const menusToCheck = [];
    
    // Transaction menu
    if (isAdmin || isKepalaProduksi) {
      menusToCheck.push(transactionMenu);
    }
    
    // Retur menu
    if (isAdmin || isKepalaProduksi) {
      menusToCheck.push(returMenu);
    }
    
    menusToCheck.forEach(menu => {
      if (isSubmenuActive(menu) && !openMenus[menu.id]) {
        setOpenMenus(prev => ({
          ...prev,
          [menu.id]: true
        }));
      }
    });
  }, [location.pathname, isAdmin, isKepalaProduksi]);

  // Toggle submenu
  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // 🔥 MAIN MENU ITEMS - Untuk Admin dan Kepala Produksi
  const mainMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-indigo-400",
      path: "/dashboard",
      roles: ["admin", "kepala_produksi"],
    },
    { 
      id: 'products', 
      label: 'Produk', 
      icon: Package, 
      color: 'text-emerald-400',
      path: '/products',
      roles: ["admin"], // Hanya Admin
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Box,
      color: "text-teal-400",
      path: "/inventory",
      roles: ["admin", "kepala_produksi"],
    },
  ];

  // 🔥 MOVEMENT MENU - Hanya Admin
  const movementMenu = {
    id: "movements",
    label: "Movement",
    icon: Truck,
    color: "text-orange-400",
    path: "/inventory/movements",
    roles: ["admin"],
  };

  // 🔥 TRANSACTIONS MENU dengan Submenu - Admin & Kepala Produksi
  const transactionMenu = {
    id: "transactions",
    label: "Transaksi",
    icon: Receipt,
    color: "text-purple-400",
    roles: ["admin", "kepala_produksi"],
    subItems: [
      {
        id: "transactions-active",
        label: "Transaksi Aktif",
        icon: Receipt,
        path: "/transactions",
        roles: ["admin", "kepala_produksi"],
      },
      {
        id: "transactions-history",
        label: "Riwayat Transaksi",
        icon: History,
        path: "/transactions/history",
        roles: ["admin", "kepala_produksi"],
      },
      {
        id: "transactions-report",
        label: "Laporan Transaksi", // 🔥 Menu Laporan Transaksi
        icon: FileText,
        path: "/transactions/report",
        roles: ["admin", "kepala_produksi"],
      },
    ],
  };

  // 🔥 PAYMENTS MENU - Hanya Admin
  const paymentMenu = {
    id: "payments",
    label: "Pembayaran",
    icon: CreditCard,
    color: "text-cyan-400",
    path: "/payments",
    roles: ["admin"],
  };

  // 🔥 RETUR MENU dengan Submenu - Admin & Kepala Produksi
  const returMenu = {
    id: "returs",
    label: "Retur",
    icon: RefreshCw,
    color: "text-rose-400",
    roles: ["admin", "kepala_produksi"],
    subItems: [
      {
        id: "returs-active",
        label: "Retur Aktif",
        icon: RefreshCw,
        path: "/returs",
        roles: ["admin", "kepala_produksi"],
      },
      {
        id: "returs-history",
        label: "Riwayat Retur",
        icon: History,
        path: "/returs/history",
        roles: ["admin", "kepala_produksi"],
      },
      {
        id: "returs-report",
        label: "Laporan Retur", // 🔥 Menu Laporan Retur
        icon: FileText,
        path: "/returs/report",
        roles: ["admin", "kepala_produksi"],
      },
    ],
  };

  // 🔥 MASTER DATA MENU - Hanya Admin
  const masterDataItems = [
    {
      id: "categories",
      label: "Kategori",
      icon: FolderTree,
      color: "text-blue-400",
      path: "/master/categories",
      roles: ["admin"],
    },
    {
      id: "jenis",
      label: "Jenis",
      icon: Tags,
      color: "text-emerald-400",
      path: "/master/jenis",
      roles: ["admin"],
    },
  ];

  // 🔥 USER MANAGEMENT MENU - Hanya Admin
  const userManagementItems = [
    {
      id: "users",
      label: "Manajemen User",
      icon: Users,
      color: "text-emerald-400",
      path: "/users",
      roles: ["admin"],
    },
  ];

  // 🔥 PROFILE MENU - Untuk semua role yang login
  const profileMenu = {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    color: "text-slate-400",
    path: "/profile",
    roles: ["admin", "kepala_produksi", "customer"],
  };

  // 🔥 Fungsi untuk mengecek apakah user memiliki akses ke menu
  const hasAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    warning(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      async () => {
        setIsLoggingOut(true);
        const result = await logout();
        if (result.success) {
          success("Logout Berhasil", "Anda telah keluar dari aplikasi.", () => {
            navigate("/login");
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (subItems) => {
    return subItems?.some(item => location.pathname === item.path);
  };

  const renderMenuItem = (item) => {
    if (!hasAccess(item)) return null;
    
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path)}
        className={`
          w-full flex items-center rounded-xl transition-all duration-200 group
          ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
          ${
            active
              ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
              : "hover:bg-slate-700/50"
          }
        `}
        title={isCollapsed ? item.label : ""}
      >
        <Icon
          className={`w-5 h-5 shrink-0 ${active ? "text-white" : item.color} group-hover:text-white transition-colors`}
        />
        {!isCollapsed && (
          <>
            <span
              className={`font-medium ${active ? "text-white" : "text-slate-300"} whitespace-nowrap`}
            >
              {item.label}
            </span>
            {active && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </>
        )}
        {isCollapsed && active && (
          <div className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full"></div>
        )}
      </button>
    );
  };

  const renderSubmenuItem = (item) => {
    if (!hasAccess(item)) return null;
    
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path)}
        className={`
          w-full flex items-center rounded-xl transition-all duration-200 group
          ${isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-4 py-2"}
          ${isCollapsed ? "" : "pl-11"}
          ${
            active
              ? "bg-indigo-600/50 shadow-lg shadow-indigo-500/20"
              : "hover:bg-slate-700/50"
          }
        `}
        title={isCollapsed ? item.label : ""}
      >
        <Icon
          className={`w-4 h-4 shrink-0 ${active ? "text-white" : item.color || "text-slate-400"} group-hover:text-white transition-colors`}
        />
        {!isCollapsed && (
          <span
            className={`text-sm ${active ? "text-white" : "text-slate-300"} whitespace-nowrap`}
          >
            {item.label}
          </span>
        )}
        {!isCollapsed && active && (
          <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
        )}
      </button>
    );
  };

  const renderMenuWithSubmenu = (menu) => {
    if (!hasAccess(menu)) return null;
    
    const Icon = menu.icon;
    const isOpen = openMenus[menu.id];
    const isParentActiveFlag = isParentActive(menu.subItems);

    return (
      <div key={menu.id} className="w-full">
        <button
          onClick={() => !isCollapsed && toggleSubmenu(menu.id)}
          className={`
            w-full flex items-center rounded-xl transition-all duration-200 group
            ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
            ${isParentActiveFlag ? "bg-indigo-600/30" : "hover:bg-slate-700/50"}
          `}
          title={isCollapsed ? menu.label : ""}
        >
          <Icon
            className={`w-5 h-5 shrink-0 ${isParentActiveFlag ? "text-indigo-400" : menu.color} group-hover:text-white transition-colors`}
          />
          {!isCollapsed && (
            <>
              <span
                className={`font-medium flex-1 text-left ${isParentActiveFlag ? "text-indigo-400" : "text-slate-300"} whitespace-nowrap`}
              >
                {menu.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>
        
        {!isCollapsed && isOpen && (
          <div className="mt-1 ml-2 space-y-1">
            {menu.subItems.map((subItem) => renderSubmenuItem(subItem))}
          </div>
        )}
        
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            {menu.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden bg-indigo-600 text-white p-2 rounded-lg shadow-lg hover:bg-indigo-700 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 bg-linear-to-b from-slate-900 to-slate-800 text-white shadow-2xl 
          flex flex-col transition-all duration-300 ease-in-out h-full
          ${isCollapsed ? "w-20" : "w-72"}
          ${isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className={`p-6 border-b border-slate-700 ${isCollapsed ? "px-4" : ""}`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <Logo showText={false} size="sm" />
            </div>
          ) : (
            <Logo showText={true} size="md" />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg hover:bg-indigo-700 transition hidden lg:block"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 sidebar-scroll">
          {/* Main Menu Header */}
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Main Menu
            </p>
          )}
          
          {/* Dashboard - Admin & Kepala Produksi */}
          {mainMenuItems[0] && hasAccess(mainMenuItems[0]) && renderMenuItem(mainMenuItems[0])}
          
          {/* Produk - Hanya Admin */}
          {mainMenuItems[1] && hasAccess(mainMenuItems[1]) && renderMenuItem(mainMenuItems[1])}
          
          {/* Inventory - Admin & Kepala Produksi */}
          {mainMenuItems[2] && hasAccess(mainMenuItems[2]) && renderMenuItem(mainMenuItems[2])}
          
          {/* Movement - Hanya Admin */}
          {hasAccess(movementMenu) && renderMenuItem(movementMenu)}
          
          {/* Transaksi - Admin & Kepala Produksi */}
          {hasAccess(transactionMenu) && renderMenuWithSubmenu(transactionMenu)}
          
          {/* Pembayaran - Hanya Admin */}
          {hasAccess(paymentMenu) && renderMenuItem(paymentMenu)}
          
          {/* Retur - Admin & Kepala Produksi */}
          {hasAccess(returMenu) && renderMenuWithSubmenu(returMenu)}

          {/* Master Data Section - Hanya Admin */}
          {masterDataItems.some(item => hasAccess(item)) && (
            <>
              {!isCollapsed && <div className="my-2 border-t border-slate-700"></div>}
              {!isCollapsed && (
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-2">
                  Master Data
                </p>
              )}
              {masterDataItems.map(item => hasAccess(item) && renderMenuItem(item))}
            </>
          )}

          {/* User Management Section - Hanya Admin */}
          {userManagementItems.some(item => hasAccess(item)) && (
            <>
              {!isCollapsed && <div className="my-2 border-t border-slate-700"></div>}
              {!isCollapsed && (
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-2">
                  User Management
                </p>
              )}
              {userManagementItems.map(item => hasAccess(item) && renderMenuItem(item))}
            </>
          )}

          {/* Profile Section - Untuk Semua Role */}
          {hasAccess(profileMenu) && (
            <>
              {!isCollapsed && <div className="my-2 border-t border-slate-700"></div>}
              {!isCollapsed && (
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 mt-2">
                  Account
                </p>
              )}
              {renderMenuItem(profileMenu)}
            </>
          )}

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center rounded-xl transition-all duration-200 group
                ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
                hover:bg-red-600/20 hover:text-red-400
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title={isCollapsed ? "Logout" : ""}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-5 h-5 shrink-0 text-red-400 animate-spin" />
                  {!isCollapsed && (
                    <span className="font-medium text-slate-300 whitespace-nowrap">
                      Logging out...
                    </span>
                  )}
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 shrink-0 text-red-400" />
                  {!isCollapsed && (
                    <span className="font-medium text-slate-300 whitespace-nowrap">
                      Logout
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: #475569 #1e293b;
        }
      `}</style>
    </>
  );
};

export default Sidebar;