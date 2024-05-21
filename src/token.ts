/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { TokenRegisterContext } from './composables/useTokenRegister'
import type { ExtraTokens, PresetTheme, ResetTokenKey, ThemeKeys, ThemeTokens, UseThemeProviderStates } from './types'
import type { ComputedRef, InjectionKey } from 'vue-demi'

export interface ThemeProviderContext<Ext extends ExtraTokens = ExtraTokens> extends TokenRegisterContext<Ext> {
  useThemeTokenContextMap: Map<ThemeKeys | keyof Ext, UseThemeProviderStates<Ext> | undefined>
  presetTheme: ComputedRef<PresetTheme>
  hashed: ComputedRef<boolean>
  attachTo: ComputedRef<Element | undefined>
  mergedTokens: ComputedRef<Omit<ThemeTokens, ResetTokenKey>>
}

// public
export const THEME_PROVIDER_TOKEN: InjectionKey<ThemeProviderContext> = Symbol('THEME_PROVIDER_TOKEN')
