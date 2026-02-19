import 'dotenv/config';
import OpenAI from 'openai';
import { createReadStream } from 'fs';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured. Add it to backend/.env');
}

const openai = new OpenAI({
  apiKey,
});

const SNAG_EXTRACTION_PROMPT = `You are analyzing a voice recording transcript from a building company property audit. 
Extract all snags/issues mentioned and return ONLY a valid JSON array of snag objects. No other text.
Each object must have these fields (use empty string if not mentioned):
- snag_description: Brief description of the problem
- project_name: Name of the project/property (infer from context if not stated)
- recommended_trade: Trade type (e.g., "Plumber", "Electrician", "Carpenter", "Painter", "Roofer")
- recommended_builder: Name of builder/contractor if mentioned
- deadline: ISO date string or description like "ASAP", "end of week"
- materials_needed: Comma-separated list of materials if mentioned
- plant_needed: Equipment/plant if mentioned
- drawing_reference: Reference to technical drawing if mentioned (e.g. "A-101")
- additional_notes: Any other relevant details

Return ONLY the JSON array, e.g. [{"snag_description":"...","project_name":"...",...},...]`;

export async function transcribeAudio(filePath) {
  const stream = createReadStream(filePath);
  const transcription = await openai.audio.transcriptions.create({
    file: stream,
    model: 'whisper-1',
    response_format: 'text',
  });

  return typeof transcription === 'string' ? transcription : transcription.text;
}

export async function extractSnagsFromTranscript(transcript) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: SNAG_EXTRACTION_PROMPT,
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content?.trim() || '[]';
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Failed to parse snag extraction response');
  }
}

export async function matchPhotosToSnags(photosBase64, snags) {
  if (!photosBase64?.length || !snags?.length) return {};

  const imageParts = photosBase64.map((base64, i) => ({
    type: 'image_url',
    image_url: { url: `data:image/jpeg;base64,${base64}` },
  }));

  const snagsDescription = snags.map((s, i) => `${i}: ${s.snag_description}`).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Match these photos to the snags below. For each photo, return the snag index (0-based) it best represents. Return JSON: {"0": 1, "1": 0} where key is photo index and value is snag index. Use -1 if photo doesn't match any snag.\n\nSnags:\n${snagsDescription}`,
          },
          ...imageParts,
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim() || '{}';
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}
