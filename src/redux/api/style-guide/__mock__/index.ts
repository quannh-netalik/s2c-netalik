import { StyleGuide } from '..';

export const mockStyleGuide: StyleGuide = {
  theme: 'Modern Dark Theme',
  description: 'A contemporary dark theme with vibrant accents and professional typography',
  colorSections: [
    {
      title: 'Primary Colors',
      swatches: [
        {
          name: 'Primary 100',
          hexColor: '#eef2ff',
          description: 'Lightest primary shade, used for subtle backgrounds',
        },
        {
          name: 'Primary 500',
          hexColor: '#6366f1',
          description: 'Main primary color, used for primary buttons and important UI elements',
        },
        {
          name: 'Primary 700',
          hexColor: '#4338ca',
          description: 'Darker primary shade, used for hover states',
        },
        {
          name: 'Primary 900',
          hexColor: '#312e81',
          description: 'Darkest primary shade, used for active states',
        },
      ],
    },
    {
      title: 'Secondary & Accent Colors',
      swatches: [
        {
          name: 'Secondary 300',
          hexColor: '#c4b5fd',
          description: 'Light secondary color for subtle highlights',
        },
        {
          name: 'Secondary 500',
          hexColor: '#8b5cf6',
          description: 'Main secondary color for complementary elements',
        },
        {
          name: 'Secondary 700',
          hexColor: '#6d28d9',
          description: 'Dark secondary for emphasis',
        },
        {
          name: 'Accent',
          hexColor: '#ec4899',
          description: 'Vibrant accent for highlighting special elements',
        },
      ],
    },
    {
      title: 'UI Component Colors',
      swatches: [
        {
          name: 'Surface Light',
          hexColor: '#27272a',
          description: 'Light surface color for cards and elevated elements',
        },
        {
          name: 'Surface',
          hexColor: '#18181b',
          description: 'Main surface color for backgrounds',
        },
        {
          name: 'Surface Dark',
          hexColor: '#09090b',
          description: 'Dark surface for modals and overlays',
        },
        {
          name: 'Border',
          hexColor: '#3f3f46',
          description: 'Default border color',
        },
      ],
    },
    {
      title: 'Utility & Form Colors',
      swatches: [
        {
          name: 'Text Primary',
          hexColor: '#ffffff',
          description: 'Primary text color',
        },
        {
          name: 'Text Secondary',
          hexColor: '#a1a1aa',
          description: 'Secondary text color',
        },
        {
          name: 'Input',
          hexColor: '#3f3f46',
          description: 'Form input background',
        },
        {
          name: 'Disabled',
          hexColor: '#52525b',
          description: 'Disabled state color',
        },
      ],
    },
    {
      title: 'Status & Feedback COlors',
      swatches: [
        {
          name: 'Success',
          hexColor: '#22c55e',
          description: 'Success states and confirmations',
        },
        {
          name: 'Error',
          hexColor: '#ef4444',
          description: 'Error states and alerts',
        },
        {
          name: 'Warning',
          hexColor: '#f59e0b',
          description: 'Warning states and cautions',
        },
        {
          name: 'Info',
          hexColor: '#3b82f6',
          description: 'Informational states',
        },
      ],
    },
  ],
  typographySections: [
    {
      title: 'Headings',
      styles: [
        {
          name: 'Display',
          fontFamily: 'Inter',
          fontSize: '3.75rem',
          fontWeight: '700',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          description: 'Hero and major section headings',
        },
        {
          name: 'Heading 1',
          fontFamily: 'Inter',
          fontSize: '3rem',
          fontWeight: '700',
          lineHeight: '1.2',
          letterSpacing: '-0.01em',
          description: 'Main page headings',
        },
        {
          name: 'Heading 2',
          fontFamily: 'Inter',
          fontSize: '2.25rem',
          fontWeight: '600',
          lineHeight: '1.3',
          description: 'Section headings',
        },
      ],
    },
    {
      title: 'Body Text',
      styles: [
        {
          name: 'Body Large',
          fontFamily: 'Inter',
          fontSize: '1.125rem',
          fontWeight: '400',
          lineHeight: '1.75',
          description: 'Lead paragraphs',
        },
        {
          name: 'Body',
          fontFamily: 'Inter',
          fontSize: '1rem',
          fontWeight: '400',
          lineHeight: '1.5',
          description: 'Default body text',
        },
        {
          name: 'Body Small',
          fontFamily: 'Inter',
          fontSize: '0.875rem',
          fontWeight: '400',
          lineHeight: '1.5',
          description: 'Supporting text',
        },
      ],
    },
    {
      title: 'UI Elements',
      styles: [
        {
          name: 'Button',
          fontFamily: 'Inter',
          fontSize: '0.875rem',
          fontWeight: '500',
          lineHeight: '1.25',
          letterSpacing: '0.01em',
          description: 'Button text',
        },
        {
          name: 'Caption',
          fontFamily: 'Inter',
          fontSize: '0.75rem',
          fontWeight: '400',
          lineHeight: '1.5',
          description: 'Small text and labels',
        },
        {
          name: 'Overline',
          fontFamily: 'Inter',
          fontSize: '0.75rem',
          fontWeight: '500',
          lineHeight: '1.5',
          letterSpacing: '0.05em',
          description: 'All caps labels and categories',
        },
      ],
    },
  ],
};
