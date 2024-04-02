const $ = new API("老体预定");


// 羽毛球
const sportId = $.read("sportId") || "4028f0ce5551abf3015551b0aae50001";
const departId = $.read("departId") || "1543";

// 乒乓球
// const sportId = $.read("sportId") || "4028f0ce5551abf3015551b4a7820008";
// const departId = $.read("departId") || "1544";
const unitPrice = $.read("unitPrice") || 15;

const token = $.read("token");

// 添加默认值为明天，格式为yyyy-MM-dd
const date = $.read("date") || (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
})();

const timeSelect = $.read("time") || "5";

// const night = ["19:30", "20:00", "20:30", "21:00"];
// const night = ["17:30", "18:00", "18:30", "19:00"];

const timeMap = new Map([
    ["1", ["09:30", "10:00", "10:30", "11:00"]],
    ["2", ["13:30", "14:00", "14:30", "15:00"]],
    ["3", ["14:30", "15:00", "15:30", "16:00"]],
    ["4", ["15:30", "16:00", "16:30", "17:00"]],
    ["5", ["19:30", "20:00", "20:30", "21:00"]],
]);

const night = timeMap.get(timeSelect);


$.http = HTTP({
    baseURL: "https://api.52jiayundong.com",
    headers: {
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'content-type': 'application/json',
        'Connection': 'keep-alive',
        'Referer': 'https://servicewechat.com/wxf4daf231d0fe7f4b/262/page-frame.html',
        'platform': 3,
        'Host': 'api.52jiayundong.com',
        'api_version': 5,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f2c) NetType/WIFI Language/zh_CN',
        'token': $.read("token") || "",
    },
});


!(async () => {
    if (!token) {
        $.notify(
            "老体预定",
            "❌ 请先设置token",
            "请点击通知前往设置"
        );
        return;
    }
    const data = await getFieldList();
    const fieldList = data[0].fieldList;

    // const order = Array.from({ length: 8 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const order1 = Array.from({ length: 6 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const order = [...order1, 0, 7]

    for (let i = 0; i < order.length; i++) {
        const current = order[i];
        $.log(`尝试预定第${current + 1}个场地`);
        const priceList = fieldList[current].priceList;
        const filter = priceList.filter((item) => night.includes(item.startTime));
        $.log(JSON.stringify(filter))
        if (filter.every(e => e.status == 0)) {
            // 预定
            $.ids = filter.map(e => e.id);
            $.fieldStartTimes = filter.map(e => e.startTime);
            $.fieldEndTimes = filter.map(e => e.endTime);
            $.fieldlist = filter.reduce((acc, cur) => {
                return [...acc, {
                    id: fieldList[current].id,
                    stime: cur.startTime,
                    etime: cur.endTime,
                    price: cur.price,
                    priceidlist: [cur.id]
                }];
            }, []);

            $.log(`预定场地: ${$.ids.join(',')}`);
            $.log(`开始时间: ${$.fieldStartTimes.join(',')}`);
            $.log(`结束时间: ${$.fieldEndTimes.join(',')}`);
            await orderLimit();
            await confirmOrder();
            await orderPlace();
            $.notify(
                "预定成功",
                "",
                `日期: ${date}\n开始时间: ${$.fieldStartTimes.join(',')}\n结束时间: ${$.fieldEndTimes.join(',')}`
            );
            // 跳出循环
            break;
        }
    }

})()
    .catch((err) => {
        $.notify(
            "老体预定",
            "❌ 出现错误",
            JSON.stringify(err, Object.getOwnPropertyNames(err))
        );
    })
    .finally(() => $.done());

async function getFieldList() {
    const params = new URLSearchParams({
        sportId: sportId,
        departId: departId,
        date: date
    });
    const url = `/field/list?${params.toString()}`;
    const resp = await $.http.get(url);
    if (resp.statusCode == 200) {
        const data = JSON.parse(resp.body);
        if (data.code === 900) {
            return data.data;
        } else {
            $.log(data.msg);
            throw new Error(data.msg);
        }
    } else {
        throw new Error("请求失败");
    }
}
async function orderLimit() {
    const params = new URLSearchParams({
        fieldDetailIdsList: $.ids.join(','),
        fieldDate: date
    });
    const url = `/order/check/orderLimit?${params.toString()}`;
    const resp = await $.http.get(url);
    if (resp.statusCode == 200) {
        const data = JSON.parse(resp.body);
        $.log(data);
        if (data.code === 900) {
            return data.data;
        } else {
            $.log(data.msg);
            throw new Error(data.msg);
        }
    } else {
        throw new Error("请求失败");
    }
}
async function confirmOrder() {
    const params = new URLSearchParams({
        venueid: departId,
        price: `${Number.parseFloat(unitPrice * $.ids.length).toFixed(2)}`,
        ordertype: 2,
        fieldStartTimes: $.fieldStartTimes.join(','),
        fieldEndTimes: $.fieldEndTimes.join(','),
        fielddate: date,
        swimorder: "",
        sportId: sportId,
        fieldDetailIds: $.ids.join(',')
    });
    const url = `/order/confirm?${params.toString()}`;
    const resp = await $.http.get(url);
    if (resp.statusCode == 200) {
        const data = JSON.parse(resp.body);
        $.log(data);
        if (data.code === 900) {
            return data.data;
        } else {
            $.log(data.msg);
            throw new Error(data.msg);
        }
    } else {
        throw new Error("请求失败");
    }
}

