import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useQuizzes(subjectId: string) {
  return useQuery({
    queryKey: ['quizzes', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('subject_id', subjectId)
        .eq('published', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!subjectId,
  })
}

export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          quiz_questions (*)
        `)
        .eq('id', quizId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!quizId,
  })
}
