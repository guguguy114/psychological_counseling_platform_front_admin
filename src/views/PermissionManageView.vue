<!-- 目前还有一个可以改进的点就是右侧如果没有父菜单权限的时候就会显示不出剩余的子菜单，最好能完成父菜单的鉴权，目前是写死必须拿父菜单 -->
<template>
    <div>
        <el-row :gutter="10" id="role-line">
            <el-col :span="3">
                <h2>编辑角色菜单</h2>
            </el-col>
            <el-col :span="4">
                <el-select v-model="currentRoleId" placeholder="选择角色" @change="selectChange">
                    <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId">
                    </el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-button type="primary" plain @click="reset" :loading="resetBtnLoading">重置</el-button>
                <el-button type="primary" @click="apply">应用</el-button>
            </el-col>
            <el-col :span="4">
                <!-- add:{{ addArr }} -->
            </el-col>
            <el-col :span="4">
                <!-- delete:{{ deleteArr }} -->
            </el-col>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="24">
                <tree-transfer :title="title" :from_data='fromData' :to_data='toData' :defaultProps="{ label: 'label' }"
                    @add-btn='add' @remove-btn='remove' :mode='mode' height='650px' :filter="true" openAll
                    :check-strictly="false">
                </tree-transfer>
            </el-col>
        </el-row>

    </div>
</template>

<script>
import http from '@/utils/request';
import treeTransfer from 'el-tree-transfer' // 引入
export default {
    name: 'PermissionManageView',
    data() {
        return {
            title: ['已拥有权限', '未拥有权限'],
            roles: [],
            currentRoleId: 1,
            fromData: [],
            toData: [],
            mode: 'transfer',
            resetBtnLoading: false,
            deleteArr: [],
            addArr: [],
        }
    },
    components: {
        treeTransfer
    },
    methods: {
        add(fromData, toData, obj) {            
            this.deleteArr = this.deleteArr.concat(obj.keys);
            this.processData(this.deleteArr, this.addArr);
        },
        remove(fromData, toData, obj) {
            this.addArr = this.addArr.concat(obj.keys);
            this.addArr = this.addArr.concat(obj.harfKeys);
            this.processData(this.addArr, this.deleteArr);
        },
        getRoles() {
            http.post('/role/get_all').then(res => {
                this.roles = res.data;
            })
        },
        selectChange() {
            this.getMenuByRole();
            this.reset();
        },
        getMenuByRole() {
            http.post('/menu/get_menu_by_role', {
                roleId: this.currentRoleId
            }).then(res => {
                if (res.code == 200) {
                    this.fromData = [];
                    this.traverseNestedArray(res.data, this.fromData);
                } else {
                    this.fromData = [];
                }
            })
            http.post('/menu/get_menu_by_role_other', {
                roleId: this.currentRoleId
            }).then(res => {
                if (res.code == 200) {
                    this.toData = [];
                    this.traverseNestedArray(res.data, this.toData);
                } else {
                    this.toData = [];
                }
            })
        },
        // 递归函数
        traverseNestedArray(arr, obj) {
            let newItem = {};
            // 遍历数组中的每一个元素 
            arr.forEach(item => {
                // 假设每个对象都有一个'children'属性，它可能是一个数组 
                newItem = {
                    id: item.menuId,
                    label: item.menuName,
                    pid: item.menuParentId,
                    children: []
                }
                // 对每个对象执行的操作 
                // 检查对象是否有'children'属性并且它是一个数组 
                if (item.childrenMenu && Array.isArray(item.childrenMenu)) {
                    // 如果是数组，递归调用此函数 
                    this.traverseNestedArray(item.childrenMenu, newItem.children);
                }
                obj.push(newItem)
            });
        },
        reset() {
            this.resetBtnLoading = true;
            this.deleteArr = [];
            this.addArr = [];
            this.getMenuByRole();
            this.resetBtnLoading = false;
        },
        processData(arr1, arr2) {
            let noChangeMenuId = arr1.filter(item => {
                return arr2.indexOf(item) != -1
            });
            if (noChangeMenuId) {
                noChangeMenuId.forEach(item => {
                    arr1.splice(arr1.indexOf(item), 1);
                    arr2.splice(arr2.indexOf(item), 1);
                });
            }
        },
        async apply() {
            let addRes = false;
            let deleteRes = false;

            if (this.addArr.length > 0) {
                await http.post('/permission/insert_permission_by_role', {
                    roleId: this.currentRoleId,
                    menuIdList: this.addArr
                }).then(res => {
                    if (res.code === 200) {
                        addRes = true;
                    }

                })
            } else {
                addRes = true;
            }
            if (this.deleteArr.length > 0) {

                await http.post('/permission/delete_permission_by_role', {
                    roleId: this.currentRoleId,
                    menuIdList: this.deleteArr
                }).then(res => {
                    if (res.code === 200) {
                        deleteRes = true
                    }
                })
            } else {
                deleteRes = true;
            }
            if (addRes && deleteRes) {
                this.$message({
                    message: '应用成功',
                    type: 'success'
                });
            } else {
                this.$message({
                    message: '应用失败',
                    type: 'error'
                });
            }
            this.reset();
            this.getMenuByRole();
        }


    },
    created() {
        this.getRoles();
        this.getMenuByRole();
    }
}
</script>

<style>
#role-line {
    margin-bottom: 10px;
}

.transfer-main {
    height: 400px;
    background-color: white;
}

</style>