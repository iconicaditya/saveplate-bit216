/**
 * Cloudinary image upload utility
 * Uploads images using Cloudinary's unsigned upload preset
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ddhhfluwi';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'saveplate_preset';

/**
 * Upload an image file to Cloudinary
 * @param file - The file to upload
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Image upload failed.');
  }

  const data = await response.json();
  return data.secure_url;
}