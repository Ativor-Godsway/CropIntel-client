/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Legacy static colors (kept for backward-compat, not used for theming)
        primary: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },

        // Theme-aware tokens — use these throughout the app
        'theme-bg':             'var(--bg-primary)',
        'theme-surface':        'var(--bg-surface)',
        'theme-surface-2':      'var(--bg-surface-2)',
        'theme-surface-hover':  'var(--bg-surface-hover)',
        'theme-card':           'var(--bg-card)',
        'theme-border':         'var(--border-color)',
        'theme-border-subtle':  'var(--border-subtle)',
        'theme-border-strong':  'var(--border-strong)',
        'theme-text':           'var(--text-primary)',
        'theme-80':             'var(--text-80)',
        'theme-label':          'var(--text-label)',
        'theme-nav-link':       'var(--text-nav)',
        'theme-muted':          'var(--text-muted)',
        'theme-50':             'var(--text-50)',
        'theme-dim':            'var(--text-dim)',
        'theme-40':             'var(--text-40)',
        'theme-hint':           'var(--text-hint)',
        'theme-faint':          'var(--text-faint)',
        'theme-green':          'var(--green-bright)',
        'theme-lime':           'var(--green-lime)',
        'theme-gold':           'var(--gold)',
        'theme-red':            'var(--red-text)',
        'theme-input':          'var(--input-bg)',
        'theme-accent':         'var(--surface-accent)',
        'theme-accent-strong':  'var(--surface-accent-strong)',
        'theme-accent-border':  'var(--border-accent)',
        'theme-gold-surface':   'var(--surface-gold)',
        'theme-gold-border':    'var(--border-gold)',
        'theme-red-surface':    'var(--surface-red)',
        'theme-red-border':     'var(--border-red)',
        'theme-active':         'var(--surface-active)',
      },
      backgroundImage: {
        'hero-glow':   'radial-gradient(ellipse 80% 60% at 50% 0%, var(--hero-glow-1) 0%, transparent 60%)',
        'hero-glow-2': 'radial-gradient(ellipse 40% 40% at 80% 60%, var(--hero-glow-2) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
};
