"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { getSmartSearchSuggestions } from "@/ai/agents/medico/SmartSearchAgent";

export function SmartSearchInput() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await getSmartSearchSuggestions({ query });
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Autocomplete error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    // Ideally, invoke a search or navigation routine here.
  };

  return (
    <div className="relative w-full max-w-sm" ref={wrapperRef}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Smart Search (Lightning fast...)"
        className="w-full bg-background pl-9 pr-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
      />
      {isLoading && (
        <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
      )}
      
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-11 left-0 w-full bg-card border shadow-md rounded-md z-50 overflow-hidden">
          <ul className="flex flex-col text-sm">
            {suggestions.map((suggestion, idx) => (
              <li 
                key={idx} 
                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search className="h-3 w-3 text-muted-foreground" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}