import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isProcessing?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    isProcessing = false,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
            onClick={() => !isProcessing && onCancel()}
        >
            <div
                className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-2xl dark:border-red-900/40 dark:bg-surface-dark"
                onClick={event => event.stopPropagation()}
            >
                <div className="mb-5 flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div>
                        <h2 id="confirmation-title" className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isProcessing && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                        {isProcessing ? 'Removing...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
