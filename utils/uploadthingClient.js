import { generateUploadThingURL } from 'uploadthing/client';

export async function uploadFiles(endpoint, files) {
  const res = await fetch(generateUploadThingURL(endpoint), {
    method: 'POST',
    body: new FormData(),
  });

  const uploadURL = res.url;

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const uploadRes = await fetch(uploadURL, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed');
  }

  return uploadRes.json(); // returns array of uploaded file info
}
