export const CLOUDINARY_CONFIG = {
  cloudName: "dfdj9xxg2",
  uploadPreset: "nhcqoul1",
  apiKey: "",
};

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
