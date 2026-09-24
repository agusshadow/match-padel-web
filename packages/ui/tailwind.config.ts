import type { Config } from 'tailwindcss'
import baseConfig from '@match-padel/config/tailwind.base'

const config: Config = {
  ...baseConfig,
  content: ['./src/**/*.{ts,tsx}'],
}

export default config
