import { supabase } from './supabaseClient.js';

function taskFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tags: row.tags || [],
    subtasks: row.subtasks || [],
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function uploadFromRow(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    filename: row.filename,
    mediaType: row.media_type,
    imagePath: row.image_path,
    tags: row.tags || [],
    category: row.category,
    critique: row.critique,
    createdAt: row.created_at,
  };
}

export async function fetchTasks() {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(taskFromRow);
}

export async function fetchUploads() {
  const { data, error } = await supabase.from('uploads').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(uploadFromRow);
}

export async function insertTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      category: task.category,
      tags: task.tags || [],
      subtasks: task.subtasks,
    })
    .select()
    .single();
  if (error) throw error;
  return taskFromRow(data);
}

export async function updateTaskRemote(id, { subtasks, completedAt }) {
  const { error } = await supabase
    .from('tasks')
    .update({ subtasks, completed_at: completedAt })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteTaskRemote(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function insertUpload(upload, file, userId) {
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from('uploads').upload(path, file, {
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('uploads')
    .insert({
      task_id: upload.taskId || null,
      filename: upload.filename,
      media_type: upload.mediaType,
      image_path: path,
      tags: upload.tags || [],
      category: upload.category,
      critique: upload.critique,
    })
    .select()
    .single();
  if (error) throw error;
  return uploadFromRow(data);
}

export async function deleteUploadRemote(id, imagePath) {
  const { error } = await supabase.from('uploads').delete().eq('id', id);
  if (error) throw error;
  if (imagePath) {
    await supabase.storage.from('uploads').remove([imagePath]);
  }
}

const signedUrlCache = new Map();

export async function getSignedImageUrl(path) {
  if (signedUrlCache.has(path)) return signedUrlCache.get(path);
  const { data, error } = await supabase.storage.from('uploads').createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) throw error;
  signedUrlCache.set(path, data.signedUrl);
  return data.signedUrl;
}
