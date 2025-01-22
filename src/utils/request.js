// 1、引入axios
import axios from 'axios'
import { Message } from 'element-ui'
import authToken from './authToken'
import router from '@/router'
// 2、创建axios实例，设置请求url，超时设置
const http = axios.create({
    // 统一的请求地址(在地址前面加这个)
    baseURL: '/api',
    timeout: 10000 // 超时时间
})
// 3、设置请求拦截器，设置统一请求头
http.interceptors.request.use(config => {
    config.headers['Token'] = authToken.getToken()
    return config
})
// 4、设置响应拦截器，执行统一的错误处理
http.interceptors.response.use(
    // 请求成功
    res => {
        if (res.data.code === -6 || res.data.code === -7) {
            authToken.removeToken()
            Message.error(res.data.msg)
            return router.push('/')
        }


        // 直接返回后端传来的dto
        return res.data
    },
    // 请求失败
    err => {
        switch (err.status) {
            
            
            case 400:
                console.log('请求参数错误');
                Message.error('请求参数错误')
                break
            case 401:
                console.log('权限不足, 请重新登录')
                Message.error('权限不足, 请重新登录')
                break
            case 404:
                console.log('请求的路径不存在')
                Message.error('请求的路径不存在') 
                break
            case 500:
                console.log('服务器内部错误')
                Message.error('服务器内部错误')
                break
        }
        return err
    }
)
// 5、导出axios实例
export default http