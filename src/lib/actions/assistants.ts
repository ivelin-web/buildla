'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type InsertAssistant, type UpdateAssistant } from '@/lib/supabase/types'

export async function getAssistants() {
  const supabase = await createClient()
  
  const { data: assistants, error } = await supabase
    .from('assistants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assistants:', error)
    throw new Error('Failed to fetch assistants')
  }

  return assistants || []
}

export async function createAssistant(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const systemPrompt = formData.get('systemPrompt') as string
  const category = formData.get('category') as string
  const firstMessage = formData.get('firstMessage') as string

  if (!name || !description || !systemPrompt) {
    throw new Error('Name, description, and system prompt are required')
  }

  const newAssistant: InsertAssistant = {
    name,
    description,
    system_prompt: systemPrompt,
    category: category || null,
    first_message: firstMessage || null,
  }

  const { error } = await supabase
    .from('assistants')
    .insert([newAssistant])

  if (error) {
    console.error('Error creating assistant:', error)
    throw new Error('Failed to create assistant')
  }

  revalidatePath('/dashboard/assistants')
}

export async function updateAssistant(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const systemPrompt = formData.get('systemPrompt') as string
  const category = formData.get('category') as string
  const firstMessage = formData.get('firstMessage') as string

  if (!name || !description || !systemPrompt) {
    throw new Error('Name, description, and system prompt are required')
  }

  const updateData: UpdateAssistant = {
    name,
    description,
    system_prompt: systemPrompt,
    category: category || null,
    first_message: firstMessage || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('assistants')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating assistant:', error)
    throw new Error('Failed to update assistant')
  }

  revalidatePath('/dashboard/assistants')
}

export async function deleteAssistant(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('assistants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting assistant:', error)
    throw new Error('Failed to delete assistant')
  }

  revalidatePath('/dashboard/assistants')
}

export async function getAssistantById(id: string) {
  const supabase = await createClient()
  
  const { data: assistant, error } = await supabase
    .from('assistants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching assistant:', error)
    throw new Error('Failed to fetch assistant')
  }

  return assistant
}