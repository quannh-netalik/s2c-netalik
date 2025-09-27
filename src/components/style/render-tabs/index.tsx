'use client';

import { FC, memo } from 'react';
import dynamic from 'next/dynamic';

import StyleGuideTabContent from '../tabs';
import { ColorSection, TypographySection } from '@/redux/api/style-guide';
import { MoodBoardImage } from '@/hooks/use-style';

const StyleGuideColor = dynamic(() => import('../colors'));
const StyleGuideTypoGraphy = dynamic(() => import('../typography'));
const StyleGuideMoodBoard = dynamic(() => import('../mood-board'), { ssr: false });

type RenderTabProps = {
  colorGuide: ColorSection[];
  typographyGuide: TypographySection[];
  guideImages: MoodBoardImage[];
};

const RenderTabs: FC<RenderTabProps> = ({ colorGuide, typographyGuide, guideImages }) => {
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

export default memo(RenderTabs);
