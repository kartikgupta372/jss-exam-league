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

export function useSubject(idOrCode: string) {
  return useQuery({
    queryKey: ['subject', idOrCode],
    queryFn: async () => {
      // Basic UUID regex
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrCode)
      const column = isUuid ? 'id' : 'code'
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq(column, idOrCode)
        .single()
      if (error) throw error
      return data as Subject
    },
    enabled: !!idOrCode,
  })
}
