import { supabase } from './supabase.js'

export async function listarAlunos() {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return data
}

export async function consultarAluno(id) {
  const numId = Number(id)
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', numId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function cadastrarAluno({ nome, email, curso, idade }) {
  const { data, error } = await supabase
    .from('alunos')
    .insert([{ nome, email, curso, idade: Number(idade) }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function alterarAluno(id, { nome, email, curso, idade }) {
  const numId = Number(id)
  const { data, error } = await supabase
    .from('alunos')
    .update({
      nome,
      email,
      curso,
      idade: Number(idade),
    })
    .eq('id', numId)
    .select()
    .maybeSingle()
  if (error) throw error
  return data
}

export async function excluirAluno(id) {
  const numId = Number(id)
  const { error } = await supabase
    .from('alunos')
    .delete()
    .eq('id', numId)
  if (error) throw error
  return true
}
