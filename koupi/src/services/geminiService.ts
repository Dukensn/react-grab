import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function getChatResponse(
  history: ChatMessage[],
  userMessage: string,
  context: {
    faqs: any[];
    userStats: any;
    courseModules: any[];
  }
) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
You are "Levo", the AI assistant for "Levye Digital", an online education platform specializing in digital marketing and sales of digital products.

CONTEXT:
- Course: Digital Marketing and Sales Mastery (Mestriz lavant pwodui nimerik ak maketing dijital).
- Pricing:
  - Gratis (Free): 0 USD (Intro, community access).
  - Premium: 15 USD (was 25 USD) (All current modules, virtual card tutorial, strategy docs, certificate).
  - VIP Mastermind: 99 USD (1-on-1 coaching, annual VIP access, in-person meetings).
- Payment Options: MonCash, local cards, virtual cards.
- Current User Stats: 
  - Streak: ${context.userStats.streak} days
  - VIP Status: ${context.userStats.isVIP ? 'Yes' : 'No'}
  - Completed Lessons: ${context.userStats.completedLessons?.length || 0}
- FAQs:
${context.faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n')}

GUIDELINES:
- Language: Haitian Creole (Kreyòl Ayisyen).
- Tone: Helpful, encouraging, professional but friendly.
- Formatting: Use Markdown for bolding or lists. Keep responses concise and focused on the user's progress or the platform.
- If the user asks about something not in the context, politely refocus them on the course.
- Encourage them to maintain their streak if it's high, or congratulate them on their progress.
`;

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    },
    // We convert our history format to the API format
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text || "Mwen eskize m, mwen pa ka reponn kounye a. Tanpri eseye ankò.";
}
