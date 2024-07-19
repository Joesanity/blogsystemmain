// /server/api/routers/generateRouter.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import axios from "axios";

const stockCategoryMapping: Record<string, number> = {
  Abroad: 1,
  Agriculture: 2,
  Aircon: 3,
  Animals: 4,
  Appliances: 5,
  Architects: 6,
  Asbestos: 7,
  Blinds: 8,
  Caravans: 9,
  Care: 10,
  Carpentry: 11,
  Cleaning: 12,
  Therapy: 13,
  Drainage: 14,
  Alcohol: 15,
  Education: 16,
  Electrical: 17,
  Engineering: 18,
  Fencing: 19,
  Flooring: 20,
  Construction: 21,
  Housing: 22,
  Landscaping: 23,
  Locksmith: 24,
  Massages: 25,
  Office: 26,
  Decorating: 27,
  Pests: 28,
  Plastering: 29,
  Heating: 30,
  Removals: 31,
  Roofing: 32,
  Security: 33,
  Steelworks: 34,
  Tiling: 35,
  Treatments: 36,
  Trees: 37,
};

const getRandomImageUrl = (categoryNumber: number) => {
  const randomImageNumber = Math.floor(Math.random() * 6) + 1;
  return `https://blog-images.stackstaging.com/${categoryNumber}/${randomImageNumber}.jpg`;
};

type GenerateContentResponse = {
  content: string;
  title: string;
};

type Blog = {
  id: number;
  title: string;
  content: string;
  websiteId: number;
  website: {
    url: string;
    username: string;
    applicationPassword: string;
    stockCategory: string;
  };
};

export const generateRouter = createTRPCRouter({
  generateBlogPost: publicProcedure
    .input(
      z.object({
        websiteId: z.number(),
        keywords: z.string(),
        stockCategory: z.string(),
        locations: z.string(),
        phoneNumber: z.string(),
        emailAddress: z.string(),
        companyName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const {
        websiteId,
        keywords,
        stockCategory,
        locations,
        phoneNumber,
        emailAddress,
        companyName,
      } = input;

      const categoryNumber = stockCategoryMapping[stockCategory];
      if (!categoryNumber) {
        throw new Error("Invalid stock category");
      }

      const imageUrl = getRandomImageUrl(categoryNumber);

      try {
        const response = await axios.post<GenerateContentResponse>(
          "http://localhost:3000/api/generateContent",
          {
            keywords,
            stockCategory,
            locations,
            phoneNumber,
            emailAddress,
            companyName,
            imageUrl, // Pass image URL to content generation API
          },
        );

        const { content: fullContent, title: blogTitle } = response.data;

        const blogToReview = await ctx.db.blogToReview.create({
          data: {
            title: blogTitle,
            content: fullContent,
            websiteId: websiteId,
          },
        });

        return blogToReview;
      } catch (error) {
        console.error("Failed to generate content:", error);
        throw new Error("Failed to generate content");
      }
    }),

  getBlogsToReview: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.blogToReview.findMany({
      include: {
        website: true, // Ensure website details are included
      },
    });
  }),

  acceptBlogPost: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const blog = await ctx.db.blogToReview.findUnique({
        where: { id: input },
        include: {
          website: true, // Include the website details
        },
      });

      if (!blog) {
        throw new Error("Blog post not found");
      }

      const { url, username, applicationPassword, stockCategory } = blog.website;

      const uploadImageToWordPress = async (imageUrl: string): Promise<number> => {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const formData = new FormData();
        formData.append("file", imageBlob, "featured-image.jpg");

        const uploadResponse = await fetch(`${url}/wp-json/wp/v2/media`, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${username}:${applicationPassword}`),
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image to WordPress");
        }

        const uploadData = await uploadResponse.json();
        return uploadData.id;
      };

      const publishToWordPress = async (
        url: string,
        username: string,
        applicationPassword: string,
        title: string,
        content: string,
        featuredImageId: number,
      ): Promise<unknown> => {
        const response = await fetch(`${url}/wp-json/wp/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa(`${username}:${applicationPassword}`),
          },
          body: JSON.stringify({
            title: title,
            content: content,
            status: "publish",
            featured_media: featuredImageId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to publish post to WordPress");
        }

        return response.json();
      };

      try {
        const categoryNumber = stockCategoryMapping[stockCategory];
        if (!categoryNumber) {
          throw new Error("Invalid stock category");
        }

        const imageUrl = getRandomImageUrl(categoryNumber);
        const featuredImageId = await uploadImageToWordPress(imageUrl);

        await publishToWordPress(
          url,
          username,
          applicationPassword,
          blog.title,
          blog.content,
          featuredImageId,
        );
      } catch (error) {
        console.error("Failed to publish post to WordPress:", error);
        throw new Error("Failed to publish post to WordPress");
      }

      await ctx.db.blogComplete.create({
        data: {
          title: blog.title,
          content: blog.content,
          websiteId: blog.websiteId,
        },
      });

      await ctx.db.blogToReview.delete({
        where: { id: input },
      });

      return { success: true };
    }),

  rejectBlogPost: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.blogToReview.delete({
        where: { id: input },
      });

      return { success: true };
    }),
});
