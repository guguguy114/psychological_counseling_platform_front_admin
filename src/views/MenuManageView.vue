<template>
    <div>
        <!-- 上方查询条件表单 -->
        <el-col :span="20">
            <el-form ref="queryForm" :model="queryForm" label-width="120px">
                <el-form-item label="查询菜单："></el-form-item>
                <el-row :gutter="10">
                    <el-col :span="8">
                        <el-form-item label="菜单名称：">
                            <el-input v-model="queryForm.menuName" placeholder="请输入菜单名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="一级菜单：">
                            <el-select v-model="queryForm.menuParentId" placeholder="请选择一级菜单" clearable>
                                <el-option v-for="item in menuMap" :key="item.menuId" :label="item.menuName"
                                    :value="item.menuId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="queryBtnLoading" @click="getMenus">查询</el-button>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="primary" :loading="addBtnLoading"
                            @click="addDialogVisible = true">新增菜单</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </el-col>

        <!-- 参数表格 -->
        <el-table :data="menus" stripe style="width: 100%" :default-sort="{ prop: 'menuOrder', order: 'descending' }"
            :border="true">
            <el-table-column prop="menuId" label="MID" width="100"></el-table-column>
            <el-table-column prop="menuName" label="菜单名称" width="400" sortable></el-table-column>
            <el-table-column prop="menuUrl" label="URL" width="300" sortable></el-table-column>
            <el-table-column prop="menuStatus" label="状态" width="100">
                <template slot-scope="scope">
                    {{ scope.row.menuStatus === 0 ? '启用' : '禁用' }}
                </template>
            </el-table-column>
            <el-table-column prop="menuParentId" label="上级菜单" width="120" sortable align="center">
                <template slot-scope="scope">
                    {{ menuMap.find(item => item.menuId === scope.row.menuParentId) === undefined ? '(无上级菜单)' :
                        menuMap.find(item => item.menuId === scope.row.menuParentId).menuName }}
                </template>
            </el-table-column>
            <el-table-column prop="menuOrder" label="排序号" width="120" sortable align="center"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="onEdit(scope.row)">修改</el-button>
                    <el-button type="text" @click="onDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 修改信息弹出框 -->
        <el-dialog title="修改菜单" :visible.sync="editDialogVisible" width="30vw" :before-close="editDialogBeforeClose">
            <el-form :model="updateForm">
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-form-item label="菜单名称：" size="small">
                            <el-input v-model="updateForm.menuName" placeholder="请输入新菜单名"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-form-item label="上级菜单：" size="small">
                            <el-select v-model="updateForm.menuParentId" placeholder="选择上级菜单">
                                <el-option v-for="item in menuMap" :key="item.menuId" :label="item.menuName"
                                    :value="item.menuId">
                                </el-option>
                                <el-option label="无上级菜单" :value="0"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="URL:" size="small">
                            <el-input v-model="updateForm.menuUrl" placeholder="请输入新URL"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="排序号:" size="small">
                            <el-input v-model="updateForm.menuOrder" placeholder="请输入新排序号" type="number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="edit" :loading="editDialogBtnLoading">确 定</el-button>
            </div>
        </el-dialog>


        <!-- 新增用户弹出框 -->
        <el-dialog title="新增菜单" :visible.sync="addDialogVisible" width="30vw" :before-close="addDialogBeforeClose">
            <el-form :model="addForm">
                <el-form-item label="菜单名称：" size="small">
                    <el-input v-model="addForm.menuName" placeholder="请输入菜单名称"></el-input>
                </el-form-item>
                <el-row :gutter="10">
                    <el-col :span="24">
                        <el-form-item label="上级菜单：">
                            <el-select v-model="addForm.menuParentId" placeholder="选择上级菜单" size="small">
                                <el-option v-for="item in menuMap" :key="item.menuId" :label="item.menuName"
                                    :value="item.menuId">
                                </el-option>
                                <el-option label="无上级菜单" :value="0"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="URL:" size="small">
                            <el-input v-model="addForm.menuUrl" placeholder="请输入URL"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="排序号：" size="small">
                            <el-input v-model="addForm.menuOrder" placeholder="请输入排序号" type="number"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>



            </el-form>
            <div slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addMenu" :loading="addDialogConfirmBtnLoading">确 定</el-button>
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
    name: 'MenuManageView',
    data() {
        return {
            queryForm: {
                menuName: '',
                menuParentId: ''
            },
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
            editDialogVisible: false,
            editDialogBtnLoading: false,
            updateForm: {
                menuId: '',
                menuName: '',
                menuParentId: '',
                menuUrl: '',
                menuOrder: ''
            },
            addDialogConfirmBtnLoading: false,
            addDialogVisible: false,
            addForm: {
                menuName: '',
                menuParentId: '',
                menuUrl: '',
                menuOrder: ''
            },
            menuMap: [],
            queryBtnLoading: false,
            addBtnLoading: false,
            addDialogVisible: false,
            addForm: {
                menuName: '',
                menuParentId: '',
                menuUrl: '',
                menuOrder: ''
            },
            menus: []
        }
    },
    methods: {
        getMenus() {
            this.queryBtnLoading = true;
            http.post('/menu/get_menu_d', {
                menuName: this.queryForm.menuName,
                menuParentId: this.queryForm.menuParentId,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                this.menus = res.data.list;
                this.pageInfo.total = res.data.total;
                this.queryBtnLoading = false;
            })
        },
        getMenuMap() {
            http.post('/menu/get_all_parent_menu', {}).then(res => {
                console.log(res);
                this.menuMap = res.data;
                console.log(this.menuMap);

            })
        },
        handleSizeChange(val) {
            this.pageInfo.pageSize = val;
            this.getMenus();
        },
        handleCurrentChange(val) {
            this.pageInfo.currentPage = val;
            this.getMenus();
        },
        onEdit(row) {
            this.addForm = row;
            this.addDialogVisible = true;
        },
        onDelete(row) {
            this.$confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                http.post('/menu/update_menu', {
                    menuId: row.menuId,
                    menuIsDelete: 1
                }).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            type: 'success',
                            message: '删除成功'
                        });
                        this.getMenus();
                    } else {
                        this.$message({
                            type: 'error',
                            message: '删除失败'
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
        editDialogBeforeClose(done) {
            done()
        },
        onEdit(row) {
            this.updateForm.menuId = row.menuId;
            this.updateForm.menuName = row.menuName;
            this.updateForm.menuParentId = row.menuParentId;
            this.updateForm.menuUrl = row.menuUrl;
            this.updateForm.menuOrder = row.menuOrder;
            this.editDialogVisible = true;
        },
        edit() {
            this.editDialogBtnLoading = true;
            http.post('/menu/update_menu', this.updateForm).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '修改成功'
                    });
                    this.editDialogVisible = false;
                    this.getMenus();
                } else {
                    this.$message({
                        type: 'error',
                        message: '修改失败'
                    });
                }
                this.editDialogBtnLoading = false;
            })
        },
        addDialogBeforeClose(done) {
            done()
        },
        addMenu() {
            this.addBtnLoading = true;
            http.post('/menu/insert_menu', this.addForm).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '添加成功'
                    });
                    this.addDialogVisible = false;
                    this.getMenus();
                } else {
                    this.$message({
                        type: 'error',
                        message: '添加失败'
                    });
                }
                this.addBtnLoading = false;
            })
        },
    },
    created() {
        this.getMenus();
        this.getMenuMap();
    }
}
</script>

<style>
#page-btn {
    margin-top: 20px;
    text-align: center;
}
</style>