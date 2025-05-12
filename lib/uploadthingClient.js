import { utapi } from 'uploadthing'; // ✅ DÜZELTİLDİ

export async function uploadFile(file) {
  const res = await utapi.uploadFiles(file);
  return res;
}
