const $ = new Env("ql_sync");

const url = $.getData("@ql.url");
const username = $.getData("@ql.username");
const password = $.getData("@ql.password");
const force_update = $.getData("@ql.force_update") || false;

!(async () => {
  if (!url || !username || !password) {
    $.log("请先配置好QL的地址、username、password");
    $.done()
    return;
  }
  const reqHost = $request.headers.Host;
  const ql = new QLSync(url, username, password);

  if (reqHost.indexOf('jd.com') > -1) {
    // 京东
    await GetCookie(ql);
  }
  if (reqHost.indexOf('tmuyun.com') > -1) {
    // 今日越城
    await jryc(ql);
  }
  if (reqHost.indexOf('gacmotor.com') > -1) {
    // 广汽传祺
    await gqcq(ql);
  }
  if (reqHost.indexOf('sf-express.com') > -1) {
    // 顺丰速运
    await sfsy(ql);
  }
  if (reqHost.indexOf('meituan.com') > -1) {
    // 美团
    await meituan(ql);
  }
  if (reqHost.indexOf('ele.me') > -1) {
    // 饿了么
    await ele(ql);
  }
})()
  .catch((e) => ($.logErr(e)))
  .finally(() => $.done());

async function jryc(ql) {
  const jrycAccount = $request.headers['X-SESSION-ID'];
  const up = await Store1('jrycAccount', jrycAccount)
  if (up || force_update) await ql.setQlCookie('jrycAccount', '今日越城');
}
async function gqcq(ql) {
  const gqcqCookie = $request.headers['token'];
  const up = await Store1('gqcqCookie', gqcqCookie)
  if (up || force_update) await ql.setQlCookie('gqcqCookie', '广汽传祺');
}
async function sfsy(ql) {
  const sfsyUrl = $request.url;
  if (sfsyUrl.indexOf('source') == -1) return;
  const up = await Store('sfsyUrl', sfsyUrl)
  if (up || force_update) await ql.setQlCookie('sfsyUrl', '顺丰速运');
}
async function meituan(ql) {
  const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
  const match = ck.match(/token=(.*?);/);
  if (match && match.length > 1) {
    const tokenValue = match[1];
    const up = await Store1('meituanCookie', tokenValue)
    if (up || force_update) await ql.setQlCookie('meituanCookie', '美团');
  } else {
    console.log('meituan ck 写入失败，未找到相关 ck');
  }
}
async function ele(ql) {
  const ck = `${$request.headers['Cookie'] || $request.headers['cookie']}`;
  const elmCookie = ck.match(/SID=.+?;/) + ck.match(/cookie2=.+?;/) + `grabCoupon=1;`

  const up = await Store1('elmCookie', elmCookie)
  if (up || force_update) await ql.setQlCookie('elmCookie', '饿了么');
}
async function GetCookie(ql) {
  const CV = `${$request.headers['Cookie'] || $request.headers['cookie']};`;

  if ($request.url.indexOf('openUpgrade') > -1) {
    if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
      const pt_pin = CV.match(/pt_pin=.+?;/);
      const JD_COOKIE = CV.match(/pt_key=.+?;/) + pt_pin;
      $.setData(pt_pin, "@ql.pin")
      const up = await StoreJD('JD_COOKIE', JD_COOKIE)
      if (up || force_update) await ql.setQlCookie('JD_COOKIE', '京东COOKIE');
    } else {
      console.log('ck 写入失败，未找到相关 ck');
    }
  } else if ($request.url.indexOf('getMixSessionLog') > -1) {
    if (CV.match(/wskey=.+?;/) && $.getData("@ql.pin") != null) {
      const JD_WSCK = $.getData("@ql.pin").match(/pin=.+?;/) + CV.match(/wskey=.+?;/);
      const up = await StoreJD('JD_WSCK', JD_WSCK)
      if (up || force_update) await ql.setQlCookie('JD_WSCK', '京东WSCK');
    }
  } else {
    console.log('未匹配到相关信息，退出抓包');
  }
}

