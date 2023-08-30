/******************************
脚本功能：目标地图+解锁订阅
软件版本：2.21.3
更新时间：2022-9-22
*******************************
[rewrite_local]
^https?:\/\/api\.revenuecat\.com\/v1\/(receipts|subscribers\/\$RCAnonymousID%3A\w{32})$ url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/mbdt.js
[mitm] 
hostname = api.revenuecat.com
*******************************/
var body = $response.body;
var objk = JSON.parse(body);

objk = {
  request_date: "2022-09-22T02:28:50Z",
  request_date_ms: 1663813730272,
  subscriber: {
    entitlements: {
      pro: {
        expires_date: null,
        grace_period_expires_date: null,
        product_identifier: "com.happydogteam.relax.lifetimePro",
        purchase_date: "2022-09-22T02:19:32Z",
      },
    },
    first_seen: "2022-09-22T02:12:43Z",
    last_seen: "2022-09-22T02:12:43Z",
    management_url: "https://apps.apple.com/account/subscriptions",
    non_subscriptions: {},
    original_app_user_id: "$RCAnonymousID:fe9dc27c6cd44b908576a7bd2eae8e24",
    original_application_version: "322",
    original_purchase_date: "2022-09-10T12:59:20Z",
    other_purchases: {},
    subscriptions: {
      "com.happydogteam.relax.lifetimePro": {
        billing_issues_detected_at: null,
        expires_date: null,
        grace_period_expires_date: null,
        is_sandbox: false,
        original_purchase_date: "2022-09-22T02:19:33Z",
        ownership_type: "PURCHASED",
        period_type: "trial",
        purchase_date: "2022-09-22T02:19:32Z",
        store: "app_store",
        unsubscribe_detected_at: "2022-09-22T02:21:43Z",
      },
    },
  },
};

body = JSON.stringify(objk);

$done({ body });
