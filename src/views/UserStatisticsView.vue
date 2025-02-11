<template>
    <div>
        <h2 style="float: left;">用户增量统计</h2>
        <el-row :gutter="10">
            <el-col :span="6">
                <el-radio-group v-model="dateRangeSelected">
                    <el-radio-button :label="1">本周</el-radio-button>
                    <el-radio-button :label="2">本月</el-radio-button>
                    <el-radio-button :label="3">近半年</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="6" :offset="8">
                <h2>该段注册总人数：{{ this.total }}</h2>
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="24">
                <e-chart :option="chartOption" style="height: 75vh;"></e-chart>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import EChart from '@/components/EChart.vue'
import http from '@/utils/request';
import moment from 'moment'

export default {
    name: 'UserStatisticsView',
    components: {
        EChart
    },
    data() {
        return {
            dateRangeSelected: null,
            total: 0,
            chartOption: {
                tooltip: {},
                xAxis: {
                    data: []
                },
                yAxis: {},
                series: [
                    {
                        type: 'bar',
                        data: [],
                        itemStyle: {
                            barBorderRadius: 5,
                            borderWidth: 1,
                            borderType: 'solid',
                            borderColor: '#73c0de',
                            shadowColor: '#5470c6',
                            shadowBlur: 3
                        }
                    }
                ]
            }
        }
    },
    mounted() {
        this.dateRangeSelected = 1
    },
    watch: {
        dateRangeSelected: function (newVal, oldVal) {
            this.chartOption.xAxis.data = []
            this.chartOption.series[0].data = []
            let startTimes = []
            let endTimes = []
            switch (newVal) {
                case 1:
                    this.chartOption.xAxis.data = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                    for (let i = 7; i >= 1; i--) {
                        this.chartOption.xAxis.data[i - 1] += ('\n(' + moment(new Date()).isoWeekday(i).format('YYYY-MM-DD') + ')')
                        startTimes.push(moment(new Date()).isoWeekday(i).format('YYYY-MM-DD'))
                        endTimes.push(moment(new Date()).isoWeekday(i).add(1, 'days').format('YYYY-MM-DD'))
                    }
                    http.post('/user/get_user_count_by_date_range', {
                        startTimes: startTimes,
                        endTimes: endTimes
                    }).then(res => {
                        this.chartOption.series[0].data = res.data.list
                        this.total = res.data.total
                    })
                    break
                case 2:
                    startTimes.push(moment(new Date()).startOf('month').format('YYYY-MM-DD'))
                    endTimes.push(moment(new Date()).startOf('month').add(10, 'days').format('YYYY-MM-DD'))

                    startTimes.push(moment(new Date()).startOf('month').add(10, 'days').format('YYYY-MM-DD'))
                    endTimes.push(moment(new Date()).startOf('month').add(20, 'days').format('YYYY-MM-DD'))

                    startTimes.push(moment(new Date()).startOf('month').add(20, 'days').format('YYYY-MM-DD'))
                    endTimes.push(moment(new Date()).startOf('month').add(1, 'months').format('YYYY-MM-DD'))

                    http.post('/user/get_user_count_by_date_range', {
                        startTimes: startTimes,
                        endTimes: endTimes
                    }).then(res => {
                        this.chartOption.series[0].data = res.data.list
                        this.total = res.data.total
                    })
                    this.chartOption.xAxis.data = ['1号-10号', '11号-20号', '21号-月底']
                    break
                case 3:
                    for (let i = 5; i >= 0; i--) {
                        this.chartOption.xAxis.data.push(this.monthsToChinese(moment(new Date()).subtract(i, 'months').format('MMM')));
                        startTimes.push(moment(new Date()).subtract(i, 'months').startOf('month').format('YYYY-MM-DD'))
                        endTimes.push(moment(new Date()).subtract(i, 'months').startOf('month').add(1, 'months').format('YYYY-MM-DD'))
                    }
                    http.post('/user/get_user_count_by_date_range', {
                        startTimes: startTimes,
                        endTimes: endTimes
                    }
                    ).then(res => {
                        this.chartOption.series[0].data = res.data.list
                        this.total = res.data.total
                    })
            }
        }
    },
    methods: {
        monthsToChinese(MMM) {
            switch (MMM) {
                case 'Jan':
                    return '一月'
                case 'Feb':
                    return '二月'
                case 'Mar':
                    return '三月'
                case 'Apr':
                    return '四月'
                case 'May':
                    return '五月'
                case 'Jun':
                    return '六月'
                case 'Jul':
                    return '七月'
                case 'Aug':
                    return '八月'
                case 'Sep':
                    return '九月'
                case 'Oct':
                    return '十月'
                case 'Nov':
                    return '十一月'
                case 'Dec':
                    return '十二月'
            }
        }
    }
}
</script>

<style></style>