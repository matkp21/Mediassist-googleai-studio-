export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp?: number;
}

export interface CompactionResult {
  compactedHistory: ChatMessage[];
  summary: string;
}

export class ContextCompactor {
  private maxTokens: number;
  private retainLastNTurns: number;

  constructor(maxTokens: number = 4000, retainLastNTurns: number = 4) {
    this.maxTokens = maxTokens;
    this.retainLastNTurns = retainLastNTurns;
  }

  /**
   * Estimates token count for a string (rough approximation: 4 chars per token).
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Compacts the chat history if it exceeds the token limit.
   * In a real implementation, this would call the LLM to summarize the older messages.
   * Here we simulate the compaction logic.
   * 
   * @param history The full chat history.
   * @param currentSummary The existing summary of previous compactions.
   * @returns CompactionResult containing the new history and updated summary.
   */
  public async compact(history: ChatMessage[], currentSummary: string = ''): Promise<CompactionResult> {
    const totalTokens = history.reduce((acc, msg) => acc + this.estimateTokens(msg.content), 0);

    if (totalTokens <= this.maxTokens || history.length <= this.retainLastNTurns) {
      return { compactedHistory: history, summary: currentSummary };
    }

    // Separate history into "to summarize" and "to retain"
    const splitIndex = history.length - this.retainLastNTurns;
    const toSummarize = history.slice(0, splitIndex);
    const toRetain = history.slice(splitIndex);

    // TODO: Call LLM to generate a real summary of `toSummarize` combined with `currentSummary`.
    // For now, we create a placeholder summary.
    const newSummary = `[Compacted Summary of ${toSummarize.length} older messages] ${currentSummary}`;

    // The new history starts with a system message containing the summary, followed by the retained turns.
    const compactedHistory: ChatMessage[] = [
      {
        role: 'system',
        content: `Previous conversation summary: ${newSummary}`,
      },
      ...toRetain
    ];

    return {
      compactedHistory,
      summary: newSummary
    };
  }
}
