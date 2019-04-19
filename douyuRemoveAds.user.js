// ==UserScript==
// @name         斗鱼去火箭横幅
// @namespace    https://github.com/wah0713
// @version      0.51
// @description  去除 火力全开（输入框上方）、播发器内关注按钮、右侧浮动广告、底部广告、抽奖中间部提示框、竞猜、火箭横幅、亲密互动(播放器左下角)、抽奖(播放器左下角)
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
        // '.UPlayerLotteryEnter'
        // // 贵族入场提醒（输入框上方）
    ]
    let tempArr = []
    const target = $('body')[0]
    const observer = new MutationObserver(function (mutations) {

        function layoutMainReSize() {
            if ($(window).width() < 1366) {
                $('.layout-Main')[0].setAttribute('style', `
                position: fixed;
                left: 50%;
                transform: translateX(-50%);
                width:966px!important;
                max-width:966px!important`)
            } else {
                console.log($('.layout-Main')[0]);
                $('.layout-Main')[0].setAttribute('style', `
                position: fixed;
                left: 50%;
                transform: translateX(-50%);
                width: 1400px!important;
                max-width: 1400px!important;`)
            }
        }
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
        if (window.location.pathname.indexOf('topic') > -1) {
            $('.layout-Main')[0].setAttribute('style',
                'margin-top: 80px;'
            )
        }
        // 播发器大小及位置
        $('.Background-holder').css('padding-top', 10)
        // $(window).on("resize", function () {
        //     layoutMainReSize()
        // })
        // layoutMainReSize()

        // 背景色
        $('body').css('background-color', '#abc')

        // 去掉除播放器以外的多余元素
        $('.bc-wrapper').each((index, element) => {
            $(element).children().each((ind, ele) => {
                if ($(ele).hasClass('layout-Main')) {
                    sign = index
                    return false
                }
            })
        })
        $('.bc-wrapper').not($('.bc-wrapper')[sign]).remove()

        $($('.bc-wrapper')[sign]).css({
            'background-color': 'transparent',
            'background-image': 'none'
        })
        //
        // console.log("$('.wfs-2a8e83')", $('.wfs-2a8e83'));
        // $('.wfs-2a8e83').on('click',function(){
        //     setTimeout(function(){
        //         console.log('$( is-fullScreenPage)',$('.is-fullScreenPage'));
        //         if($('.is-fullScreenPage').length != 0){

        //         }
        //     },200)
        // })
    });
    const config = {
        subtree: true,
        childList: true,
    }
    observer.observe(target, config);
})()