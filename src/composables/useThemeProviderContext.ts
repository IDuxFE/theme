/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import { computed, watch } from 'vue-demi'
import { createSharedComposable } from '@vueuse/core';

import { isFunction } from 'lodash-es'

import { useGlobalConfig } from './useGlobalConfig'

import { useTokenMerge } from './useTokenMerge'
import { useTokenRegister } from './useTokenRegister'
import { getResetTokens } from '../themeTokens'
import { type ThemeProviderContext } from '../token'
import {
  type ExtraTokens,
  type ThemeKeys,
  type ThemeProviderProps,
  type UseThemeProviderStates,
  globalTokenKey,
  resetTokenKey,
  type TokenTransforms,
} from '../types'

export function useThemeProviderContext<Ext extends ExtraTokens = ExtraTokens>(
  supperContext: ThemeProviderContext<Ext> | null,
  props?: ThemeProviderProps,
): ThemeProviderContext<Ext> {
  const { presetTheme, injectThemeStyle, hashed, attachTo, tokens, registries } =
    useGlobalConfig<Ext>()
  const mergedInjectThemeStyle = computed(() => props?.injectThemeStyle ?? injectThemeStyle.value)
  const mergedPresetTheme = computed(
    () =>
      (props?.inherit && !props.presetTheme
        ? supperContext?.presetTheme.value
        : props?.presetTheme) ?? presetTheme.value,
  )
  const mergedHashed = computed(
    () =>
      (props?.inherit ? supperContext?.hashed.value : undefined) ?? props?.hashed ?? hashed.value,
  )
  const useSupper = computed(() => props?.inherit && !props.tokens?.global && !!supperContext)

  const mergedAttachTo = computed(() => {
    const _attachTo =
      (props?.inherit ? supperContext?.attachTo.value : undefined) ??
      props?.attachTo ??
      attachTo.value
    if (!_attachTo) {
      return
    }

    if (_attachTo instanceof Element) {
      return _attachTo
    }

    if (isFunction(_attachTo)) {
      return _attachTo()
    }

    return document.querySelector(_attachTo) ?? undefined
  })

  const { mergedAlgorithms, mergedTokens, getMergedTokens } = useTokenMerge<Ext>(
    props,
    tokens,
    supperContext,
    mergedPresetTheme,
  )
  const {
    globalHashId,
    registerToken,
    updateToken,
    getThemeTokens,
    getThemeHashId,
    isTokensRegistered,
  } = useTokenRegister<Ext>(
    mergedInjectThemeStyle,
    mergedPresetTheme,
    mergedAlgorithms,
    mergedAttachTo,
    mergedHashed,
    getMergedTokens,
  )

  let onGlobalTokenRegistered: (() => void) | undefined = () => {
    onGlobalTokenRegistered = undefined
    watch(
      registries,
      _registries => {
        if (!_registries) {
          return
        }

        Object.keys(_registries).forEach(key => {
          const registryKey = key as keyof Ext
          const { getter, transforms, injectThemeStyle, hashed, prefix } = _registries[registryKey]
          if (isTokensRegistered(registryKey)) {
            registerToken(registryKey, {
              getter,
              transforms: transforms as TokenTransforms<ThemeKeys | keyof Ext, Ext>,
              prefix,
              hashed: hashed ?? mergedHashed.value,
            })
          } else {
            updateToken(registryKey)
          }
        })
      },
      {
        immediate: true,
        deep: true,
      },
    )
  }

  watch(
    () => mergedTokens.value.global,
    () => {
      if (!isTokensRegistered(globalTokenKey)) {
        registerToken(
          globalTokenKey,
          {
            getter: () =>
              useSupper ? supperContext!.getThemeTokens(globalTokenKey) : mergedTokens.value.global,
            prefix: undefined,
          },
          useSupper.value ? supperContext!.getThemeHashId(globalTokenKey) : undefined,
        )

        onGlobalTokenRegistered?.()
      } else {
        updateToken(
          globalTokenKey,
          useSupper.value ? supperContext!.getThemeHashId(globalTokenKey) : undefined,
        )
      }

      // sub providers don't register reset styles
      if ((props?.inherit && !!supperContext) || isTokensRegistered(resetTokenKey)) {
        return
      }

      registerToken(
        resetTokenKey,
        {
          getter: globalTokens =>
            useSupper.value
              ? supperContext!.getThemeTokens(resetTokenKey)
              : getResetTokens(globalTokens),
          hashed: false,
        },
        useSupper.value ? supperContext!.getThemeHashId(resetTokenKey) : undefined,
      )
    },
    {
      immediate: true,
      deep: true,
    },
  )

  watch(
    () => mergedTokens.value.components,
    components => {
      Object.keys(components).forEach(key => {
        updateToken(key)
      })
    },
    {
      deep: true,
    },
  )

  const useThemeTokenContextMap = new Map<ThemeKeys | keyof Ext, UseThemeProviderStates<Ext>>()

  return {
    globalHashId,
    hashed: mergedHashed,
    presetTheme: mergedPresetTheme,
    attachTo: mergedAttachTo,
    mergedTokens,
    useThemeTokenContextMap,
    getThemeHashId,
    registerToken,
    updateToken,
    getThemeTokens,
    isTokensRegistered,
  }
}

export const useSharedProviderContext = createSharedComposable(<Ext extends ExtraTokens>() => useThemeProviderContext<Ext>(null))