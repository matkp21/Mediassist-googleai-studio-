// src/lib/think-segments.ts

export interface ThinkSegment {
  type: 'text' | 'thinking';
  content: string;
}

/**
 * Parses assistant content string into alternating text and thinking segments.
 * Recognizes <think>...</think> or <|thinking|>...<|end_thinking|> blocks.
 */
export function parseModelThinkingSegments(content: string): ThinkSegment[] {
  if (typeof content !== 'string') return [{ type: 'text', content: '' }];

  const segments: ThinkSegment[] = [];
  const regex = /(<think>[\s\S]*?<\/think>|<\|thinking\|>[\s\S]*?<\|end_thinking\|>)/g;
  
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add preceding text segment if any
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Extract thinking content
    let thinkingContent = match[0];
    if (thinkingContent.startsWith('<think>')) {
      thinkingContent = thinkingContent.replace(/^<think>/, '').replace(/<\/think>$/, '');
    } else if (thinkingContent.startsWith('<|thinking|>')) {
      thinkingContent = thinkingContent.replace(/^<\|thinking\|>/, '').replace(/<\|end_thinking\|>$/, '');
    }

    segments.push({
      type: 'thinking',
      content: thinkingContent.trim()
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text segment if any
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  // Handle case where no matches were found
  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return segments;
}
