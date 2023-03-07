if ($response.statusCode != 200) {
  $done(null);
}

const obj = JSON.parse($response.body);
const title = obj?.country;
const subtitle = `${obj?.city} ${obj?.isp}`;
const ip = obj?.query;
const description = `国家: ${obj?.country}
城市: ${obj?.city}
运营商: ${obj?.isp}
数据中心: ${obj?.org}`;

$done({ title, subtitle, ip, description });
