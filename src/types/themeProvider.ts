/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { DeepPartialThemeTokens, ExtraTokens, ThemeKeys, ThemeTokenAlgorithms } from './themeTokens'
import type { UseThemeTokenContext } from '../useThemeToken'
import type {
  DefineComponent,
  EffectScope,
  HTMLAttributes,
  PropType,
  ExtractPropTypes,
  ExtractPublicPropTypes,
} from 'vue-demi'

export type ThemeInherit = boolean | 'all'
export type PresetTheme = 'default' | 'dark'
export type ThemeProviderAttachTo = string | HTMLElement | (() => HTMLElement)

export interface UseThemeProviderStates<Ext extends ExtraTokens = ExtraTokens> {
  scope: EffectScope
  subscribers: number
  context: UseThemeTokenContext<ThemeKeys | keyof Ext, Ext>
}

export const themeProviderProps = {
  presetTheme: {
    type: String as PropType<PresetTheme>,
    default: undefined,
  },
  injectThemeStyle: {
    type: Boolean,
    default: undefined,
  },
  hashed: {
    type: Boolean,
    default: undefined,
  },
  tag: String,
  setGlobalHashId: { type: Boolean, default: true },
  inherit: {
    type: [Boolean, String] as PropType<ThemeInherit>,
    default: true,
  },
  attachTo: [String, Object, Function] as PropType<ThemeProviderAttachTo>,
  tokens: Object as PropType<DeepPartialThemeTokens>,
  algorithm: Object as PropType<Partial<ThemeTokenAlgorithms>>,
} as const

export type ThemeProviderProps = ExtractPropTypes<typeof themeProviderProps>
export type ThemeProviderPublicProps = ExtractPublicPropTypes<typeof themeProviderProps>
export type ThemeProviderComponent = DefineComponent<
  Omit<HTMLAttributes, keyof ThemeProviderPublicProps> & ThemeProviderPublicProps
>
export type ThemeProviderInstance = InstanceType<DefineComponent<ThemeProviderProps>>
