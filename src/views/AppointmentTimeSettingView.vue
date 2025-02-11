<template>
    <div>
        <FullCalendar class="calenderCon" :options="calendarOptions" ref="fullCalendar" />
        <el-dialog title="添加可预约时段" :visible.sync="dayDetailVisible" width="40vw" :before-close="dayDetailBeforeClose">
            <div>
                <el-form label-width="100px" style="text-align: start;">
                    <el-form-item label="选择日期：">
                        <el-date-picker v-model="date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"
                            :picker-options="{
                                disabledDate: (date) => {
                                    return date.getTime() < Date.now() - 8.64e7; // 8.64e7 = 24 * 60 * 60 * 1000
                                }
                            }"></el-date-picker>
                    </el-form-item>



                    <el-form-item label="时间段：" style="text-align: start;">
                        <el-time-picker v-model="startTime" :picker-options="startTimePickerOptions" format="HH:00"
                            value-format="HH:00" placeholder="选择起始时间" popper-class="no-minute"
                            style="margin-right: 10px;">
                        </el-time-picker>
                        至
                        <el-time-picker v-model="endTime" :picker-options="endTimePickerOptions" format="HH:00"
                            value-format="HH:00" placeholder="选择结束时间" popper-class="no-minute"
                            style="margin-left: 10px;">
                        </el-time-picker>
                    </el-form-item>




                </el-form>
            </div>
            <div slot="footer">
                <el-button @click="dayDetailVisible = false">取 消</el-button>
                <el-button type="primary" @click="onConfirm" :loading="confirmBtnLoading">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>

import FullCalendar from '@fullcalendar/vue'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import http from '@/utils/request';


