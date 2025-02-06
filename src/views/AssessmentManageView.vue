<template>
    <div>
        <!-- 上方查询条件表单 -->
        <el-form ref="form" :model="queryForm" label-width="150px">
            <el-form-item label="查询条件："></el-form-item>
            <el-row :gutter="10">
                <el-col :span="6">
                    <el-form-item label="查询时间段：">
                        <el-date-picker v-model="dateRange" type="datetimerange" align="right" unlink-panels
                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                            :picker-options="pickerOptions">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-form-item label="查询分数范围：" style="margin-left: 32vw;">
                    <el-col :span="6">
                        <el-input v-model="firstScore" placeholder="输入分数一" oninput="value=value.replace(/[^\d.]/g,'')">
                        </el-input>
                    </el-col>
                    <el-col :span="1">
                        至
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model="secondScore" placeholder="输入分数二" oninput="value=value.replace(/[^\d.]/g,'')">
                        </el-input>
                    </el-col>
                    <el-col :span="2" :offset="2">
                        <el-button type="primary" @click="getAssessmentRecords">查询</el-button>
                    </el-col>
                </el-form-item>
            </el-row>
        </el-form>

        <!-- 测评表格 -->
        <el-table :data="assessmentRecords" style="width: 100%" :border="true" stripe>
            <el-table-column prop="assessmentTime" label="评测日期" width="180"></el-table-column>
            <el-table-column prop="userName" label="用户" width="200"></el-table-column>
            <el-table-column prop="fieldName" label="领域" width="200"></el-table-column>
            <el-table-column prop="assessmentScore" label="得分" width="200"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onCheck(scope.row)">查看报告</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 详情弹出框 -->
        <el-dialog title="报告详情" :visible.sync="detailDialogVisible" width="40vw"
            :before-close="detailDialogBeforeClose">
            <el-form ref="form" label-width="100px">
                <el-form-item label="评测结果：" style="text-align: start;">
                    {{ currentRow !== null ? results.find(item => item.paramItemValue === currentRow.assessmentResult).paramItemName : '' }}
                </el-form-item>
                <el-form-item label="评测时间：" style="text-align: start;">
                    {{ currentRow !== null ? currentRow.assessmentTime : '' }}
                </el-form-item>
                <el-form-item label="报告内容：" style="text-align: start;">
                    {{ currentRow !== null ? currentRow.assessmentReport : '' }}
                </el-form-item>
            </el-form>

            <div slot="footer">
                <el-button @click="detailDialogVisible = false">返 回</el-button>
            </div>
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
    name: 'AssessmentManageView',
    data() {
        return {
            dateRange: [],
            queryForm: {},
            results: [],
            firstScore: null,
            secondScore: null,
            assessmentRecords: [],
            results: [],
            currentRow: null,
            detailDialogVisible: false,
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
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
    created() {
        this.getAssessmentRecords();
        this.getResults();
    },
    methods: {
        getAssessmentRecords() {
            http.post('/assessment_record/get_assessment_record_by_datetime_and_score', {
                startTime: this.dateRange[0] === undefined ? null : this.dateRange[0],
                endTime: this.dateRange[1] === undefined ? null : this.dateRange[1],
                startScore: this.firstScore > this.secondScore ? this.secondScore : this.firstScore,
                endScore: this.firstScore > this.secondScore ? this.firstScore : this.secondScore,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                if (res.code == 200) {
                    this.assessmentRecords = res.data.list;
                    this.pageInfo.total = res.data.total;
                }
            })
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getAssessmentRecords();
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getAssessmentRecords();
        },
        onCheck(row) {
            this.currentRow = row;
            this.detailDialogVisible = true;
        },
        detailDialogBeforeClose(done) {
            this.currentRow = null;
            done();
        },
        getResults() {
            http.post('/param/get_param_by_id', {
                paramId: 8
            }).then(res => {
                if (res.code === 200) {
                    this.results = res.data.paramItems;
                }
            })
        }
    }
}
</script>

<style></style>