async function StoreJD(key, value) {
  let storeValue = $.getData(`@ql.${key}`) || '';
  return new Promise((resolve, reject) => {
    if (!storeValue) {
      $.setData(value, `@ql.${key}`);
      return resolve(true);
    }
    const storeValueArr = storeValue.split("&");
    const pin = value.match(/pin=(.+?);/)[1];
    const found = storeValueArr.find((item) => item.match(/pin=(.+?);/)[1] == pin)
    if (found) {
      if (found != value) {
        storeValueArr[storeValueArr.indexOf(found)] = value;
        $.setData(storeValueArr.join("&"), `@ql.${key}`);
        return resolve(true);
      } else {
        return resolve(false);
      }
    } else {
      $.setData(storeValue + "&" + value, `@ql.${key}`);
      return resolve(true);
    }

  })
}
async function Store(key, value) {
  let storeValue = $.getData(`@ql.${key}`) || '';

  return new Promise((resolve) => {
    if (!storeValue || storeValue != value) {
      $.setData(value, `@ql.${key}`);
      return resolve(true);
    }
    return resolve(false);
  })
}

async function Store1(key, value, separate = "&") {
  let storeValue = $.getData(`@ql.${key}`) || '';

  return new Promise((resolve) => {
    if (!storeValue) {
      $.setData(value, `@ql.${key}`);
      return resolve(true);
    }
    const storeValueArr = storeValue.split(separate);
    const found = storeValueArr.find((item) => item == value)
    if (found) {
      return resolve(false);
    } else {
      $.setData(storeValue + separate + value, `@ql.${key}`);
      return resolve(true);
    }

  })
}


