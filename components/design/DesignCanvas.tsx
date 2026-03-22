'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'

export interface DesignCanvasRef {
  addImage: (url: string) => Promise<void>
  addText: (text: string, font: string, size: number, color: string) => void
  deleteSelected: () => void
  clear: () => void
  getDataUrl: () => string | null
}

interface Props {
  size?: number
}

export const DesignCanvas = forwardRef<DesignCanvasRef, Props>(
  function DesignCanvas({ size = 512 }, ref) {
    const canvasEl = useRef<HTMLCanvasElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fabricRef = useRef<any>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
      if (!canvasEl.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let instance: any = null

      ;(async () => {
        const { Canvas } = await import('fabric')
        instance = new Canvas(canvasEl.current!, {
          width: size,
          height: size,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true,
        })
        fabricRef.current = instance
        setReady(true)
      })()

      const handleKey = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const active = fabricRef.current?.getActiveObject()
          if (active) {
            fabricRef.current.remove(active)
            fabricRef.current.discardActiveObject()
            fabricRef.current.renderAll()
          }
        }
      }
      document.addEventListener('keydown', handleKey)

      return () => {
        document.removeEventListener('keydown', handleKey)
        instance?.dispose()
        fabricRef.current = null
      }
    }, [size])

    useImperativeHandle(ref, () => ({
      addImage: async (url: string) => {
        if (!fabricRef.current) return
        const { FabricImage } = await import('fabric')
        const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' })
        const maxDim = size * 0.78
        const w = img.width ?? maxDim
        const h = img.height ?? maxDim
        if (w > maxDim || h > maxDim) {
          img.scale(maxDim / Math.max(w, h))
        }
        img.set({ left: size / 2, top: size / 2, originX: 'center', originY: 'center' })
        fabricRef.current.add(img)
        fabricRef.current.setActiveObject(img)
        fabricRef.current.renderAll()
      },

      addText: (text: string, font: string, fontSize: number, color: string) => {
        if (!fabricRef.current) return
        import('fabric').then(({ IText }) => {
          const t = new IText(text, {
            left: size / 2,
            top: size * 0.84,
            originX: 'center',
            originY: 'center',
            fontFamily: font,
            fontSize,
            fill: color,
            fontWeight: 'bold',
            textAlign: 'center',
          })
          fabricRef.current.add(t)
          fabricRef.current.setActiveObject(t)
          fabricRef.current.renderAll()
        })
      },

      deleteSelected: () => {
        const active = fabricRef.current?.getActiveObject()
        if (active) {
          fabricRef.current.remove(active)
          fabricRef.current.discardActiveObject()
          fabricRef.current.renderAll()
        }
      },

      clear: () => {
        fabricRef.current?.clear()
        fabricRef.current?.set({ backgroundColor: '#ffffff' })
        fabricRef.current?.renderAll()
      },

      getDataUrl: () => {
        return fabricRef.current?.toDataURL({ format: 'png', multiplier: 2 }) ?? null
      },
    }))

    return (
      <div
        className="relative border border-charcoal/20 shadow-sm"
        style={{ width: size, height: size }}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-gray">
            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasEl} />
      </div>
    )
  }
)
