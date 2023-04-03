/******************************
脚本：滴答清单解锁VIP
版本：6.3.15
时间：2022-10-19
*******************************
[rewrite_local]
^https:\/\/(ticktick|dida365)\.com\/api\/v2\/user\/status url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/ddqd.js
[mitm] 
hostname=dida365.com,ticktick.com
*******************************/
let body = JSON.parse($response.body);
body["proEndDate"] = "2099-01-01T00:00:00.000+0000";
body["needSubscribe"] = false;
body["pro"] = true;
$done({ body: JSON.stringify(body) });
