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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricModule = { FabricImage: any; IText: any }

export const DesignCanvas = forwardRef<DesignCanvasRef, Props>(
  function DesignCanvas({ size = 512 }, ref) {
    const canvasEl = useRef<HTMLCanvasElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fabricRef = useRef<any>(null)
    const fabricModuleRef = useRef<FabricModule | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
      if (!canvasEl.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let instance: any = null

      ;(async () => {
        const mod = await import('fabric')
        fabricModuleRef.current = { FabricImage: mod.FabricImage, IText: mod.IText }

        instance = new mod.Canvas(canvasEl.current!, {
          width: size,
          height: size,
          backgroundColor: 'transparent',
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
        fabricModuleRef.current = null
      }
    }, [size])

    useImperativeHandle(ref, () => ({
      addImage: async (url: string) => {
        if (!fabricRef.current || !fabricModuleRef.current) return
        const { FabricImage } = fabricModuleRef.current
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

      // Fully synchronous — no async import, module already loaded
      addText: (text: string, font: string, fontSize: number, color: string) => {
        if (!fabricRef.current || !fabricModuleRef.current) return
        const { IText } = fabricModuleRef.current
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
        fabricRef.current?.set({ backgroundColor: 'transparent' })
        fabricRef.current?.renderAll()
      },

      // Export as PNG with transparency — no white background baked in
      getDataUrl: () => {
        if (!fabricRef.current) return null
        return fabricRef.current.toDataURL({ format: 'png' }) as string
      },
    }))

    return (
      <div
        className="relative border border-charcoal/20 shadow-sm"
        style={{
          width: size,
          height: size,
          // Checkered pattern shows transparency clearly
          backgroundImage: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          backgroundColor: '#f0f0f0',
        }}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-warm-gray z-10">
            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasEl} />
      </div>
    )
  }
)
