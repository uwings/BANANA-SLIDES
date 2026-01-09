
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'info' | 'confirm';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'confirm':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h3 className="mt-4 text-xl font-black text-slate-900">{title}</h3>
          {message && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
          )}

          <div className="flex gap-3 mt-6 w-full">
            {cancelText && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
            )}
            {confirmText && (
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-white font-bold text-sm transition-colors ${getButtonColor()}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast notification component for non-blocking messages
interface ToastProps {
  message: string;
  type?: ModalType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-xl border shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${getBgColor()}`}>
      {getIcon()}
      <span className="text-sm font-medium text-slate-700">{message}</span>
    </div>
  );
};
