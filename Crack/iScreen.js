/******************************
脚本功能：我的桌面 •iScreen——解锁VIP
软件版本：3.4.2
更新时间：2022-11-09
*******************************
[rewrite_local]
^https:\/\/cs\.kuso\.xyz\/ url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/iScreen.js
[mitm] 
hostname = cs.kuso.xyz
*******************************/
let body = JSON.parse($response.body);
body.data.noAds = 1;
body.data.lockscreen_noVip = "1.1";
$done({ body: JSON.stringify(body) });
