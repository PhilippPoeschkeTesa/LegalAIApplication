export const colors = {
  background: {
    primary: {
      light: 'bg-white',
      dark: 'bg-slate-900'
    },
    secondary: {
      light: 'bg-slate-50',
      dark: 'bg-slate-800'
    },
    tertiary: {
      light: 'bg-slate-100',
      dark: 'bg-slate-800/50'
    },
    elevated: {
      light: 'bg-white',
      dark: 'bg-slate-800'
    },
    hover: {
      light: 'hover:bg-slate-50',
      dark: 'hover:bg-slate-700'
    }
  },
  text: {
    primary: {
      light: 'text-slate-900',
      dark: 'text-white'
    },
    secondary: {
      light: 'text-slate-600',
      dark: 'text-slate-300'
    },
    tertiary: {
      light: 'text-slate-500',
      dark: 'text-slate-400'
    },
    muted: {
      light: 'text-slate-400',
      dark: 'text-slate-500'
    }
  },
  border: {
    primary: {
      light: 'border-slate-200',
      dark: 'border-slate-700'
    },
    secondary: {
      light: 'border-slate-300',
      dark: 'border-slate-600'
    },
    hover: {
      light: 'hover:border-slate-300',
      dark: 'hover:border-slate-500'
    }
  },
  card: {
    background: {
      light: 'bg-white',
      dark: 'bg-slate-800'
    },
    border: {
      light: 'border-slate-200',
      dark: 'border-slate-700'
    },
    hover: {
      light: 'hover:border-slate-300 hover:shadow-md',
      dark: 'hover:border-slate-600 hover:shadow-slate-900/50'
    }
  },
  input: {
    background: {
      light: 'bg-white',
      dark: 'bg-slate-900'
    },
    border: {
      light: 'border-slate-300',
      dark: 'border-slate-600'
    },
    focus: {
      light: 'focus:border-tesa-blue focus:ring-tesa-blue',
      dark: 'focus:border-tesa-blue focus:ring-tesa-blue'
    },
    text: {
      light: 'text-slate-900',
      dark: 'text-white'
    },
    placeholder: {
      light: 'placeholder:text-slate-400',
      dark: 'placeholder:text-slate-500'
    }
  },
  button: {
    secondary: {
      background: {
        light: 'bg-white',
        dark: 'bg-slate-800'
      },
      border: {
        light: 'border-slate-300',
        dark: 'border-slate-600'
      },
      text: {
        light: 'text-slate-900',
        dark: 'text-white'
      },
      hover: {
        light: 'hover:bg-slate-50',
        dark: 'hover:bg-slate-700'
      }
    }
  },
  message: {
    assistant: {
      background: {
        light: 'bg-white',
        dark: 'bg-slate-800'
      },
      border: {
        light: 'border-slate-200',
        dark: 'border-slate-700'
      },
      text: {
        light: 'text-slate-900',
        dark: 'text-white'
      }
    }
  },
  badge: {
    info: {
      background: {
        light: 'bg-blue-50',
        dark: 'bg-blue-900/30'
      },
      text: {
        light: 'text-blue-700',
        dark: 'text-blue-300'
      },
      border: {
        light: 'border-blue-200',
        dark: 'border-blue-700'
      }
    },
    success: {
      background: {
        light: 'bg-green-50',
        dark: 'bg-green-900/30'
      },
      text: {
        light: 'text-green-700',
        dark: 'text-green-300'
      },
      border: {
        light: 'border-green-200',
        dark: 'border-green-700'
      }
    },
    warning: {
      background: {
        light: 'bg-orange-50',
        dark: 'bg-orange-900/30'
      },
      text: {
        light: 'text-orange-700',
        dark: 'text-orange-300'
      },
      border: {
        light: 'border-orange-200',
        dark: 'border-orange-700'
      }
    },
    error: {
      background: {
        light: 'bg-red-50',
        dark: 'bg-red-900/30'
      },
      text: {
        light: 'text-red-700',
        dark: 'text-red-300'
      },
      border: {
        light: 'border-red-200',
        dark: 'border-red-700'
      }
    }
  }
};

export function useColors(isDark: boolean) {
  const getColor = (colorPath: any) => {
    return isDark ? colorPath.dark : colorPath.light;
  };

  return {
    bg: {
      primary: getColor(colors.background.primary),
      secondary: getColor(colors.background.secondary),
      tertiary: getColor(colors.background.tertiary),
      elevated: getColor(colors.background.elevated),
      hover: getColor(colors.background.hover)
    },
    text: {
      primary: getColor(colors.text.primary),
      secondary: getColor(colors.text.secondary),
      tertiary: getColor(colors.text.tertiary),
      muted: getColor(colors.text.muted)
    },
    border: {
      primary: getColor(colors.border.primary),
      secondary: getColor(colors.border.secondary),
      hover: getColor(colors.border.hover)
    },
    card: {
      bg: getColor(colors.card.background),
      border: getColor(colors.card.border),
      hover: getColor(colors.card.hover)
    },
    input: {
      bg: getColor(colors.input.background),
      border: getColor(colors.input.border),
      focus: getColor(colors.input.focus),
      text: getColor(colors.input.text),
      placeholder: getColor(colors.input.placeholder)
    },
    button: {
      secondary: {
        bg: getColor(colors.button.secondary.background),
        border: getColor(colors.button.secondary.border),
        text: getColor(colors.button.secondary.text),
        hover: getColor(colors.button.secondary.hover)
      }
    },
    message: {
      assistant: {
        bg: getColor(colors.message.assistant.background),
        border: getColor(colors.message.assistant.border),
        text: getColor(colors.message.assistant.text)
      }
    },
    badge: {
      info: {
        bg: getColor(colors.badge.info.background),
        text: getColor(colors.badge.info.text),
        border: getColor(colors.badge.info.border)
      },
      success: {
        bg: getColor(colors.badge.success.background),
        text: getColor(colors.badge.success.text),
        border: getColor(colors.badge.success.border)
      },
      warning: {
        bg: getColor(colors.badge.warning.background),
        text: getColor(colors.badge.warning.text),
        border: getColor(colors.badge.warning.border)
      },
      error: {
        bg: getColor(colors.badge.error.background),
        text: getColor(colors.badge.error.text),
        border: getColor(colors.badge.error.border)
      }
    }
  };
}
