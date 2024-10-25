let wxappId = 'wx63ba0cd2d412ffc6';

function wxShare(shareInfo) {
    if (!shareInfo.img)
        shareInfo.img = "https://" + window.location.host + "/assets/images/weixinimg.png";
    else {
        if (shareInfo.img.indexOf("http") == -1 && shareInfo.img.indexOf('data:image/png;base64,') === -1) {
            shareInfo.img = "https://" + window.location.host + shareInfo.img;
        }
    }
    if (shareInfo.link.indexOf("http") == -1) {
        shareInfo.link = "https://" + window.location.host + shareInfo.link;
    }

    var paperWxShare = new PaperWxShare(shareInfo);
    paperWxShare.doWxShare();
}


/**
 * 
 * @param {*} {showbtn,jumptype,jumpid,url,width,height} 
 * @returns 
 */
function wxopenapp(params) {

    if (!params.showbtn) return;

    let jumurl = 'appname://?';
    if (params.url) jumurl += "url=" + encodeURIComponent(params.url);
    else {
        jumurl += 'type=' + params.jumptype + '&id=' + params.jumpid;
    }

    let html = `<wx-open-launch-app id="${params.showbtn}-launch-btn" appid="${wxappId}" extinfo="${jumurl}" style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:999;">
      <template>
        <style>.wx-btn { width:${params.width}; height: ${params.height};}</style>
        <div class="wx-btn"></div>
      </template>
    </wx-open-launch-app> `;

    $('#' + params.showbtn).append(html);

    var btn = document.getElementById(params.showbtn + '-launch-btn');
    btn.addEventListener('launch', function (e) {
        console.log('success');
        setTimeout(function () {
            window.location.href = "https://a.app.qq.com/o/simple.jsp?pkgname=com.zbrm.appname"
        }, 2000)
    });
    btn.addEventListener('error', function (e) {
        // alert(e.detail.errMsg);        
        utils.openclient(params.jumptype, params.jumpid, 0, params.url)
    });
}


function PaperWxShare(shareObj) {
    this.wxShareInfo = shareObj;
}

PaperWxShare.prototype.getWxSign = function () {
    if (this.wxShareInfo) {
        var shareWxObj = this;
        $.ajax({
            type: 'POST',
            url: utils.adataDomain + "/wxJsSdk/?t=" + Math.random(),
            data: { "Method": "user.user.wxjssdk", "Params": { shareurl: shareWxObj.wxShareInfo.link.split('#')[0] } },
            success: function (d) {
                if (d.code > 0) {
                    wxappId = d.content.appId
                    shareWxObj.wxReady(d.content);
                }
            }
        });
    }
}
PaperWxShare.prototype.wxReady = function (data) {
    let _this = this;
    wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['checkJsApi', 'updateTimelineShareData', 'updateAppMessageShareData'],
        openTagList: ['wx-open-launch-app']
    });

    var type = "link";
    var dataUrl = "";
    if (this.wxShareInfo.type) {
        type = this.wxShareInfo.type
    }
    if (this.wxShareInfo.dataUrl) {
        dataUrl = this.wxShareInfo.dataUrl
    }
    let sharedata = {
        title: this.wxShareInfo.title,
        desc: this.wxShareInfo.desc.trim(),
        link: this.wxShareInfo.exlink || this.wxShareInfo.link,
        imgUrl: this.wxShareInfo.img,
        type: type,
        dataUrl: dataUrl,
        success: function (res) { }
    };


    wx.ready(function () {
        wx.checkJsApi({
            jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'wx-open-launch-app']
        });
        ShareAll(sharedata);
        _this.wxShareInfo.readys && _this.wxShareInfo.readys();
    });

    function ShareAll(sharedata) {
        wx.updateAppMessageShareData(sharedata);//分享给朋友及分享到QQ
        wx.updateTimelineShareData(sharedata);//分享到朋友圈及分享到QQ空间       
        wx.onMenuShareTimeline(sharedata);
        wx.onMenuShareAppMessage(sharedata);

        wx.onMenuShareQQ(sharedata);
        wx.onMenuShareQZone(sharedata);
        wx.onMenuShareWeibo(sharedata);
    }
}
PaperWxShare.prototype.doWxShare = function () {
    if (this.wxShareInfo) {
        this.getWxSign();
    }
}
