/******************************
脚本功能：堆糖-爱豆壁纸美图社区+解锁VIP
软件版本：8.12.0
更新时间：2022-10-7
*******************************
[rewrite_local]
^https:\/\/(api|www)\.duitang\.com\/napi url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/duitang.js
[mitm] 
hostname = api.duitang.com,www.duitang.com
*******************************/

const body = $response.body
  .replace(/\"vip":\w+/g, '"vip":true')
  .replace(/\"is_life_artist":\w+/g, '"is_life_artist":true')
  .replace(/\"isnew":\w+/g, '"isnew":true')
  .replace(/\"short_video":\w+/g, '"short_video":true')
  .replace(/\"vip_end_at_mills":\d+/g, '"vip_end_at_mills":99999999999000')
  .replace(/\"vip_level":\d+/g, '"vip_level":11')
  .replace(/\"is_certify_user":\w+/g, '"is_certify_user":true')
  .replace(/\"be_follow_count":\d+/g, '"be_follow_count":1000000')
  .replace(/\"follow_count":\d+/g, '"follow_count":1000000')
  .replace(/\"score":\d+/g, '"score":1000000')
  .replace(/\"username":".*?"/g, '"username":"这个人好帅"');
$done({ body: body });
