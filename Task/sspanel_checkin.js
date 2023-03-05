// SSPANEL机场签到
// SSPANEL环境变量格式，JSON.stringify
// [
//     {
//         url: "https://http/",
//         acc: {
//             email: "852@123.com",
//             password: "123123"
//         }
//     }, {
//         url: "https://https/",
//         acc: {
//             email: "741@369.com",
//             password: "123123"
//         }
//     },
// ]

const $ = new require('./env').Env('SSPANEL面板自动签到');
const notify = $.isNode() ? require('./sendNotify') : '';
let sspanel = ($.isNode() ? process.env.SSPANEL : $.getdata('SSPANEL')) || '', message = '';


!(async () => {
    if (!sspanel) {
        console.log('请先设置环境变量【SSPANEL】')
        return;
    }
    const data = JSON.parse(sspanel)
    for (let i = 0; i < data.length; i++) {
        $.index = i + 1;
        $.SITE_URL = data[i].url// 网站
        $.email = data.acc.email// 邮箱
        $.pwd = data.acc.password// 密码
        console.log("开始第" + ($.index) + "个账号")
        await main();
        await $.wait(2000)
    }
    if (message) {
        await notify.sendNotify(`${$.name}`, `${message}`);
    }
})().catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
}).finally(() => {
    $.done();
})

async function main() {
    await login();
    await $.wait(1000);
    if ($.isRet === 1) {
        await checkin();
    }
}

// 登录
function login() {
    return new Promise((resolve) => {
        $.post(sendPost('auth/login', `email=${$.email}&passwd=${$.pwd}&code=`), (err, response, data) => {
            try {
                if (err) {
                    console.log(`login API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    data = JSON.parse(data);
                    console.log(data.msg, '\n');
                    $.isRet = data.ret;
                }
            } catch (err) {
                $.logErr(err, response);
            } finally {
                resolve();
            }
        })
    })
}

// 签到
function checkin() {
    return new Promise((resolve) => {
        $.post(sendPost('user/checkin', ''), async (err, response, data) => {
            try {
                if (err) {
                    console.log(`checkin API 请求失败\n${JSON.stringify(err)}`)
                } else {
                    console.log('开始进行签到...\n');
                    data = JSON.parse(data);
                    message += `开始第【${$.index}】个网站\n`;
                    if (data.ret === 1) {
                        if (data.trafficInfo) {
                            console.log(`${data.msg}\n今日已用：${data.trafficInfo.todayUsedTraffic}\n过去已用：${data.trafficInfo.lastUsedTraffic}\n剩余流量：${data.trafficInfo.unUsedTraffic}\n\n`);
                            message += `${data.msg}\n今日已用：${data.trafficInfo.todayUsedTraffic}\n过去已用：${data.trafficInfo.lastUsedTraffic}\n剩余流量：${data.trafficInfo.unUsedTraffic}\n\n`;
                        } else {
                            console.log(`${data.msg}\n`)
                            message += `${data.msg}\n\n`;
                        }
                    } else {
                        console.log(data.msg, '\n');
                        message += data.msg + '\n\n';
                    }
                }
            } catch (err) {
                $.logErr(err, response);
            } finally {
                resolve();
            }
        })
    })
}

function sendPost(path, body = {}) {
    return {
        url: `${$.SITE_URL}/${path}`,
        body: body,
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": `${$.SITE_URL}/${path}`,
            "Accept-encoding": "gzip, deflate, br",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.62"
        }
    }
}