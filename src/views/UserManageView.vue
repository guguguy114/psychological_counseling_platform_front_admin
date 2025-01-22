<template>
    <div>
        <!-- 上方查询条件表单 -->
        <el-col :span="20">
            <el-form ref="queryForm" :model="queryForm" label-width="100px">
                <el-form-item label="查询用户："></el-form-item>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="用户名：">
                            <el-input v-model="queryForm.userName" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="状态：">
                            <el-select v-model="queryForm.userStatus" placeholder="选择状态">
                                <el-option v-for="item in statusMap.paramItems" :key="item.paramItemOrder"
                                    :label="item.paramItemName" :value="item.paramItemValue">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-button type="primary" :loading="queryBtnLoading" @click="getUsers">查询</el-button>
                </el-row>
            </el-form>
        </el-col>

        <!-- 用户表格 -->
        <el-table :data="users" stripe style="width: 100%" :default-sort="{ prop: 'userName', order: 'descending' }"
            :border="true">
            <el-table-column prop="userId" label="UID" width="70"></el-table-column>
            <el-table-column prop="userName" label="用户名" width="180" sortable></el-table-column>
            <el-table-column prop="userSex" label="用户性别" width="100" sortable>
                <template slot-scope="scope">
                    {{ scope.row.userSex == 1 ? "男" : "女" }}
                </template>
            </el-table-column>
            <el-table-column prop="userAge" label="用户年龄" width="100" sortable></el-table-column>
            <el-table-column prop="userAddress" label="住址" width="200"></el-table-column>
            <el-table-column prop="userPhone" label="手机号" width="200"></el-table-column>
            <el-table-column prop="userStatus" label="状态" width="80" sortable>
                <template slot-scope="scope">
                    <template v-if="scope.row.userIsDelete === 0">
                        {{ scope.row.userStatus == 0 ? "禁用" : "启用" }}
                    </template>
                    <template v-else>
                        已删除
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onChangeStatus(scope.row)" :disabled="scope.row.userIsDelete === 1">{{ scope.row.userStatus == 1 ? "禁用" : "启用"
                        }}</el-button>
                    <el-button type="text" @click="onDelete(scope.row)" :disabled="scope.row.userIsDelete === 1">删除</el-button>
                    <el-button type="text" @click="onResetPassword(scope.row)" :disabled="scope.row.userIsDelete === 1">重置密码</el-button>
                </template>
            </el-table-column>
        </el-table>




        <!-- 更新信息弹出框 -->
        <el-dialog title="重置密码" :visible.sync="resetPasswordDialogVisible" width="30vw"
            :before-close="resetPasswordDialogBeforeClose">
            <el-form :model="updateForm">
                <el-form-item label="修改密码：">
                    <el-input v-model="updateForm.userPassword" placeholder="请输入新密码" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="resetPasswordDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="resetPassword" :loading="resetDialogBtnLoading">确 定</el-button>
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
    name: 'UserManageView',
    methods: {
        getUsers() {
            
            this.queryBtnLoading = true;
            http.post("/user/get_user_by_name_and_status", {
                userName: this.queryForm.userName,
                userStatus: this.queryForm.userStatus === 2 ? null : this.queryForm.userStatus,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize,
                userIsDelete: this.queryForm.userStatus === 2 ? 1 : '0',
            }).then(res => {
                if (res.code == 200) {
                    this.users = res.data.list;
                    this.pageInfo.total = res.data.total;
                } else {
                    this.users = [];
                }
                this.queryBtnLoading = false;
            })
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getUsers();
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getUsers();
        },
        getStatusMap() {
            http.post("/param/get_param_by_id", {
                paramId: 1
            }).then(res => {
                this.statusMap = res.data;
            })
        },
        onDelete(row) {
            this.$confirm("此操作将删除该用户, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/user/update_user_by_id", {
                    userId: row.userId,
                    userIsDelete: 1,
                    userStatus: 0,
                }).then((res) => {
                    if (res.code === 200) {
                        this.$message({
                            message: "删除成功",
                            type: "success",
                        });
                        row.userIsDelete = 1;
                    } else {
                        this.$message({
                            message: "删除失败",
                            type: "error",
                        });
                    }
                });
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "撤销操作",
                });
            });
        },
        onChangeStatus(row) {
            this.$confirm(`此操作将${row.userStatus == 1 ? '禁用' : '启用'}该用户，是否继续`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/user/update_user_by_id", {
                    userId: row.userId,
                    userStatus: row.userStatus == 1 ? 0 : 1,
                }).then((res) => {
                    if (res.code === 200) {
                        this.$message({
                            message: row.userStatus == 1 ? "禁用成功" : "启用成功",
                            type: "success",
                        });
                        row.userStatus = row.userStatus == 1 ? 0 : 1;
                    } else {
                        this.$message({
                            message: row.userStatus == 1 ? "禁用失败" : "启用失败",
                            type: "error",
                        });
                    }
                });
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "撤销操作",
                });
            });
        },
        resetPasswordDialogBeforeClose(done) {
            this.resetPasswordDialogVisible = false;
            done();
        },
        onResetPassword(row) {
            this.updateForm.userId = row.userId;
            this.resetPasswordDialogVisible = true;
        },
        resetPassword() {
            this.resetDialogBtnLoading = true;
            http.post("/user/update_user_by_id", {
                userId: this.updateForm.userId,
                userPassword: this.updateForm.userPassword,
            }).then((res) => {
                if (res.code === 200) {
                    this.$message({
                        message: "重置密码成功",
                        type: "success",
                    });
                    this.resetPasswordDialogVisible = false;
                } else {
                    this.$message({
                        message: "重置密码失败",
                        type: "error",
                    });
                }
                this.resetDialogBtnLoading = false;
            });
        },
        resetQueryForm() {
            this.queryForm = {
                userName: '',
                userStatus: ''
            };
            this.getUsers();
        }

    },
    data() {
        return {
            queryBtnLoading: false,
            resetDialogBtnLoading: false,
            users: [],
            statusMap: {},
            resetPasswordDialogVisible: false,
            queryForm: {
                userName: '',
                userStatus: ''
            },
            updateForm: {
                userId: '',
                userPassword: '',
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            }
        }
    },
    mounted: function () {
        this.getStatusMap();
        this.getUsers();
        this.resetQueryForm()
    },
    created() {
        this.getStatusMap();
        this.getUsers();
    }
}
</script>

<style>
#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>