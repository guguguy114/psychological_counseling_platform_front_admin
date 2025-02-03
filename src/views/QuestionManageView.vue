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
                    <el-button type="primary" @click="onOpenAddQuestionDialog">新增题目</el-button>
                </el-col>
            </el-row>
        </el-form>

        <!-- 题目表格 -->
        <el-table :data="questions" stripe style="width: 100%" height="65vh"
            :default-sort="{ prop: 'questionOrder', order: 'ascending' }" :border="true" @expand-change="onTableChange">
            <el-table-column type="expand" label="展开" width="50">
                <template slot-scope="scope">
                    <el-table :data="scope.row.questionItems" :border="true" stripe size="mini"
                        :default-sort="{ prop: 'questionItemOrder', order: 'ascending' }">
                        <el-table-column width="50"></el-table-column>
                        <el-table-column prop="questionItemId" label="QIID" width="60"></el-table-column>
                        <el-table-column prop="questionItemName" label="选项名" width="200" sortable></el-table-column>
                        <el-table-column prop="questionItemOrder" label="选项次序" width="200" sortable></el-table-column>
                        <el-table-column prop="questionItemScore" label="分值" width="200" sortable></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="text" @click="onEditRow(scope.row)">修改</el-button>
                                <el-button type="text" @click="onDeleteRow(scope.row)">删除</el-button>
                            </template>
                            <template slot="header">
                                操作
                                <el-button type="text" icon="el-icon-plus" size="small" style="margin-left: 20px;"
                                    @click="onAddOption(scope.row)">添加选项</el-button>
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
                    <el-button type="text" @click="onEdit(scope.row)">修改</el-button>
                    <el-button type="text" @click="onDelete(scope.row)">删除</el-button>
                </template>

            </el-table-column>
        </el-table>


        <!-- 新增题目对话框 -->
        <el-dialog title="新增题目" width="30vw" :visible.sync="addQuestionDialogVisible"
            :before-close="addQuestionDialogBeforeClose">
            <el-form :model="addQuestionForm">
                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="新增题目题干：" label-width="120px">
                            <el-input v-model="addQuestionForm.questionTitle" placeholder="输入题目题干"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="题目次序：" label-width="120px">
                            <el-input v-model="addQuestionForm.questionOrder" type="number"
                                placeholder="输入题目次序"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer">
                <el-button @click="addQuestionDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addQuestion" :loading="addQuestionConfirmBtnLoading">确 定</el-button>
            </div>
        </el-dialog>


        <!-- 新增选项对话框 -->
        <el-dialog title="新增选项" width="30vw" :visible.sync="addOptionDialogVisible"
            :before-close="addOptionDialogBeforeClose">
            <el-form :model="addOptionForm">
                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="新增选项信息：" label-width="120px">
                            <el-input v-model="addOptionForm.questionItemName" placeholder="输入选项信息"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="选项次序：" label-width="120px">
                            <el-input v-model="addOptionForm.questionItemOrder" type="number"
                                placeholder="输入选项次序"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="选项分值：" label-width="120px">
                            <el-input v-model="addOptionForm.questionItemScore" type="number"
                                placeholder="输入选项分值"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer">
                <el-button @click="addOptionDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addOption" :loading="addOptionConfirmBtnLoading">确 定</el-button>
            </div>
        </el-dialog>


        <!-- 修改问题对话框 -->
        <el-dialog title="修改题目信息" width="30vw" :visible.sync="editQuestionDialogVisible"
            :before-close="editQuestionDialogBeforeClose">
            <el-form :model="updateQuestionForm">
                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="修改题目：" label-width="120px">
                            <el-input v-model="updateQuestionForm.questionTitle" placeholder="输入新题目"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="修改题目次序：" label-width="120px">
                            <el-input v-model="updateQuestionForm.questionOrder" type="number"
                                placeholder="输入新题目次序"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer">
                <el-button @click="editQuestionDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editQuestion" :loading="editQuestionConfirmBtnLoading">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改选项对话框 -->
        <el-dialog title="修改题目信息" width="30vw" :visible.sync="editQuestionItemDialogVisible"
            :before-close="editQuestionItemDialogBeforeClose">
            <el-form :model="updateQuestionItemForm">
                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="修改选项：" label-width="120px">
                            <el-input v-model="updateQuestionItemForm.questionItemName" placeholder="输入新选项"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="修改选项次序：" label-width="120px">
                            <el-input v-model="updateQuestionItemForm.questionItemOrder" type="number"
                                placeholder="输入新选项次序"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="20">
                        <el-form-item label="修改选项分值：" label-width="120px">
                            <el-input v-model="updateQuestionItemForm.questionItemScore" type="number"
                                placeholder="输入新选项分值"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer">
                <el-button @click="editQuestionItemDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editQuestionItem" :loading="editQuestionItemConfirmBtnLoading">确
                    定</el-button>
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
            addQuestionDialogVisible: false,
            addQuestionForm: {
                questionTitle: '',
                questionOrder: ''
            },
            editQuestionDialogVisible: false,
            editQuestionConfirmBtnLoading: false,
            addQuestionConfirmBtnLoading: false,
            addOptionDialogVisible: false,
            editQuestionItemDialogVisible: false,
            editQuestionItemConfirmBtnLoading: false,
            addOptionForm: {
                questionItemName: '',
                questionItemOrder: '',
                questionItemScore: ''
            },
            updateQuestionItemForm: {
                questionItemId: '',
                questionItemName: '',
                questionItemOrder: '',
                questionItemScore: ''
            },
            updateQuestionForm: {
                questionId: '',
                questionTitle: '',
                questionOrder: ''
            },
            updateQuestionConfirmBtnLoading: false,
            currentQuestion: null,
            addOptionConfirmBtnLoading: false,

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
            console.log("row");
            console.log(row);


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
        // 修改题目
        onEdit(row) {
            this.updateQuestionForm = {
                questionId: row.questionId,
                questionTitle: row.questionTitle,
                questionOrder: row.questionOrder
            }
            this.editQuestionDialogVisible = true
        },
        onDelete(row) {
            this.$confirm("此操作将删除该问题, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/question/update_question_by_id", {
                    questionId: row.questionId,
                    questionIsDelete: 1,
                }).then((res) => {
                    if (res.code === 200) {
                        this.$message({
                            message: "删除成功",
                            type: "success"
                        });
                        this.getQuestions()
                    } else {
                        this.$message({
                            message: "删除失败",
                            type: "error"
                        });
                    }
                });
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "撤销操作"
                });
            });
        },
        onEditRow(row) {
            this.currentQuestion = row
            this.updateQuestionItemForm = {
                questionItemId: row.questionItemId,
                questionItemName: row.questionItemName,
                questionItemOrder: row.questionItemOrder,
                questionItemScore: row.questionItemScore
            }
            this.editQuestionItemDialogVisible = true
        },
        onDeleteRow(row) {
            this.$confirm("此操作将删除该选项, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/question_item/update_question_item_by_id", {
                    questionItemId: row.questionItemId,
                    questionItemIsDelete: 1,
                }).then((res) => {
                    if (res.code === 200) {
                        this.$message({
                            message: "删除成功",
                            type: "success"
                        });
                        this.getQuestionDetail(row)
                    } else {
                        this.$message({
                            message: "删除失败",
                            type: "error"
                        });
                    }
                });
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "撤销操作"
                });
            });
        },
        onOpenAddQuestionDialog() {
            this.addQuestionDialogVisible = true
        },
        addQuestionDialogBeforeClose(done) {
            done()
        },
        addQuestion() {
            this.addQuestionConfirmBtnLoading = true
            http.post('/question/insert_question', {
                questionTitle: this.addQuestionForm.questionTitle,
                questionOrder: this.addQuestionForm.questionOrder,
                fieldId: this.queryForm.fieldId
            }).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: "添加成功",
                        type: 'success'
                    })
                    this.addQuestionDialogVisible = false
                    this.addQuestionConfirmBtnLoading = false
                    this.getQuestions()
                } else {
                    this.addQuestionConfirmBtnLoading = false
                    this.$message({
                        message: "添加失败",
                        type: 'error'
                    })
                }
                this.addQuestionForm.questionTitle = ''
                this.addQuestionForm.questionOrder = ''
            })
        },
        onAddOption(row) {
            this.currentQuestion = row
            this.addOptionDialogVisible = true
        },
        addOptionDialogBeforeClose(done) {
            done()
        },
        addOption() {
            this.addOptionConfirmBtnLoading = true
            http.post('/question_item/insert_question_item', {
                questionItemName: this.addOptionForm.questionItemName,
                questionItemOrder: this.addOptionForm.questionItemOrder,
                questionItemScore: this.addOptionForm.questionItemScore,
                questionId: this.currentQuestion.questionId
            }).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: "添加成功",
                        type: 'success'
                    })
                    this.addOptionDialogVisible = false
                    this.addOptionConfirmBtnLoading = false
                    this.getQuestionDetail(this.currentQuestion)
                } else {
                    this.addOptionConfirmBtnLoading = false
                    this.$message({
                        message: "添加失败",
                        type: 'error'
                    })
                }
                this.addOptionForm.questionItemName = ''
                this.addOptionForm.questionItemOrder = ''
                this.addOptionForm.questionItemScore = ''
            })
        },
        editQuestionDialogBeforeClose(done) {
            done()
        },
        editQuestionItemDialogBeforeClose(done) {
            done()
        },
        editQuestion() {
            this.editQuestionConfirmBtnLoading = true
            http.post('/question/update_question_by_id', {
                questionId: this.updateQuestionForm.questionId,
                questionTitle: this.updateQuestionForm.questionTitle,
                questionOrder: this.updateQuestionForm.questionOrder,
            }).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.editQuestionDialogVisible = false
                    this.editQuestionConfirmBtnLoading = false
                    this.getQuestions()
                } else {
                    this.editQuestionConfirmBtnLoading = false
                    this.$message({
                        message: "修改失败",
                        type: 'error'
                    })
                }
            })
        },
        editQuestionItem() {
            this.editQuestionItemConfirmBtnLoading = true
            http.post('/question_item/update_question_item_by_id', {
                questionItemId: this.updateQuestionItemForm.questionItemId,
                questionItemName: this.updateQuestionItemForm.questionItemName,
                questionItemOrder: this.updateQuestionItemForm.questionItemOrder,
                questionItemScore: this.updateQuestionItemForm.questionItemScore
            }).then(res => {
                if (res.code === 200) {
                    this.$message({
                        message: "修改成功",
                        type: 'success'
                    })
                    this.editQuestionItemDialogVisible = false
                    this.editQuestionItemConfirmBtnLoading = false
                    this.getQuestionDetail(this.currentQuestion)
                } else {
                    this.editQuestionItemConfirmBtnLoading = false
                    this.$message({
                        message: "修改失败",
                        type: 'error'
                    })
                }
            })
        }
    },

    created() {
        this.getFields()
        this.getQuestions()
    }
}
</script>

<style>
#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>