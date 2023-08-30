/*
function    健康码核酸报告
https://raw.githubusercontent.com/JiongTo/Adguard fork 地址
*/

if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tphealthqrcode/.test($request.url)) {
  let obj = JSON.parse($response.body);
  // obj.data.reason = null;
  obj.data.risk_assessment_grade = "00";
  $done({ body: JSON.stringify(obj) });
}
if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tpgethsjcfromsichuan/.test($request.url)) {
  var d = new Date();

  d.setDate(d.getDate() - 1);
  d.setHours(14);
  var str = d.toISOString();

  var d1 = new Date();
  d1.setDate(d1.getDate() - 1);
  d1.setHours(23);
  var str1 = d1.toISOString();

  var obj = {
    errcode: "0",
    data: [
      {
        hscysj: str,
        hsjcsj: str1,
        hsjcjq: "阴性",
        hsjcjgmc: "成都新基因格医学检测所",
        inDay7: true,
        xm: "***",
        zjhm: "******************",
        hsjcjg: "阴性",
      },
    ],
    requestId: null,
    errmsg: "SUCCESS",
  };

  $done({ body: JSON.stringify(obj) });
}
if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tpquerypasscoderemindstatus/.test($request.url)) {
  var obj = {
    errcode: "0",
    data: {
      remind_status: "1",
    },
    requestId: "3f6669c5-e250-11ec-a3c7-525400adc02c",
    errmsg: "SUCCESS",
  };

  $done({ body: JSON.stringify(obj) });
}
if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tpscansceneinfo/.test($request.url)) {
  var obj = {
    errcode: "0",
    data: {
      code_data: {
        place_address: "天润路电子科大清水河校区-西校门",
        place_child_type_name: "校园",
        county_name: "郫都区",
        place_type_name: "社会服务和管理机构",
        place_name: "电子科技大学（清水河校区）",
        province_name: "四川省",
        city_name: "成都市",
      },
      health_info: {
        cid_type: "10",
        rule_number: "",
        is_visited_overseas: "0",
        is_isolation: "0",
        living_address: {
          address: "",
          city: "",
          county_code: "1",
          county: "",
          city_code: "",
          province_code: "",
          province: "",
        },
        report_valid_date: "2022-07-02 17:28:28",
        name: "陈*印",
        report_date: "2021-01-30 09:52:12",
        is_reported_in_24hours: false,
        report_valid_date_gettime: 1656754108640,
        gender: "01",
        current_status: "04",
        guide: "",
        other_symptom: "",
        phone: "182*****444",
        high_risk_area: [],
        cid: "10**************21",
        reason: "",
        report_expired: false,
        is_contacted: "0",
        risk_assessment_grade: "00",
        housing_type: "01",
        current_symptom: "01",
      },
    },
    requestId: "5c53ed05-e256-11ec-a675-52540069f4e6",
    errmsg: "SUCCESS",
  };

  $done({ body: JSON.stringify(obj) });
}
// if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tpgetnhctravelcodeoutsidecheck/.test($request.url)) {
//     var obj = {
//         "errcode" : "0",
//         "data" : {
//           "statue" : "1"
//         },
//         "requestId" : null,
//         "errmsg" : "SUCCESS"
//       };
      
//       $done({body: JSON.stringify(obj)});
// }
if (/^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tpgetnhctravelcodeoutsidecheck/.test($request.url) || /^https?:\/\/zfbjkt\.scdsjzx\.cn\/papi\/t\/tptravelcodesendsms/.test($request.url)) {
  var modifiedHeaders = $response.headers;
  modifiedHeaders["Date"] = "Sun, 31 Aug 2023 01:34:38 GMT";

  var modifiedStatus = "HTTP/1.1 200 OK";

  $done({ status: modifiedStatus, headers: modifiedHeaders });
}
