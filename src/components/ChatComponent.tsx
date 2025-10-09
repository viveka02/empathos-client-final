'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FiMic, FiSend } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatComponentProps {
  projectGoal: string;
  projectId: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const sanitizeText = (text: string): string => {
  let cleanText = text.replace(/\*.*?\*/g, '');
  cleanText = cleanText.replace(/\*\*/g, '');
  return cleanText.trim();
};

export default function ChatComponent({ projectGoal, projectId }: ChatComponentProps) {
  // Start with a pre-written welcome message.
  // This avoids the "messages required" error on the initial load.
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi there! I'm Erika, your AI user researcher for this session. Thank you for your time today!
      
      Before we get started, I want to make sure you understand a few things: First, I'm not a real person - I'm an artificial intelligence created to help with user research. My role is to have a friendly and open-ended conversation with you in order to understand your experiences. There are no right or wrong answers here; we're just here to learn from you. Second, everything we discuss will be completely confidential. I won't share any of your personal information or the details of our conversation with anyone outside of the research team.
      
      Our main goal is to: "${projectGoal}".
      
      Does that sound okay?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const initialGreetingPlayed = useRef(false);

  const speak = (text: string) => {
    const existingAudio = document.getElementById('tts-audio') as HTMLAudioElement;
    if (existingAudio) {
      existingAudio.pause();
      document.body.removeChild(existingAudio);
    }
    const audio = new Audio();
    audio.id = 'tts-audio';
    audio.autoplay = true; // Ensure autoplay
    fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to generate audio.');
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      audio.src = url;
    })
    .catch(err => console.error("TTS Error:", err));
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Play initial greeting audio only once when component mounts
    if (!initialGreetingPlayed.current && messages.length > 0) {
      speak(messages[0].content);
      initialGreetingPlayed.current = true;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); setIsListening(false); };
      recognition.onerror = (event: any) => { console.error('Speech error:', event.error); setIsListening(false); };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      const existingAudio = document.getElementById('tts-audio') as HTMLAudioElement;
      if (existingAudio) {
          existingAudio.pause();
          document.body.removeChild(existingAudio);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array means this runs only once on mount

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiResponding) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); // Display user message immediately
    setInput('');
    setIsAiResponding(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, projectGoal: projectGoal }),
      });
      if (!response.ok) throw new Error('Failed to get a response from the AI.');
      
      const data = await response.json();
      const cleanResponse = sanitizeText(data.response);
      const aiResponse: Message = { role: 'assistant', content: cleanResponse };
      
      setMessages(prev => [...prev, aiResponse]); // Display AI text response immediately
      speak(aiResponse.content); // Start playing AI audio

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsAiResponding(false);
    }
  };
  
  const handleEndSession = async () => {
    if (!window.confirm("Are you sure? The transcript will be saved.")) return;
    setIsAiResponding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(`${API_URL}/interviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ projectId: projectId, transcript: messages }),
      });
      if (!response.ok) throw new Error('Failed to save the transcript.');
      setIsSessionEnded(true);
      speak("Thank you for your feedback. The session has now ended.");
    } catch (error) {
      console.error(error);
      alert('Error saving session.');
    } finally {
      setIsAiResponding(false);
    }
  };

  if (isSessionEnded) {
    return (
      <div className="flex flex-col h-full justify-center items-center bg-card rounded-lg">
        <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
        <p className="text-muted-foreground">Your feedback has been saved.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow-sm ${
                msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isAiResponding && messages.length > 0 && (
          <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg shadow-sm bg-secondary text-secondary-foreground">
                ...
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : (isAiResponding ? "AI is thinking..." : "Type or click the mic...")}
            disabled={isAiResponding}
            className="w-full px-4 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-ring pr-20"
          />
          <div className="absolute right-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isAiResponding}
              className={`p-2 rounded-full transition-colors ${isListening ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground hover:bg-accent'}`}
            >
              <FiMic className="h-5 w-5" />
            </button>
            <button 
              type="submit"
              disabled={isAiResponding || !input.trim()}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <button 
            onClick={handleEndSession} 
            disabled={isAiResponding || messages.length < 2}
            className="text-xs text-muted-foreground hover:text-destructive disabled:text-border"
          >
            End Session & Save
          </button>
        </div>
      </div>
    </div>
  );
}