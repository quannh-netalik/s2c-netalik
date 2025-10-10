import {
  ConsumeCreditsQuery,
  CreditBalanceQuery,
  MoodBoardImagesQuery,
} from '@/convex/query.config';
import { MoodBoardImage } from '@/hooks/use-style';
import { prompts } from '@/prompts';
import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import z from 'zod';
import { fetchMutation } from 'convex/nextjs';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';

const ColorSwatchSchema = z.object({
  name: z.string(),
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be valid hex color'),
  description: z.string().optional(),
});

const PrimaryColorsSchema = z.object({
  title: z.literal('Primary Colors'),
  swatches: z.array(ColorSwatchSchema).length(4),
});

const SecondaryColorsSchema = z.object({
  title: z.literal('Secondary Colors'),
  swatches: z.array(ColorSwatchSchema).length(4),
});

const UIComponentColorsSchema = z.object({
  title: z.literal('UI Component Colors'),
  swatches: z.array(ColorSwatchSchema).length(4),
});

const UtilityColorsSchema = z.object({
  title: z.literal('Utility & Form Colors'),
  swatches: z.array(ColorSwatchSchema).length(4),
});

const StatusColorsSchema = z.object({
  title: z.literal('Status & Feedback COlors'),
  swatches: z.array(ColorSwatchSchema).length(4),
});

const TypographyStyleSchema = z.object({
  name: z.string(),
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  lineHeight: z.string(),
  letterSpacing: z.string().optional(),
  description: z.string().optional(),
});

const TypoGraphySectionSchema = z.object({
  title: z.string(),
  styles: z.array(TypographyStyleSchema),
});

const StyleGuideSchema = z.object({
  theme: z.string(),
  description: z.string(),
  colorSections: z.tuple([
    PrimaryColorsSchema,
    SecondaryColorsSchema,
    UIComponentColorsSchema,
    UtilityColorsSchema,
    StatusColorsSchema,
  ]),
  typographySections: z.array(TypoGraphySectionSchema).length(3),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const { ok: balanceOk, balance: balanceBalance } = await CreditBalanceQuery();

    if (!balanceOk) {
      return NextResponse.json({ error: 'Failed to fetch credit balance' }, { status: 500 });
    }

    if (balanceBalance === 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    const moodBoardImages = await MoodBoardImagesQuery(projectId);
    if (!moodBoardImages || moodBoardImages.images._valueJSON.length === 0) {
      return NextResponse.json(
        { error: 'No images found for the project. Please upload images to the mood board firsts' },
        { status: 400 },
      );
    }

    const images = moodBoardImages.images._valueJSON as unknown as MoodBoardImage[];
    const imageUrls = images.map((img) => img.url).filter(Boolean);
    const systemPrompt = prompts.styleGuide.system;

    const userPrompt = `
      Analyze these ${imageUrls.length} mood board images and generate a design system: 
      - Extract colors that work harmoniously together and create typography that matches the aesthetic.
      - Return ONLY the JSON object matching the exact schema structure above.
    `;

    const result = await generateObject({
      model: anthropic('claude-sonnet-4-2020514'),
      schema: StyleGuideSchema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            ...imageUrls.map((url) => ({
              type: 'image' as const,
              image: url as string,
            })),
          ],
        },
      ],
    });

    const { ok, balance } = await ConsumeCreditsQuery({ amount: 1 });
    if (!ok) {
      return NextResponse.json({ error: 'Failed to consume credits' }, { status: 500 });
    }

    await fetchMutation(
      api.projects.updateProjectStyleGuide,
      {
        projectId: projectId as Id<'projects'>,
        styleGuideData: result.object,
      },
      { token: await convexAuthNextjsToken() },
    );

    return NextResponse.json({
      succes: true,
      styleGuide: result.object,
      message: 'Style guide generated successfully',
      balance,
    });
  } catch (error) {
    console.error('Error generating style guide:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while generating the style guide',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
