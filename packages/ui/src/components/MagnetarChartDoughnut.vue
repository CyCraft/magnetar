<script lang="ts" setup>
import type { CollectionInstance, QueryClause, WhereClause } from '@magnetarjs/types'
import { ArcElement, ChartData, Chart as ChartJS, ChartOptions, Title } from 'chart.js'
import ChartDataLabels, {
  Context,
  // @ts-expect-error fix for `import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels'` see https://github.com/chartjs/chartjs-plugin-datalabels/issues/411
} from 'chartjs-plugin-datalabels/dist/chartjs-plugin-datalabels.esm.js'
// @ts-expect-error no types...
import DoughnutLabel from 'chartjs-plugin-doughnutlabel-rebourne'
import { isAnyObject, isArray, isString } from 'is-what'
import { computed, watch } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { MUIChartDoughnut, MUIParseLabel } from '../types.js'
import { cssColorAlpha, getRandomCssColorNames } from '../utils/chartHelpers.js'

ChartJS.register(ArcElement, Title)

const props = defineProps<{
  collection: CollectionInstance<any>
  chart: MUIChartDoughnut<any, any>
  parseLabel: MUIParseLabel | undefined
}>()

const ERROR_NO_CLAUSE =
  '❗️[@magnetarjs/ui] a filter option needs one prop called `where` or `query`, got undefined'

function calcCollection(clause?: WhereClause | QueryClause): CollectionInstance<any> {
  if (isArray(clause)) {
    return props.collection.where(...clause)
  }
  if (isAnyObject(clause)) {
    return props.collection.query(clause)
  }
  console.error(ERROR_NO_CLAUSE)
  return props.collection
}

watch(
  () => props.chart.datasets?.length,
  () => {
    const datasets = props.chart.datasets || []
    // charts with datasets will fetch the "record count" for each where filter in the option
    for (const dataset of datasets) {
      calcCollection(dataset.where || dataset.query).fetchCount()
    }
  },
  { immediate: true }
)

const chartAttrs = computed<{
  label: string
  prefix?: string
  suffix?: string
  labels: string[]
}>(() => {
  const { chart, parseLabel } = props
  const label = parseLabel ? parseLabel(chart.label) : chart.label
  const prefix = parseLabel ? parseLabel(chart.prefix) : chart.prefix
  const suffix = parseLabel ? parseLabel(chart.suffix) : chart.suffix
  const labels = chart.datasets.map(({ label }) => (parseLabel ? parseLabel(label) : label))
  return { label, prefix, suffix, labels }
})

const chartData = computed<ChartData<'doughnut', number[], string>>(() => {
  const { chart } = props
  const data: number[] = chart.datasets.map<number>(
    (dataset) => calcCollection(dataset.where || dataset.query).count
  )

  return {
    labels: chartAttrs.value.labels,
    datasets: [
      {
        data,
        borderColor: getRandomCssColorNames(),
        borderWidth: 2,
        borderRadius: 2,
        hoverOffset: 8,
      },
    ],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => {
  const { labels, prefix = '', suffix = '' } = chartAttrs.value

  const datalabels = {
    color: '#5c5f69',
    align: 'end',
    anchor: 'end',
    offset: 8,
    padding: 6,
    borderRadius: 4,
    display: 'auto',
    backgroundColor: ({ dataset, dataIndex }: Context) =>
      cssColorAlpha(dataset?.borderColor?.[dataIndex], 0.8),
    borderColor: ({ dataset, dataIndex }: Context) => dataset?.borderColor?.[dataIndex],
    borderWidth: 2,
    font: { size: 12, weight: 'bold' },
    formatter: (value: number, { dataIndex }: Context) => {
      return `${labels[dataIndex]}\n${prefix}${value.toLocaleString()}${suffix}`
    },
  }

  const doughnutLabel = {
    paddingPercentage: 5,
    labels: [
      {
        text: (context: { data: ChartData<'doughnut', number[], string> }) => {
          const total = context.data.datasets[0]?.data.reduce((a, b) => a + b, 0)
          return `${prefix}${total?.toLocaleString()}${suffix}`
        },
        font: { size: '24', weight: 'bold' },
        color: '#5c5f69',
      },
    ],
  }

  const defaults = {
    backgroundColor: ({ dataset, dataIndex }) => {
      const borderColor = dataset?.borderColor
      if (!borderColor) return ''
      const color = isString(borderColor)
        ? borderColor
        : isArray(borderColor)
          ? borderColor[dataIndex]
          : ''
      if (!isString(color)) return ''
      return cssColorAlpha(color, 0.8)
    },
    plugins: {
      // @ts-expect-error This is from the 'chartjs-plugin-doughnutlabel-rebourne' plugin
      datalabels: datalabels as any,
      doughnutlabel: doughnutLabel as any,
      legend: { display: false },
      title: { display: true, text: chartAttrs.value.label, padding: { bottom: 48 } },
    },
    layout: { padding: { left: 100, right: 100, bottom: 48 } },
    responsive: true,
  } satisfies ChartOptions<'doughnut'>

  return defaults
})
</script>

<template>
  <Doughnut
    :data="chartData"
    :options="chartOptions"
    :plugins="[ChartDataLabels as any, DoughnutLabel as any]"
  />
</template>

<style lang="sass"></style>
