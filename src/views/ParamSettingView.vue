<template>
    <div>
        <!-- 上方查询条件表单 -->
        <el-col :span="20">
            <el-form ref="queryForm" :model="queryForm" label-width="120px">
                <el-form-item label="查询参数："></el-form-item>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="参数名：">
                            <el-input v-model="queryForm.paramItemName" placeholder="请输入参数名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="参数类型：">
                            <el-select v-model="queryForm.paramId" placeholder="选择参数类型">
                                <el-option v-for="item in paramMap" :key="item.paramId" :label="item.paramName"
                                    :value="item.paramId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="queryBtnLoading" @click="getParamItems">查询</el-button>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="addBtnLoading"
                            @click="addDialogVisible = true">新增参数</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </el-col>


        <!-- 参数表格 -->
        <el-table :data="paramItems" stripe style="width: 100%"
            :default-sort="{ prop: 'param.paramName', order: 'descending' }" :border="true">
            <el-table-column prop="paramItemId" label="PTID" width="100"></el-table-column>
            <el-table-column prop="paramItemName" label="参数名称" width="400" sortable></el-table-column>
            <el-table-column prop="param.paramName" label="参数类型" width="300" sortable></el-table-column>
            <el-table-column prop="paramItemOrder" label="参数次序" width="120" sortable align="center"></el-table-column>
            <el-table-column prop="paramItemValue" label="参数值" width="100" align="center">
                <template slot-scope="scope">
                    <el-tag type="success">{{ scope.row.paramItemValue === undefined ? '(null)' :
                        scope.row.paramItemValue }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onEdit(scope.row)">修改</el-button>
                    <el-button type="text" @click="onDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!-- 修改信息弹出框 -->
        <el-dialog title="修改参数" :visible.sync="editDialogVisible" width="30vw" :before-close="editDialogBeforeClose">
            <el-form :model="updateForm">
                <el-row :gutter="20">
                    <el-col :span="6">
                        当前编辑：{{ updateForm.paramItemId }}
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="10">
                        <el-form-item label="修改参数名：" size="small">
                            <el-input v-model="updateForm.paramItemName" placeholder="请输入新参数名"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="16">
                        <el-form-item label="修改参数类型：" size="small">
                            <el-select v-model="updateForm.paramId" placeholder="参数类型">
                                <el-option v-for="item in paramMap" :key="item.paramId" :label="item.paramName"
                                    :value="item.paramId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>


                <el-row :gutter="10">
                    <el-col :span="10">
                        <el-form-item label="修改参数值：" size="small">
                            <el-input v-model="updateForm.paramItemValue" placeholder="请输入新参数值"
                                type="number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="edit" :loading="editDialogBtnLoading">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 新增弹出框 -->
        <el-dialog title="新增参数" :visible.sync="addDialogVisible" width="30vw" :before-close="addDialogBeforeClose">
            <el-form :model="addForm">
                <el-row :gutter="10">
                    <el-col :span="10 ">
                        <el-form-item label="参数名称：" size="small">
                            <el-input v-model="addForm.paramItemName" placeholder="请输入参数名称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>


                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="参数类型：">
                            <el-select v-model="addForm.paramId" placeholder="选择参数类型" size="small">
                                <el-option v-for="item in paramMap" :key="item.paramId" :label="item.paramName"
                                    :value="item.paramId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="10">
                        <el-form-item label="参数值：" size="small">
                            <el-input v-model="addForm.paramItemValue" placeholder="请输入参数值"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>





            </el-form>
            <div slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="add" :loading="addDialogConfirmBtnLoading">确 定</el-button>
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
    name: 'ParamSettingView',
    data() {
        return {
            queryForm: {
                paramItemName: '',
                paramId: ''
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
            addForm: {
                paramItemName: '',
                paramId: '',
                paramItemValue: ''
            },
            updateForm: {
                paramItemId: '',
                paramItemValue: '',
                paramId: '',
                paramItemName: ''
            },
            editDialogVisible: false,
            editDialogBtnLoading: false,
            addBtnLoading: false,
            addDialogVisible: false,
            addDialogConfirmBtnLoading: false,
            queryBtnLoading: false,
            // addDialogFormRules: {
            //     paramItemName: [
            //         { required: true, message: '请输入参数名', trigger: 'blur' },
            //         { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            //     ],
            //     paramItemValue: [
            //         { required: true, message: '请输入参数值', trigger: 'blur' },
            //         { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            //     ],
            //     paramName: [
            //         { required: true, message: '请选择参数类型', trigger: 'blur' }
            //     ]
            // },
            paramMap: [],
            paramItems: []
        }
    },
    methods: {
        getParamItems() {
            this.queryBtnLoading = true;
            http.post("/param_item/get_param_item", {
                paramItemName: this.queryForm.paramItemName,
                paramId: this.queryForm.paramId,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                if (res.code == 200) {
                    this.paramItems = res.data.list;
                    this.pageInfo.total = res.data.total;
                } else {
                    this.$message({ message: res.msg, type: "获取失败" });
                }
                this.queryBtnLoading = false;
            })
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getParamItems();
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getParamItems();
        },
        getParamMap() {
            http.post("/param/get_all", {
            }).then(res => {
                this.paramMap = res.data;
            })
        },
        onDelete(row) {
            this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                http.post("/param_item/update_param_item_by_id", {
                    paramItemId: row.paramItemId,
                    paramItemIsDelete: 1
                }).then(res => {
                    if (res.code == 200) {
                        console.log(res);

                        this.$message({ message: "删除成功", type: "success" });
                        this.paramItems.pop(row);
                    } else {
                        this.$message({
                            message: "删除失败",
                            type: "error"
                        });
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        onEdit(row) {
            this.updateForm.paramItemName = row.paramItemName;
            this.updateForm.paramId = row.param.paramId;
            this.updateForm.paramItemValue = row.paramItemValue;
            this.updateForm.paramItemId = row.paramItemId;
            this.editDialogVisible = true;
        },
        edit() {
            this.editDialogBtnLoading = true;
            http.post("/param_item/update_param_item_by_id", {
                paramItemId: this.updateForm.paramItemId,
                paramItemName: this.updateForm.paramItemName,
                paramId: this.updateForm.paramId,
                paramItemValue: this.updateForm.paramItemValue
            }).then(res => {
                if (res.code == 200) {
                    this.$message({ message: "修改成功", type: "success" });
                    this.editDialogVisible = false;
                    this.getParamItems();
                } else {
                    this.$message({
                        message: "修改失败",
                        type: "error"
                    });
                }
                this.editDialogBtnLoading = false;
            })
        },
        editDialogBeforeClose(done) {
            done()
        },
        add() {
            this.addBtnLoading = true;
            http.post("/param_item/insert_param_item", {
                paramItemName: this.addForm.paramItemName,
                paramId: this.addForm.paramId,
                paramItemValue: this.addForm.paramItemValue
            }).then(res => {
                if (res.code == 200) {
                    this.$message({ message: "添加成功", type: "success" });
                    this.addDialogVisible = false;
                    this.getParamItems();
                } else {
                    this.$message({
                        message: "添加失败",
                        type: "error"
                    });
                }
                this.addBtnLoading = false;
            })
        },
        addDialogBeforeClose(done) {
            done()
        },
    },
    created() {
        this.getParamItems();
        this.getParamMap();
    }

}
</script>

<style>
#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>