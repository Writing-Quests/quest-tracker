import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({command}) => {
  const opts = {
    plugins: [react()],
    build: {
      outDir: '../backend/public/app',
      emptyOutDir: true,
    },
  }
  console.log(command)
  if(command === 'build') {
    opts.base = '/app'
  }
  return opts
})
