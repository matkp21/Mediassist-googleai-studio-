"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Activity, Trophy, Shield, Star, Search, Flame, 
  MessageSquare, Heart, Bookmark, Share2, Download, 
  CheckCircle2, Clock, Check, Medal, Target, BrainCircuit, Play, 
  SendHorizonal, Award, Lock, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Dummy Data ---
const categoryTags = ["Notes", "Diagram", "MCQs", "Mnemonic", "Flowchart", "PYQ"];

const initialPosts = [
  { id: 1, author: "Anjali S.", avatar: "A", verified: true, time: "2h ago", tag: "Notes", title: "Complete Pathology Snippets - Neoplasia", preview: "I've compressed the entire ROBBINS neoplasia chapter into 14 high-yield pages with diagrams. Covers all tumor markers and genetics that repeatedly show up in finals.", likes: 342, comments: 45, downloads: 890, tags: ["Pathology", "MBBS", "Robbins"] },
  { id: 2, author: "Rahul M.", avatar: "R", verified: true, time: "5h ago", tag: "Flowchart", title: "Shock Management Algorithm", preview: "Easy-to-remember flowchart for differentiating and managing Hypovolemic vs Cardiogenic vs Septic vs Neurogenic shock. Updated to latest ATLS guidelines.", likes: 215, comments: 18, downloads: 410, tags: ["Surgery", "ATLS", "Shock"] },
  { id: 3, author: "Priya K.", avatar: "P", verified: true, time: "Yesterday", tag: "PYQ", title: "Ophthalmology 10-Year PYQ Compilation", preview: "Sorted all short notes and long essay questions from MedVarsity past 10 years chapter-wise. Included high-probability ones for this year.", likes: 580, comments: 82, downloads: 1205, tags: ["Ophthalmology", "PYQ", "Finals"] },
  { id: 4, author: "Sneha R.", avatar: "S", verified: true, time: "2 days ago", tag: "Mnemonic", title: "Cranial Nerves Foramina", preview: "The ONLY mnemonic you will ever need to remember which cranial nerve exits through which foramen. 'Standing Room Only' applied perfectly.", likes: 890, comments: 120, downloads: 2300, tags: ["Anatomy", "Neuro", "Mnemonics"] }
];

const challengesData = [
  { id: 1, live: true, title: "Ophthalmology Speed Round", reward: "₹5,000 + 20,000 XP", participants: 1420, timeInfo: "Live Now", bg: "from-blue-500/10 to-blue-500/5", color: "text-blue-500", border: "border-blue-500/20" },
  { id: 2, live: false, title: "Pharmacology Boss Battle", reward: "₹2,500 + 10,000 XP", participants: 850, timeInfo: "Starts in 2h", bg: "from-purple-500/10 to-purple-500/5", color: "text-purple-500", border: "border-purple-500/20" },
  { id: 3, live: false, title: "Clinical Diagnosis Duel", reward: "10,000 XP", participants: 620, timeInfo: "Starts in 5h", bg: "from-amber-500/10 to-amber-500/5", color: "text-amber-500", border: "border-amber-500/20" },
  { id: 4, live: false, title: "Anatomy Blitz", reward: "10,000 XP", participants: 415, timeInfo: "Starts tomorrow", bg: "from-emerald-500/10 to-emerald-500/5", color: "text-emerald-500", border: "border-emerald-500/20" }
];

