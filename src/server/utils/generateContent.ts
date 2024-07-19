const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000';

type GenerateContentResponse = {
  content: string;
};

export const generateContent = async (keywords: string, stockCategory: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords,
        stockCategory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GenerateContentResponse = await response.json();
    
    // Return only the HTML content
    return data.content;
  } catch (error) {
    console.error('Failed to generate content:', error);
    throw new Error('Content generation failed');
  }
};
