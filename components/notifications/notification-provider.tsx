"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface NotificationContextType {
  requestPermission: () => Promise<NotificationPermission>
  subscribeToNotifications: () => Promise<void>
  sendNotification: (title: string, body: string, options?: NotificationOptions) => Promise<void>
  isSupported: boolean
  permission: NotificationPermission
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)

    // Get current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications not supported')
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      throw error
    }
  }

  const subscribeToNotifications = async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Notifications not supported')
    }

    try {
      // Request permission first
      const permissionResult = await requestPermission()
      if (permissionResult !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)

      // Get FCM token (this would be implemented with Firebase)
      // For now, we'll use a placeholder
      const token = 'placeholder-fcm-token-' + Date.now()

      // Get current user
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Subscribe to push notifications
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId: user.id,
          platform: 'web'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe to notifications')
      }

      toast.success('تم تفعيل الإشعارات بنجاح!')
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      toast.error('فشل في تفعيل الإشعارات')
      throw error
    }
  }

  const sendNotification = async (
    title: string,
    body: string,
    options: NotificationOptions = {}
  ): Promise<void> => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not supported or permission not granted')
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const value: NotificationContextType = {
    requestPermission,
    subscribeToNotifications,
    sendNotification,
    isSupported,
    permission,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
