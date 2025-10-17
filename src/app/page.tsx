'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContactForm } from '@/components/ContactForm';
import { Cpu, Beaker, BarChart2 } from 'lucide-react';

export default function HomePage() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  return (
    <>
      <ContactForm open={isContactFormOpen} onOpenChange={setIsContactFormOpen} />

      {/* --- HERO SECTION WITH VIDEO BACKGROUND --- */}
      <section className="relative flex flex-col items-center justify-center text-center h-[60vh] overflow-hidden">
        {/* The video element */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Text content */}
        <div className="relative z-20 text-white px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Unlock Actionable User Insights, Instantly.
          </h1>
          <p className="mt-6 text-lg leading-8 max-w-2xl text-slate-300">
            The AI-powered platform that automates user interviews and analysis, helping you build products your users truly need.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={() => setIsContactFormOpen(true)}>
              Request Access
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <Cpu size={48} className="text-primary"/>
              <h3 className="mt-4 text-lg font-semibold">1. Define Your Goal</h3>
              <p className="mt-2 text-muted-foreground">Set up a new research project in seconds with a clear objective.</p>
            </div>
            <div className="flex flex-col items-center">
              <Beaker size={48} className="text-primary"/>
              <h3 className="mt-4 text-lg font-semibold">2. Launch AI Interviews</h3>
              <p className="mt-2 text-muted-foreground">Share a simple link and let our AI agent conduct natural, in-depth conversations.</p>
            </div>
            <div className="flex flex-col items-center">
              <BarChart2 size={48} className="text-primary"/>
              <h3 className="mt-4 text-lg font-semibold">3. Receive Actionable Insights</h3>
              <p className="mt-2 text-muted-foreground">Instantly get summaries, themes, and structured data in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}