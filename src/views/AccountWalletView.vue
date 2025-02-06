<template>
    <div>
        <el-row :gutter="20" id="title-box">
            <el-col :span="3">
                <h3>当前余额：</h3>
            </el-col>
            <el-col :span="2">
                <h3>{{ consultantBalance + " 元" }}</h3>
            </el-col>
        </el-row>

        <el-row :gutter="10" id="flow-title-box">
            <el-col :span="12" :offset="6">
                <h2>账户流水</h2>
            </el-col>
        </el-row>

        <el-row id="table-box">
            <!-- 流水表格 -->
            <el-table :data="flows" stripe style="width: 100%" :border="true" height="60vh">
                <el-table-column prop="fundFlowTime" label="发生时间" width="250"></el-table-column>
                <el-table-column prop="userName" label="客户名称" width="300" sortable></el-table-column>
                <el-table-column prop="fundFlow" label="金额（元）" sortable></el-table-column>
            </el-table>
        </el-row>

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
    name: 'AccountWalletView',
    data() {
        return {
            flows: [],
            pageInfo: {
                currentPage: 1,
                pageSize: 5,
                total: 0
            },
            consultantBalance: 0
        }
    },
    created() {
        this.getFlows();
        this.getConsultantBalance();
    },
    methods: {
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
        },
        getFlows() {
            http.post('/fund_flow/get_consultant_fund_flow_by_admin_id', {
                adminId: this.$store.state.userData.adminId,
                startPage: this.pageInfo.currentPage,
                pageSize: this.pageInfo.pageSize
            }).then(res => {
                this.flows = res.data.list;
                this.pageInfo.total = res.data.total;
            })
        },
        getConsultantBalance() {
            http.post('/consultant/get_balance', {
                adminId: this.$store.state.userData.adminId
            }).then(res => {
                this.consultantBalance = res.data;
            })
        }
    }
}
</script>

<style>
#table-box {
    text-align: center;
}

#title-box {
    margin-bottom: 20px;
    text-align: start;
}

#flow-title-box {
    margin-bottom: 20px;
}
</style>