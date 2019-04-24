// ==UserScript==
// @name         斗鱼去火箭横幅(贵族弹幕样式&&聊天区域铭牌)
// @namespace    https://github.com/wah0713/myTampermonkey
// @version      1.3
// @description  增加 弹幕悬停关闭、登录开启最高画质 （功能按钮）去除 贵族弹幕样式&&聊天区域铭牌、火力全开（输入框上方）、播放器内关注按钮、右侧浮动广告、底部广告、抽奖中间部提示框、竞猜、火箭横幅、亲密互动(播放器左下角)、抽奖(播放器左下角)、贵族入场提醒（输入框上方）、页游签到奖励（播放器左下角）、分享 客户端 手游中心（播放器右上角）、导航栏客户端按钮、播放器内主播推荐关注弹幕、播放器内房间号日期（播放器内左下角）、播放器左侧亲密互动、播放器左下角下载客户端QR、未登录提示、分区推荐弹幕
// @supportURL   https://github.com/wah0713/myTampermonkey/issues
// @author       wah0713
// @compatible   chrome
// @license      MIT
// @icon         https://www.douyu.com/favicon.ico
// @require      https://cdn.bootcss.com/jquery/3.4.0/jquery.min.js
// @match        http*://www.douyu.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    if (!/^\/\d+$/.test(window.location.pathname) && window.location.pathname.indexOf('topic') === -1) return false

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    let sign = 0
    let removeDomList = [
        // 火力全开（输入框上方）、
        '.FirePower',
        // 播放器内关注按钮、
        '.focus_box_con-7adc83',
        // 右侧浮动广告、
        ' #js-room-activity',
        // 底部广告、
        ' #js-bottom',
        // 抽奖中间部提示框、
        '.LotteryContainer',
        // 竞猜、
        '.guessGameContainer',
        // 火箭横幅、
        '.broadcastDiv-af5699',
        // 亲密互动(播放器左下角)、
        '.closeBg-998534',
        // 抽奖(播放器左下角)、
        '.UPlayerLotteryEnter',
        // 贵族入场提醒（输入框上方）、
        '.EnterEffect',
        // 补充 贵族入场提醒（输入框上方）、
        '.ToolbarActivityArea',
        // 页游签到奖励（播放器左下角）、
        '.Title-roomOtherBottom',
        // 分享 客户端 手游中心（播放器右上角）、
        '.Header-download-wrap',
        // 导航栏客户端按钮、
        '.noSubFloat-3e7a50',
        // 播放器内主播推荐关注弹幕
        '.watermark-442a18',
        // 播放器内房间号日期（播放器内左下角）、
        '.code_box-5cdf5a',
        '.code-box-15b952',
        // 播放器左下角下载客户端QR、
        '.normalBg-a5403d',
        // 播放器左侧亲密互动、
        '.multiBitRate-da4b60',
        // 未登录提示、
        '.ordinaryBcBox-8220a7'
        // 分区推荐弹幕
    ]
    let tempArr = []

    // 只执行一次
    let notProcessedLayoutMain = true
    let notProcessedBackground = true
    let notProcessedLayoutContainer = true
    let notProcessedAdjustClarity = true

    const target = $('body')[0]

    // 引入定制的样式
    const myCss = $(`<link rel="stylesheet" href="https://wah0713.github.io/myTampermonkey/css/base.css">`)
    $('head').append(myCss)

    // 开关功能列表
    $('body').append(`
    <div id="wah0713">
        <button>登陆最高画质(close)</button>
        <button>弹幕关闭悬停(close)</button>
    </div>`)

    // 是否开启登陆高清画质
    function adjustClarity_fun() {
        if (!GM_getValue('adjustClarity', false)) {
            $('#wah0713 >button:nth-child(1)').addClass('close').text('登陆最高画质(close)')
        } else {
            $('#wah0713 >button:nth-child(1)').removeClass('close').text('登陆最高画质(open)')
        }
    }
    adjustClarity_fun()
    $('#wah0713 >button:nth-child(1)').click(() => {
        GM_setValue('adjustClarity', !GM_getValue('adjustClarity', false))
        adjustClarity_fun()
    })

    // 是否开启弹幕禁止悬停
    function danmuMove_fun() {
        if (!GM_getValue('danmuMove', false)) {
            $('#wah0713 >button:nth-child(2)').addClass('close').text('弹幕关闭悬停(close)')
        } else {
            $('#wah0713 >button:nth-child(2)').removeClass('close').text('弹幕关闭悬停(open)')
        }
    }
    danmuMove_fun()
    $('#wah0713 >button:nth-child(2)').click(() => {
        GM_setValue('danmuMove', !GM_getValue('danmuMove', false))
        danmuMove_fun()
    })

    // 调试
    // $(window).dblclick(() => {
    //     console.log(`GM_getValue('adjustClarity', false)`, GM_getValue('adjustClarity', false));
    //     console.log(`GM_getValue('danmuMove', false)`, GM_getValue('danmuMove', false));
    // })

    const observer = new MutationObserver(function () {
        // remove模块
        tempArr = removeDomList.slice(0)
        let i = 0
        removeDomList.length && removeDomList.forEach((domName, index) => {
            if ($(domName).remove().length != 0) {
                tempArr.splice(index + i, 1)
                i--
            }
        })
        removeDomList = tempArr.slice(0)

        // 支持url带 /topic
        if (notProcessedLayoutMain) {
            if (window.location.pathname.indexOf('topic') > -1) {
                $('.layout-Main')[0].setAttribute('style',
                    'margin-top: 80px;'
                )
            }
            notProcessedLayoutMain = false
        }

        // 登录开启最高画质
        if (GM_getValue('adjustClarity', false)) {
            if (notProcessedAdjustClarity && $('.tip-e3420a ul') && $('.tip-e3420a ul').children().length && !$('.tip-e3420a ul li:first-child').hasClass('selected-3a8039')) {
                $('.tip-e3420a ul li:first-child').click()
                notProcessedAdjustClarity = false
            }
        }

        // 弹幕悬停关闭
        if (GM_getValue('danmuMove', false)) {
            $('.danmuItem-31f924').each((index, dom) => {
                if ($(dom).children().length <= 1) {
                    $(dom).append('<div style="height: 100%;width: 100%;position: absolute;top: 0;left: 0;z-index: 999; cursor:default;"></div>')
                }
            })
        }

        // 播放器位置
        if (notProcessedBackground) {
            $('.Background-holder').css('padding-top', 10)
            notProcessedBackground = false
        }

        // 背景图
        if ($('.layout-Main').offset().top < $(window).height() * 1 / 2) {
            $('body').css({
                'background-image': "none",
                'background-color': '#abc'
            })
        } else {
            $('body').css({
                'background-image': "url('https://wah0713.github.io/myTampermonkey/image/down.jpg')",
                'background-color': '#f6f6f6',
                'background-position': 'center 68px',
                'background-repeat': 'repeat-y'
            })
        }
        if (notProcessedLayoutContainer) {
            $('.layout-Container').css({
                'background-image': "none",
                'background-color': '#abc'
            })
            notProcessedLayoutContainer = false
        }

        // 去掉除播放器以外的多余bc-wrapper元素
        $('.bc-wrapper').each((index, element) => {
            $(element).children().each((ind, ele) => {
                if ($(ele).hasClass('layout-Main')) {
                    sign = index
                    return false
                }
            })
        })
        $('.bc-wrapper').not($('.bc-wrapper')[sign]).remove()

        // 去掉播放器下方活动列表
        $('.ToolbarGiftArea').length === 1 && $('.ToolbarGiftArea').children().not('.GiftInfoPanel').not('.ToolbarGiftArea-GiftBox').not('.ToolbarGiftArea-giftExpandBox').not($('.ToolbarGiftArea').children().eq(-1)).hide()

        // 播放器内贵族样式弹幕（降级为普通弹幕）
        $('.user-icon-8af1e3').remove()
        $('.noble-icon-c10b6a').remove()

        // 播放器内分区弹幕
        $(".bc-f66a59").remove()

        // 播放器内火力全开获奖
        $('.FirePowerRewardModal').remove()

        // // 输入框上方送礼400毫米淡出
        $("#js-player-barrage .BarrageBanner").children().delay(1000 * 3).fadeOut("slow")

        // 聊天框用户进入欢迎语
        $('.Barrage-list .Barrage-userEnter').parent('.Barrage-listItem').hide()

        // 聊天框用户送礼
        $('.Barrage-list .Barrage-message').parent('.Barrage-listItem').hide()

        // 聊天框用户竞猜获奖
        $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').hide()

        // 聊天框用户粉丝牌升级
        $('.Barrage-list .Barrage-icon--sys').parent('.Barrage-listItem').hide()

        // 聊天框用户铭牌
        $('.Barrage-list .Barrage-nickName').prevAll().hide()
    })
    const config = {
        subtree: true,
        childList: true,
    }
    observer.observe(target, config)
})()