import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TextShape, updateShape } from '@/redux/slice/shapes';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { FC, useCallback, useMemo, useState } from 'react';
import { fontFamilies } from './fonts';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Palette, Strikethrough, Underline } from 'lucide-react';
import { Input } from '@/components/ui/input';

type FontStyle = TextShape['fontStyle']; // 'normal' | 'italic'
type TextDecoration = TextShape['textDecoration']; // 'none' | 'underline' | 'line-through'

type TextSideBarProps = {
  isOpen: boolean;
};

// TODO: edit based on 6:40:59
const TextSideBar: FC<TextSideBarProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const selectedShapes = useAppSelector((s) => s.shapes.selected);
  const shapeEntities = useAppSelector((s) => s.shapes.shapes.entities);

  const selectedTextShape = useMemo(
    () =>
      Object.keys(selectedShapes)
        .map((id) => shapeEntities[id])
        .find((shape) => shape?.type === 'text') as TextShape | undefined,
    [selectedShapes, shapeEntities],
  );

  const [colorInput, setColorInput] = useState<string>(selectedTextShape?.fill || '#ffffff');

  const updateTextProperty = useCallback(
    (property: keyof TextShape, value: string | number) => {
      if (!selectedTextShape) return;

      dispatch(
        updateShape({
          id: selectedTextShape.id,
          patch: {
            [property]: value,
          },
        }),
      );
    },
    [dispatch, selectedTextShape],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      setColorInput(color);
      if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        updateTextProperty('fill', color);
      }
    },
    [updateTextProperty],
  );

  if (!isOpen || !selectedTextShape) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed right-5 top-1/2 transform -translate-y-1/2 w-80 backdrop-blur-xl bg-white/[0.08] border-white/[0.12] gap-2 p-3 saturate-150 border rounded-lg z-50 transition-transform duration-200',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="p-4 flex flex-col gap-10 overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div className="space-y-2">
          <Label className="text-white/80">Font Family</Label>
          <Select
            value={selectedTextShape.fontFamily}
            onValueChange={(value) => updateTextProperty('fontFamily', value)}
          >
            <SelectTrigger className="bg-white/5 border-white/10 w-full text-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="bg-black/90 border-white/10">
              {fontFamilies.map((font) => (
                <SelectItem key={font} value={font} className="text-white hover:bg-white/10">
                  <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Font Size: {selectedTextShape.fontSize}px</Label>
          <Slider
            value={[selectedTextShape.fontSize]}
            onValueChange={([value]) => updateTextProperty('fontSize', value)}
            min={8}
            max={128}
            step={1}
            className="w-full"
          />
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label className="text-white/80">Font Weight: {selectedTextShape.fontWeight}</Label>
          <Slider
            value={[selectedTextShape.fontWeight]}
            onValueChange={([value]) => updateTextProperty('fontWeight', value)}
            min={100}
            max={900}
            step={100}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white/80">Style</Label>
          <div className="flex gap-2">
            {/* Bold */}
            <Toggle
              pressed={selectedTextShape.fontWeight >= 600}
              onPressedChange={(pressed) => updateTextProperty('fontWeight', pressed ? 700 : 400)}
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              <Bold className="w-4 h-4" />
            </Toggle>

            {/* Italic */}
            <Toggle
              pressed={selectedTextShape.fontStyle === 'italic'}
              onPressedChange={(pressed) => {
                const value: FontStyle = pressed ? 'italic' : 'normal';
                updateTextProperty('fontStyle', value);
              }}
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              <Italic className="w-4 h-4" />
            </Toggle>

            {/* Underline */}
            <Toggle
              pressed={selectedTextShape.textDecoration === 'underline'}
              onPressedChange={(pressed) => {
                const value: TextDecoration = pressed ? 'underline' : 'none';
                updateTextProperty('textDecoration', value);
              }}
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              <Underline className="w-4 h-4" />
            </Toggle>

            {/* Line-through */}
            <Toggle
              pressed={selectedTextShape.textDecoration === 'line-through'}
              onPressedChange={(pressed) => {
                const value: TextDecoration = pressed ? 'line-through' : 'none';
                updateTextProperty('textDecoration', value);
              }}
              className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
            >
              <Strikethrough className="w-4 h-4" />
            </Toggle>
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label className="text-white/80">Line Height: {selectedTextShape.lineHeight}</Label>
          <Slider
            value={[selectedTextShape.lineHeight]}
            onValueChange={([value]) => updateTextProperty('lineHeight', value)}
            min={0.8}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Letter Spacing */}
        <div className="space-y-2">
          <Label className="text-white/80">
            Letter Spacing: {selectedTextShape.letterSpacing}px
          </Label>
          <Slider
            value={[selectedTextShape.letterSpacing]}
            onValueChange={([value]) => updateTextProperty('letterSpacing', value)}
            min={-2}
            max={10}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-white/80 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Text Color
          </Label>
          <div className="flex gap-2">
            <Input
              value={colorInput}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder="#ffffff"
              className="bg-white/5 border-white/10 text-white flex-1"
            />
            <div
              className="w-10 h-10 rounded border border-white/20 cursor-pointer"
              style={{
                backgroundColor: selectedTextShape.fill || '#ffffff',
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'color';
                input.value = selectedTextShape.fill || '#ffffff';
                input.onchange = (e) => {
                  const color = (e.target as HTMLInputElement).value;
                  setColorInput(color);
                  updateTextProperty('fill', color);
                };
                input.click();
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextSideBar;
