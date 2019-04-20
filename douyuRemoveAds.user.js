// ==UserScript==
// @name         斗鱼去火箭横幅
// @namespace    https://github.com/wah0713
// @version      1.1
// @description  去除 火力全开（输入框上方）、播发器内关注按钮、右侧浮动广告、底部广告、抽奖中间部提示框、竞猜、火箭横幅、亲密互动(播放器左下角)、抽奖(播放器左下角)、贵族入场提醒（输入框上方）、页游签到奖励（播放器左下角）、分享 客户端 手游中心（播放器右上角）、导航栏客户端按钮
// @supportURL   https://github.com/wah0713/myTampermonkey/issues
// @author       wah0713
// @compatible   chrome
// @license      MIT
// @icon         https://www.douyu.com/favicon.ico
// @require      https://cdn.bootcss.com/jquery/3.4.0/jquery.min.js
// @match        http*://www.douyu.com/*
// @grant        none
// ==/UserScript==

(function () {
    if (!/^\/\d+$/.test(window.location.pathname) && window.location.pathname.indexOf('topic') === -1) return false
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
    let sign = 0
    let removeDomList = [
        // 火力全开（输入框上方）、
        '.FirePower',
        // 播发器内关注按钮、
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
        // 贵族入场提醒（输入框上方）、
        '.ToolbarActivityArea',
        // 页游签到奖励（播放器左下角）、
        '.Title-roomOtherBottom',
        // 分享 客户端 手游中心（播放器右上角）、
        '.Header-download-wrap'
        // 导航栏客户端按钮
    ]
    let tempArr = []

    let notProcessedLayoutMain = true
    let notProcessedBackground = true

    const target = $('body')[0]
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

        // 播发器大小及位置
        if (notProcessedBackground) {
            $('.Background-holder').css('padding-top', 10)
            notProcessedBackground = false
        }

        // 背景图
        if ($('.layout-Main').offset().top < $(window).height() * 1 / 2) {
            $('body').css({
                'background-image': "none",
                'background-color': '#abc',
            })
        } else {
            $('body').css({
                'background-image': "url('https://wah0713.github.io/myTampermonkey/image/down.jpg')",
                'background-color': '#f6f6f6',
                'background-position': 'center 68px',
                'background-repeat': 'repeat-y'
            })
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
        $('.bc-wrapper').css({
            'background-color': 'transparent',
            'background-image': 'none'
        })

        // 去掉播放器下方活动列表
        $('.ToolbarGiftArea').length === 1 && $('.ToolbarGiftArea').children().not('.GiftInfoPanel').not('.ToolbarGiftArea-GiftBox').not('.ToolbarGiftArea-giftExpandBox').not($('.ToolbarGiftArea').children().eq(-1)).hide()

    });
    const config = {
        subtree: true,
        childList: true,
    }
    observer.observe(target, config);
})()