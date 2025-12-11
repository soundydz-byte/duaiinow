'use client'

import { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

// محاولة استيراد Capacitor APIs (اختياري - للهاتف)
let Geolocation: any = null
let LocalNotifications: any = null

try {
  Geolocation = require('@capacitor/geolocation').Geolocation
  LocalNotifications = require('@capacitor/local-notifications').LocalNotifications
} catch (e) {
  // Capacitor غير متاح (في الويب)
}

export function PermissionsRequest() {
  const [showDialog, setShowDialog] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [currentPermission, setCurrentPermission] = useState<'location' | 'notification'>('location')

  useEffect(() => {
    // تأخير صغير لتجنب hydration issues
    const timer = setTimeout(() => {
      checkAndRequestPermissions()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const checkAndRequestPermissions = async () => {
    try {
      const permissionsRequested = localStorage.getItem('permissionsRequested')
      
      if (!permissionsRequested) {
        setShowDialog(true)
      }
    } catch (error) {
      console.error('خطأ في التحقق من الأذونات:', error)
    }
  }

  // للويب: استخدام Geolocation API
  const requestLocationPermissionWeb = async () => {
    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        console.log('✗ Geolocation API غير متاح')
        resolve(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✓ تم منح أذونات الموقع (الويب)')
          resolve(true)
        },
        (error) => {
          console.log('✗ تم رفض أذونات الموقع أو حدث خطأ:', error.message)
          resolve(false)
        }
      )
    })
  }

  // للهاتف: استخدام Capacitor
  const requestLocationPermissionMobile = async () => {
    try {
      if (!Geolocation) {
        return await requestLocationPermissionWeb()
      }

      const permissions = await Geolocation.checkPermissions()
      
      if (permissions.location === 'granted') {
        console.log('✓ تم منح أذونات الموقع بالفعل')
        return true
      }

      const result = await Geolocation.requestPermissions()
      
      if (result.location === 'granted') {
        console.log('✓ تم منح أذونات الموقع')
        return true
      } else {
        console.log('✗ تم رفض أذونات الموقع')
        return false
      }
    } catch (error) {
      console.error('خطأ في طلب أذونات الموقع:', error)
      return false
    }
  }

  const requestLocationPermission = async () => {
    try {
      setCurrentPermission('location')
      // محاولة الهاتف أولاً، ثم الويب
      await requestLocationPermissionMobile()
      requestNotificationPermission()
    } catch (error) {
      console.error('خطأ:', error)
      requestNotificationPermission()
    }
  }

  // للويب: استخدام Notification API
  const requestNotificationPermissionWeb = async () => {
    try {
      if (!('Notification' in window)) {
        console.log('✗ Notification API غير متاح')
        return false
      }

      if (Notification.permission === 'granted') {
        console.log('✓ تم منح أذونات الإشعارات بالفعل')
        return true
      }

      if (Notification.permission === 'denied') {
        console.log('✗ تم رفض أذونات الإشعارات سابقاً')
        return false
      }

      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        console.log('✓ تم منح أذونات الإشعارات (الويب)')
        
        // تسجيل خدمة الدفع إذا كانت متاحة
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          if (registration.pushManager) {
            console.log('✓ Push Manager متاح')
          }
        }
        
        return true
      } else {
        console.log('✗ تم رفض أذونات الإشعارات')
        return false
      }
    } catch (error) {
      console.error('خطأ في طلب أذونات الإشعارات:', error)
      return false
    }
  }

  // للهاتف: استخدام Capacitor
  const requestNotificationPermissionMobile = async () => {
    try {
      if (!LocalNotifications) {
        return await requestNotificationPermissionWeb()
      }

      const permissions = await LocalNotifications.checkPermissions()
      
      if (permissions.display === 'granted') {
        console.log('✓ تم منح أذونات الإشعارات بالفعل')
        return true
      }

      const result = await LocalNotifications.requestPermissions()
      
      if (result.display === 'granted') {
        console.log('✓ تم منح أذونات الإشعارات')
        return true
      } else {
        console.log('✗ تم رفض أذونات الإشعارات')
        return false
      }
    } catch (error) {
      console.error('خطأ في طلب أذونات الإشعارات:', error)
      return false
    }
  }

  const requestNotificationPermission = async () => {
    try {
      setCurrentPermission('notification')
      // محاولة الهاتف أولاً، ثم الويب
      await requestNotificationPermissionMobile()
      completePermissionsRequest()
    } catch (error) {
      console.error('خطأ:', error)
      completePermissionsRequest()
    }
  }

  const completePermissionsRequest = () => {
    localStorage.setItem('permissionsRequested', 'true')
    setPermissionsGranted(true)
    setShowDialog(false)
  }

  const handleAllow = () => {
    if (currentPermission === 'location') {
      requestLocationPermission()
    } else {
      requestNotificationPermission()
    }
  }

  const handleDeny = () => {
    if (currentPermission === 'location') {
      requestNotificationPermission()
    } else {
      completePermissionsRequest()
    }
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="rtl:text-right">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {currentPermission === 'location' 
              ? '🗺️ الوصول إلى الموقع'
              : '🔔 تفعيل الإشعارات'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {currentPermission === 'location' 
              ? 'نحتاج إلى الوصول إلى موقعك لإيجاد أقرب صيدليات إليك وتقديم أفضل الخدمات'
              : 'سيساعدك تفعيل الإشعارات على عدم تفويت أي تحديثات مهمة حول الأدوية والصيدليات'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end rtl:flex-row-reverse">
          <AlertDialogCancel onClick={handleDeny}>
            {currentPermission === 'location' ? 'تخطي الآن' : 'تم'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAllow}>
            السماح
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
