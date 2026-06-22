import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'success',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Batal',
  showConfirmButton = true,
  showCancelButton = false
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    success: {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500',
      titleColor: 'text-green-800',
      confirmButtonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
    error: {
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      titleColor: 'text-red-800',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500',
      titleColor: 'text-yellow-800',
      confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: InformationCircleIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500',
      titleColor: 'text-blue-800',
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const config = icons[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={showCancelButton ? handleCancel : onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-modal-pop"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full ${config.bgColor} mb-4`}>
              <IconComponent className={`h-10 w-10 ${config.color}`} />
            </div>
            
            {/* Title */}
            <h3 className={`text-xl font-semibold mb-2 ${config.titleColor}`}>
              {title}
            </h3>
            
            {/* Message */}
            <div className="mt-2">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {message}
              </p>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              {showCancelButton && (
                <button
                  onClick={handleCancel}
                  className="flex-1 inline-flex justify-center rounded-lg px-6 py-2.5 text-sm font-semibold
                    bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {cancelText}
                </button>
              )}
              {showConfirmButton && (
                <button
                  onClick={handleConfirm}
                  className={`flex-1 inline-flex justify-center rounded-lg px-6 py-2.5 text-sm font-semibold
                    shadow-sm transition-all duration-200 text-white
                    focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.confirmButtonClass}
                    ${showCancelButton ? '' : 'w-full'}`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes modalPop {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-modal-pop {
    animation: modalPop 0.2s ease-out;
  }
`;
document.head.appendChild(style);

export default Modal;