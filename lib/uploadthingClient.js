import { utapi } from 'uploadthing/server';

export async function uploadFile(file) {
  const res = await utapi.uploadFiles(file);
  return res;
}
