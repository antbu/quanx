/******************************
脚本：1blocker解锁订阅
版本：5.2.5
时间：2022-9-19
*******************************
[rewrite_local]
^https:\/\/api\.revenuecat\.com\/v1\/subscribers url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/blocker.js
[mitm] 
hostname = api.revenuecat.com
*******************************/
var body = $response.body;
var objk = JSON.parse(body);

objk = {
  request_date: "2022-06-25T07:36:54Z",
  request_date_ms: 1656142614383,
  subscriber: {
    entitlements: {
      premium: {
        expires_date: "2030-11-28T01:01:01Z",
        grace_period_expires_date: null,
        product_identifier: "blocker.ios.subscription.yearly",
        purchase_date: "2020-11-14T01:01:01Z",
      },
    },
    first_seen: "2020-11-14T01:01:01Z",
    last_seen: "2020-11-14T01:01:01Z",
    management_url: "itms-apps://apps.apple.com/account/subscriptions",
    non_subscriptions: {},
    original_app_user_id: "9C57FE95-67YU-999B-09CB-GH89HJK89",
    original_application_version: "900",
    original_purchase_date: "2020-11-14T12:43:04Z",
    other_purchases: {},
    subscriptions: {
      "blocker.ios.subscription.yearly": {
        billing_issues_detected_at: null,
        expires_date: "2030-11-28T01:01:01Z",
        grace_period_expires_date: null,
        is_sandbox: false,
        original_purchase_date: "2020-11-14T12:45:21Z",
        period_type: "trial",
        purchase_date: "2020-11-14T12:45:20Z",
        store: "app_store",
        unsubscribe_detected_at: null,
      },
    },
  },
};

body = JSON.stringify(objk);

$done({ body });
