// ==UserScript==
// @name         斗鱼去火箭横幅(贵族弹幕样式&&聊天区域铭牌)
// @namespace    https://github.com/wah0713/myTampermonkey
// @version      1.71
// @description  一个兴趣使然的脚本，本来只是屏蔽火箭横幅的脚本，到后来。。。
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
    // Background-holder的原始paddingTop值
    let OriginalbackgroundGolderPaddingTop = $('.Background-holder').css('padding-top') || 0
    let removeDomList = [
        // 火力全开（输入框上方）、
        '.FirePower',
        // 播放器内关注按钮、
        '.focus_box_con-7adc83',
        // 右侧浮动广告、
        ' #js-room-activity',
        // 抽奖中间部提示框、
        '.LotteryContainer',
        // 火箭横幅、
        '.broadcastDiv-af5699',
        // 亲密互动(播放器左下角)、
        '.closeBg-998534',
        // 抽奖(播放器左下角)、
        '.UPlayerLotteryEnter',
        // 贵族入场提醒（输入框上方）、
        '.EnterEffect',
        // 补充 贵族入场提醒（输入框上方）、
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
        '.ordinaryBcBox-8220a7',
        // 分区推荐弹幕、
        '.PaladinWeek-toast'
        // 游侠活动
    ]
    let tempArr = []

    // 只执行一次
    let notProcessedAdjustClarity = true
    let playerCentered = true

    const target = $('body')[0]

    // 引入定制的样式
    const myCss = $(`<link rel='stylesheet' href='https://wah0713.github.io/myTampermonkey/css/base.css'>`)
    $('head').append(myCss)

    // 右侧自定义按钮模块
    $('body').append('<div id="wah0713"></div>')

    // 用户默认配置
    let defaultConfig = {
        adjustClarity: false, // 登陆最高画质
        danmuMove: false, // 弹幕悬停
        guessIsShow: false, // 竞猜显示
        backgroundIsShow: false, // 背景显示
        chatBoxCleaning: true, // 聊天框简化
        forbiddenMessage: false, // 禁言消息显示
    }
    let config = GM_getValue('Config', defaultConfig)

    window.onbeforeunload = () => {
        GM_setValue('Config', config)
    }

    /**
     *  封装按钮显示事件
     * @param {string} localStorageName 按钮本地存储名
     * @param {string} displayName 按钮显示名
     */
    function btnListFun(localStorageName, displayName) {
        $("#wah0713").append(`<button class='${localStorageName}'>${displayName}(close)</button>`)

        function btnInit() {
            if (!config[localStorageName]) {
                $(`#wah0713 .${localStorageName}`).addClass('close').text(`${displayName}(close)`)
            } else {
                $(`#wah0713 .${localStorageName}`).removeClass('close').text(`${displayName}(open)`)
            }
        }
        btnInit()
        $(`#wah0713 .${localStorageName}`).click(() => {
            config[localStorageName] = !config[localStorageName]
            btnInit()
        })
    }

    // 按钮事件
    btnListFun('adjustClarity', '登陆最高画质')
    btnListFun('danmuMove', '弹幕悬停')
    btnListFun('guessIsShow', '竞猜显示')
    btnListFun('backgroundIsShow', '背景显示')
    btnListFun('chatBoxCleaning', '聊天框简化')
    btnListFun('forbiddenMessage', '禁言消息显示')

    // 左侧展开默认收起
    if ($(".Aside-main--shrink").width() > 100) {
        $(".Aside-toggle").click()
    }

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

        // 主播公告、贡献周榜、贵宾和粉丝团
        if (config.chatBoxCleaning) {
            $(".layout-Player-asideMainTop").addClass("hide")
        } else {
            $(".layout-Player-asideMainTop").removeClass("hide")
        }

        // 播放器居中
        if (playerCentered && $('.layout-Main').offset().top > $(window).height() * 1 / 4) {
            if (document.documentElement) {
                document.documentElement.scrollTo(0, $(".layout-Main").offset().top - 88)
            } else if (document.body) {
                document.body.scrollTo(0, $(".layout-Main").offset().top - 88)
            }
            playerCentered = false
        }

        // 登录开启最高画质
        if (config.adjustClarity) {
            if (notProcessedAdjustClarity && $('.tip-e3420a ul') && $('.tip-e3420a ul').children().length && !$('.tip-e3420a ul li:first-child').hasClass('selected-3a8039')) {
                $('.tip-e3420a ul li:first-child').click()
                notProcessedAdjustClarity = false
            }
        }

        // 弹幕悬停关闭
        if (config.danmuMove) {
            $(".danmuItem-31f924 .mask").remove()
        } else {
            $('.danmuItem-31f924').each((index, dom) => {
                if (!$(dom)[0].handle) {
                    $(dom)[0].handle = true
                    $(dom).append('<div class="mask" style="height: 100%;width: 100%;position: absolute;top: 0;left: 0;z-index: 999; cursor:default;"></div>')
                }
            })
        }

        // 是否开启竞猜关闭
        if (config.guessIsShow) {
            $('.guessGameContainer').show()
            $(".ActivityItem").each((idx, dom) => {
                if ($(dom).find(".GuessIcon").length === 0) {
                    $(dom).hide()
                } else {
                    $(dom).show()
                }
            })
        } else {
            $('.guessGameContainer').hide()
            $(".ActivityItem").hide()
        }

        // 背景图
        if (config.backgroundIsShow) {
            // 播放器位置
            $('.Background-holder').css('padding-top', OriginalbackgroundGolderPaddingTop)
            $('html').removeClass('no-background')
            // 底部广告
            $('#js-bottom').show()
            $('body')[0].style = ""
            if ($('.layout-Container')[0]) {
                $('.layout-Container')[0].style = ""
            }
            // 支持url带 /topic
            if (window.location.pathname.indexOf('topic') > -1) {
                $('.layout-Main')[0].removeAttribute('style')
            }
            $('.bc-wrapper').show()
        } else {
            // 播放器位置
            $('.Background-holder').css('padding-top', 10)
            // 底部广告
            $('#js-bottom').hide()
            $('html').addClass('no-background')
            if ($('.layout-Main').offset().top < $(window).height() * 1 / 2) {
                $('body').css({
                    'background-image': 'none',
                    'background-color': '#ffe'
                })
            } else {
                $('body').css({
                    'background-image': "url('https://wah0713.github.io/myTampermonkey/image/down.jpg')",
                    'background-color': '#ffe',
                    'background-position': 'center 68px',
                    'background-repeat': 'repeat-y'
                })
            }
            $('.layout-Container') && $('.layout-Container').css({
                'background-image': 'none',
                'background-color': '#ffe'
            })

            // 支持url带 /topic
            if (window.location.pathname.indexOf('topic') > -1) {
                $('.layout-Main')[0].setAttribute('style',
                    'margin-top: 80px;'
                )
            }

            // 去掉除播放器以外的多余bc-wrapper元素
            $('.bc-wrapper').each((index, element) => {
                $(element).children().each((idx, ele) => {
                    if ($(ele).hasClass('layout-Main')) {
                        sign = index
                        return false
                    }
                })
            })
            $('.bc-wrapper').not($('.bc-wrapper')[sign]).hide()
        }

        // 火力全开弹幕
        $('.afterpic-8a2e13').remove()

        // 火力全开聊天区域
        $('.FirePowerIcon').remove()

        // 去掉播放器下方活动列表
        $('.ToolbarGiftArea').length === 1 && $('.ToolbarGiftArea').children().not('.GiftInfoPanel').not('.ToolbarGiftArea-GiftBox').not('.ToolbarGiftArea-giftExpandBox').not($('.ToolbarGiftArea').children().eq(-1)).hide()

        // 播放器内贵族样式弹幕（降级为普通弹幕）
        $('.user-icon-8af1e3').remove()
        $('.noble-icon-c10b6a').remove()

        // 播放器内分区弹幕
        $('.bc-f66a59').remove()

        // 播放器内火力全开获奖
        $('.FirePowerRewardModal').remove()

        // 输入框上方送礼3000毫米淡出
        $('#js-player-barrage .BarrageBanner').children().delay(1000 * 3).fadeOut('slow')

        // 聊天框用户进入欢迎语
        $('.Barrage-list .Barrage-userEnter').parent('.Barrage-listItem').hide()

        // 聊天框用户送礼
        $('.Barrage-list .Barrage-message').parent('.Barrage-listItem').hide()

        // 聊天框用户竞猜获奖
        $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').hide()

        // 聊天框用户相关消息广播
        // 系统提示（例如禁言）Barrage-notice--red
        $('.Barrage-list .Barrage-icon--sys').each((idx, dom) => {
            const domParent = $(dom).parent('.Barrage-listItem')
            if (config.forbiddenMessage) {
                if (domParent.find('.Barrage-text').text().indexOf("禁言") === -1) {
                    domParent.hide()
                }
            } else {
                domParent.hide()
            }
        })
        // 聊天框用户铭牌
        $('.Barrage-list .Barrage-nickName').prevAll().hide()
    })
    const observerConfig = {
        subtree: true,
        childList: true,
    }
    observer.observe(target, observerConfig)

    // // styleTest
    // const node = document.createTextNode(`
    // html .is-fullScreenPage #wah0713 {
    //     display: none;
    //   }
    // `)
    // $('head').append($(`<style type="text/css"></style>`).append(node))

})()