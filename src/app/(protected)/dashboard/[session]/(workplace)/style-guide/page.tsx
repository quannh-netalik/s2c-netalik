import { FC } from 'react';

import { MoodBoardImagesQuery, StyleGuideQuery } from '@/convex/query.config';

import { MoodBoardImage } from '@/hooks/use-style';
import RenderTabs from '@/components/style/render-tabs';
import { StyleGuide } from '@/redux/api/style-guide';

type PageProps = {
  searchParams: Promise<{
    projectId: string;
  }>;
};

const Page: FC<PageProps> = async ({ searchParams }) => {
  const projectId = (await searchParams).projectId;

  const [existingStyleGuide, existingMoodBoardImages] = await Promise.all([
    StyleGuideQuery(projectId),
    MoodBoardImagesQuery(projectId),
  ]);

  const guide = existingStyleGuide.styleGuide?._valueJSON as unknown as StyleGuide;
  const guideImages = existingMoodBoardImages.images._valueJSON as unknown as MoodBoardImage[];

  return (
    <RenderTabs
      colorGuide={guide?.colorSections || []}
      typographyGuide={guide?.typographySections || []}
      guideImages={guideImages}
    />
  );
};

export default Page;
