import type { Toast as ToastType } from "@/types/toast";

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg
                  flex items-center gap-3 animate-fade-in`}
      data-toast-id={toast.id}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white hover:text-gray-200 font-bold"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
}
