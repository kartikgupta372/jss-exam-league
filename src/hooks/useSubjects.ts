import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Subject } from '@/types/database'

export interface SubjectWithStats extends Subject {
  _notes: number;
  _quizzes: number;
  _doubts: number;
}

export function useSubjects(year?: number) {
  return useQuery({
    queryKey: ['subjects', year],
    queryFn: async () => {
      let query = supabase.from('subjects').select('*').order('name')
      if (year) {
        query = query.eq('year', year)
      }
      const { data, error } = await query
      if (error) throw error
      
      const subs = data as Subject[]
      
      const enriched = await Promise.all(subs.map(async (s) => {
        const [{ count: notes }, { count: quizzes }, { count: doubts }] = await Promise.all([
          supabase.from('materials').select('id', { count: 'exact', head: true }).eq('subject_id', s.id).eq('status', 'approved'),
          supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('subject_id', s.id).eq('published', true),
          supabase.from('doubts').select('id', { count: 'exact', head: true }).eq('subject_id', s.id),
        ])
        return { ...s, _notes: notes ?? 0, _quizzes: quizzes ?? 0, _doubts: doubts ?? 0 } as SubjectWithStats
      }))

      return enriched
    },
  })
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: ['subject', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Subject
    },
    enabled: !!id,
  })
}
