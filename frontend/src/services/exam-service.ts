import { supabase } from '../lib/supabase'
import { Database } from '../lib/supabase-types'

type Exam = Database['public']['Tables']['exams']['Row']
type Question = Database['public']['Tables']['questions']['Row']
type ExamResult = Database['public']['Tables']['exam_results']['Row']

// Fetch all exams
export async function getAllExams() {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching exams:', error)
    throw error
  }

  return data as Exam[]
}

// Fetch exams created by a specific user
export async function getExamsByUser(userId: string) {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user exams:', error)
    throw error
  }

  return data as Exam[]
}

// Fetch a single exam by ID
export async function getExamById(examId: string) {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()

  if (error) {
    console.error(`Error fetching exam with ID ${examId}:`, error)
    throw error
  }

  return data as Exam
}

// Create a new exam
export async function createExam(exam: Omit<Exam, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('exams')
    .insert(exam)
    .select()
    .single()

  if (error) {
    console.error('Error creating exam:', error)
    throw error
  }

  return data as Exam
}

// Update an exam
export async function updateExam(examId: string, updates: Partial<Omit<Exam, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('exams')
    .update(updates)
    .eq('id', examId)
    .select()
    .single()

  if (error) {
    console.error(`Error updating exam with ID ${examId}:`, error)
    throw error
  }

  return data as Exam
}

// Delete an exam
export async function deleteExam(examId: string) {
  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)

  if (error) {
    console.error(`Error deleting exam with ID ${examId}:`, error)
    throw error
  }

  return true
}

// Get questions for an exam
export async function getExamQuestions(examId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error(`Error fetching questions for exam ${examId}:`, error)
    throw error
  }

  return data as Question[]
}

// Add a question to an exam
export async function addQuestionToExam(question: Omit<Question, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('questions')
    .insert(question)
    .select()
    .single()

  if (error) {
    console.error('Error adding question to exam:', error)
    throw error
  }

  return data as Question
}

// Submit exam results
export async function submitExamResults(result: Omit<ExamResult, 'id' | 'completed_at'>) {
  const { data, error } = await supabase
    .from('exam_results')
    .insert({
      ...result,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting exam results:', error)
    throw error
  }

  return data as ExamResult
}

// Get exam results for a user
export async function getUserExamResults(userId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      exams (
        id,
        title,
        description
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error(`Error fetching exam results for user ${userId}:`, error)
    throw error
  }

  return data
}

// Get all results for an exam
export async function getExamResults(examId: string) {
  const { data, error } = await supabase
    .from('exam_results')
    .select(`
      *,
      users (
        id,
        email,
        full_name
      )
    `)
    .eq('exam_id', examId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error(`Error fetching results for exam ${examId}:`, error)
    throw error
  }

  return data
} 