/******************************
脚本功能：网速测试大师+解锁订阅
软件版本：2.65.0
更新时间：2022-10-1
*******************************
[rewrite_local]
^https:\/\/iap\.etm\.tech\/receipts url script-response-body https://raw.githubusercontent.com/antbu/quanx/main/Crack/wscsds.js
[mitm] 
hostname = iap.etm.tech
*******************************/
var body = $response.body;
var objk = JSON.parse(body);

objk = {
  entitlements: [
    {
      expires_date_ms: 3859786074000,
      purchase_date_ms: 1655289297000,
      product_identifier: "SpeedTest_RemoveAd_1_Year_20181015",
      is_in_trial_period: false,
      is_in_intro_offer_period: false,
      environment: "Production",
      redeem: {},
      auto_renew: true,
      entitlement_id: "premium",
    },
  ],
  is_valid: true,
};

body = JSON.stringify(objk);

$done({ body });
