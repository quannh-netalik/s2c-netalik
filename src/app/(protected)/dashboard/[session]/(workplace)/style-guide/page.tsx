import { FC } from 'react';

import { MoodBoardImagesQuery, StyleGuideQuery } from '@/convex/query.config';
import StyleGuideTabContent from '@/components/style/tabs';
import StyleGuideTypoGraphy from '@/components/style/typography';
import StyleGuideColor from '@/components/style/colors';

import { mockMoodBoardImages } from '@/hooks/__mock__/use-style.mock';
import { mockStyleGuide } from '@/redux/api/style-guide/__mock__';
import StyleGuideMoodBoard from '@/components/style/mood-board';
import { MoodBoardImage } from '@/hooks/use-style';

type PageProps = {
  searchParams: Promise<{
    projectId: string;
  }>;
};

const Page: FC<PageProps> = async ({ searchParams }) => {
  const projectId = (await searchParams).projectId;
  const existingStyleGuide = await StyleGuideQuery(projectId);

  // const guide = existingStyleGuide.styleGuide?._valueJSON as unknown as StyleGuide;
  const guide = mockStyleGuide;

  const colorGuide = guide?.colorSections || [];
  const typographyGuide = guide?.typographySections || [];

  const existingMoodBoardImages = await MoodBoardImagesQuery(projectId);
  const guideImages = existingMoodBoardImages.images._valueJSON as unknown as MoodBoardImage[];

  // const guideImages = mockMoodBoardImages;
  return (
    <div>
      <StyleGuideTabContent value="colors" className="space-y-8">
        <StyleGuideColor guideImages={guideImages} colorGuide={colorGuide} />
      </StyleGuideTabContent>

      <StyleGuideTabContent value="typography">
        <StyleGuideTypoGraphy typographyGuide={typographyGuide} />
      </StyleGuideTabContent>

      <StyleGuideTabContent value="moodBoard">
        <StyleGuideMoodBoard guideImages={guideImages} />
      </StyleGuideTabContent>
    </div>
  );
};

export default Page;