async function orderPlace() {
    const postData = {
        "fieldorder": {
            "date": date,
            "fieldlist": $.fieldlist
        },
        "ordertype": "2",
        "goodslist": [],
        "couponid": "",
        "vipCardId": "",
        "timeCardId": "",
        "lockerNum": "",
        "swimorder": [],
        "venueid": departId,
        "sportid": sportId
    }
    const resp = await $.http.post({
        url: "/order/place",
        body: JSON.stringify(postData)
    });
    if (resp.statusCode == 200) {
        const data = JSON.parse(resp.body);
        $.log(data);
        if (data.code === 900) {
            return data.data;
        } else {
            $.log(data.msg);
            throw new Error(data.msg);
        }
    } else {
        throw new Error("请求失败");
    }
}

/**
 * OpenAPI
 * @author: Peng-YM
 * https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
 */
function ENV() {
    const isQX = typeof $task !== "undefined";
    const isLoon = typeof $loon !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
    const isNode = typeof require == "function" && !isJSBox;
    const isRequest = typeof $request !== "undefined";
    const isScriptable = typeof importModule !== "undefined";
    return {
        isQX,
        isLoon,
        isSurge,
        isNode,
        isJSBox,
        isRequest,
        isScriptable,
    };
}

function HTTP(
    defaultOptions = {
        baseURL: "",
    }
) {
    const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
    const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    function send(method, options) {
        options =
            typeof options === "string"
                ? {
                    url: options,
                }
                : options;
        const baseURL = defaultOptions.baseURL;
        if (baseURL && !URL_REGEX.test(options.url || "")) {
            options.url = baseURL ? baseURL + options.url : options.url;
        }
        options = {
            ...defaultOptions,
            ...options,
        };
        const timeout = options.timeout;
        const events = {
            ...{
                onRequest: () => { },
                onResponse: (resp) => resp,
                onTimeout: () => { },
            },
            ...options.events,
        };

        events.onRequest(method, options);

        let worker;
        if (isQX) {
            worker = $task.fetch({
                method,
                ...options,
            });
        } else if (isLoon || isSurge || isNode) {
            worker = new Promise((resolve, reject) => {
                const request = isNode ? require("request") : $httpClient;
                request[method.toLowerCase()](options, (err, response, body) => {
                    if (err) reject(err);
                    else
                        resolve({
                            statusCode: response.status || response.statusCode,
                            headers: response.headers,
                            body,
                        });
                });
            });
        } else if (isScriptable) {
            const request = new Request(options.url);
            request.method = method;
            request.headers = options.headers;
            request.body = options.body;
            worker = new Promise((resolve, reject) => {
                request
                    .loadString()
                    .then((body) => {
                        resolve({
                            statusCode: request.response.statusCode,
                            headers: request.response.headers,
                            body,
                        });
                    })
                    .catch((err) => reject(err));
            });
        }

        let timeoutid;
        const timer = timeout
            ? new Promise((_, reject) => {
                timeoutid = setTimeout(() => {
                    events.onTimeout();
                    return reject(
                        `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
                    );
                }, timeout);
            })
            : null;

        return (timer
            ? Promise.race([timer, worker]).then((res) => {
                clearTimeout(timeoutid);
                return res;
            })
            : worker
        ).then((resp) => events.onResponse(resp));
    }

    const http = {};
    methods.forEach(
        (method) =>
            (http[method.toLowerCase()] = (options) => send(method, options))
    );
    return http;
}

function API(name = "untitled", debug = false) {
    const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV();
    return new (class {
        constructor(name, debug) {
            this.name = name;
            this.debug = debug;

            this.http = HTTP();
            this.env = ENV();

            this.node = (() => {
                if (isNode) {
                    const fs = require("fs");

                    return {
                        fs,
                    };
                } else {
                    return null;
                }
            })();
            this.initCache();

            const delay = (t, v) =>
                new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, v), t);
                });

            Promise.prototype.delay = function (t) {
                return this.then(function (v) {
                    return delay(t, v);
                });
            };
        }

        // persistence
        // initialize cache
        initCache() {
            if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
            if (isLoon || isSurge)
                this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

            if (isNode) {
                // create a json for root cache
                let fpath = "root.json";
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        {
                            flag: "wx",
                        },
                        (err) => console.log(err)
                    );
                }
                this.root = {};

                // create a json file with the given name if not exists
                fpath = `${this.name}.json`;
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        {
                            flag: "wx",
                        },
                        (err) => console.log(err)
                    );
                    this.cache = {};
                } else {
                    this.cache = JSON.parse(
                        this.node.fs.readFileSync(`${this.name}.json`)
                    );
                }
            }
        }

        // store cache
        persistCache() {
            const data = JSON.stringify(this.cache, null, 2);
            if (isQX) $prefs.setValueForKey(data, this.name);
            if (isLoon || isSurge) $persistentStore.write(data, this.name);
            if (isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data,
                    {
                        flag: "w",
                    },
                    (err) => console.log(err)
                );
                this.node.fs.writeFileSync(
                    "root.json",
                    JSON.stringify(this.root, null, 2),
                    {
                        flag: "w",
                    },
                    (err) => console.log(err)
                );
            }
        }

        write(data, key) {
            this.log(`SET ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(data, key);
                }
                if (isQX) {
                    return $prefs.setValueForKey(data, key);
                }
                if (isNode) {
                    this.root[key] = data;
                }
            } else {
                this.cache[key] = data;
            }
            this.persistCache();
        }

        read(key) {
            this.log(`READ ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.read(key);
                }
                if (isQX) {
                    return $prefs.valueForKey(key);
                }
                if (isNode) {
                    return this.root[key];
                }
            } else {
                return this.cache[key];
            }
        }

        delete(key) {
            this.log(`DELETE ${key}`);
            if (key.indexOf("#") !== -1) {
                key = key.substr(1);
                if (isSurge || isLoon) {
                    return $persistentStore.write(null, key);
                }
                if (isQX) {
                    return $prefs.removeValueForKey(key);
                }
                if (isNode) {
                    delete this.root[key];
                }
            } else {
                delete this.cache[key];
            }
            this.persistCache();
        }

        // notification
        notify(title, subtitle = "", content = "", options = {}) {
            const openURL = options["open-url"];
            const mediaURL = options["media-url"];

            if (isQX) $notify(title, subtitle, content, options);
            if (isSurge) {
                $notification.post(
                    title,
                    subtitle,
                    content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`,
                    {
                        url: openURL,
                    }
                );
            }
            if (isLoon) {
                let opts = {};
                if (openURL) opts["openUrl"] = openURL;
                if (mediaURL) opts["mediaUrl"] = mediaURL;
                if (JSON.stringify(opts) === "{}") {
                    $notification.post(title, subtitle, content);
                } else {
                    $notification.post(title, subtitle, content, opts);
                }
            }
            if (isNode || isScriptable) {
                const content_ =
                    content +
                    (openURL ? `\n点击跳转: ${openURL}` : "") +
                    (mediaURL ? `\n多媒体: ${mediaURL}` : "");
                if (isJSBox) {
                    const push = require("push");
                    push.schedule({
                        title: title,
                        body: (subtitle ? subtitle + "\n" : "") + content_,
                    });
                } else {
                    console.log(`${title}\n${subtitle}\n${content_}\n\n`);
                }
            }
        }

        // other helper functions
        log(msg) {
            if (this.debug) console.log(`[${this.name}] LOG: ${this.stringify(msg)}`);
        }

        info(msg) {
            console.log(`[${this.name}] INFO: ${this.stringify(msg)}`);
        }

        error(msg) {
            console.log(`[${this.name}] ERROR: ${this.stringify(msg)}`);
        }

        wait(millisec) {
            return new Promise((resolve) => setTimeout(resolve, millisec));
        }

        done(value = {}) {
            if (isQX || isLoon || isSurge) {
                $done(value);
            } else if (isNode && !isJSBox) {
                if (typeof $context !== "undefined") {
                    $context.headers = value.headers;
                    $context.statusCode = value.statusCode;
                    $context.body = value.body;
                }
            }
        }

        stringify(obj_or_str) {
            if (typeof obj_or_str === "string" || obj_or_str instanceof String)
                return obj_or_str;
            else
                try {
                    return JSON.stringify(obj_or_str, null, 2);
                } catch (err) {
                    return "[object Object]";
                }
        }
    })(name, debug);
}