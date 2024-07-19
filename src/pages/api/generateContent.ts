// /pages/api/generateContent.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateContent = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { keywords, stockCategory, locations, phoneNumber, emailAddress, companyName } = req.body as {
    keywords: string[];
    stockCategory: string;
    locations: string[];
    phoneNumber: string;
    emailAddress: string;
    companyName: string;
  };

  try {
    // Title of content
    const titleResponse = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at coming up with unique blog titles based on the keywords provided. You will only print out the title, and no other information at all as a response, in British English'
        },
        {
          role: 'user',
          content: `Create one blog post idea from one of these: ${keywords} and use one of these locations: ${locations}. Make it suitable for long tail keywords, it should be between 7-10 words and be a creative idea that isn't common.`
        }
      ],
      model: 'gpt-4o-mini',
    });

    let blogTitle = titleResponse.choices[0]?.message.content?.trim();
    if (blogTitle && blogTitle.startsWith('"') && blogTitle.endsWith('"')) {
      blogTitle = blogTitle.slice(1, -1);
    }

    if (!blogTitle) {
      return res.status(500).json({ error: 'Failed to generate blog title' });
    }

    // First part of the content
    const chatCompletion1 = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content writer that creates content in British English and in HTML format. Use only <h1> for the title, <h2> for subtitles, and <p> tags for the content. Do not include any other HTML tags or metadata.'
        },
        {
          role: 'user',
          content: `Generate the first half of a blog post titled "${blogTitle}". Ensure the content is in HTML format and uses British English. It should include a <h1> tag with the title, followed by multiple <p> tags with the content, with different section titles in <h2> tags. Aim for approximately 500 words. The details of the website it is going on are Phone: ${phoneNumber}, Email: ${emailAddress}, Company: ${companyName}, do not include a conclusion, as this is the first half.`
        }
      ],
      model: 'gpt-4o-mini',
    });

    let generatedContent1 = chatCompletion1.choices[0]?.message.content?.trim();

    if (!generatedContent1) {
      return res.status(500).json({ error: 'Failed to generate the first part of the content' });
    }

    // Clean the content by removing unwanted tags
    generatedContent1 = cleanHtmlContent(generatedContent1);

    console.log('Generated Content Part 1:', generatedContent1);

    // Second part of the content
    const chatCompletion2 = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content writer that creates content in British English and in HTML format. Use only <h1> for the title, <h2> for subtitles, and <p> tags for the content. Do not include any other HTML tags or metadata.'
        },
        {
          role: 'user',
          content: `Continue generating the blog post titled "${blogTitle}" in the category of ${stockCategory}, do not include the first half, this should be all new content. Ensure the content is in HTML format and uses British English. Continue directly from the following content without repeating any part of it. Here is the first part to continue: ${generatedContent1}. Make sure to add a call to action at the end under a heading of conclusion. The details of the website it is going on are Phone: ${phoneNumber}, Email: ${emailAddress}, Company: ${companyName}`
        }
      ],
      model: 'gpt-4o-mini',
    });

    let generatedContent2 = chatCompletion2.choices[0]?.message.content?.trim();

    if (!generatedContent2) {
      return res.status(500).json({ error: 'Failed to generate the second part of the content' });
    }

    // Clean the content by removing unwanted tags
    generatedContent2 = cleanHtmlContent(generatedContent2);

    console.log('Generated Content Part 2:', generatedContent2);

    const fullContent = `${generatedContent1}\n${generatedContent2}`;

    res.status(200).json({ content: fullContent, title: blogTitle });
  } catch (error) {
    console.error('Failed to generate content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
};

function cleanHtmlContent(content: string): string {
  // Remove unwanted HTML tags
  return content.replace(/<(\/?)(html|head|meta|title|link|body|script|style)[^>]*>/gi, '');
}

export default generateContent;
