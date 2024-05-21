/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { ThemeProviderContext } from '../token'

import { type ComputedRef, computed } from 'vue-demi'

import { merge } from 'lodash-es'

import { getPresetAlgorithms, getThemeTokens } from '../themeTokens'
import {
  type CertainThemeTokens,
  type DeepPartialThemeTokens,
  type ExtraTokens,
  type GlobalThemeTokens,
  type PresetTheme,
  type ResetTokenKey,
  type ThemeKeys,
  type ThemeProviderProps,
  type ThemeTokenAlgorithms,
  type ThemeTokens,
  globalTokenKey,
} from '../types'

export interface TokenMergeContext<Ext extends ExtraTokens> {
  mergedAlgorithms: ComputedRef<ThemeTokenAlgorithms>
  mergedTokens: ComputedRef<Omit<ThemeTokens, ResetTokenKey>>
  getMergedTokens: <K extends ThemeKeys | keyof Ext>(
    key: K,
    tokens: CertainThemeTokens<K, Ext>,
  ) => CertainThemeTokens<K, Ext>
}

export function useTokenMerge<Ext extends ExtraTokens>(
  props: ThemeProviderProps | undefined,
  tokens: ComputedRef<DeepPartialThemeTokens<Ext>>,
  supperContext: ThemeProviderContext<Ext> | null,
  mergedPresetTheme: ComputedRef<PresetTheme>,
): TokenMergeContext<Ext> {
  const mergedAlgorithms = computed(() => {
    const presetAlgorithms = getPresetAlgorithms(mergedPresetTheme.value)
    const { getBaseColors, getColorPalette, getGreyColors } = props?.algorithm ?? {}

    return {
      getBaseColors: getBaseColors ?? presetAlgorithms.getBaseColors,
      getColorPalette: getColorPalette ?? presetAlgorithms.getColorPalette,
      getGreyColors: getGreyColors ?? presetAlgorithms.getGreyColors,
    }
  })

  const mergedTokens = computed(() => {
    const { global: configGlobalTokens, components: configComponentTokens } = tokens.value

    const overwrittenTokens = merge(
      {
        ...(props?.inherit && !props.presetTheme
          ? supperContext?.mergedTokens.value.global ?? {}
          : {}),
      },
      { ...configGlobalTokens },
      props?.tokens?.global,
    ) as GlobalThemeTokens

    const mergedGlobalTokens = getThemeTokens(
      mergedPresetTheme.value,
      overwrittenTokens,
      mergedAlgorithms.value,
    )

    const mergedComponentTokens = merge(
      { ...(props?.inherit ? supperContext?.mergedTokens.value.components ?? {} : {}) },
      { ...configComponentTokens },
      props?.tokens?.components,
    )

    return {
      global: mergedGlobalTokens,
      components: mergedComponentTokens,
    } as DeepPartialThemeTokens<Ext>
  })

  const getMergedTokens = <K extends ThemeKeys | keyof Ext>(
    key: K,
    tokens: CertainThemeTokens<K, Ext>,
  ): CertainThemeTokens<K, Ext> => {
    if (key === globalTokenKey) {
      return merge({ ...tokens }, mergedTokens.value.global)
    }

    return merge({ ...tokens }, mergedTokens.value.components?.[key])
  }

  return {
    mergedAlgorithms,
    mergedTokens: mergedTokens as ComputedRef<Omit<ThemeTokens, ResetTokenKey>>,
    getMergedTokens,
  }
}
