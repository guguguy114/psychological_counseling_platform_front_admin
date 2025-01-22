// 引入cookie
import Cookies from "js-cookie";


// token 的 key
const TokenKey = "Admin-Token";

// 获取token
 function getToken() {
  return Cookies.get(TokenKey);
}

// 设置token
 function setToken(token) {
  return Cookies.set(TokenKey, token);
}

// 删除token
 function removeToken() {
  return Cookies.remove(TokenKey);
}

export default { getToken, setToken, removeToken };