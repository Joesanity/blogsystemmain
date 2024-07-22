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

      console.log("Generating blog post with the following data:", {
        websiteId,
        keywords,
        stockCategory,
        locations,
        phoneNumber,
        emailAddress,
        companyName,
      });

      const categoryNumber = stockCategoryMapping[stockCategory];
      if (!categoryNumber) {
        console.error("Invalid stock category:", stockCategory);
        throw new Error("Invalid stock category");
      }

      const imageUrl = getRandomImageUrl(categoryNumber);

      try {
        console.log("Requesting content generation with data:", {
          keywords,
          stockCategory,
          locations,
          phoneNumber,
          emailAddress,
          companyName,
          imageUrl,
        });

        const response = await axios.post<GenerateContentResponse>(
          "https://blogsystemmain.vercel.app/api/generateContent",
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

        console.log("Content generation response:", response.data);

        const { content: fullContent, title: blogTitle } = response.data;

        const blogToReview = await ctx.db.blogToReview.create({
          data: {
            title: blogTitle,
            content: fullContent,
            websiteId: websiteId,
          },
        });

        console.log("Blog to review created:", blogToReview);

        return blogToReview;
      } catch (error) {
        console.error("Failed to generate content:", error);
        throw new Error("Failed to generate content");
      }
    }),

  getBlogsToReview: publicProcedure.query(async ({ ctx }) => {
    try {
      const blogsToReview = await ctx.db.blogToReview.findMany({
        include: {
          website: true, // Ensure website details are included
        },
      });
      console.log("Fetched blogs to review:", blogsToReview);
      return blogsToReview;
    } catch (error) {
      console.error("Failed to fetch blogs to review:", error);
      throw new Error("Failed to fetch blogs to review");
    }
  }),

  acceptBlogPost: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        const blog = await ctx.db.blogToReview.findUnique({
          where: { id: input },
          include: {
            website: true, // Include the website details
          },
        });

        if (!blog) {
          console.error("Blog post not found with ID:", input);
          throw new Error("Blog post not found");
        }

        console.log("Accepting blog post:", blog);

        const { url, username, applicationPassword, stockCategory } = blog.website;

        const uploadImageToWordPress = async (imageUrl: string): Promise<number> => {
          console.log("Uploading image to WordPress:", imageUrl);

          const response = await fetch(imageUrl);
          const imageBlob = await response.blob();
          const formData = new FormData();
          formData.append("file", imageBlob, "featured-image.jpg");

          console.log("Uploading image with form data:", formData);

          const uploadResponse = await fetch(`${url}/wp-json/wp/v2/media`, {
            method: "POST",
            headers: {
              Authorization: "Basic " + btoa(`${username}:${applicationPassword}`),
            },
            body: formData,
          });

          const responseBody = await uploadResponse.text();
          console.log("Upload response body:", responseBody);

          if (!uploadResponse.ok) {
            console.error(`Failed to upload image to WordPress: ${responseBody}`);
            throw new Error("Failed to upload image to WordPress");
          }

          const uploadData = JSON.parse(responseBody);
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
          console.log("Publishing post to WordPress with:", { title, content, featuredImageId });

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

          const responseBody = await response.text();
          console.log("Publish response body:", responseBody);

          if (!response.ok) {
            console.error(`Failed to publish post to WordPress: ${responseBody}`);
            throw new Error("Failed to publish post to WordPress");
          }

          return JSON.parse(responseBody);
        };

        const categoryNumber = stockCategoryMapping[stockCategory];
        if (!categoryNumber) {
          console.error("Invalid stock category:", stockCategory);
          throw new Error("Invalid stock category");
        }

        const imageUrl = getRandomImageUrl(categoryNumber);
        const featuredImageId = await uploadImageToWordPress(imageUrl);

        console.log("Image uploaded to WordPress with ID:", featuredImageId);

        await publishToWordPress(
          url,
          username,
          applicationPassword,
          blog.title,
          blog.content,
          featuredImageId,
        );

        console.log("Blog post published to WordPress");

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

        console.log("Blog post moved to completed and deleted from review");

        return { success: true };
      } catch (error) {
        console.error("Failed to accept blog post:", error);
        throw new Error("Failed to accept blog post");
      }
    }),

  rejectBlogPost: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.blogToReview.delete({
          where: { id: input },
        });
        console.log("Rejected blog post with ID:", input);
        return { success: true };
      } catch (error) {
        console.error("Failed to reject blog post:", error);
        throw new Error("Failed to reject blog post");
      }
    }),
});
