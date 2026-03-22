import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const [productRows, relatedRows] = await Promise.all([
    sql`
      SELECT p.*,
        row_to_json(c.*) AS collection,
        json_agg(DISTINCT pi.* ORDER BY pi.sort_order) FILTER (WHERE pi.id IS NOT NULL) AS images,
        json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.slug = ${slug} AND p.active = true
      GROUP BY p.id, c.id
      LIMIT 1
    `,
    sql`
      SELECT p.*,
        json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL) AS images,
        json_agg(DISTINCT pv.*) FILTER (WHERE pv.id IS NOT NULL) AS variants
      FROM products p
      INNER JOIN collections c ON c.id = p.collection_id
      INNER JOIN products base ON base.collection_id = c.id AND base.slug = ${slug}
      LEFT JOIN product_images pi ON pi.product_id = p.id
      LEFT JOIN product_variants pv ON pv.product_id = p.id
      WHERE p.active = true AND p.slug != ${slug}
      GROUP BY p.id
      LIMIT 4
    `,
  ])

  const product = productRows[0]
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ product, related: relatedRows })
}
