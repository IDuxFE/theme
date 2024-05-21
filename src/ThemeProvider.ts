/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/idux/blob/main/LICENSE
 */

import { defineComponent, h } from 'vue-demi'

import { useThemeProvider } from './useThemeProvider'
import { themeProviderProps } from './types'

export default defineComponent({
  name: 'IxThemeProvider',
  props: themeProviderProps,
  setup(props, { slots, attrs }) {
    const { globalHashId } = useThemeProvider(props)

    return () =>
      props.tag
        ? h(
            props.tag,
            {
              attrs,
              class: props.setGlobalHashId ? globalHashId.value : undefined,
            },
            slots.default?.(),
          )
        : slots.default?.()
  },
})
