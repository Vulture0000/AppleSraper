/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#08090D',
          elevated: '#0D0F15',
        },
        surface: {
          DEFAULT: '#101218',
          subtle: '#151821',
          card: '#181C26',
          border: '#232A3B',
          hover: '#1F2433',
        },
        brand: {
          cyan: '#00F0FF',
          blue: '#0070F3',
          purple: '#8B5CF6',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          dim: '#475569',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 12px 40px 0 rgba(0, 240, 255, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'neumorph': '5px 5px 12px #07080b, -5px -5px 12px #13161f',
        'neumorph-inset': 'inset 2px 2px 5px #07080b, inset -2px -2px 5px #191d29',
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
