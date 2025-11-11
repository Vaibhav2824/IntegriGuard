import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase-types'

type ExamResult = Database['public']['Tables']['exam_results']['Row']
type Exam = Database['public']['Tables']['exams']['Row']

// Get available exams for a student
export async function getAvailableExams(studentId: string) {
  const { data, error } = await supabase
    .from('exams')
    .select(`
      *,
      exam_results!inner (
        user_id
      )
    `)
    .eq('is_published', true)
    .neq('exam_results.user_id', studentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching available exams:', error)
    throw error
  }

  return data as Exam[]
}

// Get completed exams for a student
export async function getCompletedExams(studentId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      exams (
        id,
        title,
        description,
        created_at
      )
    `)
    .eq('user_id', studentId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching completed exams:', error)
    throw error
  }

  return data as (ExamResult & {
    exams: Pick<Exam, 'id' | 'title' | 'description' | 'created_at'>
  })[]
}

// Get student's performance statistics
export async function getStudentStats(studentId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select('score')
    .eq('user_id', studentId)

  if (error) {
    console.error('Error fetching student stats:', error)
    throw error
  }

  const scores = data.map(result => result.score)
  const totalExams = scores.length
  const averageScore = totalExams > 0
    ? scores.reduce((sum, score) => sum + score, 0) / totalExams
    : 0
  const highestScore = totalExams > 0
    ? Math.max(...scores)
    : 0
  const lowestScore = totalExams > 0
    ? Math.min(...scores)
    : 0

  return {
    totalExams,
    averageScore,
    highestScore,
    lowestScore,
  }
}

// Get student's recent activity
export async function getStudentActivity(studentId: string, limit = 5) {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      exams (
        id,
        title
      )
    `)
    .eq('user_id', studentId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching student activity:', error)
    throw error
  }

  return data
}

// Get student's performance in a specific exam
export async function getExamPerformance(studentId: string, examId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      exams (
        id,
        title,
        description
      ),
      questions (
        id,
        question_text,
        options,
        correct_answer
      )
    `)
    .eq('user_id', studentId)
    .eq('exam_id', examId)
    .single()

  if (error) {
    console.error('Error fetching exam performance:', error)
    throw error
  }

  return data
} 