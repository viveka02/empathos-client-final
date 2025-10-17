'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function ContactForm({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Submission failed.");
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Access</DialogTitle>
          <DialogDescription>
            Submit the form below and our team will get back to you shortly.
          </DialogDescription>
        </DialogHeader>
        {status === 'success' ? (
          <div className="py-8 text-center">
            <h3 className="font-bold">Thank You!</h3>
            <p className="text-muted-foreground">Your message has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Your Name" required />
            <Input name="email" type="email" placeholder="Your Email" required />
            <Textarea name="message" placeholder="Tell us about your use case" required />
            <Button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting...' : 'Submit Request'}
            </Button>
            {status === 'error' && <p className="text-sm text-destructive">Failed to send message. Please try again.</p>}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}