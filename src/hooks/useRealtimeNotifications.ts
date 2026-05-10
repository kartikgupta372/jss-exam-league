import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    // Listen to new inserts in the notifications table for this user
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new
          // Trigger a toast based on notification type
          if (newNotif.type === 'karma_award') {
            toast(`+10 Karma! ${newNotif.message}`, 'success')
          } else if (newNotif.type === 'material_approved') {
            toast(`Approved! ${newNotif.message}`, 'success')
          } else if (newNotif.type === 'doubt_reply') {
            toast(`New Reply: ${newNotif.message}`, 'info')
          } else {
            toast(newNotif.message, 'info')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, toast])
}
