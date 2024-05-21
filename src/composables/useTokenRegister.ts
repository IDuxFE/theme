/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import type { BaseColors, ColorPalette } from '../themeTokens'

import { type ComputedRef, type Ref, ref, set, computed } from 'vue-demi'

import { useDynamicCss } from './useDynamicCss'
import {
  type CertainThemeTokens,
  type ExtraTokens,
  type GlobalThemeTokens,
  type PresetTheme,
  type ThemeKeys,
  type ThemeTokenAlgorithms,
  type TokenRecord,
  type ThemeRegistry,
  type TokenTransforms,
  globalTokenKey,
} from '../types'
import { createTokensHash, tokenToCss } from '../utils'

export type TokenGetter<K extends ThemeKeys | keyof Ext, Ext extends ExtraTokens = ExtraTokens> = (
  globalTokens: GlobalThemeTokens,
  presetTheme: PresetTheme,
  algorithms: {
    getColorPalette: (color: string) => ColorPalette
    getGreyColors: () => ColorPalette
    getBaseColors: () => BaseColors
  },
) => CertainThemeTokens<K, Ext>

export type RegisterToken<K extends ThemeKeys | keyof Ext, Ext extends ExtraTokens = ExtraTokens> = (
  key: K,
  registry: ThemeRegistry<Ext, K>,
  existedHashId?: string,
) => string | undefined
export type UpdateToken<K extends ThemeKeys | keyof Ext, Ext extends ExtraTokens = ExtraTokens> = (
  key: K,
  hashId?: string,
) => string | undefined

export interface TokenRegisterContext<Ext extends ExtraTokens = ExtraTokens> {
  globalHashId: ComputedRef<string>
  isTokensRegistered: (key: ThemeKeys | keyof Ext) => boolean
  registerToken: RegisterToken<ThemeKeys | keyof Ext, Ext>
  updateToken: UpdateToken<ThemeKeys | keyof Ext, Ext>
  getThemeTokens: <K extends ThemeKeys | keyof Ext>(key: K) => CertainThemeTokens<K, Ext>
  getThemeHashId: (key: ThemeKeys | keyof Ext) => string | undefined
}

export function useTokenRegister<Ext extends ExtraTokens = ExtraTokens>(
  injectThemeStyle: ComputedRef<boolean>,
  mergedPresetTheme: ComputedRef<PresetTheme>,
  mergedAlgorithms: ComputedRef<ThemeTokenAlgorithms>,
  mergedAttachTo: ComputedRef<Element | undefined>,
  mergedHashed: ComputedRef<boolean>,
  getMergedTokens: <K extends ThemeKeys | keyof Ext>(key: K, tokens: CertainThemeTokens<K, Ext>) => CertainThemeTokens<K, Ext>,
): TokenRegisterContext<Ext> {
  const tokenRecordMap = ref({}) as Ref<Record<string | keyof Ext, TokenRecord<ThemeKeys | keyof Ext, Ext>>>
  const tokenGettersMap = new Map<ThemeKeys | keyof Ext, TokenGetter<ThemeKeys | keyof Ext, Ext>>()
  const tokenTransformsMap = new Map<ThemeKeys | keyof Ext, TokenTransforms<ThemeKeys | keyof Ext, Ext> | undefined>()
  const tokenHashedMap = new Map<ThemeKeys | keyof Ext, boolean | undefined>()
  const tokenPrefixMap = new Map<ThemeKeys | keyof Ext, string | undefined>()

  const updateThemeStyle = useDynamicCss(mergedAttachTo)

  const _globalHashId = ref('')
  const setGlobalHashId = (hashId: string) => {
    _globalHashId.value = hashId
  }
  const globalHashId = computed(() => _globalHashId.value)

  const _updateToken = <K extends ThemeKeys | keyof Ext>(key: K, force: boolean, existedHashId?: string) => {
    let record = tokenRecordMap.value[key ?? globalTokenKey]

    if (record && !force) {
      return record.hashId
    }

    const globalTokens = (key === globalTokenKey
      ? {}
      : tokenRecordMap.value[globalTokenKey]?.tokens) as unknown as GlobalThemeTokens

    if (!globalTokens) {
      return
    }

    const getTokens = tokenGettersMap.get(key) as TokenGetter<K, Ext>
    const transforms = tokenTransformsMap.get(key)
    const prefix = tokenPrefixMap.get(key)
    const hashed = tokenHashedMap.get(key)

    if (!getTokens) {
      return
    }

    const tokens = getTokens(globalTokens, mergedPresetTheme.value, mergedAlgorithms.value)

    if (!tokens) {
      return
    }

    const mergedCompTokens = getMergedTokens(key, tokens)

    const hashId = existedHashId ?? createTokensHash(key as string, mergedCompTokens as Record<string, string | number>)

    if (record?.hashId === hashId) {
      return hashId
    }

    const oldHashId = record?.hashId

    record = {
      key,
      hashId: hashId,
      tokens: mergedCompTokens,
    }

    set(tokenRecordMap.value, key, record)

    // if hashId is already provided, we consider the style injected already, no need to inject it again
    if (injectThemeStyle.value && !existedHashId) {
      const cssContent = tokenToCss(
        { ...record, hashId: hashed ?? mergedHashed.value ? record.hashId : '' } as TokenRecord<string>,
        prefix,
        transforms,
      )
      updateThemeStyle(cssContent, record.hashId, oldHashId)
    }

    if (key === globalTokenKey) {
      setGlobalHashId(record.hashId)
      Object.keys(tokenRecordMap.value)
        .filter(key => key !== globalTokenKey)
        .forEach(componentTokenKey => {
          updateToken(componentTokenKey)
        })
    }

    return record.hashId
  }

  const isTokensRegistered = (key: ThemeKeys | keyof Ext) => {
    return !!tokenRecordMap.value[key]
  }

  const registerToken = <K extends ThemeKeys | keyof Ext>(
    key: K,
    registry: ThemeRegistry<Ext, K>,
    existedHashId?: string,
  ) => {
    const { getter, transforms, prefix, hashed } = registry
    tokenGettersMap.set(key, getter)
    tokenTransformsMap.set(key, transforms as any)
    tokenPrefixMap.set(key, prefix)
    tokenHashedMap.set(key, hashed)

    return _updateToken(key, false, existedHashId)
  }

  const updateToken = <K extends ThemeKeys | keyof Ext>(key: K, hashId?: string) => {
    if (!isTokensRegistered(key)) {
      return
    }

    return _updateToken(key, true, hashId)
  }

  const getThemeTokens = <K extends ThemeKeys | keyof Ext>(key: K) => {
    return tokenRecordMap.value[key]!.tokens as CertainThemeTokens<K, Ext>
  }
  const getThemeHashId = (key: ThemeKeys | keyof Ext) => {
    return tokenRecordMap.value[key]?.hashId
  }

  return {
    globalHashId,
    isTokensRegistered,
    getThemeTokens,
    getThemeHashId,
    registerToken,
    updateToken,
  }
}
