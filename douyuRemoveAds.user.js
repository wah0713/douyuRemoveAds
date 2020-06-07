// ==UserScript==
// @name         斗鱼去火箭横幅(贵族弹幕样式&&聊天区域铭牌)
// @namespace    https://github.com/wah0713/myTampermonkey
// @version      1.97
// @description  一个兴趣使然的脚本，本来只是屏蔽火箭横幅的脚本，到后来。。。 【✅功能按钮】 默认最高画质、弹幕悬停、竞猜显示、抽奖显示、背景显示、礼物栏简化、聊天框简化、完成日常奖励、禁言消息显示。 【✅默认设置】左侧展开默认收起、弹幕简化（贵族弹幕）、聊天框消息简化（聊天区域铭牌、大部分系统消息）【✅屏蔽】火力全开（输入框上方）、播放器内关注按钮、右侧浮动广告、火箭横幅、亲密互动(播放器左下角)、贵族入场提醒（输入框上方）、贵族入场提醒（输入框上方）、分享 客户端 手游中心（播放器右上角）、导航栏客户端按钮、播放器内主播推荐关注弹幕、播放器内房间号日期（播放器内左下角）、播放器左下角下载客户端QR、播放器左侧亲密互动、未登录提示、分区推荐弹幕、游侠活动、聊天框上方贵族发言、播放器左下方广告、聊天框内广告、底部广告、画面卡顿提示框、播放器右下角悬浮广告、播放器内左下角悬浮签到广告、LPL赛事播放器内左下角广告、播放器内竞猜提醒弹幕....
// @supportURL   https://github.com/wah0713/myTampermonkey/issues
// @author       wah0713
// @compatible   chrome
// @license      MIT
// @icon         https://www.douyu.com/favicon.ico
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://greasyfork.org/scripts/388079-canvas%E5%8A%A8%E7%94%BB/code/canvas%E5%8A%A8%E7%94%BB.js?version=721651
// @match        http*://www.douyu.com/*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  if (!/^\/\d+$/.test(window.location.pathname) && window.location.pathname.indexOf('topic') === -1) return false

  // 版本号
  const version = 1.97
  // 更新说明
  const updateNotes = version + `：<br />
        1、斗鱼升级，修改了礼物栏简化，现在能正常屏蔽 由 火小山 提出<br />
        2、优化了一处体验感不是很好的地方<br />
        `
  // layoutMain的初始MarginTop
  let originalLayoutMainMarginTop = null
  // layoutMain的初始OffsetTop
  let originalayoutMainOffsetTop = null
  let sign = 0
  // 日常奖励弹框
  let $FTP
  // Background-holder的原始paddingTop值
  let InitiaGuessGameHeight = 0
  // 5秒延迟
  let delay = false

  const body = $('body')[0]
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

  // 只执行一次
  const once = {
    notProcessedAdjustClarity: true,
    backgroundIsShow: true,
    removeBottomAd: true,
    InitiaGuessGameHeight: true,
    isFlashPlayer: true,
    AdjustClarityDelay: true
  }

  // 用户默认配置
  const defaultConfig = {
    adjustClarity: false, // 登陆最高画质
    danmuMove: false, // 弹幕悬停
    guessIsShow: false, // 竞猜显示
    lotteryIsShow: false, // 抽奖显示
    backgroundIsShow: false, // 背景显示
    playerBottomSimplification: true, // 播放器下方简化
    chatBoxCleaning: true, // 聊天框简化
    forbiddenMessage: false, // 禁言消息显示
    autoReward: false, // 完成日常奖励
  }
  const config = GM_getValue('Config', defaultConfig)
  for (let key in defaultConfig) {
    if (typeof (config[key]) === 'undefined') {
      config[key] = defaultConfig[key]
    }
  }
  window.onbeforeunload = () => {
    GM_setValue('Config', config)
  }

  $('body').append(`<div id='wah0713-alert'><i></i><span></span></div>`)

  /**
   *  提示框
   * @param {string} message 内容
   * @param {string} type 类型
   * @param {number} time 延迟时间
   * @param {dom} dom 控制的dom
   */
  function myAlert(params) {
    $('#wah0713-alert >span').html(params.message).parent('#wah0713-alert')
    if (params.type === 'warning') {
      $('#wah0713-alert').show()
      setTimeout(() => {
        $('#wah0713-alert').hide()
      }, params.time * 1000)
      $('#wah0713-alert').removeClass().addClass('warning').children('i').text('x')
    } else if (params.type === 'info') {
      $('#wah0713-alert').removeClass().addClass('info').children('i').text('i')
      params.dom.mouseleave(() => {
        $('#wah0713-alert').hide()
      })
      params.dom.mouseenter(() => {
        // 提示用户更新内容
        GM_setValue(version, true)
        $('#wah0713-alert').show()
        // 彩蛋
        if (!config.backgroundIsShow) {
          if (!$('#easterEgg').length) {
            window.easterEgg && window.easterEgg($(".layout-Player-aside")[0])
          }
          $('#easterEgg').show()
        } else {
          $('#easterEgg').hide()
        }
      })
    }
  }
  // 右侧自定义按钮模块
  $('body').append(`
        <div id="wah0713">
            <div class="gear"><img src="http://wx3.sinaimg.cn/mw690/8666830cgy1g9xp13x8m0j20gy0gv78h.jpg">
                <div class="redDot"></div>
            </div>
        </div>
        `)
  $('#wah0713').mouseenter(() => {
    $('#wah0713 .gear').fadeOut("slow")
    myAlert({
      message: updateNotes,
      type: 'info',
      dom: $('#wah0713 >.tip')
    })
  }).mouseleave(() => {
    $('#wah0713 .gear').fadeIn("slow")
  })

  // 版本号和提示语
  $("#wah0713").append(`<p class='tip'>${version}版本（更新内容详情）</p>`)

  /**
   *  封装按钮显示事件
   * @param {string} localStorageName 按钮本地存储名
   * @param {string} displayName 按钮显示名
   */
  function btnListFun(localStorageName, displayName, description) {
    $("#wah0713").append(`<button class='${localStorageName}' title='${description}'>${displayName}(close)</button>`)

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
      if (typeof (once[localStorageName]) !== 'undefined') {
        once[localStorageName] = true
      }
    })
  }

  // 按钮事件
  btnListFun('adjustClarity', '默认最高画质', '10秒后开启当前房间最高画质，可能会闪一次屏__本功能由noob-one提出')
  btnListFun('danmuMove', '弹幕悬停', '播放器内弹幕被选中时悬停__本功能由noob-one提出')
  btnListFun('guessIsShow', '竞猜显示', '竞猜是否显示__本功能由noob-one提出')
  btnListFun('lotteryIsShow', '抽奖显示', '抽奖是否显示__本功能由lv88ff提出')
  btnListFun('backgroundIsShow', '背景显示', '背景是否显示__本功能由dongliang zhang提出')
  btnListFun('playerBottomSimplification', '礼物栏简化', '播放器下方礼物栏简化__本功能由evenora提出')
  btnListFun('chatBoxCleaning', '聊天框简化', '聊天框头部去除主播公告、贡献周榜、贵宾、粉丝团和主播通知__本功能由dongliang zhang提出')
  btnListFun('autoReward', '完成日常奖励', '支持获取鱼塘的奖励和自动房间签到')
  btnListFun('forbiddenMessage', '禁言消息显示', '聊天框内用户被禁言消息是否显示__本功能由lv88ff提出')

  // 左侧展开默认收起
  if ($(".Aside-main--shrink").width() > 100) {
    $(".Aside-toggle").click()
  }

  // 自动发送弹幕封装
  function AutoDanmuSend() {
    //  大于3小于10的数字
    const raddom = Math.max(3, Math.ceil(7 * Math.random()))
    const arr = []
    arr.length = raddom
    const AutoDanmu = arr.fill('6').join('')
    $('.ChatSend-txt').val(AutoDanmu)
    $('.ChatSend-button').click()
  }

  // 日常奖励按钮封装
  function TreasureBoxBtnListHandle() {
    const $oneCompleteBtn = $('.FTP-bubble-progressText.is-complete').eq(0)
    if ($oneCompleteBtn.length === 1) {
      $oneCompleteBtn.click()
    }
    const $oneFinishedBtn = $('.FTP-singleTask-btn.is-finished').eq(0)
    if ($oneFinishedBtn.length === 1) {
      $oneFinishedBtn.click()
    } else {
      $('.FTP-activePoint').click()
      $('.FTP-singleTask-btn.is-finished').eq(0).click()
    }
    // 关闭
    $('.FishpondTreasure-icon').click()
  }

  // 日常奖励自动获取
  setInterval(() => {
    if ($('.autoReward')[0].style.display !== 'none' && config.autoReward) {
      if ($('.RoomLevelDetail-level').text() === '签到' && $('.Title-followBtnBox.is-followed').length) {
        $('.RoomLevelDetail-level').click()
      }
      if (Number($('.FishpondTreasure-num').text())) {
        $FTP = $('.FTP')
        if (!$FTP.length) { // 弹框没有出来
          $('.FishpondTreasure-icon').click()
          $FTP = $('.FTP')
          $FTP.addClass('opacity0')
          TreasureBoxBtnListHandle()
        } else { // 弹框出来
          TreasureBoxBtnListHandle()
        }
      }
    }
  }, 30 * 1000)

  // 头部隐藏
  let headIsHideTimer = null
  let headIsShowTimer = null
  $('body').addClass('head-hide')
  $('#js-header').mouseenter(() => {
    clearTimeout(headIsHideTimer)
    headIsShowTimer = setTimeout(() => {
      $('body').removeClass('head-hide')
      $('.public-DropMenu-drop').each((idx, dom) => {
        dom.style = ""
      })
    }, 500)
  })
  $('#js-header').mouseleave(() => {
    clearTimeout(headIsShowTimer)
    headIsHideTimer = setTimeout(() => {
      $('body').addClass('head-hide')
      $('.public-DropMenu-drop').hide()
      $('.Search-text').blur()
    }, 5 * 1000)
  })

  const observer = new MutationObserver(function () {
    // 提示用户更新了
    if (GM_getValue(version)) {
      $('#wah0713 .gear >img').removeClass('active')
      $('#wah0713 .gear .redDot').hide()
      $('#wah0713 .tip').removeClass('active')
    } else {
      $('#wah0713 .gear >img').addClass('active')
      $('#wah0713 .gear .redDot').show()
      $('#wah0713 .tip').addClass('active')
    }

    // 开启高清画质延迟5秒
    if (once.AdjustClarityDelay && $('.tip-e3420a ul') && $('.tip-e3420a ul').children().length) {
      setTimeout(() => {
        delay = true
      }, 10 * 1000)
      once.AdjustClarityDelay = false
    }

    // flash播放器
    if (once.isFlashPlayer && $('#room-flash-player').length) {
      myAlert({
        message: '正在使用flash播放器，【斗鱼去火箭横幅】部分功能会失效',
        type: 'warning',
        time: 3
      })
      once.isFlashPlayer = false
    }

    // 获取初始竞猜高度
    if (once.InitiaGuessGameHeight && $('.Bottom-guessGame-placeholder').length) {
      InitiaGuessGameHeight = $('.Bottom-guessGame-placeholder').height()
      once.InitiaGuessGameHeight = false
    }

    // 底部广告（特殊dom）
    if (once.removeBottomAd && $('.Bottom-ad').length) {
      $('.Bottom-ad').hide()
      once.removeBottomAd = false
    }

    // 自定义按钮显示条件
    if ($('.UnLogin').length) {
      $('.adjustClarity').hide()
      $('.danmuMove').hide()
      $('.autoReward').hide()
    } else {
      $('.adjustClarity').show()
      $('.danmuMove').show()
      $('.autoReward').show()
    }

    // 抽奖显示
    if (config.lotteryIsShow) {
      // 抽奖中间部提示框、
      $(".LotteryContainer").show()
      // 抽奖(播放器左下角)、
      $(".UPlayerLotteryEnter").removeClass('is-hide')
      // 中奖播放器中显示
      $(".LotteryContainer-svgaWrap").show()
      // 粉丝福利社抽奖
      $('.LotteryDrawEnter').show()

    } else {
      // 抽奖中间部提示框、
      $(".LotteryContainer").hide()
      // 抽奖(播放器左下角)、
      $(".UPlayerLotteryEnter").addClass('is-hide')
      // 中奖播放器中显示
      $(".LotteryContainer-svgaWrap").hide()
      // 粉丝福利社抽奖
      $('.LotteryDrawEnter').hide()
    }

    // 屏蔽播放器内大多活动
    $('.player-dialog').children().each((index, dom) => {
      if (config.lotteryIsShow) {
        if (!$(dom).find('.LotteryContainer').length) {
          $(dom).hide()
        } else {
          $(dom).show()
        }
      } else {
        $(dom).hide()
      }
    })

    // 礼物栏简化

    // if ($(ele).is(':visible')) { // 判断是否隐藏
    //   allhide = false
    // }

    if (config.playerBottomSimplification) {
      $('.ActivityItem').removeClass('is-hide')
      $('.ActiviesExpanel').addClass('is-hide')
      $('.ActivityItem:not(.ActivityItem[data-flag="room_level"]):not(.ActivityItem[data-flag="anchor_quiz"])').addClass('is-hide')
      $('.PlayerToolbar-Task').addClass('is-hide')
      $('.ToolbarActivityArea>div:last-child>div>div:not(.LotteryDrawEnter)').addClass('is-hide')
    } else {
      $('.ActivityItem').removeClass('is-hide')
      $('.ActiviesExpanel').removeClass('is-hide')
      $('.PlayerToolbar-Task').removeClass('is-hide')
      $('.ToolbarActivityArea>div:last-child>div>div:not(.LotteryDrawEnter)').removeClass('is-hide')
    }

    // 主播公告、贡献周榜、贵宾和粉丝团
    if (config.chatBoxCleaning) {
      $(".layout-Player-asideMainTop").addClass("hide")
    } else {
      $(".layout-Player-asideMainTop").removeClass("hide")
    }

    // 登录开启最高画质
    if ($('.adjustClarity')[0].style.display !== 'none' && config.adjustClarity) {
      if (delay && once.notProcessedAdjustClarity && $('.tip-e3420a ul') && $('.tip-e3420a ul').children().length && !$('.tip-e3420a ul li:first-child').hasClass('selected-3a8039')) {
        $('.tip-e3420a ul li:first-child').click()
        once.notProcessedAdjustClarity = false
      }
    }

    // 弹幕悬停关闭
    if ($('.danmuMove')[0].style.display !== 'none' && config.danmuMove) {
      $(".danmuItem-31f924 .mask").remove()
    } else {
      $('.danmuItem-31f924').each((idx, dom) => {
        if (!$(dom)[0].handle) {
          $(dom)[0].handle = true
          $(dom).append('<div class="mask" style="height: 100%;width: 100%;position: absolute;top: 0;left: 0;z-index: 999; cursor:default;"></div>')
        }
      })
    }

    // 竞猜显示
    if (config.guessIsShow) {
      // 聊天框用户竞猜获奖
      $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').show()
      $('.ActivityItem[data-flag="anchor_quiz"]').show()
      $('.guessGameContainer').show()
      $('.Bottom-guessGame-placeholder').height(InitiaGuessGameHeight)
    } else {
      // 聊天框用户竞猜获奖
      $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').hide()
      $('.ActivityItem[data-flag="anchor_quiz"]').hide()
      $('.guessGameContainer').hide()
      $('.Bottom-guessGame-placeholder').height(0)
    }

    // 背景图
    $layoutMain = $('.layout-Main')
    if (config.backgroundIsShow && !$('.is-fullScreenPage').length) {
      if (once.backgroundIsShow) {
        $('html').removeClass('no-background')
        // 恢复除播放器以外的多余bc-wrapper元素
        $('.bc-wrapper').show()

        $('.wm-general').show().removeClass('marginTop100')

        $('.wm-general-bgblur').removeClass('background-image-hide')

        $layoutMain[0].style = ""
        setTimeout(() => {
          window.scrollTo(0, $('.layout-Player').offset().top - 100)
        }, 200)
        once.backgroundIsShow = false
      }
      // 彩蛋
      $('#easterEgg').hide()
    } else {
      $('html').addClass('no-background')
      // 暴雪频道特有
      if (originalayoutMainOffsetTop && (originalayoutMainOffsetTop > $(window).height() * 1 / 2)) {
        $('body').addClass('go-beyound')
      } else {
        $('body').removeClass('go-beyound')
      }

      !originalLayoutMainMarginTop && (originalLayoutMainMarginTop = $layoutMain.css('margin-top').split('px')[0] - 0)
      if (once.backgroundIsShow) {
        setTimeout(() => {
          originalayoutMainOffsetTop = $layoutMain.offset().top
          if (originalayoutMainOffsetTop < 70) {
            const gaps = 70 - originalayoutMainOffsetTop
            $layoutMain.css('margin-top', originalLayoutMainMarginTop + gaps)
          } else {
            $layoutMain[0].style = ""
          }
          window.scrollTo(0, $('.layout-Player').offset().top - 100)
        }, 200)
        once.backgroundIsShow = false
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

      $('.wm-general').each((idx, dom) => {
        if ($(dom).find('div.layout-Main').length) {
          $(dom).addClass('marginTop100')
        } else {
          $(dom).hide()
        }
      })
      $('.wm-general-bgblur').addClass('background-image-hide')

      $('.bc-wrapper').not($('.bc-wrapper')[sign]).hide()
    }

    // 输入框上方送礼3000毫米淡出
    $('#js-player-barrage .BarrageBanner').children().delay(1000 * 3).fadeOut('slow')

    // 聊天框用户进入欢迎语
    $('.Barrage-list .Barrage-userEnter').parent('.Barrage-listItem').hide()

    // 聊天框用户送礼
    $('.Barrage-list .Barrage-message').parent('.Barrage-listItem').hide()

    // 聊天框用户点赞 （parents多个s）
    $('.Barrage-list .roomDianzanIcon').parents('.Barrage-listItem').hide()

    // 聊天框用户铭牌
    $('.Barrage-list .Barrage-nickName').prevAll().hide()

    // 聊天框用户相关消息广播
    // 系统提示（例如禁言）Barrage-notice--red
    $('.Barrage-list .Barrage-icon--sys').each((idx, dom) => {
      const domParent = $(dom).parent('.Barrage-listItem')
      if (config.forbiddenMessage) {
        if (domParent.find('.Barrage-text').text().indexOf("禁言") === -1) {
          domParent.hide()
        } else {
          domParent.show()
        }
      } else {
        domParent.hide()
      }
    })

  })
  const observerConfig = {
    subtree: true,
    childList: true,
  }
  observer.observe(body, observerConfig)

  const node = document.createTextNode(`
html ::-webkit-scrollbar{height:14px;width:12px;overflow:visible;position:absolute;bottom:16px}html ::-webkit-scrollbar-button{height:0;width:0}html ::-webkit-scrollbar-thumb,html ::-webkit-scrollbar-track{background-clip:padding-box;border:3px solid transparent;border-radius:100px}html ::-webkit-scrollbar-corner{background-color:transparent}html ::-webkit-scrollbar-thumb{background-color:#ccc}html ::-webkit-scrollbar-track{background-color:hsla(0,0%,100%,0)}html body .broadcastDiv-af5699{display:none!important;opacity:0!important;visibility:hidden!important}html body #js-header{transition:opacity .5s;opacity:1}html body .layout-Main{transition:margin-top .5s;margin-top:0}html body #js-aside{margin-top:-68px;z-index:401}html body.head-hide #js-header{opacity:.1}html body .super-noble-icon-9aacaf,html body .super-tail-bffa58,html body .super-user-icon-574f31{display:none!important}html body .super-text-0281ca{background:none!important}html .Barrage{border-top:none}html .adjustClarity,html .autoReward,html .danmuMove{display:none}html .danmuItem-31f924{background-color:transparent!important}html .danmuItem-31f924 .text-b132b0{font:700 24px SimHei,Microsoft JhengHei,Arial,Helvetica,sans-serif!important}html .Barrage-listItem div:first-child{padding:0 10px!important}html .Barrage-listItem .Barrage-nickName{color:#2b94ff!important}html .Barrage-listItem .Barrage-nickName.is-self{color:#ff5d23!important}html .layout-Player-asideMainTop.hide .layout-Player-announce{display:none}html .layout-Player-asideMainTop.hide .layout-Player-barrage{top:0}html .layout-Player-asideMainTop.hide .layout-Player-rank{border:none;display:none}html .layout-Player-asideMainTop.hide .ChatRank-rankWraper{display:none}html .noble-bf13ad{background:none!important}html .Barrage-notice--noble{background:none!important;border:none!important}html.no-background .bc-wrapper{background-color:transparent!important;background-image:none!important}html.no-background .Background-holder{padding-top:10px}html.no-background #js-bottom{display:none}html.no-background body{background-image:none;background-color:#ffe}html.no-background body.go-beyound{background-image:url(https://wx2.sinaimg.cn/mw690/8666830cgy1g9xp15vwl4j20i20jdwey.jpg);background-color:#f6f6f6;background-position:center 68px;background-repeat:repeat-y}html.no-background body .layout-Container{background-image:none;background-color:#ffe}html .is-fullScreenPage #wah0713{display:none}html #wah0713{position:fixed;top:50%;transform:translateY(-50%);right:-182px;border:1px solid #ccc;border-radius:6px;z-index:20;padding:10px 5px;background:#fef54e url(http://wx3.sinaimg.cn/mw690/8666830cgy1g9xp179mfvj20hs0vkaac.jpg) no-repeat 50%/100%;width:160px;transition:all .5s ease-out}html #wah0713 .tip{margin-bottom:5px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}html #wah0713 .tip>a{color:red}html #wah0713 .tip.active{animation:Bigger 2s linear infinite}html #wah0713:hover{right:0}html #wah0713:hover>button{opacity:1}html #wah0713 .gear{width:32px;padding-right:13px;position:absolute;top:50%;left:-45px;transform:translateY(-50%)}html #wah0713 .gear>img{width:100%;animation:rotating 30s linear infinite paused;border-radius:33%}html #wah0713 .gear>img.active{animation-play-state:running}html #wah0713 .gear .redDot{display:none;width:9px;height:9px;background-color:#fd4a4e;border-radius:50%;position:absolute;top:3px;right:2px}html #wah0713>button{margin:0 auto 5px;display:block;line-height:1;white-space:nowrap;cursor:pointer;background:#409eff;border:1px solid #409eff;color:#fff;-webkit-appearance:none;text-align:center;box-sizing:border-box;outline:none;transition:.1s;font-weight:500;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;padding:6px 10px;font-size:14px;border-radius:4px;opacity:.75}html #wah0713>button:last-of-type{margin-bottom:0}html #wah0713>button:hover{opacity:.8}html #wah0713>button.close{background-color:#fff;color:#409eff}html #wah0713-alert{display:none;padding:8px 16px;position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:30;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border:1px solid #ccc;border-radius:8px}html #wah0713-alert>i{width:14px;height:14px;display:inline-block;border-radius:50%;color:#fff;text-align:center;line-height:14px;font-family:Arial,Microsoft YaHei,黑体,宋体,sans-serif;margin-right:8px;position:relative;top:-1px}html #wah0713-alert.warning{background-color:#fff1f0;border-color:#f5222d}html #wah0713-alert.warning>i{background-color:#f5222d}html #wah0713-alert.info{background-color:#f4f4f5;border-color:#909399}html #wah0713-alert.info>i{background-color:#909399}html #wah0713-alert>span{font-family:Chinese Quote,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;font-size:14px;font-variant:tabular-nums;color:rgba(0,0,0,.65)}html .marginTop100{margin-top:100px!important}html .background-image-hide{background-image:none!important;background-color:none!important}#FansFestival2003Tips,#js-room-activity,.ActDayPay-toast,.activity-icon-4b45df,.activity-icon-c717fc,.ad-box-f661ba,.afterpic-8a2e13,.Barrage-chat-ad,.Barrage-topFloater,.bc-f66a59,.closeBg-998534,.code-box-15b952,.code_box-5cdf5a,.DanmuEffectDom-container,.EnterEffect,.FirePower,.FirePowerIcon,.FirePowerRewardModal,.focus_box_con-7adc83,.FuDaiActPanel,.guessIconReminding,.Header-download-wrap,.HeaderNav,.headpic-dda332,.LotteryContainer-svgaDes,.LuckyStartEnter,.multiBitRate-da4b60,.noble-icon-88f562,.noble-icon-c10b6a,.normalBg-a5403d,.noSubFloat-3e7a50,.ordinaryBcBox-8220a7,.PaladinWeek-toast,.PcDiversion,.PlayerToolbar-signCont,.PrivilegeGiftModalDialog,.recommendAD-54569e,.RoomText-wrap,.SysSign-Ad,.Title-roomOtherBottom,.user-icon-8af1e3,.user-icon-eeabb1,.vivo-ad-743527,.watermark-442a18,.WXTipsBox{display:none!important}.opacity0{opacity:0}.is-hide{display:none!important}@keyframes rotating{0%{transform:rotate(0)}to{transform:rotate(1turn)}}@keyframes Bigger{0%{transform:scale(.95)}50%{transform:scale(1)}to{transform:scale(.95)}}
  `)
  $('head').append($(`<style type="text/css"></style>`).append(node))

  // // debugJS
  // setTimeout(() => {
  // }, 5 * 1000);
})()