<template>
    <div>
        <el-form ref="queryForm" label-width="120px">
            <el-form-item label="预约查询："></el-form-item>
            <el-row :gutter="10">
                <el-col :span="6">
                    <el-form-item label="咨询师：">
                        <el-input v-model="queryForm.consultantName" placeholder="输入咨询师名称"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="用户：">
                        <el-input v-model="queryForm.userName" placeholder="请输入用户名称"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="预约日期：" style="text-align: start;">
                        <el-date-picker v-model="queryForm.dateRange" type="daterange" align="right" unlink-panels
                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                            :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="getAppointment" :loading="queryBtnLoading"
                        style="margin-left: 20px;">查询</el-button>
                </el-col>
            </el-row>
        </el-form>

        <!-- 预约表格 -->
        <el-table :data="appointments" stripe style="width: 100%" :border="true" height="60vh">
            <el-table-column label="预约时间段" width="340" header-align="center" align="center">
                <template slot-scope="scope">
                    <span>
                        {{ dateTimeFormat(scope.row.appointmentStartTime) }} 至
                        {{ dateTimeFormat(scope.row.appointmentEndTime) }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="adminName" label="咨询师" width="120" header-align="center" align="center" sortable>
            </el-table-column>
            <el-table-column prop="userName" label="用户名" width="120" header-align="center" align="center" sortable>
            </el-table-column>
            <el-table-column prop="fieldName" label="咨询领域" width="120" header-align="center" align="center" sortable>
            </el-table-column>
            <el-table-column label="完成状态" width="120" header-align="center" align="center" sortable>
                <template slot-scope="scope">
                    {{ appointmentStatusList.find(item => item.paramItemValue ===
                        scope.row.appointmentStatus).paramItemName }}
                </template>
            </el-table-column>
            <el-table-column header-align="center" align="center" prop="prop" label="完成时间" width="170">
                <!-- TODO完成时间，但是不知道是什么阶段的时间后续再补 -->
            </el-table-column>
            <el-table-column prop="prop" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onStop(scope.row)"
                        v-if="scope.row.appointmentStatus === 1">终止预约</el-button>
                    <el-button type="text" @click="onCheck(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!-- 查看详情 -->
        <el-dialog title="预约详情" :visible.sync="detailDialogVisible" width="width"
            :before-close="detailDialogBeforeClose" v-if="this.currentAppointment !== null">
            <el-descriptions class="margin-top" :column="3" border>
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-user"></i>
                        用户名
                    </template>
                    {{ this.currentAppointment.userName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template slot="label">
                        领域
                    </template>
                    {{ this.currentAppointment.fieldName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-time"></i>
                        预约时间
                    </template>
                    {{ dateTimeFormat(this.currentAppointment.appointmentStartTime) }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-tickets"></i>
                        预约状态
                    </template>
                    {{ appointmentStatusList.find(item => item.paramItemValue ===
                        this.currentAppointment.appointmentStatus).paramItemName }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-shopping-cart-2"></i>
                        预约费用
                    </template>
                    {{ this.currentAppointment.appointmentPrice }}
                </el-descriptions-item>
                <el-descriptions-item>
                    <template slot="label">
                        <i class="el-icon-s-custom"></i>
                        咨询师
                    </template>
                    {{ this.$store.state.userData.name }}
                </el-descriptions-item>
            </el-descriptions>
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span id="item-title">问题描述</span>
                </div>
                <div class="text item">
                    {{ this.currentAppointment.appointmentDetail !== undefined ?
                        this.currentAppointment.appointmentDetail :
                        '(暂无)' }}
                </div>
            </el-card>
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span id="item-title">诊断答复</span>
                    <div style="float: right;">
                        答复时间: {{ this.currentAppointment.appointmentReplyTime !== undefined ?
                            dateTimeFormat(this.currentAppointment.appointmentReplyTime) : '(未答复)' }}
                    </div>
                </div>
                <div class="text item">
                    {{ this.currentAppointment.appointmentReply !== undefined ? this.currentAppointment.appointmentReply
                        :
                        '(未诊断)' }}
                </div>
            </el-card>
            <el-card class="box-card">
                <div slot="header" class="clearfix">
                    <span id="item-title">评价内容</span>
                </div>
                <div class="text item">
                    {{ this.currentAppointment.appointmentComment !== undefined ?
                        this.currentAppointment.appointmentComment :
                        '(未评价)' }}
                </div>
            </el-card>
        </el-dialog>


        <!-- 分页 -->
        <div class="block" id="page-btn">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="pageInfo.currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="pageInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="pageInfo.total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import http from '@/utils/request';

export default {
    name: 'AppointmentManageView',
    data() {
        return {
            queryForm: {
                consultantName: null,
                dateRange: [],
                userName: null,
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
            currentAppointment: null,
            detailDialogVisible: false,
            appointmentStatusList: [],
            appointments: [],
            queryBtnLoading: false,
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            }
        }
    },
    mounted() {
        this.getAppointmentStatusList();
        this.getAppointment();
    },
    methods: {
        getAppointmentStatusList() {
            http.post("/param/get_param_by_id", {
                paramId: 9
            }).then(res => {
                if (res.code == 200) {
                    this.appointmentStatusList = res.data.paramItems;
                }
            })
        },
        getAppointment() {
            this.queryBtnLoading = true;
            http.post("/appointment/get_appointment", {
                startTime: this.queryForm.dateRange !== null ? this.queryForm.dateRange[0] : null,
                endTime: this.queryForm.dateRange !== null ? this.queryForm.dateRange[1] : null,
                consultantName: this.queryForm.consultantName,
                userName: this.queryForm.userName,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                if (res.code == 200) {
                    this.appointments = res.data.list;
                    this.pageInfo.total = res.data.total;
                }
                this.queryBtnLoading = false;
            })
        },
        dateTimeFormat(time) {
            var date = new Date(time);
            var y = 1900 + date.getYear();
            var m = "0" + (date.getMonth() + 1);
            var d = "0" + date.getDate();
            var h = "0" + date.getHours();
            var minute = "0" + date.getMinutes();
            return y + "年" + m.substring(m.length - 2, m.length) + "月" + d.substring(d.length - 2, d.length) + "日" + h.substring(h.length - 2, h.length) + ":" + minute.substring(minute.length - 2, minute.length);
        },
        stringLengthLimit(str, len) {
            if (str.length > len) {
                return str.substring(0, len) + "...";
            } else {
                return str;
            }
        },
        onCheck(row) {
            this.currentAppointment = row;
            this.detailDialogVisible = true;
        },
        detailDialogBeforeClose(done) {
            this.detailDialogVisible = false;
            done();
        },
        onStop(row) {
            this.$confirm('确定要终止该预约吗？此操作不可撤销！', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                http.post("/appointment/update_appointment_by_id", {
                    appointmentId: row.appointmentId,
                    appointmentStatus: 5
                }).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            message: '终止成功',
                            type: 'success'
                        });
                        this.getAppointment();
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消终止'
                });
            });
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getAppointment();
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getAppointment();
        },
    }
}
</script>

<style>
.text {
    text-indent: 2em;
    text-align: start;
    font-size: 15px;
}

.item {
    margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}

.box-card {
    margin-top: 20px;
    width: 100%;
}

#item-title {
    font-size: 18px;
    font-weight: bold;
    float: left;
}
</style>