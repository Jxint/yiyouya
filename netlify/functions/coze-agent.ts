import { getCozeConfig } from './coze-config';

type CozeAction = 'start' | 'depart' | 'message' | 'next' | 'summarize' | string;

type CozeAgentData = {
  greeting_bubble: string;
  journal_content: string;
  extracted_tags: string[];
  image_prompt: string;
  reply_text: string;
  user_sentiment: string;
  intimacy_bonus: number;
  next_suggestion: string;
  travel_plan: string[];
  image_url: string;
};

type HandlerEvent = {
  httpMethod: string;
  body: string | null;
};

type HandlerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const emptyData = (): CozeAgentData => ({
  greeting_bubble: '',
  journal_content: '',
  extracted_tags: [],
  image_prompt: '',
  reply_text: '',
  user_sentiment: '',
  intimacy_bonus: 0,
  next_suggestion: '',
  travel_plan: [],
  image_url: '',
});

const jsonResponse = (statusCode: number, action: CozeAction, data: CozeAgentData, error: string | null): HandlerResponse => ({
  statusCode,
  headers,
  body: JSON.stringify({
    success: !error,
    action,
    data,
    error,
  }),
});

const parseJsonObject = (value: unknown): Record<string, unknown> => {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== 'string') return {};

  try {
    const parsed = JSON.parse(value);
    return parseJsonObject(parsed);
  } catch {
    return { reply_text: value };
  }
};

const stringValue = (value: unknown) => (typeof value === 'string' ? value : '');
const numberValue = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const tagsValue = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  if (typeof value === 'string') {
    return value
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const planValue = (value: unknown) => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()));
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeCozeData = (rawPayload: unknown): CozeAgentData => {
  const payload = parseJsonObject(rawPayload);
  const nestedData = parseJsonObject(payload.data);
  const output = parseJsonObject(payload.output);
  const source = { ...payload, ...nestedData, ...output };

  return {
    greeting_bubble: stringValue(source.greeting_bubble),
    journal_content: stringValue(source.journal_content),
    extracted_tags: tagsValue(source.extracted_tags),
    image_prompt: stringValue(source.image_prompt),
    reply_text: stringValue(source.reply_text),
    user_sentiment: stringValue(source.user_sentiment),
    intimacy_bonus: numberValue(source.intimacy_bonus),
    next_suggestion: stringValue(source.next_suggestion),
    travel_plan: planValue(source.travel_plan),
    image_url: stringValue(source.image_url),
  };
};

const buildWorkflowParameters = (body: Record<string, unknown>, action: CozeAction) => ({
  action,
  session_id: body.session_id ?? body.sessionId ?? '',
  user_id: body.user_id ?? body.userId ?? '',
  destination: body.destination ?? null,
  current_location: body.current_location ?? body.currentLocation ?? '',
  pet_type: body.pet_type ?? body.petType ?? '',
  pet: body.pet ?? null,
  userPreferences: body.userPreferences ?? body.preferences ?? '',
  historySummary: body.historySummary ?? '',
  user_message: body.user_message ?? body.userMessage ?? body.message ?? '',
  stopIndex: body.stopIndex ?? null,
});

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  let action: CozeAction = 'unknown';
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, action, emptyData(), 'Only POST is supported.');
  }

  try {
    const body = parseJsonObject(event.body);
    action = stringValue(body.action) || 'unknown';

    const { apiToken, workflowId, workflowRunUrl } = getCozeConfig();
    if (!apiToken) return jsonResponse(200, action, emptyData(), 'Missing COZE_API_TOKEN.');
    if (!workflowId) return jsonResponse(200, action, emptyData(), 'Missing COZE_WORKFLOW_ID.');

    const cozeResponse = await fetch(workflowRunUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        parameters: JSON.stringify(buildWorkflowParameters(body, action)),
      }),
    });

    const rawText = await cozeResponse.text();
    const rawResult = parseJsonObject(rawText);
    const cozeCode = rawResult.code;
    const cozeMessage = stringValue(rawResult.msg) || stringValue(rawResult.message);

    if (!cozeResponse.ok) {
      return jsonResponse(cozeResponse.status, action, emptyData(), cozeMessage || `Coze workflow request failed with ${cozeResponse.status}.`);
    }
    if (cozeCode !== undefined && cozeCode !== 0 && cozeCode !== '0') {
      return jsonResponse(200, action, emptyData(), cozeMessage || `Coze workflow returned code ${String(cozeCode)}.`);
    }

    return jsonResponse(200, action, normalizeCozeData(rawResult.data ?? rawResult), null);
  } catch (error) {
    return jsonResponse(200, action, emptyData(), error instanceof Error ? error.message : 'Coze agent failed.');
  }
};
