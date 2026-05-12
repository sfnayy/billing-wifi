import React from 'react';
import { AlertTriangle, Loader } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, itemDetails, confirmText = 'Ya, Hapus', isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-rose-500" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-800 text-center mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-1">
          {message}
        </p>
        {itemDetails && (
          <p className="text-lg font-black text-center text-slate-700 mb-4 px-4 py-2 bg-slate-50 rounded-xl mt-3 mx-2">
            {itemDetails}
          </p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow disabled:opacity-60"
          >
            {isLoading ? <Loader size={16} className="animate-spin" /> : null}
            {isLoading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
