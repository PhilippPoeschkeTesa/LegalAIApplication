export const dm = {
  bg: (isDark: boolean) => isDark ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm' : 'bg-white border-slate-200',
  card: (isDark: boolean) => isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200',
  text: (isDark: boolean) => isDark ? 'text-white' : 'text-slate-900',
  textSecondary: (isDark: boolean) => isDark ? 'text-slate-300' : 'text-slate-600',
  textMuted: (isDark: boolean) => isDark ? 'text-slate-400' : 'text-slate-500',
  input: (isDark: boolean) => isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300',
  hover: (isDark: boolean) => isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50',
  border: (isDark: boolean) => isDark ? 'border-slate-700' : 'border-slate-200',
};
