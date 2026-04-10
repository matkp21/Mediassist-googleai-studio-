
// src/app/chat/page.tsx
"use client"; 

import { useState, useEffect } from 'react'; 
import { ChatInterface } from '@/components/chat/chat-interface';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ChatInterfaceAnimation } from '@/components/chat/chat-interface-animation'; 
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const [showAnimation, setShowAnimation] = useState(true); 
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Logic for showing animation once per session (optional)
    // const animationShown = sessionStorage.getItem('chatAnimationShown');
    // if (animationShown) {
    //   setShowAnimation(false);
    // } else {
    //   sessionStorage.setItem('chatAnimationShown', 'true');
    // }
  }, []);


  if (!isClient) {
    return (
      <PageWrapper title="Loading Chat..." className="flex-1 flex flex-col h-full p-0 sm:p-0">
        <div className="flex-1 flex flex-col h-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (showAnimation) {
    return <ChatInterfaceAnimation onAnimationComplete={() => setShowAnimation(false)} />;
  }

  return (
    <PageWrapper title="MediAssistant Chat" className="flex-1 flex flex-col h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,0rem))] p-0 sm:p-0">
      <div className="flex-1 flex flex-col h-full p-2 sm:p-4">
         <ChatInterface />
      </div>
    </PageWrapper>
  );
}
