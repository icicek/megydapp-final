import { uploadFiles } from 'uploadthing/server'; // ✅ kesin çalışan yol

export async function uploadFile(file) {
  const res = await uploadFiles(file);
  return res;
}
