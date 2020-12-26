<template>
  <q-page class="page-docs" padding>
    <DocPage
      :pathToChapterFiles="pathToChapterFiles"
      :chapterOrder="chapterOrder"
      @TOC="(TOC) => $emit('set-toc', TOC)"
    />
  </q-page>
</template>

<style lang="sass">
// $
.page-docs
  h1, h2, h3, h4, h5, h6
    margin-top: 1.6em
    margin-bottom: 0.6em

  blockquote
    position: relative
    margin-left: 0
    +py($md)
    +px($xl)
    &:before,&:after
      position: absolute
      top: 0
    &:after
      content: '“'
      left: 0.3em
      font-size: 2em
      line-height: 1.4em
    &:before
      content: ''
      left: 0
      width: 0.4em
      height: 100%
      background: currentColor
      opacity: 0.1
  .markdown
    +C(color, 'white')
    code:not(.language-js):not(.language-html)
      color: #eeeeee
      +py(3px)
      +px(6px)
      border-radius: 6px
    code:not(.language-js):not(.language-html),
    pre
      +C(background, lucy-bg-head)
  .planetar-example-card
    +C(color, 'black')
  .planetar-api-card
    +C(background, 'white')
    .text-h4
      +C(color, lucy-bg-head)
    a
      +C(color, primary)
</style>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { DocPage } from 'planetar'
import { routeNamePageChaptersMap } from '../config/pageChapters'
import { ROUTE_NAMES } from '../router/routes'

export default defineComponent({
  components: { DocPage },
  props: {
    id: { type: String },
  },
  setup(props, options) {
    const routeName = options.root.$route.name as ROUTE_NAMES
    const pathToChapterFiles = 'pages/' + routeName
    const chapterOrder = computed((): string[] => routeNamePageChaptersMap[routeName])

    return { pathToChapterFiles, chapterOrder }
  },
})
</script>
