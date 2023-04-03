/******************************
脚本：Keep 解锁VIP
版本：7.36.0
时间：2022-10-22
*******************************
[rewrite_local]
^https:\/\/api\.gotokeep\.com url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/keep.js
[mitm] 
hostname = api.gotokeep.com
*******************************/

const body = $response.body
  .replace(/\"memberStatus":\d+/g, '"memberStatus":1')
  .replace(/\"username":".*?"/g, '"username":"这个人好帅"')
  .replace(/\"buttonText":".*?"/g, '"buttonText":"已永久"')
  .replace(/\"hasPaid\":\w+/g, '"hasPaid":true')
  .replace(/\"downLoadAll\":\w+/g, '"downLoadAll":true')
  .replace(/\"videoTime\":\d+/g, '"videoTime":3000')
  .replace(/\"startEnable\":\w+/g, '"startEnable":true')
  .replace(/\"preview\":\w+/g, '"preview":true')
  .replace(/\"errorCode\":\d+/g, '"errorCode":0')
  .replace(/\"status\":\w+/g, '"status":true');
$done({ body: body });
