/*
 应用名称：KeepStyle
脚本：去除home页上方活动、底部社区、底部商城以及我的页面推广信息
*/

if ($request.url.indexOf('athena/v5/people/my') != -1) {
    let obj = JSON.parse($response.body);
    obj.data.floatingInfo = {}
    $done({ body: JSON.stringify(obj) });
}
else if( $request.url.indexOf('config/v3/basic') != -1 ){
    let obj = JSON.parse($response.body);
    obj.data.bottomBarControl.defaultTab = "home";
    obj.data.bottomBarControl.tabs = Object.values(obj.data.bottomBarControl.tabs).filter(item => !(item["tabType"]=="entry"||item["tabType"]=="mall"));
    obj.data.homeTabs = Object.values(obj.data.homeTabs).filter(item => !(item["type"]=="uni_web_activity"));
    $done({ body: JSON.stringify(obj) });
}