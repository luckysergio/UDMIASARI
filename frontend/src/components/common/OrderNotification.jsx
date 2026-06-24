// src/components/common/OrderNotification.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, ShoppingBag, Eye, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import notificationService from '../../services/notificationService';
import echo from '../../services/echo';
import { formatRupiah } from '../../utils/format';
import { useModal } from '../../contexts/ModalContext';

const OrderNotification = ({ isAdmin = false }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [latestNotification, setLatestNotification] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const { success } = useModal();

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!isAdmin) return;
        
        console.log('🔍 Fetching notifications...');
        setIsLoading(true);
        const result = await notificationService.getNotifications();
        console.log('📋 Fetch result:', result);
        
        if (result.success) {
            console.log('✅ Notifications data:', result.data);
            setNotifications(result.data || []);
            setUnreadCount(result.count || 0);
        } else {
            console.error('❌ Failed to fetch notifications:', result.message);
        }
        setIsLoading(false);
    };

    // Handle new notification from WebSocket
    const handleNewNotification = (event) => {
        console.log('🔔 New notification received:', event);
        
        if (event && event.id) {
            setNotifications(prev => {
                const exists = prev.some(n => n.id === event.id);
                if (exists) {
                    console.log('⚠️ Notification already exists:', event.id);
                    return prev;
                }
                console.log('✅ Adding new notification:', event.id);
                return [event, ...prev];
            });
            setUnreadCount(prev => prev + 1);
            setLatestNotification(event);
            setShowPopup(true);
        } else {
            console.warn('⚠️ Invalid notification event:', event);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // Get notification icon based on type
    const getNotificationIcon = (notification) => {
        const type = notification.type || notification.notification_type || '';
        
        if (type === 'new_order' || type === 'order_completed') {
            return {
                icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
                bgColor: 'bg-emerald-500/20',
                label: 'Pesanan'
            };
        } else if (type === 'retur_created' || type === 'retur_approved' || 
                   type === 'retur_rejected' || type === 'retur_replacement_sent' || 
                   type === 'retur_completed' || type.startsWith('retur_')) {
            return {
                icon: <RefreshCw className="w-4 h-4 text-orange-400" />,
                bgColor: 'bg-orange-500/20',
                label: 'Retur'
            };
        } else {
            return {
                icon: <ShoppingBag className="w-4 h-4 text-indigo-400" />,
                bgColor: 'bg-indigo-500/20',
                label: 'Notifikasi'
            };
        }
    };

    // Setup WebSocket
    useEffect(() => {
        if (!isAdmin) {
            console.log('🔔 User bukan admin');
            return;
        }

        console.log('🔔 Inisialisasi notifikasi untuk admin');
        fetchNotifications();

        try {
            const channel = echo.channel('notifications');
            
            channel.subscribed(() => {
                console.log('✅ Connected to notifications channel');
            });

            // Listener untuk transaksi
            channel.listen('.transaction.created', (event) => {
                console.log('📦 [EVENT] transaction.created received:', event);
                handleNewNotification(event);
            });

            // 🔥 TAMBAHKAN LISTENER UNTUK RETUR
            channel.listen('.return.created', (event) => {
                console.log('🔄 [EVENT] return.created received:', event);
                handleNewNotification(event);
            });

            // Debug semua event
            channel.listen('*', (event, data) => {
                console.log('🔍 [ALL EVENTS] Event name:', event);
                console.log('🔍 [ALL EVENTS] Event data:', data);
            });

            channel.error((error) => {
                console.error('❌ WebSocket error:', error);
            });

            return () => {
                console.log('🔌 Unsubscribing from notifications channel');
                channel.stopListening('.transaction.created');
                channel.stopListening('.return.created');
                channel.stopListening('*');
                echo.leaveChannel('notifications');
            };
        } catch (error) {
            console.error('❌ Error setting up notification channel:', error);
        }
    }, [isAdmin]);

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleMarkAsRead = async (id) => {
        const result = await notificationService.markAsRead(id);
        if (result.success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            setUnreadCount(prev => prev - 1);
            success('Berhasil', 'Notifikasi ditandai telah dibaca');
        }
    };

    const handleClearAll = async () => {
        const result = await notificationService.clearAll();
        if (result.success) {
            setNotifications([]);
            setUnreadCount(0);
            setIsOpen(false);
            success('Berhasil', 'Semua notifikasi telah dibersihkan');
        }
    };

    // Update dropdown position when opening
    const handleToggleDropdown = () => {
        if (!isOpen) {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right,
                });
            }
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto refresh every 30 seconds
    useEffect(() => {
        if (!isAdmin) return;
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (!isAdmin) return null;

    return (
        <>
            {/* Bell Icon */}
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={handleToggleDropdown}
                    className="relative p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-300"
                    title="Notifikasi"
                >
                    <Bell className="w-5 h-5 text-slate-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ============================================================
                DROPDOWN NOTIFIKASI - MENGGUNAKAN PORTAL
                ============================================================ */}
            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className="fixed w-85 sm:w-100 max-h-125 bg-slate-800 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden z-999999"
                    style={{
                        top: dropdownPosition.top,
                        right: dropdownPosition.right,
                        zIndex: 999999,
                        maxWidth: 'calc(100vw - 32px)',
                    }}
                >
                    <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/95 sticky top-0 z-10">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                            <Bell className="w-4 h-4 text-indigo-400" />
                            Notifikasi
                            {unreadCount > 0 && (
                                <span className="text-xs text-slate-400">({unreadCount} baru)</span>
                            )}
                        </h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-slate-400 hover:text-red-400 transition flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                Hapus Semua
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-105">
                        {isLoading ? (
                            <div className="p-4 text-center text-slate-400 text-sm">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
                                <p className="mt-2">Memuat...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Tidak ada notifikasi</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const iconData = getNotificationIcon(notification);
                                
                                return (
                                    <div
                                        key={notification.id}
                                        className="flex items-start gap-3 p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition cursor-pointer group"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconData.bgColor}`}>
                                            {iconData.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium wrap-break-word leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center flex-wrap gap-1 mt-1.5">
                                                {notification.grand_total && (
                                                    <>
                                                        <span className="text-xs text-emerald-400 font-semibold">
                                                            {formatRupiah(notification.grand_total)}
                                                        </span>
                                                        <span className="text-xs text-slate-500">•</span>
                                                    </>
                                                )}
                                                {notification.total_refund && (
                                                    <>
                                                        <span className="text-xs text-rose-400 font-semibold">
                                                            {formatRupiah(notification.total_refund)}
                                                        </span>
                                                        <span className="text-xs text-slate-500">•</span>
                                                    </>
                                                )}
                                                <span className="text-xs text-slate-500">
                                                    {formatDate(notification.created_at)}
                                                </span>
                                                {notification.status && (
                                                    <>
                                                        <span className="text-xs text-slate-500">•</span>
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                            notification.status === 'dipesan' || notification.status === 'pending'
                                                                ? 'bg-yellow-500/20 text-yellow-400' 
                                                                : notification.status === 'approved' || notification.status === 'completed'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                            {notification.status === 'pending' ? 'Menunggu' : 
                                                             notification.status === 'approved' ? 'Disetujui' :
                                                             notification.status === 'rejected' ? 'Ditolak' :
                                                             notification.status === 'replacement_sent' ? 'Pengganti Dikirim' :
                                                             notification.status === 'completed' ? 'Selesai' :
                                                             notification.status}
                                                        </span>
                                                    </>
                                                )}
                                                {notification.type_label && (
                                                    <>
                                                        <span className="text-xs text-slate-500">•</span>
                                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                                                            {notification.type_label}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                            className="text-slate-400 hover:text-indigo-400 transition shrink-0 opacity-0 group-hover:opacity-100 mt-1"
                                            title="Tandai telah dibaca"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* ============================================================
                NOTIFICATION POPUP - DI ATAS SEGALANYA
                ============================================================ */}
            {showPopup && latestNotification && createPortal(
                <>
                    {/* Overlay */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9999999,
                            pointerEvents: 'auto'
                        }}
                        onClick={handleClosePopup}
                    />
                    
                    {/* Popup */}
                    <div 
                        className="fixed inset-0 flex items-center justify-center p-4"
                        style={{ 
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 10000000,
                            pointerEvents: 'none'
                        }}
                    >
                        <div 
                            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-emerald-500/30 overflow-hidden"
                            style={{ pointerEvents: 'auto' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-linear-to-r from-emerald-600/20 to-teal-600/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        {latestNotification.type === 'new_order' || latestNotification.type === 'order_completed' ? (
                                            <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                        ) : latestNotification.notification_type?.startsWith('retur_') ? (
                                            <RefreshCw className="w-5 h-5 text-orange-400" />
                                        ) : (
                                            <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">
                                            {latestNotification.type === 'new_order' ? 'Pesanan Baru!' :
                                             latestNotification.notification_type?.startsWith('retur_') ? 'Retur Baru!' :
                                             'Notifikasi'}
                                        </h3>
                                        <p className="text-xs text-emerald-400">
                                            {latestNotification.invoice_no ? `Order #${latestNotification.invoice_no?.slice(-6)}` :
                                             latestNotification.return_no ? `Retur #${latestNotification.return_no?.slice(-6)}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClosePopup}
                                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-5">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-3">
                                        {latestNotification.type === 'new_order' || latestNotification.type === 'order_completed' ? (
                                            <ShoppingBag className="w-8 h-8 text-emerald-400" />
                                        ) : latestNotification.notification_type?.startsWith('retur_') ? (
                                            <RefreshCw className="w-8 h-8 text-orange-400" />
                                        ) : (
                                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                                        )}
                                    </div>
                                    <h4 className="text-white font-semibold text-base">
                                        {latestNotification.type === 'new_order' ? 'Ada Pesanan Masuk!' :
                                         latestNotification.notification_type?.startsWith('retur_') ? 'Ada Retur Masuk!' :
                                         'Notifikasi'}
                                    </h4>
                                    <p className="text-slate-400 text-sm mt-1 wrap-break-word">
                                        {latestNotification.message}
                                    </p>
                                </div>

                                <div className="bg-slate-700/30 rounded-xl p-4 space-y-2">
                                    {latestNotification.invoice_no && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Invoice</span>
                                            <span className="text-white font-medium break-all">{latestNotification.invoice_no}</span>
                                        </div>
                                    )}
                                    {latestNotification.return_no && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">No. Retur</span>
                                            <span className="text-white font-medium break-all">{latestNotification.return_no}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Customer</span>
                                        <span className="text-white font-medium wrap-break-word">{latestNotification.customer_name}</span>
                                    </div>
                                    {latestNotification.grand_total && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Total</span>
                                            <span className="text-emerald-400 font-bold">{formatRupiah(latestNotification.grand_total)}</span>
                                        </div>
                                    )}
                                    {latestNotification.total_refund && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Total Refund</span>
                                            <span className="text-rose-400 font-bold">{formatRupiah(latestNotification.total_refund)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Status</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                            latestNotification.status === 'dipesan' || latestNotification.status === 'pending'
                                                ? 'bg-yellow-500/20 text-yellow-400' 
                                                : latestNotification.status === 'approved' || latestNotification.status === 'completed'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {latestNotification.status === 'pending' ? 'Menunggu' : 
                                             latestNotification.status === 'approved' ? 'Disetujui' :
                                             latestNotification.status === 'rejected' ? 'Ditolak' :
                                             latestNotification.status === 'replacement_sent' ? 'Pengganti Dikirim' :
                                             latestNotification.status === 'completed' ? 'Selesai' :
                                             latestNotification.status || 'Dipesan'}
                                        </span>
                                    </div>
                                    {latestNotification.type_label && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Tipe</span>
                                            <span className="text-purple-400 font-medium">{latestNotification.type_label}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 text-center">
                                    <p className="text-xs text-slate-400">
                                        Klik "Tutup" atau "Lihat Detail" untuk menutup notifikasi
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex gap-2 p-4 border-t border-slate-700 bg-slate-800/50">
                                <button
                                    onClick={handleClosePopup}
                                    className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all duration-300 text-sm font-medium"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={() => {
                                        handleClosePopup();
                                        if (latestNotification.type === 'new_order' || latestNotification.type === 'order_completed') {
                                            window.location.href = '/transactions';
                                        } else if (latestNotification.notification_type?.startsWith('retur_')) {
                                            window.location.href = '/returs';
                                        } else {
                                            window.location.href = '/transactions';
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg shadow-emerald-500/25"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
};

export default OrderNotification;