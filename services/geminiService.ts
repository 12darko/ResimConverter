import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. AI features will fail.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Converts a browser Blob/File to a Base64 string required by Gemini
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateAiFilename = async (file: File): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const base64Data = await fileToGenerativePart(file);

    // Using the stable model name to prevent 404 errors
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: "Analyze this image and generate a short, highly descriptive, SEO-friendly filename (in English, snake_case, max 5 words). Output ONLY the filename, do not include the extension."
          }
        ]
      }
    });

    const text = response.text;
    return text ? text.trim() : null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback logic or re-throw depending on app needs, currently returning null allows UI to show generic error
    return null;
  }
};