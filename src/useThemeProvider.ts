import type { ExtraTokens, ThemeProviderProps } from './types'

import { type ThemeProviderContext, THEME_PROVIDER_TOKEN } from './token'

import { provide, inject } from 'vue-demi'
import { warn } from './utils'

import {
  useThemeProviderContext,
  useSharedProviderContext,
} from './composables/useThemeProviderContext'

export type PublicThemeProviderContext<Ext extends ExtraTokens = ExtraTokens> = Pick<
  ThemeProviderContext<Ext>,
  | 'globalHashId'
  | 'getThemeHashId'
  | 'getThemeTokens'
  | 'registerToken'
  | 'updateToken'
  | 'isTokensRegistered'
  | 'presetTheme'
>

export function useThemeProvider<Ext extends ExtraTokens = ExtraTokens>(
  props?: ThemeProviderProps,
): PublicThemeProviderContext<Ext> {
  let supperContext = inject<ThemeProviderContext<Ext> | null>(THEME_PROVIDER_TOKEN, null)

  if (props?.inherit === 'all' && !supperContext) {
    if (__DEV__) {
      warn(
        'components/theme',
        `parent IxThemeProvider not found when using inherit 'all', this may cause unexpected theme errors`,
      )
    }
    supperContext = useSharedProviderContext<Ext>()
  }

  const context = useThemeProviderContext<Ext>(supperContext, props)
  provide(THEME_PROVIDER_TOKEN, context as unknown as ThemeProviderContext)

  return createPublicContext(context)
}

export function useSharedThemeProvider<Ext extends ExtraTokens>() {
  return createPublicContext(useSharedProviderContext<Ext>())
}

function createPublicContext<Ext extends ExtraTokens>(
  innerContext: ThemeProviderContext<Ext>,
): PublicThemeProviderContext<Ext> {
  const {
    presetTheme,
    globalHashId,
    registerToken,
    updateToken,
    getThemeHashId,
    getThemeTokens,
    isTokensRegistered,
  } = innerContext

  return {
    presetTheme,
    globalHashId,
    getThemeHashId,
    getThemeTokens,
    registerToken,
    updateToken,
    isTokensRegistered,
  }
}
