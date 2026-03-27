// =============================================================
// Cloudinary Configuration
// Replace the values below with your actual Cloudinary credentials
// from https://console.cloudinary.com → Dashboard
// =============================================================

export const CLOUDINARY_CONFIG = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UPLOAD_PRESET", // create an unsigned preset in Cloudinary dashboard
  apiKey: "YOUR_API_KEY", // only needed for signed uploads
};

// Upload a file to Cloudinary (unsigned upload)
export async function uploadToCloudinary(
  file: File,
  folder = "insticonnect",
  onProgress?: (percent: number) => void,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", folder);

  const xhr = new XMLHttpRequest();
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  return new Promise((resolve, reject) => {
    xhr.open("POST", url);

    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable)
          onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
      }
    };
    xhr.onerror = () =>
      reject(new Error("Network error during Cloudinary upload"));
    xhr.send(formData);
  });
}

// Delete an image by publicId (requires signed delete or server-side call)
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  },
): string {
  const { width, height, quality = 80, format = "webp" } = options ?? {};
  const transforms = [
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transforms}/${publicId}`;
}

// --------------- Integration with CreatePost / StoryCreator ---------------
//
// In CreatePost.tsx, replace the local URL.createObjectURL call with:
//
//   const { url } = await uploadToCloudinary(file, "posts", (p) => setProgress(p));
//   setImage(url); // url is a persistent Cloudinary CDN URL
//
// And save `url` in Firestore alongside the post document.
