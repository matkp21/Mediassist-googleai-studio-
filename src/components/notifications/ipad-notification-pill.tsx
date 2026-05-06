'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, iPadNotification } from '@/contexts/notification-context';
import { Bell, CheckCircle2, AlertCircle, Info, Stethoscope, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function IPadNotificationPill() {
  const { activeNotification, hideActiveNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Reset expanded state when a new notification comes in, unless currently hovering
  useEffect(() => {
    if (activeNotification && !isHovered) {
      setIsExpanded(false);
    }
  }, [activeNotification]);

  if (!activeNotification) return null;

  const IconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    clinical: <Stethoscope className="w-5 h-5 text-purple-500" />,
    system: <Bell className="w-5 h-5 text-gray-500" />
  };

  const notificationIcon = IconMap[activeNotification.type || 'info'];

  const handleActionClick = () => {
    if (activeNotification.actionUrl) {
      router.push(activeNotification.actionUrl);
    }
    hideActiveNotification();
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ y: -40, opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
            className="pointer-events-auto"
            onMouseEnter={() => {
              setIsHovered(true);
              setIsExpanded(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsExpanded(false);
            }}
          >
            {/* iPadOS Style Pill Container */}
            <motion.div 
              layout
              className={cn(
                "relative overflow-hidden bg-black/80 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-300",
                isExpanded ? "rounded-[32px] w-[360px]" : "rounded-full w-max min-w-[200px] max-w-[320px]"
              )}
            >
              <div className="relative z-10 w-full">
                
                {/* Collapsed State (Pill) */}
                <motion.div 
                  layout
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer",
                    isExpanded && "border-b border-white/10"
                  )}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <div className="shrink-0">{notificationIcon}</div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-semibold text-white truncate">
                      {activeNotification.title}
                    </p>
                    {!isExpanded && activeNotification.message && (
                      <p className="text-xs text-white/60 truncate mt-0.5">
                        {activeNotification.message}
                      </p>
                    )}
                  </div>
                  {!isExpanded && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        hideActiveNotification();
                      }}
                      className="shrink-0 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>

                {/* Expanded State (Card) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      key="expanded-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 pt-3 flex flex-col gap-3"
                    >
                      <p className="text-sm text-white/80 leading-relaxed text-pretty">
                        {activeNotification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-white/40 font-mono">
                          {activeNotification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>

                        <div className="flex gap-2">
                          <button 
                            onClick={hideActiveNotification}
                            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                          >
                            Dismiss
                          </button>
                          
                          {(activeNotification.actionLabel || activeNotification.actionUrl) && (
                            <button 
                              onClick={handleActionClick}
                              className="px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              {activeNotification.actionLabel || 'View Details'}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
              
              {/* Subtle ambient glow behind based on type */}
              <div className={cn(
                "absolute inset-0 opacity-20 blur-xl mix-blend-screen pointer-events-none transition-opacity duration-300",
                activeNotification.type === 'success' && "bg-green-500",
                activeNotification.type === 'error' && "bg-rose-500",
                activeNotification.type === 'warning' && "bg-amber-500",
                activeNotification.type === 'info' && "bg-blue-500",
                activeNotification.type === 'clinical' && "bg-purple-500",
              )} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
