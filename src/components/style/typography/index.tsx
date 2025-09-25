import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TypographySection } from '@/redux/api/style-guide';
import { Info, Type } from 'lucide-react';
import { FC } from 'react';

type StyleGuideTypoGraphyProps = {
  typographyGuide: TypographySection[];
};

const StyleGuideTypoGraphy: FC<StyleGuideTypoGraphyProps> = ({ typographyGuide }) => {
  return typographyGuide.length === 0 ? (
    <div className="text-center py-20">
      <Type className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium text-foreground mb-2">No typography generated yet</h3>
      <p className="text-sm text-muted-foreground mb-6">Generate a style guide to see typography recommendation</p>
    </div>
  ) : (
    <div className="flex flex-col gap-10">
      {typographyGuide.map((section, index) => (
        <div key={index} className="flex flex-col gap-5">
          <div>
            <h3 className="text-lg font-medium text-foreground/50 mb-4">{section.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.styles.map((style, styleIndex) => (
                <div
                  key={styleIndex}
                  className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.02] border  border-white/[0.08] saturate-150"
                >
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-foreground/50">{style.name}</h4>
                    {style.description && (
                      <div className="flex gap-2">
                        <div className="text-sm text-muted-foreground">{style.description}</div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground " />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-1">
                              <div> Font: {style.fontFamily}</div>
                              <div> Size: {style.fontSize}</div>
                              <div> Weight: {style.fontWeight}</div>
                              <div> Line Height: {style.lineHeight}</div>
                              {style.letterSpacing && <div> Letter Spacing: {style.letterSpacing}</div>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>

                  <div
                    className="text-muted-foreground"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      lineHeight: style.lineHeight,
                      letterSpacing: style.lineHeight || 'normal',
                    }}
                  >
                    The quick brown for jumps over the lazy dog
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StyleGuideTypoGraphy;