function QLSync(url, username, password) {
  return new (class {
    constructor(url, username, password) {
      this.url = url;
      this.username = username;
      this.password = password;
      this.token = $.getData("@ql.token") || "";
      this.ckName = "";
      this.remarks = "";
      this.ckValue = "";
    }

    async ajax(method, url, data, auth = true) {
      return new Promise((resolve, reject) => {
        const options = {
          url: url,
          method: method,
          headers: {
            'Accept': '*/*',
          }
        };
        if (data) {
          options.body = $.toStr(data);
          options.headers['Content-Type'] = `application/json;charset=UTF-8`;

        }
        if (auth) {
          options.headers['Authorization'] = `Bearer ${this.token}`;
        }
        $.log('headers',$.toStr(options.headers))
        $task.fetch(options).then(
          (resp) => {
            const { statusCode, body } = $.toObj(resp, resp);
            $.log(234,statusCode,body)
            if (statusCode == 200) {
              resolve($.toObj(body, body));
            } else {
              reject(body?.message);
            }
          },
          (err) => reject(err)
        );
      });
    }

    async updateToken() {
      return new Promise(async (resolve, reject) => {
        try {
        $.log('2',this.username,this.password)

          const time = new Date().getTime()
          const resp = await this.ajax("POST", `${this.url}/api/user/login&t=${time}`,{
            "username": this.username,
            "password": this.password
        }, false).then().catch(e => $.log(222,e));
        $.log('2-resp',resp.data.token)

          this.token = resp.data.token;
          $.setData(resp.data.token, "@ql.token");
          resolve();
        } catch (e) {
          return reject(e);
        }
      });
    }

    async updateCk() {
      return new Promise(async (resolve, reject) => {
        try {
          const time = new Date().getTime()
          const resp = await this.ajax("GET", `${this.url}/open/envs?searchValue=${this.ckName}&t=${time}`);
          let id = resp.data?.find((item) => item.name == this.ckName)?.id;
          if (id) {
            await this.ajax("PUT", `${this.url}/open/envs?t=${time}`, {
              name: this.ckName,
              value: this.ckValue,
              id,
            })
          } else {
            await this.ajax("POST", `${this.url}/open/envs?t=${time}`, [{ name: this.ckName, value: this.ckValue, remarks: this.remarks }])
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }

    async setQlCookie(ckName, remarks) {
      this.ckName = ckName;
      this.remarks = remarks;
      this.ckValue = $.getData(`@ql.${ckName}`);
      try {
        $.log('1-token',this.token)
        if (!this.token) {
          $.log('2-token',this.token)
          await this.updateToken();
        }
        await this.updateCk();
        return Promise.resolve();
      } catch (error) {
        if (error == "UnauthorizedError") {
          try {
            await this.updateToken();
            await this.updateCk();
            return Promise.resolve();
          } catch (e) {
            return Promise.reject(e);
          }
        }
        return Promise.reject(error);
      }
    }
  })(url, username, password)
}

// https://github.com/chavyleung/scripts/blob/master/Env.js
// prettier-ignore
function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env;
    }

    send(opts, method = 'GET') {
      opts = typeof opts === 'string' ? { url: opts } : opts;
      let sender = this.get;
      if (method === 'POST') {
        sender = this.post;
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }

    get(opts) {
      return this.send.call(this.env, opts);
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST');
    }
  }

  return new (class {
    constructor(name, opts = {}) {
      this.name = name;
      this.http = new Http(this);
      this.data = null;
      this.dataFile = 'box.dat';
      this.logs = [];
      this.isMute = false;
      this.noLogKey = opts.noLogKey || '';
      this.noLog = opts.noLog;
      this.isNeedRewrite = false;
      this.logSeparator = '\n';
      this.startTime = new Date().getTime();
      Object.assign(this, opts);
      this.log('', `🔔${this.name}, 开始!`);
    }

    isNode() {
      return 'undefined' !== typeof module && !!module.exports;
    }

    isQuanX() {
      return 'undefined' !== typeof $task;
    }

    isSurge() {
      return 'undefined' !== typeof $httpClient && 'undefined' === typeof $loon;
    }

    isLoon() {
      return 'undefined' !== typeof $loon;
    }

    isShadowrocket() {
      return 'undefined' !== typeof $rocket;
    }

    toObj(str, defaultValue = null) {
      try {
        return JSON.parse(str);
      } catch {
        return defaultValue;
      }
    }

    toStr(obj, defaultValue = null) {
      try {
        return JSON.stringify(obj);
      } catch {
        return defaultValue;
      }
    }

    getJson(key, defaultValue) {
      let json = defaultValue;
      const val = this.getData(key);
      if (val) {
        try {
          json = JSON.parse(this.getData(key));
        } catch { }
      }
      return json;
    }

    setJson(val, key) {
      try {
        return this.setData(JSON.stringify(val), key);
      } catch {
        return false;
      }
    }

    getScript(url) {
      return new Promise((resolve) => {
        this.get({ url }, (err, resp, body) => resolve(body));
      });
    }

    runScript(script, runOpts) {
      return new Promise((resolve) => {
        let httpApi = this.getData('@chavy_boxjs_userCfgs.httpApi');
        httpApi = httpApi ? httpApi.replace(/\n/g, '').trim() : httpApi;
        let httpApi_timeout = this.getData(
          '@chavy_boxjs_userCfgs.httpApi_timeout'
        );
        httpApi_timeout = httpApi_timeout ? httpApi_timeout * 1 : 20;
        httpApi_timeout =
          runOpts && runOpts.timeout ? runOpts.timeout : httpApi_timeout;
        const [key, addr] = httpApi.split('@');
        const opts = {
          url: `http://${addr}/v1/scripting/evaluate`,
          body: {
            script_text: script,
            mock_type: 'cron',
            timeout: httpApi_timeout,
          },
          headers: { 'X-Key': key, Accept: '*/*' },
        };
        this.post(opts, (err, resp, body) => resolve(body));
      }).catch((e) => this.logErr(e));
    }

    loadData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        if (isCurDirDataFile || isRootDirDataFile) {
          const datPath = isCurDirDataFile
            ? curDirDataFilePath
            : rootDirDataFilePath;
          try {
            return JSON.parse(this.fs.readFileSync(datPath));
          } catch (e) {
            return {};
          }
        } else return {};
      } else return {};
    }

    writeData() {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require('fs');
        this.path = this.path ? this.path : require('path');
        const curDirDataFilePath = this.path.resolve(this.dataFile);
        const rootDirDataFilePath = this.path.resolve(
          process.cwd(),
          this.dataFile
        );
        const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath);
        const isRootDirDataFile =
          !isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath);
        const jsonData = JSON.stringify(this.data);
        if (isCurDirDataFile) {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        } else if (isRootDirDataFile) {
          this.fs.writeFileSync(rootDirDataFilePath, jsonData);
        } else {
          this.fs.writeFileSync(curDirDataFilePath, jsonData);
        }
      }
    }

    lodash_get(source, path, defaultValue = undefined) {
      const paths = path.replace(/\[(\d+)\]/g, '.$1').split('.');
      let result = source;
      for (const p of paths) {
        result = Object(result)[p];
        if (result === undefined) {
          return defaultValue;
        }
      }
      return result;
    }

    lodash_set(obj, path, value) {
      if (Object(obj) !== obj) return obj;
      if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
      path
        .slice(0, -1)
        .reduce(
          (a, c, i) =>
            Object(a[c]) === a[c]
              ? a[c]
              : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
          obj
        )[path[path.length - 1]] = value;
      return obj;
    }

    getData(key) {
      let val = this.getVal(key);
      // 如果以 @
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objVal = objKey ? this.getVal(objKey) : '';
        if (objVal) {
          try {
            const objedVal = JSON.parse(objVal);
            val = objedVal ? this.lodash_get(objedVal, paths, '') : val;
          } catch (e) {
            val = '';
          }
        }
      }
      return val;
    }

    setData(val, key) {
      let isSuc = false;
      if (/^@/.test(key)) {
        const [, objKey, paths] = /^@(.*?)\.(.*?)$/.exec(key);
        const objdat = this.getVal(objKey);
        const objVal = objKey
          ? objdat === 'null'
            ? null
            : objdat || '{}'
          : '{}';
        try {
          const objedVal = JSON.parse(objVal);
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        } catch (e) {
          const objedVal = {};
          this.lodash_set(objedVal, paths, val);
          isSuc = this.setVal(JSON.stringify(objedVal), objKey);
        }
      } else {
        isSuc = this.setVal(val, key);
      }
      return isSuc;
    }

    getVal(key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.read(key);
      } else if (this.isQuanX()) {
        return $prefs.valueForKey(key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        return this.data[key];
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    setVal(val, key) {
      if (this.isSurge() || this.isLoon()) {
        return $persistentStore.write(val, key);
      } else if (this.isQuanX()) {
        return $prefs.setValueForKey(val, key);
      } else if (this.isNode()) {
        this.data = this.loadData();
        this.data[key] = val;
        this.writeData();
        return true;
      } else {
        return (this.data && this.data[key]) || null;
      }
    }

    initGotEnv(opts) {
      this.got = this.got ? this.got : require('got');
      this.ckTough = this.ckTough ? this.ckTough : require('tough-cookie');
      this.ckJar = this.ckJar ? this.ckJar : new this.ckTough.CookieJar();
      if (opts) {
        opts.headers = opts.headers ? opts.headers : {};
        if (undefined === opts.headers.Cookie && undefined === opts.cookieJar) {
          opts.cookieJar = this.ckJar;
        }
      }
    }

    get(opts, callback = () => { }) {
      if (opts.headers) {
        delete opts.headers['Content-Type'];
        delete opts.headers['Content-Length'];
      }
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient.get(opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        this.got(opts)
          .on('redirect', (resp, nextOpts) => {
            try {
              if (resp.headers['set-cookie']) {
                const ck = resp.headers['set-cookie']
                  .map(this.ckTough.Cookie.parse)
                  .toString();
                if (ck) {
                  this.ckJar.setCookieSync(ck, null);
                }
                nextOpts.cookieJar = this.ckJar;
              }
            } catch (e) {
              this.logErr(e);
            }
            // this.ckJar.setCookieSync(resp.headers['set-cookie'].map(Cookie.parse).toString())
          })
          .then(
            (resp) => {
              const { statusCode: status, statusCode, headers, body } = resp;
              callback(null, { status, statusCode, headers, body }, body);
            },
            (err) => {
              const { message: error, response: resp } = err;
              callback(error, resp, resp && resp.body);
            }
          );
      }
    }

    post(opts, callback = () => { }) {
      const method = opts.method ? opts.method.toLocaleLowerCase() : 'post';
      // 如果指定了请求体, 但没指定`Content-Type`, 则自动生成
      // if (opts.body && // opts.headers && !opts.headers['Content-Type']) {
      // opts.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      //  }
      if (opts.headers) delete opts.headers['Content-Length'];
      if (this.isSurge() || this.isLoon()) {
        if (this.isSurge() && this.isNeedRewrite) {
          opts.headers = opts.headers || {};
          Object.assign(opts.headers, { 'X-Surge-Skip-Scripting': false });
        }
        $httpClient[method](opts, (err, resp, body) => {
          if (!err && resp) {
            resp.body = body;
            resp.statusCode = resp.status;
          }
          callback(err, resp, body);
        });
      } else if (this.isQuanX()) {
        opts.method = method;
        if (this.isNeedRewrite) {
          opts.opts = opts.opts || {};
          Object.assign(opts.opts, { hints: false });
        }
        $task.fetch(opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => callback(err)
        );
      } else if (this.isNode()) {
        this.initGotEnv(opts);
        const { url, ..._opts } = opts;
        this.got[method](url, _opts).then(
          (resp) => {
            const { statusCode: status, statusCode, headers, body } = resp;
            callback(null, { status, statusCode, headers, body }, body);
          },
          (err) => {
            const { message: error, response: resp } = err;
            callback(error, resp, resp && resp.body);
          }
        );
      }
    }
    /**
     *
     * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S')
     *    :$.time('yyyyMMddHHmmssS')
     *    y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒
     *    其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
     * @param {string} fmt 格式化参数
     * @param {number} 可选: 根据指定时间戳返回格式化日期
     *
     */
    time(fmt, ts = null) {
      const date = ts ? new Date(ts) : new Date();
      let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        );
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length)
          );
      return fmt;
    }

    /**
     * 系统通知
     *
     * > 通知参数: 同时支持 QuanX 和 Loon 两种格式, EnvJs根据运行环境自动转换, Surge 环境不支持多媒体通知
     *
     * 示例:
     * $.msg(title, subt, desc, 'twitter://')
     * $.msg(title, subt, desc, { 'open-url': 'twitter://', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     * $.msg(title, subt, desc, { 'open-url': 'https://bing.com', 'media-url': 'https://github.githubassets.com/images/modules/open_graph/github-mark.png' })
     *
     * @param {*} title 标题
     * @param {*} subt 副标题
     * @param {*} desc 通知详情
     * @param {*} opts 通知参数
     *
     */
    msg(title = name, subt = '', desc = '', opts) {
      const toEnvOpts = (rawOpts) => {
        if (!rawOpts) return rawOpts;
        if (typeof rawOpts === 'string') {
          if (this.isLoon()) return rawOpts;
          else if (this.isQuanX()) return { 'open-url': rawOpts };
          else if (this.isSurge()) return { url: rawOpts };
          else return undefined;
        } else if (typeof rawOpts === 'object') {
          if (this.isLoon()) {
            let openUrl = rawOpts.openUrl || rawOpts.url || rawOpts['open-url'];
            let mediaUrl = rawOpts.mediaUrl || rawOpts['media-url'];
            return { openUrl, mediaUrl };
          } else if (this.isQuanX()) {
            let openUrl = rawOpts['open-url'] || rawOpts.url || rawOpts.openUrl;
            let mediaUrl = rawOpts['media-url'] || rawOpts.mediaUrl;
            let updatePasteboard =
              rawOpts['update-pasteboard'] || rawOpts.updatePasteboard;
            return {
              'open-url': openUrl,
              'media-url': mediaUrl,
              'update-pasteboard': updatePasteboard,
            };
          } else if (this.isSurge()) {
            let openUrl = rawOpts.url || rawOpts.openUrl || rawOpts['open-url'];
            return { url: openUrl };
          }
        } else {
          return undefined;
        }
      };
      if (!this.isMute) {
        if (this.isSurge() || this.isLoon()) {
          $notification.post(title, subt, desc, toEnvOpts(opts));
        } else if (this.isQuanX()) {
          $notify(title, subt, desc, toEnvOpts(opts));
        }
      }
      if (!this.isMuteLog) {
        let logs = ['', '==============📣系统通知📣=============='];
        logs.push(title);
        subt ? logs.push(subt) : '';
        desc ? logs.push(desc) : '';
        console.log(logs.join('\n'));
        this.logs = this.logs.concat(logs);
      }
    }

    log(...logs) {
      if (this.noLog || (this.noLogKey && (this.getData(this.noLogKey) || 'N').toLocaleUpperCase() === 'Y')) {
        return;
      }
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs];
      }
      console.log(logs.join(this.logSeparator));
    }

    logErr(err, msg) {
      const isPrintSack = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      if (!isPrintSack) {
        this.log('', `❗️${this.name}, 错误!`, err);
      } else {
        this.log('', `❗️${this.name}, 错误!`, err.stack);
      }
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    done(val = {}) {
      const endTime = new Date().getTime();
      const costTime = (endTime - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
      this.log();
      if (this.isSurge() || this.isQuanX() || this.isLoon()) {
        $done(val);
      }
    }
  })(name, opts);
}
