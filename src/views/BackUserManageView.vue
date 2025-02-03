<template>
    <div>
        <!-- 上方查询条件表单 -->
        <el-col :span="20">
            <el-form ref="queryForm" :model="queryForm" label-width="120px">
                <el-form-item label="查询后台用户："></el-form-item>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="后台用户名：">
                            <el-input v-model="queryForm.adminName" placeholder="请输入用户名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="职称：">
                            <el-input v-model="queryForm.consultantTitle" placeholder="请输入职称"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="状态：">
                            <el-select v-model="queryForm.adminStatus" placeholder="选择状态">
                                <el-option v-for="item in statusMap.paramItems" :key="item.paramItemOrder"
                                    :label="item.paramItemName" :value="item.paramItemValue">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="queryBtnLoading" @click="getAdmins">查询</el-button>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="addBtnLoading"
                            @click="addDialogVisible = true">新增用户</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </el-col>



        <!-- 用户表格 -->
        <el-table :data="admins" stripe style="width: 100%" :default-sort="{ prop: 'adminName', order: 'descending' }"
            :border="true" height="60vh">
            <el-table-column prop="adminId" label="AdminID" width="100"></el-table-column>
            <el-table-column prop="adminName" label="后台用户名" width="180" sortable></el-table-column>
            <el-table-column prop="role.roleName" label="身份" width="100" sortable></el-table-column>
            <el-table-column prop="consultant.consultantTitle" label="职称" width="180" sortable>
                <template slot-scope="scope">
                    <template v-if="scope.row.consultant === undefined">
                        无此信息
                    </template>
                    <template v-else>
                        {{ scope.row.consultant.consultantTitle }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="consultant.consultantCollege" label="毕业院校" width="200">
                <template slot-scope="scope">
                    <template v-if="scope.row.consultant === undefined">
                        无此信息
                    </template>
                    <template v-else>
                        {{ scope.row.consultant.consultantCollege }}
                    </template>
                </template>
            </el-table-column>
            <el-table-column prop="adminStatus" label="状态" width="80" sortable>
                <template slot-scope="scope">
                    <template v-if="scope.row.adminIsDelete === 0">
                        {{ scope.row.adminStatus == 0 ? "禁用" : "启用" }}
                    </template>
                    <template v-else>
                        已删除
                    </template>
                </template>

            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onChangeStatus(scope.row)"
                        :disabled="scope.row.adminIsDelete === 1">{{
                            scope.row.adminStatus == 1 ? "禁用" :
                                "启用"
                        }}</el-button>
                    <el-button type="text" @click="onDelete(scope.row)"
                        :disabled="scope.row.adminIsDelete === 1">删除</el-button>
                    <el-button type="text" @click="onResetPassword(scope.row)"
                        :disabled="scope.row.adminIsDelete === 1">重置密码</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!-- 更新信息弹出框 -->
        <el-dialog title="重置密码" :visible.sync="resetPasswordDialogVisible" width="30vw"
            :before-close="resetPasswordDialogBeforeClose">
            <el-form :model="updateForm">
                <el-form-item label="修改密码：">
                    <el-input v-model="updateForm.adminPassword" placeholder="请输入新密码" type="password"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="resetPasswordDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="resetPassword" :loading="resetDialogBtnLoading">确 定</el-button>
            </div>
        </el-dialog>




        <!-- 新增用户弹出框 -->
        <el-dialog title="新增后台用户" :visible.sync="addDialogVisible" width="30vw"
            :before-close="addAdminDialogBeforeClose">
            <el-form :model="addForm">
                <el-form-item label="设置用户账号：" size="small">
                    <el-input v-model="addForm.adminAccount" placeholder="请输入用户账号"></el-input>
                </el-form-item>
                <el-form-item label="设置用户密码：" size="small">
                    <el-input v-model="addForm.adminPassword" placeholder="请输入用户密码"></el-input>
                </el-form-item>
                <el-form-item label="设置用户名：">
                    <el-input v-model="addForm.adminName" placeholder="请输入用户名" size="small"></el-input>
                </el-form-item>
                <el-form-item label="选择角色：">
                    <el-select v-model="addForm.adminRoleId" placeholder="选择角色" @change="changeRole" size="small">
                        <el-option v-for="item in roleMap.paramItems" :key="item.paramItemOrder"
                            :label="item.paramItemName" :value="item.paramItemValue">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-divider v-if="addIsConsultant"></el-divider>
                <el-row :gutter="5">
                    <el-col :span="12">
                        <el-form-item label="设置毕业院校：" v-show="addIsConsultant" size="small">
                            <el-input v-model="addForm.consultant.consultantCollege" placeholder="请输入毕业院校">

                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="设置职称：" v-show="addIsConsultant" size="small">
                            <el-input v-model="addForm.consultant.consultantTitle" placeholder="请输入职称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="设置领域：" v-show="addIsConsultant" size="small">
                            <el-select v-model="addForm.consultant.consultantFieldId" placeholder="请选择领域">
                                <el-option v-for="item in fieldMap" :key="item.fieldId" :label="item.fieldName"
                                    :value="item.fieldId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>


            </el-form>
            <div slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addAdmin" :loading="addDialogConfirmBtnLoading">确 定</el-button>
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
import http from '@/utils/request'

export default {
    name: 'BackUserManageView',
    data() {
        return {
            queryForm: {
                adminName: '',
                adminStatus: '',
                consultantTitle: ''
            },
            updateForm: {
                adminPassword: ''
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
            addForm: {
                adminName: '',
                adminAccount: '',
                adminPassword: '',
                adminStatus: 1,
                adminRole: 1,
                consultant: {
                    consultantTitle: '',
                    consultantCollege: '',
                    consultantFieldId: '',
                }
            },

            addBtnLoading: false,
            resetPasswordDialogVisible: false,
            resetDialogBtnLoading: false,
            addDialogVisible: false,
            addDialogConfirmBtnLoading: false,
            queryBtnLoading: false,
            addIsConsultant: false,
            statusMap: {},
            fieldMap: {},
            roleMap: {},
            admins: []
        }
    },
    methods: {
        onChangeStatus(row) {
            this.$confirm(`此操作将${row.userStatus == 1 ? '禁用' : '启用'}该用户，是否继续`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/admin/update_admin_by_id", {
                    adminId: row.adminId,
                    adminStatus: row.adminStatus == 1 ? 0 : 1
                }).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            message: "修改成功",
                            type: "success"
                        });
                        this.getAdmins();
                    } else {
                        this.$message({
                            message: "修改失败",
                            type: "error"
                        });
                    }
                })
            }).catch(() => {
                this.$message({
                    type: "info",
                    message: "撤销操作",
                });
            });
        },
        onDelete(row) {
            this.$confirm("此操作将删除该用户, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                http.post("/admin/update_admin_by_id", {
                    adminId: row.adminId,
                    adminIsDelete: 1,
                    adminStatus: 0,
                }).then((res) => {
                    if (res.code === 200) {
                        this.$message({
                            message: "删除成功",
                            type: "success"
                        });
                        row.adminIsDelete = 1;
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
        onResetPassword(row) {
            this.updateForm.adminPassword = "";
            this.resetPasswordDialogVisible = true;
            this.updateForm.adminId = row.adminId;
        },
        resetPassword() {
            http.post("/admin/update_admin_by_id", {
                adminId: this.updateForm.adminId,
                adminPassword: this.updateForm.adminPassword
            }).then(res => {
                if (res.code == 200) {
                    this.$message({
                        message: "重置成功",
                        type: "success"
                    });
                    this.resetPasswordDialogVisible = false;
                    this.getAdmins();
                } else {
                    this.$message({
                        message: "重置失败",
                        type: "error"
                    });
                }
            })
        },
        resetPasswordDialogBeforeClose(done) {
            this.updateForm.adminPassword = "";
            done();
        },
        addAdminDialogBeforeClose(done) {
            this.addForm.adminName = "";
            this.addForm.adminPassword = "";
            this.addForm.consultant.consultantTitle = "";
            this.addForm.consultant.consultantCollege = "";
            done();
        },
        addAdmin() {
            this.addDialogConfirmBtnLoading = true;
            let newForm = this.addForm;
            if (!this.addIsConsultant) {
                newForm = {
                    adminName: this.addForm.adminName,
                    adminAccount: this.addForm.adminAccount,
                    adminPassword: this.addForm.adminPassword,
                    adminStatus: this.addForm.adminStatus,
                    adminRoleId: this.addForm.adminRole,
                }
            }
            http.post("/admin/insert_admin", newForm).then(res => {
                if (res.code == 200) {
                    this.$message({
                        message: "添加成功",
                        type: "success"
                    });
                    this.addDialogConfirmBtnLoading = false;
                    this.getAdmins();
                } else {
                    this.$message({
                        message: "添加失败",
                        type: "error"
                    });
                }
                this.addDialogConfirmBtnLoading = false;
            })
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getAdmins();
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getAdmins();
        },
        getStatusMap() {
            http.post("/param/get_param_by_id", {
                paramId: 1
            }).then(res => {
                this.statusMap = res.data;
            })
        },
        getAdmins() {
            this.queryBtnLoading = true;
            http.post("/admin/get_admin", {
                adminName: this.queryForm.adminName,
                adminStatus: this.queryForm.adminStatus === 2 ? null : this.queryForm.adminStatus,
                adminIsDelete: this.queryForm.adminStatus === 2 ? 1 : '0',
                consultantTitle: this.queryForm.consultantTitle,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                if (res.code == 200) {
                    this.admins = res.data.list;
                    this.pageInfo.total = res.data.total;
                } else {
                    this.admins = [];
                }
                this.queryBtnLoading = false;
            })
        },
        getRoleMap() {
            http.post("/param/get_param_by_id", {
                paramId: 2
            }).then(res => {
                this.roleMap = res.data;
            })
        },
        changeRole(value) {
            this.addIsConsultant = value === 1 ? false : true;
        },
        getFieldsMap() {
            http.post("/field/get_all", {
            }).then(res => {
                console.log(res);

                this.fieldMap = res.data;
            })
        }
    },
    created() {
        this.getAdmins();
        this.getStatusMap();
        this.getRoleMap();
        this.getFieldsMap();
    }
}
</script>

<style>
#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>