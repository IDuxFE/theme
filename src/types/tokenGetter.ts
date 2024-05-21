/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { BaseColors, ColorPalette } from '../themeTokens'

import type {
  CertainThemeTokens,
  ExtraTokens,
  GlobalThemeTokens,
  PresetTheme,
  ThemeKeys,
} from '../types'

export type TokenGetter<K extends ThemeKeys | keyof Ext, Ext extends ExtraTokens = ExtraTokens> = (
  globalTokens: GlobalThemeTokens,
  presetTheme: PresetTheme,
  algorithms: {
    getColorPalette: (color: string) => ColorPalette
    getGreyColors: () => ColorPalette
    getBaseColors: () => BaseColors
  },
) => CertainThemeTokens<K, Ext>
