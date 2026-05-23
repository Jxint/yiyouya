import type { ChatMessage, Destination, DiaryEntry, Pet } from '../types';
import { imageService } from './imageService';

type CozeAction = 'start' | 'depart' | 'message' | 'next' | 'summarize';

type CozeAgentData = {
  greeting_bubble?: string;
  journal_content?: string;
  extracted_tags?: string[];
  image_prompt?: string;
  reply_text?: string;
  user_sentiment?: string;
  intimacy_bonus?: number;
  next_suggestion?: string;
  travel_plan?: string[] | string;
  image_url?: string;
};

type CozeAgentResponse = {
  success: boolean;
  action: CozeAction | string;
  data?: CozeAgentData | null;
  error?: string | null;
};

type AgentDestination = Destination & {
  cozeAgentRawOutput?: CozeAgentResponse[];
  cozeImagePrompt?: string;
};

const delay = (ms = 500) => new Promise((resolve) => window.setTimeout(resolve, ms));
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

let nextDiaryAction: Extract<CozeAction, 'depart' | 'next'> = 'depart';
let latestStartGreeting = '';

const normalizeTravelPlan = (travelPlan: CozeAgentData['travel_plan']): string[] | undefined => {
  if (Array.isArray(travelPlan)) return travelPlan.filter(Boolean);
  if (typeof travelPlan !== 'string') return undefined;
  return travelPlan
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
    .filter(Boolean);
};

const mergeTags = (destination: Destination, tags?: string[]) => {
  if (!tags?.length) return destination.tags;
  return Array.from(new Set([...destination.tags, ...tags.filter(Boolean)]));
};

const attachCozeOutput = (destination: Destination, output: CozeAgentResponse): Destination => {
  const current = destination as AgentDestination;
  current.cozeAgentRawOutput = [...(current.cozeAgentRawOutput ?? []), output];
  current.cozeImagePrompt = output.data?.image_prompt ?? current.cozeImagePrompt;
  current.tags = mergeTags(destination, output.data?.extracted_tags);
  return current;
};

const callCozeAgent = async (
  action: CozeAction,
  payload: Record<string, unknown>,
): Promise<CozeAgentResponse | undefined> => {
  try {
    const response = await fetch('/.netlify/functions/coze-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!response.ok) throw new Error(`Coze agent returned ${response.status}`);

    const result = (await response.json()) as CozeAgentResponse;
    if (!result.success || !result.data) throw new Error(result.error ?? 'Coze agent returned an empty response');
    return result;
  } catch (error) {
    console.warn(`[agentService] Coze ${action} failed; using mock fallback.`, error);
    return undefined;
  }
};

const fallbackTravelPlan = async (destination: Destination, pet: Pet): Promise<string[]> => {
  await delay();
  return [
    `${pet.name} 先抵达 ${destination.name}，确认天气和第一站路线。`,
    `寻找一个最能代表 ${destination.country} 当地气质的街区或自然景点。`,
    '给主人带回一段图文游记，并等待下一步指令。',
  ];
};

const fallbackDiaryEntry = async (destination: Destination, stopIndex: number): Promise<DiaryEntry> => {
  await delay(700);
  const imageUrl = imageService.getDiaryEntryImage(destination, stopIndex);
  return {
    id: createId('diary'),
    destinationId: destination.id,
    title: `${destination.name} 第 ${stopIndex} 站`,
    content: `宠物抵达了 ${destination.name} 的第 ${stopIndex} 个探索点。它记录下 ${destination.tags.join('、')} 的气息，并把这段体验整理成给主人看的小游记。`,
    imageUrl,
    createdAt: new Date().toISOString(),
  };
};

const fallbackReply = async (message: string, destination: Destination): Promise<ChatMessage> => {
  await delay(400);
  return {
    id: createId('msg'),
    role: 'pet',
    content: `我收到啦。关于“${message}”，我会在 ${destination.name} 的路上多留意一点，再把看到的细节带回来。`,
    createdAt: new Date().toISOString(),
  };
};

const fallbackSummary = async (text: string): Promise<string> => {
  await delay(300);
  if (!text.trim()) {
    return '偏好安静、有故事感、适合慢旅行的目的地。';
  }
  return `偏好总结：${text.trim()}。适合安排节奏舒缓、细节丰富的旅行。`;
};

export const agentService = {
  markNextDiaryAction(action: Extract<CozeAction, 'depart' | 'next'>) {
    nextDiaryAction = action;
  },

  consumeLatestStartGreeting(destination: Destination) {
    const greeting = latestStartGreeting || `我开始为 ${destination.name} 做出发准备了。`;
    latestStartGreeting = '';
    return greeting;
  },

  async generateTravelPlan(destination: Destination, pet: Pet): Promise<string[]> {
    const result = await callCozeAgent('start', { destination, pet });
    if (!result?.data) return fallbackTravelPlan(destination, pet);

    attachCozeOutput(destination, result);
    latestStartGreeting = result.data.greeting_bubble || result.data.reply_text || '';
    return normalizeTravelPlan(result.data.travel_plan) ?? fallbackTravelPlan(destination, pet);
  },

  async generateDiaryEntry(destination: Destination, stopIndex: number): Promise<DiaryEntry> {
    const action = nextDiaryAction;
    nextDiaryAction = 'next';
    const result = await callCozeAgent(action, { destination, stopIndex });
    if (!result?.data) return fallbackDiaryEntry(destination, stopIndex);

    attachCozeOutput(destination, result);
    const imageUrl = result.data.image_url?.trim() || imageService.getDiaryEntryImage(destination, stopIndex);
    return {
      id: createId('diary'),
      destinationId: destination.id,
      title: result.data.next_suggestion || `${destination.name} 第 ${stopIndex} 站`,
      content: result.data.journal_content || result.data.reply_text || (await fallbackDiaryEntry(destination, stopIndex)).content,
      imageUrl,
      createdAt: new Date().toISOString(),
    };
  },

  async replyToUserMessage(message: string, destination: Destination): Promise<ChatMessage> {
    const result = await callCozeAgent('message', { message, destination });
    if (!result?.data) return fallbackReply(message, destination);

    attachCozeOutput(destination, result);
    return {
      id: createId('msg'),
      role: 'pet',
      content: result.data.reply_text || result.data.next_suggestion || (await fallbackReply(message, destination)).content,
      createdAt: new Date().toISOString(),
    };
  },

  async summarizePreferences(text: string): Promise<string> {
    const result = await callCozeAgent('summarize', { text });
    if (!result?.data) return fallbackSummary(text);
    return result.data.reply_text || result.data.journal_content || fallbackSummary(text);
  },
};
