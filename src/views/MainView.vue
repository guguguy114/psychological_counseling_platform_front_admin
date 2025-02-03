<template>
    <div id="box">
        <el-container>
            <el-header>
                <el-col :span="4">
                    <h3>心理咨询平台后台管理系统</h3>
                </el-col>

                <div style="left: 18vw; position: fixed; width: 20vw; text-align: left;">
                    <h4 style="margin-right: 2vw;">
                        {{ currentPageName !== "" ? ' > ' : "" }}
                    </h4>
                    <h4>
                        {{ currentPageName !== "" ? currentPageName : "" }}
                    </h4>
                </div>


                <el-col :span="4" :offset="10">
                    当前用户：{{ admin.name }}
                </el-col>
                <el-col :span="4">
                    您的身份：{{ admin.roleName }}
                </el-col>
                <el-col :span="2">
                    <el-button type="text" @click="onLogout">退出登录</el-button>
                </el-col>
            </el-header>
            <el-container>
                <el-aside width="18vw">
                    <cy-menu :menu-list="menuList" @menu-change="onMenuChange"></cy-menu>
                </el-aside>
                <el-container>
                    <el-main>
                        <router-view></router-view>
                    </el-main>
                    <el-footer> 2024 ©shiroko</el-footer>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import CyMenu from '@/components/CyMenu.vue';
import http from '@/utils/request';

export default {
    name: 'MainView',

    components: {
        CyMenu
    },
    methods: {
        onLogout() {
            this.$store.dispatch("setuserdata", {});
            this.$router.push({
                name: "login"
            });
        },
        onMenuChange(menu) {
            this.currentPageName = menu.menuName;
        }
    },
    data() {
        return {
            menuList: [],
            currentPageName: "",
            admin: {},
        }
    },
    created() {
        this.admin = this.$store.state.userData;
        http.post("/menu/get_menu", {
            adminId: this.admin.adminId
        }).then(res => {
            if (res.code == 200) {
                this.menuList = res.data;
            } else {
                this.$message.error("获取菜单失败");
            }
        })
    }
}
</script>

<style>
#box {
    height: calc(100vh - 60px);
}


.el-header,
.el-footer {
    background-color: #464646;
    color: #f2f2f2;
    text-align: center;
    line-height: 60px;
}

.el-aside {
    background-color: #f7f7f7;
    color: #333;
    text-align: left;
    line-height: 200px;
    height: calc(100vh - 60px);
}

body>.el-container {
    margin-bottom: 40px;

}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
    line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
    line-height: 320px;
}

h4 {
    display: inline-block;
}

.el-main {
    background-color: #f7f7f7;
    color: #333;
    text-align: center;
}

</style>