const leaderboardData = [
  { rank: 1, name: "Arjun K.", avatar: "A", points: "154,200 XP", streak: 42, level: 35, medal: "🥇", highlight: "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500" },
  { rank: 2, name: "Neha S.", avatar: "N", points: "148,500 XP", streak: 38, level: 34, medal: "🥈", highlight: "bg-gradient-to-r from-slate-400/10 to-transparent border-l-2 border-slate-400" },
  { rank: 3, name: "Vikram R.", avatar: "V", points: "142,100 XP", streak: 31, level: 32, medal: "🥉", highlight: "bg-gradient-to-r from-amber-600/10 to-transparent border-l-2 border-amber-600" },
  { rank: 4, name: "Mathew K.", avatar: "M", points: "138,500 XP", streak: 28, level: 31, isYou: true },
  { rank: 5, name: "Pooja V.", avatar: "P", points: "135,200 XP", streak: 25, level: 30 },
  { rank: 6, name: "Kunal D.", avatar: "K", points: "128,900 XP", streak: 21, level: 28 },
  { rank: 7, name: "Aditi M.", avatar: "A", points: "125,400 XP", streak: 19, level: 27 },
];

const badgesData = [
  { id: 1, title: "First Blood", desc: "Completed first case", icon: Star, earned: true, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { id: 2, title: "Bookworm", desc: "Read 50 notes", icon: BookOpen, earned: true, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 3, title: "Diagnostician", desc: "Perfect diagnosis x5", icon: Shield, earned: true, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 4, title: "Anatomy Ace", desc: "100% on anatomy quiz", icon: Activity, earned: true, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 5, title: "Pharmacologist", desc: "Passed pharma boss", icon: CheckCircle2, earned: true, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: 6, title: "Streak Master", desc: "14 day streak", icon: Flame, earned: true, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 7, title: "Clinician", desc: "10 clinical simulations", icon: Heart, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
  { id: 8, title: "Top 10%", desc: "Reach top 10% on LB", icon: Trophy, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
  { id: 9, title: "Contributor", desc: "100+ downloads on posts", icon: Download, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
  { id: 10, title: "Social Butterfly", desc: "50+ comments given", icon: MessageSquare, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
  { id: 11, title: "Sharpshooter", desc: "100 MCQs in a row", icon: Target, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
  { id: 12, title: "Neural Link", desc: "Used all StudyBot tools", icon: BrainCircuit, earned: false, color: "text-gray-400", bg: "bg-[var(--fill)]" },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("Feed");
  const [posts, setPosts] = useState(initialPosts);
  const [composerText, setComposerText] = useState("");
  const [selectedTag, setSelectedTag] = useState("Notes");
  
  // Interactions
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());
  const [joinedChallenges, setJoinedChallenges] = useState<Set<number>>(new Set());

  const handlePost = () => {
    if (!composerText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: "Mathew K.",
      avatar: "M",
      verified: true,
      time: "Just now",
      tag: selectedTag,
      title: "Community Shared Update",
      preview: composerText,
      likes: 0,
      comments: 0,
      downloads: 0,
      tags: [selectedTag, "Update"]
    };
    setPosts([newPost, ...posts]);
    setComposerText("");
  };

  const toggleLike = (id: number) => {
    const next = new Set(likedPosts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedPosts(next);
  };

  const toggleSave = (id: number) => {
    const next = new Set(savedPosts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedPosts(next);
  };

  const toggleChallenge = (id: number) => {
    const next = new Set(joinedChallenges);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setJoinedChallenges(next);
  };

  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden pt-6 pb-32 px-4 md:px-10">
      
      {/* --- Header & Live Stats Strip --- */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <h1 className="text-[36px] md:text-[44px] leading-tight tracking-tight flex items-baseline mb-3 font-serif">
          Community Hub
        </h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[13px] md:text-[14px] text-[var(--sec)] font-medium">
          <div className="flex items-center gap-1.5"><Users size={16} className="text-blue-500" /> 12,480 members</div>
          <div className="w-1 h-1 rounded-full bg-[var(--sep3)]" />
          <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-purple-500" /> 4,820 notes shared</div>
          <div className="w-1 h-1 rounded-full bg-[var(--sep3)]" />
          <div className="flex items-center gap-1.5"><Activity size={16} className="text-emerald-500" /> <span className="flex h-2 w-2 relative mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>284 active now</div>
          <div className="w-1 h-1 rounded-full bg-[var(--sep3)] hidden sm:block" />
          <div className="flex items-center gap-1.5 hidden sm:flex"><Target size={16} className="text-rose-500" /> 16 live challenges</div>
          <div className="w-1 h-1 rounded-full bg-[var(--sep3)] hidden sm:block" />
          <div className="flex items-center gap-1.5 hidden sm:flex"><Star size={16} className="text-yellow-500" /> 2.4M XP awarded</div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* --- Main Content Area --- */}
        <div className="flex-1 min-w-0">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide border-b border-[var(--sep)] pb-2">
            {["Feed", "Challenges", "Leaderboard", "Badges"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-[var(--lb)] text-[var(--s0)] shadow-md" 
                    : "text-[var(--sec)] hover:bg-[var(--fill2)] hover:text-[var(--lb)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[600px] mb-8">
            <AnimatePresence mode="wait">
              {/* 1. FEED TAB */}
              {activeTab === "Feed" && (
                <motion.div key="Feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                
                {/* Composer */}
                <div className="glass-card rounded-[24px] p-5 border border-[var(--glBorder)] shadow-[var(--shm)] relative overflow-hidden">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center flex-shrink-0">M</div>
                    <div className="flex-1">
                      <textarea
                        value={composerText}
                        onChange={(e) => setComposerText(e.target.value)}
                        placeholder="Share high-yield notes, mnemonics, or PYQs with the community..."
                        className="w-full bg-transparent resize-none outline-none text-[15px] text-[var(--lb)] placeholder:text-[var(--ter)] min-h-[80px]"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
                        {categoryTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors border",
                              selectedTag === tag
                                ? "bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/30"
                                : "bg-[var(--fill)] text-[var(--sec)] border-[var(--sep)] hover:bg-[var(--fill2)]"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <button className="text-[var(--ter)] hover:text-[var(--blue)] transition-colors"><Bookmark size={18} /></button>
                        </div>
                        <button 
                          onClick={handlePost}
                          disabled={!composerText.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--blue)] text-white font-bold text-[14px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                        >
                          Share <SendHorizonal size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-5">
                  {posts.map((post) => {
                    const isLiked = likedPosts.has(post.id);
                    const isSaved = savedPosts.has(post.id);
                    
                    return (
                    <div key={post.id} className="glass-card rounded-[24px] p-5 border border-[var(--sep)] shadow-[var(--shs)] hover:shadow-[var(--shm)] transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center flex-shrink-0 relative">
                            {post.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[15px]">{post.author}</span>
                              {post.verified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />}
                            </div>
                            <div className="text-[12px] text-[var(--ter)] font-mono">{post.time}</div>
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-[var(--fill2)] text-[var(--sec)] text-[12px] font-bold tracking-tight uppercase">
                          {post.tag}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-[18px] mb-2 text-[var(--lb)]">{post.title}</h3>
                      <p className="text-[14.5px] text-[var(--sec)] leading-relaxed mb-4">{post.preview}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-5">
                        {post.tags.map(t => (
                          <span key={t} className="text-[12px] text-[var(--blue)] font-medium">#{t}</span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--sep)]">
                        <div className="flex items-center gap-5">
                          <button onClick={() => toggleLike(post.id)} className={cn("flex items-center gap-1.5 text-[14px] font-medium transition-colors hover:text-rose-500", isLiked ? "text-rose-500" : "text-[var(--sec)]")}>
                            <Heart size={18} className={isLiked ? "fill-rose-500" : ""} /> {post.likes + (isLiked ? 1 : 0)}
                          </button>
                          <button className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--sec)] hover:text-[var(--blue)] transition-colors">
                            <MessageSquare size={18} /> {post.comments}
                          </button>
                          <button onClick={() => toggleSave(post.id)} className={cn("flex items-center gap-1.5 text-[14px] font-medium transition-colors hover:text-amber-500", isSaved ? "text-amber-500" : "text-[var(--sec)]")}>
                            <Bookmark size={18} className={isSaved ? "fill-amber-500" : ""} />
                          </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--fill)] hover:bg-[var(--fill2)] text-[var(--sec)] hover:text-[var(--lb)] text-[13px] font-bold transition-all border border-[var(--sep)]">
                          <Download size={14} /> Download PDF
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </motion.div>
            )}

              {/* 2. CHALLENGES TAB */}
              {activeTab === "Challenges" && (
                <motion.div key="Challenges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                
                {/* Prize Banner */}
                <div className="relative overflow-hidden rounded-[24px] p-6 glass-card border border-[var(--glBorder)] shadow-[var(--shm)] flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent z-0"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 flex-shrink-0 animate-pulse">
                      <Trophy size={28} />
                    </div>
                    <div>
                      <div className="text-[12px] font-mono font-bold tracking-widest text-[#f59e0b] uppercase mb-1">Weekly Prize Pool</div>
                      <div className="text-[28px] md:text-[32px] font-bold text-[var(--lb)] leading-none mb-1 tracking-tight drop-shadow-sm">₹10,000 + 50,000 XP</div>
                      <div className="text-[14px] text-[var(--sec)]">Compete in live challenges to climb the leaderboard and win.</div>
                    </div>
                  </div>
                  <button className="relative z-10 whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all w-full sm:w-auto">
                    View Rules
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {challengesData.map(ch => {
                    const isJoined = joinedChallenges.has(ch.id);
                    return (
                    <div key={ch.id} className={cn("glass-card rounded-[24px] p-5 border shadow-[var(--shs)] flex flex-col justify-between h-full bg-gradient-to-br transition-shadow hover:shadow-[var(--shm)]", ch.bg, ch.border)}>
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm", ch.color)}>
                            {ch.live && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span></span>}
                            {ch.live ? "LIVE" : "UPCOMING"}
                          </div>
                          <div className="flex items-center gap-1 text-[var(--sec)] text-[12px] font-medium bg-[var(--fill)] px-2 py-1 rounded-md">
                            <Users size={12} /> {ch.participants}
                          </div>
                        </div>
                        <h3 className="text-[20px] font-bold leading-tight mb-2 text-[var(--lb)] pr-4">{ch.title}</h3>
                        <div className="flex items-center gap-2 text-[14px] font-semibold text-amber-500 mb-6 drop-shadow-sm">
                          <Award size={16} /> {ch.reward}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-[13px] font-mono text-[var(--ter)]">{ch.timeInfo}</div>
                        <button 
                          onClick={() => toggleChallenge(ch.id)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center min-w-[100px]",
                            isJoined 
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                              : "bg-[var(--lb)] text-[var(--s0)] shadow-md hover:opacity-90"
                          )}
                        >
                          {isJoined ? <><Check size={16} className="mr-1.5"/> Joined</> : "Join"}
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              </motion.div>
            )}

              {/* 3. LEADERBOARD TAB */}
              {activeTab === "Leaderboard" && (
                <motion.div key="Leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                 <div className="glass-card rounded-[24px] overflow-hidden border border-[var(--sep)] shadow-[var(--shm)]">
                   <div className="p-4 border-b border-[var(--sep)] flex justify-between items-center bg-[var(--fill)]/50">
                     <h2 className="font-bold text-[18px] flex items-center gap-2"><Trophy size={20} className="text-yellow-500"/> Kerala State Leaderboard</h2>
                     <span className="text-[12px] font-mono text-[var(--sec)]">Resets in 2d 14h</span>
                   </div>
                   
                   <div className="divide-y divide-[var(--sep)]">
                     {leaderboardData.map((row) => (
                       <div key={row.rank} className={cn("p-4 flex items-center gap-4 transition-colors hover:bg-[var(--fill)]", row.highlight, row.isYou && "bg-[var(--blue)]/5 border-l-2 border-blue-500")}>
                         <div className="w-8 flex justify-center text-[16px] font-bold text-[var(--ter)]">
                           {row.medal || `#${row.rank}`}
                         </div>
                         <div className="relative">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
                             {row.avatar}
                           </div>
                           {row.rank === 1 && <div className="absolute -inset-1 border-2 border-yellow-400 rounded-full animate-pulse opacity-50"></div>}
                         </div>
                         <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-[15px]">{row.name}</span>
                             {row.isYou && <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 text-[10px] font-bold uppercase tracking-wider">You</span>}
                           </div>
                           <div className="text-[12px] text-[var(--sec)] font-medium flex items-center gap-3">
                             <span className="flex items-center gap-0.5"><Flame size={12} className="text-orange-500"/> {row.streak} days</span>
                             <span>Lvl {row.level}</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-[15px] text-[var(--lb)]">{row.points}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   {/* Overtake progress bar */}
                   <div className="p-4 bg-[var(--fill2)] border-t border-[var(--sep)]">
                     <div className="flex justify-between text-[12px] mb-2 font-medium">
                       <span className="text-[var(--sec)]">Your Progress</span>
                       <span className="text-blue-500 font-bold">87% to overtake #3</span>
                     </div>
                     <div className="h-2 w-full bg-[var(--fill)] rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-[87%] rounded-full relative">
                         <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse"></div>
                       </div>
                     </div>
                   </div>
                 </div>
              </motion.div>
            )}

              {/* 4. BADGES TAB */}
              {activeTab === "Badges" && (
                <motion.div key="Badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                
                {/* Next Badge Card */}
                <div className="glass-card rounded-[24px] p-6 border border-[var(--glBorder)] shadow-[var(--shm)] relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[60px] pointer-events-none"></div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20 flex-shrink-0 relative z-10">
                     <Heart size={36} className="drop-shadow-md" />
                  </div>
                  <div className="flex-1 relative z-10 w-full">
                    <div className="text-[12px] font-mono font-bold tracking-widest text-[#f43f5e] uppercase mb-1">Next Badge to Earn</div>
                    <div className="text-[22px] font-bold text-[var(--lb)] mb-1">Clinician</div>
                    <p className="text-[14px] text-[var(--sec)] mb-4">Complete 10 clinical simulations flawlessly.</p>
                    <div className="flex justify-between text-[13px] mb-2 font-bold">
                       <span className="text-[var(--lb)]">6 / 10 completed</span>
                       <span className="text-rose-500">60%</span>
                    </div>
                    <div className="h-2.5 w-full bg-[var(--fill)] border border-[var(--sep)] rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-rose-500 to-red-500 w-[60%] rounded-full relative overflow-hidden">
                         <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] w-10 -ml-10 animate-[shimmer_2s_infinite]"></div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {badgesData.map(badge => (
                    <div key={badge.id} className={cn("glass-card rounded-[20px] p-5 flex flex-col items-center text-center border transition-all", badge.earned ? "border-[var(--sep)] shadow-[var(--shs)] hover:-translate-y-1 hover:shadow-[var(--shm)]" : "border-dashed border-[var(--sep2)] opacity-70 grayscale")}>
                      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mb-3", badge.bg)}>
                        {badge.earned ? <badge.icon size={28} className={badge.color} /> : <Lock size={24} className="text-gray-400" />}
                      </div>
                      <h4 className="font-bold text-[14px] text-[var(--lb)] mb-1">{badge.title}</h4>
                      <p className="text-[11px] text-[var(--sec)] font-medium leading-tight">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Right Sidebar --- */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          
          {/* Top 5 Mini Leaderboard */}
          <div className="glass-card rounded-[24px] p-5 border border-[var(--sep)] shadow-[var(--shs)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[16px] flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Top 5</h3>
              <button onClick={() => setActiveTab("Leaderboard")} className="text-[12px] font-bold text-blue-500 hover:text-blue-600">See all</button>
            </div>
            <div className="space-y-3">
              {leaderboardData.slice(0, 5).map(row => (
                <div key={row.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-bold text-[var(--ter)] w-4">{row.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-[var(--fill)] flex items-center justify-center text-[12px] font-bold">
                      {row.avatar}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold leading-tight">{row.name}</div>
                      <div className="text-[11px] text-[var(--sec)]">{row.points}</div>
                    </div>
                  </div>
                  {row.isYou && <span className="bg-blue-500/20 text-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">You</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Live Challenges Preview */}
          <div className="glass-card rounded-[24px] p-5 border border-[var(--sep)] shadow-[var(--shs)]">
            <h3 className="font-bold text-[16px] flex items-center gap-2 mb-4"><Target size={16} className="text-rose-500"/> Live Challenges</h3>
            <div className="space-y-4">
              {challengesData.filter(c => c.live).map(ch => (
                <div key={ch.id} className="p-3 bg-[var(--fill)] rounded-xl border border-[var(--sep)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>Live</span>
                      <span className="text-[11px] text-[var(--sec)] font-mono">{ch.participants} const.</span>
                    </div>
                    <div className="font-bold text-[14px] mb-2">{ch.title}</div>
                    <button onClick={() => setActiveTab("Challenges")} className="w-full py-2 bg-[var(--lb)] text-[var(--s0)] rounded-lg text-[12px] font-bold hover:opacity-90 transition-opacity">Join Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Stats Panel */}
          <div className="glass-card rounded-[24px] p-5 border border-[var(--sep)] shadow-[var(--shs)]">
            <h3 className="font-bold text-[16px] flex items-center gap-2 mb-4"><Activity size={16} className="text-emerald-500"/> My Stats</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[var(--fill)] rounded-xl p-3 flex flex-col justify-center border border-[var(--sep)]">
                <span className="text-[11px] text-[var(--sec)] font-medium mb-1">Shared</span>
                <span className="text-[20px] font-bold">14</span>
              </div>
              <div className="bg-[var(--fill)] rounded-xl p-3 flex flex-col justify-center border border-[var(--sep)]">
                <span className="text-[11px] text-[var(--sec)] font-medium mb-1">Downloads</span>
                <span className="text-[20px] font-bold">482</span>
              </div>
              <div className="bg-[var(--fill)] rounded-xl p-3 flex flex-col justify-center border border-[var(--sep)]">
                <span className="text-[11px] text-[var(--sec)] font-medium mb-1">Challenges</span>
                <span className="text-[20px] font-bold">8</span>
              </div>
              <div className="bg-[var(--fill)] rounded-xl p-3 flex flex-col justify-center border border-[var(--sep)]">
                <span className="text-[11px] text-[var(--sec)] font-medium mb-1">Total Rank</span>
                <span className="text-[20px] font-bold text-yellow-500">#4</span>
              </div>
            </div>
          </div>

          {/* Verified Contributors */}
          <div className="glass-card rounded-[24px] p-5 border border-[var(--sep)] shadow-[var(--shs)]">
            <h3 className="font-bold text-[16px] flex items-center gap-2 mb-4"><Shield size={16} className="text-purple-500"/> Verified Mentors</h3>
            <div className="flex -space-x-3 mt-2">
              {['A', 'P', 'R', 'S', 'M'].map((letter, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--s0)] bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-[14px] shadow-sm transform hover:-translate-y-1 transition-transform relative z-10 cursor-pointer">
                  {letter}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[var(--s0)] bg-[var(--fill2)] text-[var(--sec)] flex items-center justify-center font-bold text-[12px] z-0 cursor-pointer">
                +12
              </div>
            </div>
            <p className="text-[12px] text-[var(--ter)] mt-3">Verified contributors have proven high-yield impact. Tap to follow.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
