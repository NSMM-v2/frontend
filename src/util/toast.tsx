import {toast} from 'react-hot-toast'
import {useToast as useShadcnToast} from '@/hooks/use-toast'

// 간단한 토스트 함수들
const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '420px'
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#f0fdf4'
    }
  })
}

const showError = (message: string) => {
  return toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '420px'
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fef2f2'
    }
  })
}

const showWarning = (message: string) => {
  return toast(message, {
    duration: 3500,
    position: 'top-center',
    icon: '⚠️',
    style: {
      background: '#fffbeb',
      color: '#d97706',
      border: '1px solid #fed7aa',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '420px'
    }
  })
}

const showInfo = (message: string) => {
  return toast(message, {
    duration: 3000,
    position: 'top-center',
    icon: 'ℹ️',
    style: {
      background: '#eff6ff',
      color: '#2563eb',
      border: '1px solid #bfdbfe',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '420px'
    }
  })
}

const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
    style: {
      background: '#f9fafb',
      color: '#374151',
      border: '1px solid #e5e7eb',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '420px'
    }
  })
}

const dismiss = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId)
  } else {
    toast.dismiss()
  }
}

// 추가 필요한 함수들
const showPartnerRestore = (message: string) => {
  return showSuccess(message) // 복구 성공 메시지
}

const dismissLoading = (toastId?: string) => {
  return dismiss(toastId) // 로딩 토스트 해제
}

// useToast hook export (Shadcn UI와 호환)
const useToast = useShadcnToast

// 기본 export 객체
const toastObject = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismiss,
  partnerRestore: showPartnerRestore,
  dismissLoading: dismissLoading
}

export default toastObject

// 개별 함수들도 export
export {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismiss,
  showPartnerRestore,
  dismissLoading,
  useToast
}
