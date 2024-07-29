import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export const websiteRouter = createTRPCRouter({
  addWebsite: protectedProcedure
  .input(
    z.object({
      url: z.string().url(),
      username: z.string(),
      applicationPassword: z.string(),
      companyName: z.string(),
      phoneNumber: z.string(),
      emailAddress: z.string().email(),
      stockCategory: z.string(),
      keywords: z.string(),
      locations: z.string(),
      landingPages: z.array(z.string()).optional(),
      blogPosts: z.array(z.string()).optional(),
      blogAmountMonthly: z.string(),
      blogStartingDate: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    console.log("Received input:", input);

    const {
      url,
      username,
      applicationPassword,
      companyName,
      phoneNumber,
      emailAddress,
      stockCategory,
      keywords,
      locations,
      landingPages,
      blogPosts,
      blogAmountMonthly,
      blogStartingDate,
    } = input;

    try {
      const website = await ctx.db.website.create({
        data: {
          url,
          username,
          applicationPassword,
          companyName,
          phoneNumber,
          emailAddress,
          stockCategory,
          keywords,
          locations,
          landingPages: {
            create: landingPages?.map((page) => ({ url: page })) ?? [],
          },
          blogPosts: {
            create: blogPosts?.map((post) => ({ title: post })) ?? [],
          },
          blogAmountMonthly,
          blogStartingDate,
        },
      });

      return website;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Validation Error',
          cause: error,
        });
      }
      console.error("Database error:", error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database error',
      });
    }
  }),
  getWebsites: protectedProcedure.query(({ ctx }) => {
    return ctx.db.website.findMany({
      include: {
        blogsToReview: true,
        blogsComplete: true,
      },
    });
  }),

  getWebsite: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.website.findUnique({
        where: {
          url: input.url,
        },
        include: {
          blogsToReview: true,
          blogsComplete: true,
        },
      });
    }),

  deleteWebsite: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.website.delete({
        where: {
          url: input.url,
        },
      });
    }),

  editWebsite: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        username: z.string(),
        applicationPassword: z.string(),
        companyName: z.string(),
        phoneNumber: z.string(),
        emailAddress: z.string().email(),
        stockCategory: z.string(),
        keywords: z.string(),
        locations: z.string(),
        blogAmountMonthly: z.string(), // Add this
        blogStartingDate: z.string(), // Add this
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        url,
        username,
        applicationPassword,
        companyName,
        phoneNumber,
        emailAddress,
        stockCategory,
        keywords,
        locations,
        blogAmountMonthly, // Add this
        blogStartingDate, // Add this
      } = input;
  
      const editwebsite = await ctx.db.website.update({
        where: {
          url: url,
        },
        data: {
          url: url,
          username: username,
          applicationPassword: applicationPassword,
          companyName: companyName,
          phoneNumber: phoneNumber,
          emailAddress: emailAddress,
          stockCategory: stockCategory,
          keywords: keywords,
          locations: locations,
          blogAmountMonthly: blogAmountMonthly, // Add this
          blogStartingDate: blogStartingDate, // Add this
        },
      });
  
      return editwebsite;
    }),
});
