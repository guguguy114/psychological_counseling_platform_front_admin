import Vue from 'vue'
import VueRouter from 'vue-router'
import authToken from '@/utils/authToken'
import store from '@/store'
import { Message } from 'element-ui'

Vue.use(VueRouter)

// 解决编程式路由往同一地址跳转时会报错的情况
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;

// push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};

//replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => err);
};

const routes = [
  {
    path: '/',
    name: 'login',
    meta: { title: '登录' },
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestView.vue')
  },
  {
    path: '/404',
    name: '404',
    meta: { title: '404' },
    component: () => import('../views/NoFoundView.vue')
  },
  {
    path: '/main',
    name: 'main',
    meta: { title: '主页' },
    component: () => import('../views/MainView.vue'),
    children: [
      {
        path: '/main/appointment_manage',
        name: 'appointment_manage',
        meta: { title: '咨询预约管理' },
        component: () => import('../views/AppointmentManageView.vue')
      },
      {
        path: '/main/user_manage',
        name: 'user_manage',
        meta: { title: '用户管理' },
        component: () => import('../views/UserManageView.vue')
      },
      {
        path: '/main/back_user_manage',
        name: 'back_user_manage',
        meta: { title: '后台用户管理' },
        component: () => import('../views/BackUserManageView.vue')
      },
      {
        path: '/main/param_setting',
        name: 'param_setting',
        meta: { title: '参数配置' },
        component: () => import('../views/ParamSettingView.vue')
      },
      {
        path: '/main/menu_manage',
        name: 'menu_manage',
        meta: { title: '菜单管理' },
        component: () => import('../views/MenuManageView.vue')
      },
      {
        path: '/main/permission_manage',
        name: 'permission_manage',
        meta: { title: '权限管理' },
        component: () => import('../views/PermissionManageView.vue')
      },
      {
        path: '/main/question_manage',
        name: 'question_manage',
        component: () => import('../views/QuestionManageView.vue')
      },
      {
        path: '/main/log_manage',
        name: 'log_manage',
        component: () => import('../views/LogManageView.vue')
      },
      {
        path: '/main/assessment_manage',
        name: 'assessment_manage',
        meta: { title: '在线评估管理' },
        component: () => import('../views/AssessmentManageView.vue')
      },
      {
        path: '/main/account_wallet',
        name: 'account_wallet',
        meta: { title: '资金账户' },
        component: () => import('../views/AccountWalletView.vue')
      },
      {
        path: '/main/appointment_time_setting',
        name: 'appointment_time_setting',
        meta: { title: '预约时间设置' },
        component: () => import('../views/AppointmentTimeSettingView.vue')
      },
      {
        path: '/main/appointment',
        name: 'appointment',
        meta: { title: '预约诊断' },
        component: () => import('../views/AppointmentView.vue')
      },
      {
        path: '/main/user_statistics',
        name: 'user_statistics',
        meta: { title: '用户统计' },
        component: () => import('../views/UserStatisticsView.vue')
      }
    ]
  },
]

const whiteList = ["/"];

const router = new VueRouter({
  mode: 'hash',
  routes
})

// 全局前置路由守卫配置在这
router.beforeEach((to, from, next) => {
  /* 
   to 表示将要访问的路由对象
   from 来的路由对象
   next 放行
  */
  console.log("to", to);
  console.log("from", from);
  // 如果路径在数组返回index没有在数组里面就返回-1
  if (whiteList.indexOf(to.path) !== -1) {
    to.meta.title && (document.title = to.meta.title);
    next();
  } else {
    // 如果有登录信息，允许登录
    // if (sessionStorage.getItem("admin")) {
    // 这里使用vuex判断
    // if (store.state.userData.adminId !== undefined) {
    if (authToken.getToken()) {
      console.log("token存在");
      console.log(store);

      if (store.state.userData.adminId === undefined) {
        console.log("vuex不存在");
        store.dispatch("getadmininfobytoken");
      }
      to.meta.title && (document.title = to.meta.title);
      next();
    } else {
      // 没有登录
      // 跳转到登录页
      Message.error("请先登录");
      // 这里如果通过router.push跳转没办法自己跳自己
      // router.push("/");
      // 需要实现：没有登录跳转到登录，登录后跳转到main
      // 需要不能相同
      if (from.path !== to.path && to.path !== "/") {
        console.log("redirect to login");
        to.meta.title && (document.title = to.meta.title);
        next(
          {
            path: "/",
            query: {
              redirect: to.path,
            },
          }
        );
      }
    }
  }
})

export default router
