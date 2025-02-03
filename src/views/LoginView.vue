<template>
    <div>

        <div id="login-box">
            <div>
                <h1 id="title">后台管理系统</h1>
            </div>
            <el-form ref="loginForm" :model="loginForm" label-width="80px">
                <el-form-item label="账号：">
                    <el-input v-model="loginForm.account" placeholder="请输入账号"></el-input>
                </el-form-item>
                <el-form-item label="密码：">
                    <el-input v-model="loginForm.password" placeholder="请输入密码" type="password"></el-input>
                </el-form-item>
                <el-form-item label="验证码：">
                    <el-col :span="7">
                        <el-input v-model="loginForm.code" placeholder="验证码"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <img :src="codeUrl" alt="code" @click="changeCode">
                    </el-col>
                    <el-col :span="5">
                        <el-button type="text" @click="changeCode">看不清，换一张</el-button>
                    </el-col>
                </el-form-item>
                <el-button type="primary" @click="onLogin">登录</el-button>
            </el-form>
        </div>

    </div>


</template>

<script>
import http from '@/utils/request';
import authToken from '@/utils/authToken';

export default {
    name: 'LoginView',
    data() {
        return {
            codeUrl: '/api/code/get_code',
            loginForm: {
                account: '',
                password: '',
                code: ""
            }
        }
    },
    methods: {
        onLogin() {
            http.post('/admin/login', {
                adminAccount: this.loginForm.account,
                adminPassword: this.loginForm.password,
                code: this.loginForm.code
            }).then(res => {
                if (res.code == 200) {
                    authToken.removeToken();
                    authToken.setToken(res.data);
                    this.$store.dispatch("getadmininfobytoken")
                    this.$message.success({
                        message: "登录成功",
                        onClose: () => {
                            if (this.$route.query.redirect) {
                                this.$router.push(this.$route.query.redirect);
                            } else {
                                this.$router.push({
                                    name: "main",
                                });
                            }
                        },
                    });
                } else if (res.code == -1) {
                    this.$message.error("验证码错误");
                    this.resetForm()
                } else {
                    this.$message.error("登录失败，请检查账号密码");
                    this.resetForm()
                }
            });
        },
        changeCode() {
            this.codeUrl = '/api/code/get_code?time=' + new Date().getTime();
        },
        resetForm() {
            this.loginForm.account = "";
            this.loginForm.password = "";
            this.loginForm.code = "";
            this.changeCode();
        }
    }
}
</script>

<style scoped>

#title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 50px;
}

#login-box {
    width: 30vw;
    height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-top: 10vh;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 50px;
    text-align: center;
}
</style>