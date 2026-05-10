import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Material } from '@/types/database'

// For regular users — only approved materials
export function useMaterials(subjectId: string, status: 'approved' | 'pending' | 'rejected' = 'approved') {
  return useQuery({
    queryKey: ['materials', subjectId, status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(`*, profiles:uploaded_by (full_name, avatar_url)`)
        .eq('subject_id', subjectId)
        .eq('status', status)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!subjectId,
  })
}

// For admin — see ALL materials regardless of status
export function useAllMaterials(subjectId: string) {
  return useQuery({
    queryKey: ['materials', subjectId, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(`*, profiles:uploaded_by (full_name, avatar_url)`)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!subjectId,
  })
}

export function useMaterial(materialId: string) {
  return useQuery({
    queryKey: ['material', materialId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(`*, profiles:uploaded_by (full_name, avatar_url), subjects (name, code)`)
        .eq('id', materialId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!materialId,
  })
}
