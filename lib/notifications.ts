import webpush from 'web-push'
import { createClient } from './supabase/server'

// Configure web-push with VAPID keys
// These should be set in environment variables
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface NotificationAction {
  action: string
  title: string
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  actions?: NotificationAction[]
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
) {
  try {
    const supabase = await createClient()

    // Get user's push tokens
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching push tokens:', error)
      return
    }

    if (!tokens || tokens.length === 0) {
      console.log('No push tokens found for user:', userId)
      return
    }

    // Send notification to each token
    const promises = tokens.map(async (tokenRecord) => {
      try {
        const subscription = {
          endpoint: tokenRecord.token,
          keys: {
            // These would be stored in the database for each token
            p256dh: 'placeholder-p256dh-key',
            auth: 'placeholder-auth-key'
          }
        }

        const notificationPayload = {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon.svg',
          badge: payload.badge || '/icon.svg',
          image: payload.image,
          data: {
            url: payload.url || '/',
            dateOfArrival: Date.now(),
          },
          actions: payload.actions || [
            {
              action: 'view',
              title: 'عرض'
            },
            {
              action: 'dismiss',
              title: 'تجاهل'
            }
          ],
          requireInteraction: payload.requireInteraction ?? true,
          silent: payload.silent ?? false,
          tag: payload.tag || 'general'
        }

        await webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
        console.log('Push notification sent successfully to:', tokenRecord.platform)
      } catch (error) {
        console.error('Error sending push notification:', error)
        // Remove invalid tokens
        if ((error as any).statusCode === 410 || (error as any).statusCode === 400) {
          await supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', userId)
            .eq('token', tokenRecord.token)
        }
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error('Error in sendPushNotification:', error)
  }
}

export async function sendNotificationToUsers(
  userIds: string[],
  payload: NotificationPayload
) {
  const promises = userIds.map(userId => sendPushNotification(userId, payload))
  await Promise.all(promises)
}

export async function sendNotificationToAllUsers(payload: NotificationPayload) {
  try {
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id')

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    if (!users || users.length === 0) {
      return
    }

    const userIds = users.map(user => user.id)
    await sendNotificationToUsers(userIds, payload)
  } catch (error) {
    console.error('Error in sendNotificationToAllUsers:', error)
  }
}

// Utility functions for common notifications
export const notificationTemplates = {
  prescriptionResponse: (pharmacyName: string, prescriptionId: string) => ({
    title: 'رد جديد على وصفتك',
    body: `الصيدلية ${pharmacyName} ردت على وصفتك`,
    url: `/prescriptions/${prescriptionId}`,
    tag: 'prescription-response'
  }),

  medicineReady: (pharmacyName: string, prescriptionId: string) => ({
    title: 'دواؤك جاهز!',
    body: `الصيدلية ${pharmacyName} أعدت دواؤك`,
    url: `/prescriptions/${prescriptionId}`,
    tag: 'medicine-ready'
  }),

  subscriptionExpiring: (daysLeft: number) => ({
    title: 'انتهاء اشتراك قريب',
    body: `اشتراكك سينتهي خلال ${daysLeft} أيام`,
    url: '/pharmacy/subscriptions',
    tag: 'subscription-expiring'
  }),

  newPrescription: (userName: string, prescriptionId: string) => ({
    title: 'وصفة جديدة',
    body: `${userName} رفع وصفة جديدة`,
    url: `/pharmacy/prescriptions/${prescriptionId}`,
    tag: 'new-prescription'
  }),

  welcome: (userName: string) => ({
    title: 'مرحباً بك في دوائي!',
    body: `شكراً لانضمامك ${userName}`,
    url: '/home',
    tag: 'welcome'
  })
}
