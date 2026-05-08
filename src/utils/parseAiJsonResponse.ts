export const parseAiJsonResponse = <T>(text: string): T => {
  if (!text) {
    throw new Error("Empty AI response");
  }

  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");

  try {
    return JSON.parse(cleanedText) as T;
  } catch {
    throw new Error("Invalid AI JSON response format");
  }
};
