/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { BasicTokens } from './basicToken'
import type { DerivedTokens } from './derived'
import type { ExtendedTokens } from './extended'
import type { ResetTokens } from './reset'
import type { BaseColors, ColorPalette } from '../../themeTokens'

export type { BasicTokens } from './basicToken'
export type {
  DerivedTokens,
  DerivedColorTokens,
  DerivedFontTokens,
  DerivedSizeTokens,
  DerivedMotionTokens,
  ShadowTokens,
} from './derived'
export type {
  ExtendedTokens,
  ExtendedColorTokens,
  ExtendedFontTokens,
  ExtendedSizeTokens,
  ControlTokens,
  ScrollbarTokens,
  OverlayTokens,
} from './extended'

export type { ResetTokens }

export const globalTokenKey = 'global'
export const resetTokenKey = 'reset'
export const componentTokenKey = 'components'
export const themeTokenPrefix = 'ix'

export type GlobalTokenKey = typeof globalTokenKey
export type ResetTokenKey = typeof resetTokenKey

export type ExtraTokens = Record<string, Record<string, string | number>>

export interface GlobalThemeTokens extends BasicTokens, DerivedTokens, ExtendedTokens {}

export interface ThemeTokens<Ext extends ExtraTokens = ExtraTokens> {
  global: GlobalThemeTokens
  reset: ResetTokens
  components: Ext & {
    [key: string]: Record<string, string | number>
  }
}
export interface DeepPartialThemeTokens<Ext extends ExtraTokens = ExtraTokens> {
  global?: Partial<GlobalThemeTokens>
  components?: {
    [key in keyof Ext]?: Partial<Ext[key]>
  } & {
    [key: string]: Record<string, string | number>
  }
}

export type ThemeKeys =
  | typeof globalTokenKey
  | typeof resetTokenKey
  | (string & Record<never, never>)

export type CertainThemeTokens<
  key extends ThemeKeys | keyof Ext,
  Ext extends ExtraTokens = ExtraTokens,
> = key extends typeof globalTokenKey
  ? GlobalThemeTokens
  : key extends typeof resetTokenKey
    ? ResetTokens
    : key extends keyof Ext
      ? Ext[key]
      : Record<string, string | number>

export type ThemeTokenKey<
  key extends ThemeKeys | keyof Ext,
  Ext extends ExtraTokens = ExtraTokens,
> = key extends typeof globalTokenKey
  ? keyof GlobalThemeTokens
  : key extends keyof Ext
    ? keyof Ext[key]
    : string

export type GetColorPalette = (color: string) => ColorPalette
export type GetGreyColors = () => ColorPalette
export type GetBaseColors = () => BaseColors

export interface ThemeTokenAlgorithms {
  getColorPalette: GetColorPalette
  getGreyColors: GetGreyColors
  getBaseColors: GetBaseColors
}
