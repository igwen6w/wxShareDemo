var utils = {
    issuplocal: window.localStorage,
    mediaDomain: '//media.example.com',
    imgDomain: '//img.example.com',
    adataDomain: 'https://data.example.com',
    GetQueryStr: function (key, url) {
        if (!url) url = location.href;
        var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");
        var r = url.substr(url.indexOf("\?") + 1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return "";
    },
    //获取url中的参数
    GetQueryInt: function (name, url) {
        if (!url) url = location.href;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]);
        return 0; //返回参数值
    },
    isweixin: function () {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") return true; else return false;
    },
    isapp: function () {
        var _self = this;
        var ua = navigator.userAgent.toLowerCase();
        if (ua && ua.indexOf("zbrm@jsb") > -1) {
            return 1;//app
        } else if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return 2;//weixin
        } else {
            if (_self.getParentUrl().indexOf("www.") > 0) return 3;// pc
            else return 0;//wap
        }
    },
    //如果返回的是false说明当前操作系统是手机端，如果返回的是true则说明当前的操作系统是电脑端
    IsPC: function () {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    },
    getParentUrl: function () {
        var url = '';
        if (parent !== window) { try { url = parent.location.href; } catch (e) { url = document.referrer; } }
        return url;
    },
    urlshare: function (shareinfo) {
        try {
            if (this.browser.versions.android) window.jsInterfaceGo.urlshare(JSON.stringify(shareinfo));
            else window.webkit.messageHandlers.urlshare.postMessage(shareinfo);
        } catch (e) { }
    },
    gologin: function (url) {
        try {
            if (this.browser.versions.android) window.jsInterfaceGo.gologin(url);
            else window.webkit.messageHandlers.gologin.postMessage(url);
        } catch (e) { }
    },
    goback: function (url) {
        try {
            if (this.browser.versions.android) window.jsInterfaceGo.goback();
            else window.webkit.messageHandlers.goback.postMessage('');
        } catch (e) { }
    },
    browser: {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {   //移动终端浏览器版本信息
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                isIOS9plus: u.match(/(iPhone|iPod|iPad|Mac OS)/i) != null && u.indexOf('os 8') == -1 && u.indexOf('os 7') == -1 && u.indexOf('os 6') == -1 && u.indexOf('os 5') == -1
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    },
    ishidetop: function () {
        var ishidetop = 0;
        if (this.browser.versions.mobile) {//判断是否是移动设备打开。browser代码在下面
            var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                ishidetop++;  //在微信中打开
            }
            if (ua.match(/WeiBo/i) == "weibo") {
                ishidetop++;//在新浪微博客户端打开
            }
            if (ua.match(/QQ/i) == "qq") {
                ishidetop++;//在QQ空间打开
            }
            if (this.browser.versions.ios) {
                ishidetop++;//在苹果浏览器打开
            }
            if (this.browser.versions.android) {
                ishidetop++;//是否在安卓浏览器打开
            }
        } else {
            //否则就是PC浏览器打开
        }
        if (ishidetop > 0) {
            $("header").remove()
            $(".bge").addClass('no-header')
        }
    },

    islocksup: false,
    loadclick: function (newsid, ctype, connid, userid) {
        var _self = this;
        let sekey = "addclick_" + newsid + "_" + ctype + '_' + connid;
        var dtn = (new Date()).getTime()
        var item = _self.lsGet(sekey);
        if (item && item != -1) {
            if (item.dt + 60 * 1000 > dtn) {//一分钟内不再增加点击量			
                $('#readnum').html(item.readnum)
                return false
            }
        }
        //超过一分钟则可以继续增加点击量
        $.ajax({
            type: 'POST', url: "/ajax/?t=" + Math.random(), data: {
                "Method": "news.news.addclick", "Params": { "newsid": newsid, "ctype": ctype || 0, "cid": connid || 0, "userid": userid || 0, "suid": _self.GetQueryStr("suid") || 0 }
            },
            success: function (d) {
                if (d.code) {
                    let readnum = d.code;
                    $('#readnum').html(readnum)
                    item = { dt: dtn, readnum: readnum };
                    _self.lsSet(sekey, item)
                    return true
                }
                if (d.pageinfo) { $('head').append(d.pageinfo); }
            }
        });
    },

    lsSet: function (k, v) {
        if (this.issuplocal) {
            var storage = window.localStorage;
            storage.removeItem(k)
            storage.setItem(k, typeof v == "string" ? v : JSON.stringify(v));
        }
    },
    lsGet: function (k, isob) {
        if (this.issuplocal) {
            var storage = window.localStorage;
            return !isob ? JSON.parse(storage.getItem(k)) : storage.getItem(k);
        } else
            return -1;
    },
    lsSets: function (k, v) {
        if (this.issuplocal) {
            var storage = window.sessionStorage;
            storage.removeItem(k)
            storage.setItem(k, typeof v == "string" ? v : JSON.stringify(v));
        }
    },
    lsGets: function (k, isob) {
        if (this.issuplocal) {
            var storage = window.sessionStorage;
            return !isob ? JSON.parse(storage.getItem(k)) : storage.getItem(k);
        } else
            return -1;
    },
    openclient: function (jumptype, id, iscomment, url) {
        if (url) {
            location.href = "/down?url=" + encodeURIComponent(url);
            return
        }
        let conf = { godown: 0, iosdownurl: "https://apps.apple.com/cn/app/id1495292950", downurl: "https://a.app.qq.com/o/simple.jsp?pkgname=com.zbrm.zgnews", scheme: "zgnews" };

        var self = this;

        /* newsdetail =新闻详情,atlasdetail=图集详情,videodetail=视频详情,livedetail =直播详情,specialdetail =专题详情,dongguadetail =冬呱详情,listingdetail =听音详情  */

        // var sourceUrl = conf.scheme + '://?type=' + jumptype + '&id=' + (id || 0) + "&open=" + (iscomment || 0);
        //
        //
        // if (self.browser.versions.ios) {
        //     if (self.browser.versions.isIOS9plus) location.href = sourceUrl;    
        //     else {
        //         //在iframe中打开APP
        //         var ifr = document.createElement('iframe');
        //         ifr.src = sourceUrl;
        //         ifr.style.display = 'none';
        //         document.body.appendChild(ifr);
        //         setTimeout(function () {
        //             document.body.removeChild(ifr);
        //         }, 2000);
        //     }
        // } else {
        //     location.href = sourceUrl;
        // }
        // setTimeout(function () {
        //     if (self.browser.versions.ios) window.location.href = conf.iosdownurl; else window.location.href =  conf.downurl;        //     
        // }, 3000);        
        // return

        let Params = 'type=' + jumptype + '&id=' + (id || 0) + "&open=" + (iscomment || 0);

        var downurl = conf.godown ? "/down" : (self.browser.versions.ios && conf.iosdownurl ? conf.iosdownurl : (conf.downurl +"&"+ Params)) //+ Params;
        if (!jumptype) {
            location.href = downurl;
            return
        }
        if (self.browser.versions.mobile) {
            var startTime = Date.now();
            if (self.isweixin()) location.href = downurl;
            else location.href = conf.scheme + '://?' + Params;


            var t = setTimeout(function () {
                var endTime = Date.now();
                if (!startTime || endTime - startTime < 2200) location.href = "/down";
            }, 2000);
            window.onblur = function () { clearTimeout(t); }
        } else {
            location.href = downurl;
        }
    },
    init: function () {
        var self = this;

        // let _rf = (document.documentElement.clientWidth / 12.5);
        // document.addEventListener("DOMContentLoaded", () => {
        //     if (self.browser.versions.android) {
        //         $('.down-box').css('font-size', _rf + 'px');
        //         $('.down-text h3').css('font-size', .3 + 'em');
        //         $('.down-text p').css('font-size', .24 + 'em');
        //         $('.down-a').css({ 'display': 'flex', 'justify-content': 'center', 'align-items': 'center' });
        //         $('.down-a a').css({ 'font-size': .24 + 'em' });

        //         $('.read-more .more_up').css({ 'display': 'flex', 'justify-content': 'center', 'align-items': 'center' });
        //         $('.read-more .more_up a').css('font-size', .3 * _rf + 'px');

        //         $('.appgo').css({ 'display': 'flex', 'justify-content': 'center', 'align-items': 'center', 'font-size': .28 * _rf + 'px' });

        //         $('.weui-dialog .weui-dialog__title').css({ 'font-size': .32 * _rf + 'px', 'line-height': .56 * _rf + 'px' });
        //         $('.weui-dialog .weui-dialog__ft a').css({ 'font-size': .28 * _rf + 'px', 'line-height': .96 * _rf + 'px' });
        //     }
        //     $("img").bind("error", function () {
        //         this.src = "https://static.zhengguannews.cn/wap/assets/images/error.png";
        //     });
        // }, false);
        // if (self.browser.versions.android) {
        //     $(".topnews").bind('DOMNodeInserted', function (e) {
        //         $('.top-nav .s-title').css('font-size', .28 * _rf + 'px');
        //         $('.top-nav .down-link a').css({ 'display': 'flex', 'justify-content': 'center', 'align-items': 'center', 'font-size': .28 * _rf + 'px' });
        //     });
        // };
        this.ishidetop()
    },
    dateFormat: function (fmt, date) {
        let ret;
        date = new Date(date)
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "h+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    },
    getdate: function (date, format) {//处理时间
        if (!date)
            date = ''
        date = date.replace(/\-/g, "/").replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');//修复ios系统 时间异常
        if (!format)
            format = "yyyy-MM-dd hh:mm"
        if (!date)
            return ''
        var datanow = new Date(Date.parse(date)) || new Date();
        var date = {
            "M+": datanow.getMonth() + 1,
            "d+": datanow.getDate(),
            "h+": datanow.getHours(),
            "m+": datanow.getMinutes(),
            "s+": datanow.getSeconds(),
            "q+": Math.floor((datanow.getMonth() + 3) / 3),
            "S+": datanow.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (datanow.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    },
    getCookie: function (name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) return unescape(arr[2]);
        else return 0;
    },
    setCookie(name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    },
}

utils.init()