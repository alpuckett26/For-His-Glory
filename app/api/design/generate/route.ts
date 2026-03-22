import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Step 1: Claude refines the user's idea into a detailed image generation prompt
    const refinement = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are a creative director for a Christian apparel brand called "For His Glory".
A customer wants a t-shirt design with this idea: "${prompt.trim()}"

Write a detailed DALL-E image generation prompt for this shirt design. The prompt should:
- Describe a clean, print-ready graphic design (not a photo of a shirt)
- Be faith-forward and suitable for Christian apparel
- Specify art style (e.g. bold typography, minimalist illustration, vintage graphic)
- Include color palette suggestions
- Be optimized for screen printing (limited colors, high contrast)
- End with: "white background, vector art style, centered composition, suitable for t-shirt printing"

Respond with ONLY the image generation prompt, nothing else.`,
        },
      ],
    })

    const imagePrompt =
      refinement.content[0].type === 'text'
        ? refinement.content[0].text.trim()
        : prompt

    // Step 2: DALL-E 3 generates the design from Claude's refined prompt
    const image = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    })

    const imageUrl = image.data?.[0]?.url
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl, refinedPrompt: imagePrompt })
  } catch (error) {
    console.error('Design generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
