import type {
  DeepPartialThemeTokens,
  ExtraTokens,
  ThemeGlobalConfig,
  PresetTheme,
  ThemeProviderAttachTo,
  ThemeRegistry,
} from '../types'

import { createSharedComposable } from '@vueuse/core'
import { type ComputedRef, type Ref, ref, computed } from 'vue-demi'
import { merge } from 'lodash-es'

export interface ThemeGlobalConfigContext<Ext extends ExtraTokens = ExtraTokens> {
  presetTheme: ComputedRef<PresetTheme>
  injectThemeStyle: ComputedRef<boolean>
  hashed: ComputedRef<boolean>
  attachTo: ComputedRef<ThemeProviderAttachTo | undefined>
  tokens: ComputedRef<DeepPartialThemeTokens<Ext>>
  registries: ComputedRef<
    | {
        [key in keyof Ext]: ThemeRegistry<Ext, key>
      }
    | undefined
  >
  updateGlobalConfig: (config: Partial<ThemeGlobalConfig<Ext>>) => void
}

let onGlobalConfigUpdate: (() => void) | undefined

const globalConfigStore: ThemeGlobalConfig = {
  presetTheme: 'default',
  injectThemeStyle: true,
  hashed: true,
}

export function setGlobalConfig<Ext extends ExtraTokens>(config: Partial<ThemeGlobalConfig<Ext>>) {
  merge(globalConfigStore, config)

  onGlobalConfigUpdate?.()
}

export const useGlobalConfig = createSharedComposable(<
  Ext extends ExtraTokens,
>(): ThemeGlobalConfigContext<Ext> => {
  const globalConfig = ref({ ...globalConfigStore }) as Ref<ThemeGlobalConfig<Ext>>

  onGlobalConfigUpdate = () => {
    globalConfig.value = { ...globalConfigStore } as ThemeGlobalConfig<Ext>
  }

  const presetTheme = computed(() => globalConfig.value.presetTheme)
  const injectThemeStyle = computed(() => globalConfig.value.injectThemeStyle)
  const hashed = computed(() => globalConfig.value.hashed)
  const attachTo = computed(() => globalConfig.value.attachTo)
  const tokens = computed(() => ({
    global: globalConfig.value.global,
    components: globalConfig.value.components,
  }))
  const registries = computed(() => globalConfig.value.registries)

  const updateGlobalConfig = (config: Partial<ThemeGlobalConfig<Ext>>) => {
    setGlobalConfig(config)
  }

  return {
    presetTheme,
    injectThemeStyle,
    hashed,
    attachTo,
    tokens,
    registries,
    updateGlobalConfig,
  }
})
