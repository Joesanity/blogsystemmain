// /server/utils/generateContent.ts

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export const generateContent = async (keywords: string, stockCategory: string) => {
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
  
      const data = await response.json();
      
      // Return only the HTML content
      return data.content;
    } catch (error) {
      console.error('Failed to generate content:', error);
      throw new Error('Content generation failed');
    }
  };
