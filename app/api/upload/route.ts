import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken } from '@/lib/auth-middleware';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddhhfluwi',
  api_key: process.env.CLOUDINARY_API_KEY || '663767197568961',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Bqft-6GxnGBsJ86j8bEE1EPI1ZU',
});

export async function POST(req: NextRequest) {
  const user = authenticateToken(req);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'saveplate/inventory',
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
  }
}