import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(req: NextRequest) {
  const { dataUrl } = await req.json()

  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const upload = await cloudinary.uploader.upload(dataUrl, {
      folder: 'for-his-glory/designs',
      resource_type: 'image',
    })

    return NextResponse.json({ imageUrl: upload.secure_url })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export failed' },
      { status: 500 }
    )
  }
}
