<template>
    <div>

        <!-- 上方选择领域 -->
        <el-form ref="form" :model="queryForm" label-width="150px">
            <el-row :gutter="10">
                <el-col :span="8">
                    <el-form-item label="选择领域题库：">
                        <el-select v-model="queryForm.fieldId" placeholder="选择领域" @change="onChangeField">
                            <el-option v-for="item in fields" :key="item.fieldId" :label="item.fieldName"
                                :value="item.fieldId">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="5">
                    <el-button type="primary">新增题目</el-button>
                </el-col>
            </el-row>
        </el-form>

        <!-- 题目表格 -->
        <el-table :data="questions" stripe style="width: 100%" height="65vh"
            :default-sort="{ prop: 'questionTitle', order: 'descending' }" :border="true"
            @expand-change="onTableChange">
            <el-table-column type="expand" label="展开" width="50">
                <template slot-scope="scope">
                    <el-table :data="scope.row.questionItems" :border="true" stripe size="mini"
                        :default-sort="{ prop: 'questionItemOrder', order: 'ascending' }">
                        <el-table-column width="50"></el-table-column>
                        <el-table-column prop="questionItemId" label="QIID" width="60"></el-table-column>
                        <el-table-column prop="questionItemName" label="选项名" width="200" sortable></el-table-column>
                        <el-table-column prop="questionItemOrder" label="选项次序" width="200" sortable></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="text" @click="onEdit(scope.row)">修改</el-button>
                                <el-button type="text" @click="onDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </template>
            </el-table-column>
            <el-table-column prop="questionId" label="QID" width="60"></el-table-column>
            <el-table-column prop="questionTitle" label="问题题干" width="800" sortable></el-table-column>
            <el-table-column prop="questionOrder" label="参数次序" width="120" sortable align="center"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onEditRow(scope.row)">修改</el-button>
                    <el-button type="text" @click="onDeleteRow(scope.row)">删除</el-button>
                </template>
            </el-table-column>

        </el-table>



        

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
    name: 'QuestionManageView',
    data() {
        return {
            fields: [],
            questions: [],
            queryForm: {
                fieldId: 1,
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
        }
    },
    methods: {
        getFields() {
            http.post('/field/get_all').then(res => {
                this.fields = res.data
            })
        },
        getQuestions() {
            http.post('/question/get_question_by_field', {
                fieldId: this.queryForm.fieldId,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                if (res.code === 200) {
                    this.questions = res.data.list
                    this.pageInfo.total = res.data.total
                } else {
                    this.$message(
                        {
                            message: "该领域没有题目",
                            type: 'info'
                        }
                    )
                    this.questions = []
                }
            })
        },
        getQuestionDetail(row) {
            http.post('/question/get_question_by_id', {
                questionId: row.questionId
            }).then(res => {
                this.questions.find(item => item.questionId === row.questionId).questionItems = res.data.questionItems
                console.log(this.questions);

            })
        },
        onTableChange(row, expandedRows) {
            this.getQuestionDetail(row)
        },
        onChangeField() {
            this.getQuestions()
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val
            this.getQuestions()
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val
            this.getQuestions()
        },
        onEdit(row) {
            console.log(row);
        },
        onDelete(row) {
            console.log(row);
        },
        onEditRow(row) {
            console.log(row);
        },
        onDeleteRow(row) {
            console.log(row);
        },
    },
    created() {
        this.getFields()
        this.getQuestions()
    }
}
</script>

<style>
.demo-table-expand {
    font-size: 0;
}

.demo-table-expand label {
    width: 90px;
    color: #99a9bf;
    margin-left: 20px;
}

.demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
}

#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>