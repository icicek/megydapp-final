// ✅ Pure Uploadthing v5 Route Handler (manual tanım)
import { createUploadthing } from 'uploadthing/server';

const f = createUploadthing();

const handleUpload = f({ image: { maxFileSize: '4MB' } });

export async function POST(req) {
  const { headers } = req;
  const body = await req.formData();

  // Manual fetch POST for uploadthing
  const res = await fetch('https://uploadthing.com/api/uploadFiles', {
    method: 'POST',
    headers,
    body,
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function GET() {
  return new Response('Uploadthing GET route works!', { status: 200 });
}
