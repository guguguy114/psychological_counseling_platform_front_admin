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
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/404',
    name: '404',
    component: () => import('../views/NoFoundView.vue')
  },
  {
    path: '/main',
    name: 'main',
    component: () => import('../views/MainView.vue'),
    children: [
      {
        path: '/main/user_manage',
        name: 'user_manage',
        component: () => import('../views/UserManageView.vue')
      },
      {
        path: '/main/back_user_manage',
        name: 'back_user_manage',
        component: () => import('../views/BackUserManageView.vue')
      },
      {
        path: '/main/param_setting',
        name: 'param_setting',
        component: () => import('../views/ParamSettingView.vue')
      },
      {
        path: '/main/menu_manage',
        name: 'menu_manage',
        component: () => import('../views/MenuManageView.vue')
      },
      {
        path: '/main/permission_manage',
        name: 'permission_manage',
        component: () => import('../views/PermissionManageView.vue')
      }
    ]
  },
]

const whiteList = ["/", "/enroll"];

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
