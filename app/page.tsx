'use client'

import { toBlob } from 'html-to-image';
import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Camera, Check, RotateCcw, Sparkles, Upload, Zap } from 'lucide-react'

type Stage = 'upload' | 'loading' | 'result'

type RoastResult = {
  roast: string
  vibe_score: number
  focal_point: string
}

export default function Page() {
  const roastCardRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>('upload')
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<RoastResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()
  
  const acceptFile = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    if (image) URL.revokeObjectURL(image)
    const preview = URL.createObjectURL(file)
    setImage(preview)
    setCopied(false)
    setError(null)
    setResult(null)
    setStage('loading')

    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/roast', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Failed to roast')
      }
      setResult({
        roast: data.roast,
        vibe_score: data.vibe_score,
        focal_point: data.focal_point,
      })
      setStage('result')
    } catch {
      URL.revokeObjectURL(preview)
      setImage(null)
      setStage('upload')
      setError('Could not roast that photo. Try another one.')
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => acceptFile(event.target.files?.[0])
  
  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    acceptFile(event.dataTransfer.files?.[0])
  }
  
  const reset = () => {
    if (image) URL.revokeObjectURL(image)
    setImage(null)
    setResult(null)
    setError(null)
    setStage('upload')
    if (inputRef.current) inputRef.current.value = ''
  }

  const share = async () => {
    const score = result?.vibe_score ?? 0
    const text = `I got roasted by VIBE CHECK. Score: ${score}/100.`
    if (navigator.share) await navigator.share({ title: 'My Vibe Check', text }).catch(() => undefined)
    else {
      await navigator.clipboard?.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  const handleShare = async () => {
    if (!roastCardRef.current) return;
  
    try {
      const blob = await toBlob(roastCardRef.current, { pixelRatio: 2 });
      if (!blob) return;
      
      const file = new File([blob], 'vibe-check-roast.png', { type: 'image/png' });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Get Roasted',
          text: `My Vibe Score: ${result?.vibe_score ?? 0}/100`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vibe-check-roast.png';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Screenshot generation failed:', error);
    }
  };

  const transition = reduceMotion ? { duration: 0.01 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };
  
  return (
    <main className="min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="noise" aria-hidden="true" />
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 md:px-10 md:py-8">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Zap className="size-4 fill-current" /></div>
          <span className="font-mono text-sm font-bold tracking-[0.2em]">VIBE<span className="text-primary">/</span>CHECK</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI personality scan <span className="ml-2 inline-block size-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" /></span>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100dvh-92px)] w-full max-w-6xl flex-col justify-center px-5 pb-12 md:px-10 md:pb-20">
        <AnimatePresence mode="wait">
          
          {stage === 'upload' && <motion.div key="upload" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={transition} className="mx-auto w-full max-w-2xl text-center">
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.35em] text-primary">Your face. Our honesty.</p>
            <h1 className="text-balance font-mono text-5xl font-black uppercase leading-[0.9] tracking-[-0.08em] sm:text-7xl md:text-8xl">Get<br /><span className="text-primary text-glow">Roasted.</span></h1>
            <p className="mx-auto mt-7 max-w-md text-pretty text-sm leading-6 text-muted-foreground">Upload a photo and let our questionable AI tell you exactly what your vibe is giving.</p>
            <button type="button" onClick={() => inputRef.current?.click()} onDrop={onDrop} onDragOver={(e) => e.preventDefault()} className="upload-orb group relative mx-auto mt-10 grid aspect-square w-56 place-items-center rounded-full border border-primary/50 bg-primary/5 text-primary transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:ring-offset-background sm:w-72">
              <span className="absolute inset-3 rounded-full border border-dashed border-primary/40 transition-transform group-hover:rotate-12" />
              <span className="relative flex flex-col items-center gap-3"><Upload className="size-8" strokeWidth={1.5} /><span className="font-mono text-xs font-bold uppercase tracking-[0.2em]">Drop it<br />like it&apos;s hot</span></span>
            </button>
            <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="sr-only" />
            {error && <p className="mt-4 font-mono text-xs text-primary">{error}</p>}
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">JPG / PNG / WEBP · max 10MB</p>
          </motion.div>}

          {stage === 'loading' && image && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="mx-auto w-full max-w-4xl">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="scan-frame relative aspect-[4/5] overflow-hidden rounded-2xl border border-primary/40 bg-card"><img src={image} alt="Your uploaded photo being analyzed" className="size-full object-cover opacity-70 grayscale" /><div className="scan-line absolute inset-x-0 top-0 h-1 bg-primary shadow-[0_0_24px_8px_var(--primary)]" /><div className="absolute inset-0 bg-[linear-gradient(transparent_49%,rgba(74,222,128,0.08)_50%,transparent_51%)] bg-[length:100%_6px]" /><span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-primary">Scanning subject_01</span></div>
              <div><p className="font-mono text-[11px] uppercase tracking-[0.3em] text-primary">Processing your aura</p><h2 className="mt-4 text-4xl font-black uppercase tracking-tighter">Calibrating<br />the roast<span className="text-primary">...</span></h2><div className="mt-8 space-y-4">{['Detecting energy', 'Cross-referencing red flags', 'Writing something mean'].map((label, i) => <div key={label} className="flex items-center gap-3"><div className="size-4 rounded-sm border border-primary/50">{i < 2 && <Check className="size-full p-0.5 text-primary" />}</div><span className="font-mono text-xs text-muted-foreground">{label}</span><span className="ml-auto h-2 w-24 overflow-hidden rounded-full bg-secondary"><span className="block h-full w-2/3 animate-pulse bg-primary" /></span></div>)}</div></div>
            </div>
          </motion.div>}

          {stage === 'result' && image && result && <motion.div key="result" initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} transition={transition} className="mx-auto w-full max-w-md">
            
            <div ref={roastCardRef} className="trading-card overflow-hidden rounded-2xl border border-primary/40 bg-card p-3 shadow-[0_0_70px_rgba(74,222,128,0.15)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border"><img src={image} alt="Your uploaded vibe check photo" className="size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" /><div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 font-mono text-[9px] font-bold tracking-widest text-primary backdrop-blur"><Sparkles className="size-3" /> RARE VIBE</div><span className="absolute bottom-4 right-4 font-mono text-[9px] tracking-widest text-primary">#{String(result.vibe_score).padStart(6, '0')}</span></div>
              <div className="px-2 pb-2 pt-5"><div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your vibe score</p><div className="mt-1 font-mono text-7xl font-black leading-none tracking-[-0.1em] text-primary text-glow">{result.vibe_score}<span className="text-2xl tracking-normal text-muted-foreground">/100</span></div></div><div className="mb-1 text-right font-mono text-[10px] uppercase tracking-widest text-primary">Certified<br />icon behavior</div></div><div className="my-5 h-px bg-border" /><p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">The roast</p><p className="mt-3 text-pretty text-sm leading-6 text-card-foreground">&quot;{result.roast}&quot;</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[9px] font-bold tracking-widest text-primary">{result.focal_point}</span></div><div className="mt-6 flex gap-3"><button onClick={share} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_24px_rgba(74,222,128,0.3)] transition hover:shadow-[0_0_34px_rgba(74,222,128,0.5)]">{copied ? <Check className="size-4" /> : <ArrowUpRight className="size-4" />} {copied ? 'Copied' : 'Share'}</button><button onClick={reset} aria-label="Reset and upload a new photo" className="grid size-11 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary hover:text-primary"><RotateCcw className="size-4" /></button></div></div>
            </div>
            
            <p className="mt-5 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">A totally scientific assessment · Share responsibly</p>
            
            <button onClick={handleShare} className="mt-6 w-full rounded-xl bg-green-500 px-4 py-3 font-mono text-sm font-bold uppercase text-black hover:opacity-90">
              Share to IG / WhatsApp
            </button>
            <a 
              href="https://wa.me/919925411642?text=I%20got%20roasted%20and%20need%20to%20fix%20my%20fit.%20Show%20me%20the%20Centilliox%20catalog." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-primary/50 bg-transparent px-4 py-3 font-mono text-sm font-bold uppercase text-primary transition hover:bg-primary/10"
             >
              Fix your fit · Shop Centilliox
             </a>
            
          </motion.div>} 
          
        </AnimatePresence>
      </section>
      
      <div className="fixed bottom-5 left-5 z-10 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground md:flex"><Camera className="size-3 text-primary" /> No photos leave your browser</div>
    </main>
  )
}