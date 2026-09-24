import type { Config } from 'tailwindcss'
import baseConfig from '@match-padel/config/tailwind.base'

const config: Config = {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
