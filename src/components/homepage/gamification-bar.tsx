"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export function GamificationBar() {
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [rank, setRank] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load local stats
    const statsStr = localStorage.getItem("medi_gamification_stats");
    if (statsStr) {
      try {
        const stats = JSON.parse(statsStr);
        setStreak(stats.streak || 1);
        setBadges(stats.badges || 0);
        setLevel(stats.level || 1);
        setProgress(stats.progress || 0);
        setRank(stats.rank || 3);
      } catch(e) {}
    } else {
      setStreak(14);
      setBadges(24);
      setLevel(12);
      setProgress(68);
      setRank(3);
      localStorage.setItem("medi_gamification_stats", JSON.stringify({
        streak: 14, badges: 24, level: 12, progress: 68, rank: 3
      }));
    }
    
    // Check daily streak
    const lastLogin = localStorage.getItem("medi_last_login_date");
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          setStreak(s => {
            const newS = s + 1;
            updateStats({ streak: newS });
            return newS;
          });
        } else if (diffDays > 1) {
          setStreak(1);
          updateStats({ streak: 1 });
        }
      } else {
          // If no last login, assume it's Day 14 as per old design base
          localStorage.setItem("medi_last_login_date", today);
      }
      localStorage.setItem("medi_last_login_date", today);
    }
  }, []);

  const updateStats = (newData: any) => {
    const prev = JSON.parse(localStorage.getItem("medi_gamification_stats") || "{}");
    localStorage.setItem("medi_gamification_stats", JSON.stringify({ ...prev, ...newData }));
  }

  // Handle click to manually progress for interactivity
  const handleProgress = () => {
    let p = progress + 15;
    let l = level;
    let b = badges;
    let r = rank;
    if (p >= 100) {
      p = p - 100;
      l += 1;
      b += 1; // Gain a badge on level up
      r = Math.max(1, r - 1); // Rank goes up
    }
    setProgress(p);
    setLevel(l);
    setBadges(b);
    setRank(r);
    updateStats({ progress: p, level: l, badges: b, rank: r });
  }

  if (!mounted) return null;

  return (
    <div 
      className="glass-card rounded-[20px] p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 cursor-pointer hover:bg-[var(--fill2)] transition-colors shadow-[var(--shm)] hover:shadow-[var(--shl)]"
      onClick={handleProgress}
      title="Tap to gain experience points!"
    >
      <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide py-1">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-[14px] font-bold text-[var(--lb)]">{streak}-day streak</div>
          </div>
        </div>
        <div className="w-px h-8 bg-[var(--sep)] hidden md:block"></div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f59e0b] to-[#d97706] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
            <span className="font-bold text-[12px]">#{rank}</span>
          </div>
          <div>
            <div className="text-[13px] font-bold text-[var(--lb)] whitespace-nowrap">Kerala Rank</div>
          </div>
        </div>
        <div className="w-px h-8 bg-[var(--sep)] hidden md:block"></div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-[var(--fill)] border border-[var(--sep)] flex items-center justify-center">
            <Star size={14} className="text-[#a07df0]" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[var(--lb)] whitespace-nowrap">{badges} Badges</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full md:max-w-[180px] gap-1.5 flex-shrink-0 relative overflow-hidden">
        <div className="flex items-center justify-between z-10 relative">
          <span className="text-[12px] font-bold text-[var(--lb)]">Level {level}</span>
          <span className="text-[11px] font-mono text-[var(--ter)]">{progress}% to Next</span>
        </div>
        <div className="w-full h-2 rounded-full border border-[var(--sep)] bg-[var(--fill)] overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--blue)] to-[var(--pur)] rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
