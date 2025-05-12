'use client';

import React, { useState } from 'react';
import { uploadFile } from '@/lib/uploadthingClient';

export default function ImageUploader() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const res = await uploadFile(file);
      const url = res?.data?.[0]?.url; // 👈 gelen URL burada
      setPreviewUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <input type="file" accept="image/*" onChange={handleChange} />
      {loading && <p>Uploading...</p>}
      {previewUrl && (
        <div className="mt-4">
          <p>Uploaded Image:</p>
          <img src={previewUrl} alt="Uploaded" className="w-64 rounded-md mt-2" />
        </div>
      )}
    </div>
  );
}
