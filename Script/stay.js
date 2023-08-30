/*
应用名称：Stay去除仓库广告
脚本：去除仓库广告
*/

const obj = JSON.parse($response.body);
if (obj.biz) {
    obj.biz = Object.values(obj.biz).filter(item => !(item["type"]=="promoted"));
}
$done({ body: JSON.stringify(obj) });