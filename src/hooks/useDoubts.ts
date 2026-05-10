import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDoubts(subjectId?: string) {
  return useQuery({
    queryKey: ['doubts', subjectId],
    queryFn: async () => {
      let query = supabase
        .from('doubts')
        .select(`
          *,
          doubt_replies(count)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
      
      if (subjectId) {
        query = query.eq('subject_id', subjectId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useDoubt(doubtId: string) {
  return useQuery({
    queryKey: ['doubt', doubtId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doubts')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url),
          doubt_replies(
            id, body, upvote_count, created_at,
            profiles:user_id(full_name, avatar_url)
          )
        `)
        .eq('id', doubtId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!doubtId,
  })
}
