/******************************
脚本：钱迹解锁VIP
软件版本：3.0.6
时间：2022-10-5
*******************************
[rewrite_local]
^https:\/\/qianji\.xxoojoke\.com\/vip\/configios url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/qj.js
^https:\/\/qianji\.xxoojoke\.com\/client\/init url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/qj.js
^https:\/\/qianji\.xxoojoke\.com\/budget\/list url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/qj.js
[mitm] 
hostname = qianji.xxoojoke.com
*******************************/
let body = JSON.parse($response.body);
const hack = {
  vipend: 2365847580,
  viptype: 100,
  vipstart: 1365847580,
};
if ($request.url.match("vip/configios")) {
  body.data.config.userinfo = {
    ...body.data.config.userinfo,
    ...hack,
  };
}
if ($request.url.match("client/init")) {
  body.data.userinfo = {
    ...body.data.userinfo,
    ...hack,
  };
}
if ($request.url.match("budget/list")) {
  body = {
    ec: 200,
    em: "",
  };
}

$done({ body: JSON.stringify(body) });
