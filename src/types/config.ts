import type { DeepPartialThemeTokens, ExtraTokens, ThemeKeys } from './themeTokens'
import type { PresetTheme, ThemeProviderAttachTo } from './themeProvider'
import type { TokenGetter } from './tokenGetter'
import type { TokenTransforms } from './tokenTransform'

export interface ThemeRegistry<Ext extends ExtraTokens, K extends ThemeKeys | keyof Ext> {
  getter: TokenGetter<K, Ext>
  hashed?: boolean
  injectThemeStyle?: boolean
  prefix?: string
  transforms?: TokenTransforms<K, Ext>
}

export interface ThemeGlobalConfig<Ext extends ExtraTokens = ExtraTokens> extends DeepPartialThemeTokens<Ext> {
  presetTheme: PresetTheme
  injectThemeStyle: boolean
  hashed: boolean
  attachTo?: ThemeProviderAttachTo
  registries?: {
    [key in keyof Ext]: ThemeRegistry<Ext, key>
  }
}
