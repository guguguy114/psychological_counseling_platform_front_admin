<template>
    <div :style="{width: '100%', height: '300px'}" ref="chart"></div>
  </template>
   
  <script>
  import * as echarts from 'echarts'
   
  export default {
    name: 'EChart',
    props: {
      option: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chartInstance: null
      }
    },
    watch: {
      option: {
        handler(newOption) {
          if (this.chartInstance) {
            this.chartInstance.setOption(newOption);
          }
        },
        deep: true
      }
    },
    mounted() {
      this.chartInstance = echarts.init(this.$refs.chart);
      this.chartInstance.setOption(this.option);
    },
    beforeDestroy() {
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }
    }
  }
  </script>
  