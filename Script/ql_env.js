const $ = new API("ql", false);


!(async () => {
    const reqHost = $request.headers.Host;
    // if (reqHost.indexOf('next.gacmotor.com') > -1) {
    //     // 广汽传祺 
    //     await gqcq();
    // }
    // if (reqHost.indexOf('sf-express.com') > -1) {
    //     // 顺丰速运
    //     await sfsy();
    // }

    // if (reqHost.indexOf('ele.me') > -1) {
    //     // 饿了么
    //     await ele();
    // }
    if (reqHost.indexOf('meituan.com') > -1) {
        // 美团
        await meituan();
    }
    if (reqHost.indexOf('www.deppon.com') > -1) {
        // 德邦快递
        await deppon();
    }
    if (reqHost.indexOf('webapi.qmai.cn') > -1) {
        // 霸王茶姬
        await bwcj();
    }
    if (reqHost.indexOf('qiehuang-apig.xiaoyisz.com') > -1) {
        // 统一茄皇三期
        await tyqh();
    }
    if (reqHost.indexOf('m.ctrip.com') > -1) {
        // 携程旅行
        await xclx();
    }
})()
    .catch((e) => ($.logErr(e)))
    .finally(() => $.done());



// async function gqcq() {
//     const gqcqAccount = $request.headers['apptoken'];
//     await Store1('gqcqCookie', gqcqAccount)
// }


// async function sfsy() {
//     const sfsyUrl = $request.url;
//     if (sfsyUrl.indexOf('source') == -1) return;
//     await Store('sfsyUrl', sfsyUrl)
// }

// async function ele() {
//     const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
//     const sid = extractCookieValue(ck, 'SID')
//     const cookie2 = extractCookieValue(ck, 'cookie2')
//     if (!!sid && !!cookie2) {
//         const elmCookie = `${sid}${cookie2}grabCoupon=1;`
//         await Store1('elmCookie', elmCookie)
//     }
// }
async function meituan() {
    const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
    const match = ck.match(/token=(.*?);/);
    if (match && match.length > 1) {
        const tokenValue = match[1];
        await Store1('meituanCookie', tokenValue)
    }
}
async function deppon() {
    const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
    const match = ck.match(/ECO_TOKEN=(.*?);/);
    if (match && match.length > 1) {
        const tokenValue = match[1];
        await Store1('dbkdCookie', tokenValue)
    }
}
async function bwcj() {
    const token = $request.headers['Qm-User-Token'];
    await Store1('bwcjCookie', token)
}
async function tyqh() {
    const body = $request.body;
    const pbody = JSON.parse(body);
    const tyqhCookie = `${pbody.thirdId}#${pbody.wid}`;
    await Store1('tyqhCookie', tyqhCookie)
}
async function xclx() {
    const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
    const match = ck.match(/cticket=(.*?);/);
    if (match && match.length > 1) {
        const tokenValue = match[1];
        await Store1('xclxCookie', tokenValue, '\n')
    }
}


function extractCookieValue(cookieString, key) {
    const cookies = cookieString.split(';');
    let result = '';
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const keyValue = cookie.split('=');

        if (keyValue[0] === key) {
            result = `${key}=${keyValue[1]};`;
            break;
        }
    }
    return result;
}


async function Store(key, value) {
    const CacheKey = `#${key}`;
    let storeValue = $.read(CacheKey) || '';

    return new Promise((resolve) => {
        if (!storeValue || storeValue != value) {
            $.write(value, CacheKey);
            return resolve(true);
        }
        return resolve(false);
    })
}

// 分隔存储
async function Store1(key, value, separate = "&") {
    const CacheKey = `#${key}`;

    let storeValue = $.read(CacheKey) || '';

    return new Promise((resolve) => {
        if (!storeValue) {
            $.write(value, CacheKey);
            return resolve(true);
        }
        const storeValueArr = storeValue.split(separate);
        const found = storeValueArr.find((item) => item == value)
        if (found) {
            return resolve(false);
        } else {
            $.write(storeValue + separate + value, CacheKey);
            return resolve(true);
        }

    })
}



function ENV() {
    const isQX = typeof $task !== "undefined";
    const isLoon = typeof $loon !== "undefined";
    const isSurge = typeof $httpClient !== "undefined" && !isLoon;
    const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
    const isNode = typeof require == "function" && !isJSBox;
    const isRequest = typeof $request !== "undefined";
    const isScriptable = typeof importModule !== "undefined";
    return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable };
}

function HTTP(defaultOptions = { baseURL: "" }) {
    const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
    const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];
    const URL_REGEX =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    function send(method, options) {
        options = typeof options === "string" ? { url: options } : options;
        const baseURL = defaultOptions.baseURL;
        if (baseURL && !URL_REGEX.test(options.url || "")) {
            options.url = baseURL ? baseURL + options.url : options.url;
        }
        options = { ...defaultOptions, ...options };
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
            worker = $task.fetch({ method, ...options });
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

        return (
            timer
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

        // persistance

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
                        { flag: "wx" },
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
                        { flag: "wx" },
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
            const data = JSON.stringify(this.cache);
            if (isQX) $prefs.setValueForKey(data, this.name);
            if (isLoon || isSurge) $persistentStore.write(data, this.name);
            if (isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data,
                    { flag: "w" },
                    (err) => console.log(err)
                );
                this.node.fs.writeFileSync(
                    "root.json",
                    JSON.stringify(this.root),
                    { flag: "w" },
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
                if (JSON.stringify(opts) == "{}") {
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
            if (this.debug) console.log(msg);
        }

        info(msg) {
            console.log(msg);
        }

        error(msg) {
            console.log("ERROR: " + msg);
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
    })(name, debug);
}
