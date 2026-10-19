import { colors } from './colors.config'
import type { Config } from 'tailwindcss'

const {
  primary_light,
  primary,
  primary_dark,
  secondary_light,
  secondary,
  warn,
  active,
  active_light,
  danger,
  border,
  light_gray,
  blue,
} = colors

const config: Config = {
  important: true,
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        app: 'var(--font-app)',
      },
      colors: {
        border: border,
        primary: {
          light: primary_light,
          DEFAULT: primary,
          dark: primary_dark,
        },
        active: { DEFAULT: active, light: active_light },
        warn: { DEFAULT: warn },
        danger: { DEFAULT: danger },
        secondary: { light: secondary_light, DEFAULT: secondary },
        gray: {
          light: light_gray,
        },
        blue,
        go: {
          ink: '#111111',
          muted: '#6B7280',
          hint: '#9CA3AF',
          chip: '#F2F3F5',
          line: '#F2F3F6',
          line2: '#EEF0F3',
          green: '#15803D',
          bright: '#16A34A',
          soft: '#E8F7EE',
          gold: '#F5B400',
          goldsoft: '#FFF4CC',
          goldtext: '#92400E',
          red: '#EF4444',
          blue: '#2563EB',
          bluesoft: '#EFF6FF',
          amber: '#F59E0B',
        },
      },
      container: {
        center: true,
      },
      screens: {
        d2xl: { max: '1535px' },
        dxl: { max: '1279px' },
        dlg: { max: '1000px' },
        dmx: { max: '960px' },
        dmd: { max: '860px' },
        dsm: { max: '639px' },
        dxx: { max: '570px' },
        dxs: { max: '400px' },
      },
    },
  },
  plugins: [],
}
export default config