export default {
    name: 'AppointmentTimeSettingView',
    components: {
        FullCalendar
    },
    data() {
        return {
            calendarApi: null,
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin], // 需要用哪个插件引入后放到这个数组里
                initialDate: new Date(), // 日历第一次加载时显示的初始日期。可以解析为Date的任何职包括ISO8601日期字符串，例如"2014-02-01"。
                initialView: 'dayGridMonth', // 日历加载时的初始视图，默认值为'dayGridMonth'，可以为任何可用视图的值，如例如'dayGridWeek'，'timeGridDay'，'listWeek'
                locale: 'zh-cn', // 设置日历的语言，中文为 “zh-cn”
                firstDay: '1', // 设置每周的第一天，默认值取决于当前语言环境，该值为代表星期几的数字，且值必须为整数，星期日=0
                weekNumberCalculation: 'ISO', // 指定"ISO"结果为ISO8601周数。指定"ISO"将firstDay的默认值更改为1（Monday）
                buttonText: { // 文本将显示在headerToolbar / footerToolbar的按钮上。不支持HTML注入。所有特殊字符将被转义。
                    today: '今天',
                    month: '月',
                    week: '周',
                    day: '天'
                },
                headerToolbar: { // 在日历顶部定义按钮和标题。将headerToolbar选项设置为false不会显示任何标题工具栏。可以为对象提供属性start/center/end或left/center/right。这些属性包含带有逗号/空格分隔值的字符串。用逗号分隔的值将相邻显示。用空格分隔的值之间会显示一个很小的间隙。
                    right: 'today addAppointmentBtn prev,next',
                    center: 'title',
                    left: 'dayGridMonth,dayGridWeek,dayGridDay'
                },
                eventTimeFormat: { // 在每个事件上显示的时间的格式
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: false
                },
                displayEventEnd: true, // 是否在日历上显示事件的时间
                events: [{ // 将在日历上显示的事件对象， events 可以是数组、json、函数。具体可以查看官方文档
                    title: '标题',
                    start: '2025-02-01 12:00:00',
                    end: '2025-02-02 08:00:00', // 这里要注意，end为可选参数，无end参数时该事件仅在当天展示
                    backgroundColor: '#FDEBC9', // 该事件的背景颜色
                    borderColor: '#FDEBC9', // 该事件的边框颜色
                    textColor: '#F9AE26' // 该事件的文字颜色
                }],
                customButtons: { // 定义可在headerToolbar / footerToolbar中使用的自定义按钮
                    today: {
                        text: '今天', // 按钮的展示文本
                        click: this.todayClick // 点击按钮触发的事件，这里要注意的是当按钮绑定了事件之后该按钮原本自带的事件将会失效
                    },
                    next: {
                        click: this.nextClick
                    },
                    prev: {
                        click: this.prevClick
                    }
                },
                customButtons: {
                    addAppointmentBtn: {
                        text: '添加可预约时间',
                        click: this.onAddAppointment
                    }
                },
                eventClick: this.handleDateClick, // 点击事件时，触发该回调
                eventMouseEnter: this.handleMouseEnter, // 鼠标悬停在事件上时，触发该回调
                eventMouseLeave: this.handleMouseLeave, // 鼠标移除时，触发该回调
                dateClick: this.handleDateClick, // 当用户单击日期或时间时,触发该回调，触发此回调，您必须加载interaction插件
                selectable: true, // 设置日历是否可选择，默认值为false
                height: "80vh", // 设置日历的高度，默认值为auto，即根据日历内容自动调整高度
            },
            selectableRangeStart: '08:00',
            selectableRangeEnd: '21:00',
            startTime: null,
            endTime: null,
            dateRange: [],
            date: null,
            consultant: null,
            confirmBtnLoading: false,
            dayDetailVisible: false,
        }
    },
    mounted() {
        // 这里有两点要注意，想要调用插件的方法，要在组件上设置ref
        // 并且在组件未加载的时候this.$refs中是没有fullCalendar的，所以未加载的时候调用方法会报错
        this.calendarApi = this.$refs.fullCalendar.getApi()
        this.getAppointmentTime()
    },
    computed: {
        // 动态生成开始时间选择框的选项
        startTimePickerOptions() {
            if (!this.endTime) {
                // 如果没有选择结束时间，则默认到晚上9点
                return {
                    selectableRange: `${this.selectableRangeStart}:00:00 - ${this.selectableRangeEnd}:00:00`,
                    format: 'HH:00',
                };
            } else {
                const endHour = parseInt(this.endTime.split(':')[0]);
                return {
                    selectableRange: `${this.selectableRangeStart}:00:00 - ${endHour - 1}:59:59`,
                    format: 'HH:00',
                };
            }
        },
        // 动态生成结束时间选择框的选项
        endTimePickerOptions() {
            if (!this.startTime) {
                // 如果没有选择开始时间，则默认从早上8点开始
                return {
                    selectableRange: `${this.selectableRangeStart}:00:00 - ${this.selectableRangeEnd}:00:00`,
                    format: 'HH:00',
                };
            } else {
                const startHour = parseInt(this.startTime.split(':')[0]);
                return {
                    selectableRange: `${startHour + 1}:00:00 - ${this.selectableRangeEnd}:00:00`,
                    format: 'HH:00',
                };
            }
        }
    },
    watch: {
        startTime(newVal) {
            if (newVal && this.endTime && newVal >= this.endTime) {
                // 如果开始时间晚于或等于结束时间，重置结束时间
                this.endTime = '';
            }
        },
        endTime(newVal) {
            if (newVal && this.startTime && newVal <= this.startTime) {
                // 如果结束时间早于或等于开始时间，重置开始时间
                this.startTime = '';
            }
        }
    },

    methods: {
        handleDateClick(dateClickInfo) {
            console.log(dateClickInfo)
        },
        handleMouseEnter(mouseEnterInfo) {
            console.log(mouseEnterInfo.event.startStr)
            // 提示：mouseEnterInfo.event.startStr 可以获取当前事件的开始事件
        },
        handleMouseLeave(mouseEnterInfo) {
            console.log(mouseEnterInfo)
        },
        todayClick(mouseEvent, htmlElement) {
            this.calendarApi.today() // 将日历移动到当前日期。
            this.calendarApi.getDate() // 返回日期的日历的当前日期
        },
        nextClick(mouseEvent, htmlElement) {
            this.calendarApi.next() // 将日历向前移动一步（例如，一个月或一周）。
            // 如果dayGridMonth查看日历，则将日历向前移动一个月。
            // 如果日历位于dayGridWeek或中timeGridWeek，则将日历向前移动一周。
            // 如果日历位于dayGridDay或中timeGridDay，则将日历向前移动一天。
        },
        prevClick(mouseEvent, htmlElement) {
            this.calendarApi.prev() // 将日历后退一步（例如，一个月或一周）。
            // 如果dayGridMonth查看日历，则将日历后移一个月。
            // 如果日历位于dayGridWeek或中timeGridWeek，则将日历后移一周。
            // 如果日历位于dayGridDay或中timeGridDay，则将日历移回一天。
        },



        dayDetailBeforeClose(done) {
            this.dayDetailVisible = false
            done()
        },
        onAddAppointment() {
            this.dayDetailVisible = true
            this.startTime = null
            this.endTime = null
            this.date = null
        },
        onConfirm() {
            if (!this.date) {
                this.$message.error('请选择日期')
                return
            }
            if (!this.startTime || !this.endTime) {
                this.$message.error('请选择时间段')
                return
            }
            if (this.startTime === this.endTime) {
                this.$message.error('开始时间不能等于结束时间')
                return
            }
            this.confirmBtnLoading = true
            this.dateRange[0] = this.date + ' ' + this.startTime + ':00'
            this.dateRange[1] = this.date + ' ' + this.endTime + ':00'
            http.post("/appointment_time/insert_appointment_time", {
                appointmentStartTime: this.dateRange[0],
                appointmentEndTime: this.dateRange[1],
                consultantId: this.consultant.consultantId,
            }).then(res => {
                if (res.code == 200) {
                    this.$message.success('添加成功')
                } else {
                    this.$message.error(res.msg)
                }
                this.getAppointmentTime()
                this.confirmBtnLoading = false
                this.dayDetailVisible = false
            })
        },
        onDayDetailClose() {
            this.dayDetailVisible = false
        },
        async getConsultant() {
            await http.post("/consultant/get_consultant_by_admin_id", {
                adminId: this.$store.state.userData.adminId
            }).then(res => {
                if (res.code == 200) {
                    this.consultant = res.data
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        async getAppointmentTime() {
            if (this.consultant === null) {
                console.log("no consultant");
                await this.getConsultant()
            }
            this.calendarOptions.events = []
            http.post("/appointment_time/get_appointment_time_by_consultant_id", {
                consultantId: this.consultant.consultantId
            }).then(res => {
                if (res.code == 200) {
                    console.log(res.data)
                    res.data.forEach(item => {
                        this.calendarOptions.events.push({
                            title: item.userName === undefined ? '(未预约)' : item.userName,
                            start: item.appointmentStartTime,
                            end: item.appointmentEndTime,
                            backgroundColor: '#999EFF',
                            textColor: item.userName === undefined ? '#fff' : '#aaa',
                            allDay: false
                        })
                    })
                    this.calendarApi.render()
                } else {
                    this.$message.error(res.data)
                }
            })
        }
    }
}
</script>

<style>
.no-minute .el-time-spinner__wrapper {
    width: 100%
}

.no-minute .el-scrollbar:nth-of-type(2) {
    display: none
}
</style>