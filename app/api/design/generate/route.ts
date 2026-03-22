import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { v2 as cloudinary } from 'cloudinary'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Step 1: Claude extracts scripture text and generates a pure artwork prompt
    const refinement = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: `You are a creative director for a Christian apparel brand. Your job is to extract two things from a customer's shirt idea and return them as a JSON object with exactly two keys: "artPrompt" and "scriptureText".

"artPrompt" rules — STRICT:
- Describe ONLY the illustration/graphic element (lion, cross, eagle, mountain, dove, anchor, etc.)
- Specify art style, color palette, lighting, and composition
- Do NOT mention any text, words, letters, numbers, verses, quotes, or phrases anywhere in this field
- Do NOT include typography instructions of any kind
- Do NOT reference scripture or Bible references

"scriptureText" rules:
- Extract the scripture reference or short phrase the customer wants printed on the shirt
- Examples: "Philippians 4:13", "Isaiah 40:31", "He Is Risen", "For His Glory"
- If no text was mentioned, return an empty string
- Max 40 characters

Return ONLY the JSON object. No markdown. No explanation.`,
      messages: [
        {
          role: 'user',
          content: `Customer's shirt idea: "${prompt.trim()}"`,
        },
      ],
    })

    const rawContent =
      refinement.content[0].type === 'text' ? refinement.content[0].text.trim() : '{}'

    let artPrompt = prompt
    let scriptureText = ''
    try {
      // Strip markdown code fences if Claude wrapped it
      const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const parsed = JSON.parse(cleaned)
      artPrompt = parsed.artPrompt ?? prompt
      scriptureText = parsed.scriptureText ?? ''
    } catch {
      artPrompt = rawContent || prompt
    }

    // Always append a hard override so DALL-E never renders text regardless of what Claude wrote
    const imagePrompt = `${artPrompt} — pure illustration, absolutely no text, no words, no letters, no numbers, no typography, no written characters of any kind in the image.`

    // Step 2: DALL-E 3 generates the design from the artwork-only prompt
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
    })

    const tempUrl = image.data?.[0]?.url
    if (!tempUrl) {
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    // Step 3: Upload to Cloudinary for permanent storage
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    const upload = await cloudinary.uploader.upload(tempUrl, {
      folder: 'for-his-glory/designs',
      resource_type: 'image',
    })

    return NextResponse.json({
      imageUrl: upload.secure_url,
      refinedPrompt: artPrompt,
      scriptureText,
    })
  } catch (error) {
    console.error('Design generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
