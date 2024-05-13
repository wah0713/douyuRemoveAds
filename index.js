// ==UserScript==
// @name         简单斗鱼(贵族弹幕样式&&聊天区域铭牌)
// @namespace    https://github.com/wah0713/douyuRemoveAds
// @version      2.4.9
// @description  一个兴趣使然的脚本，本来只是屏蔽火箭横幅的脚本，到后来。。。 【✅功能按钮】 默认最高画质、弹幕悬停、竞猜显示、抽奖显示、背景显示、礼物栏简化、聊天框简化、禁言消息显示、聊天框用户铭牌显示、显示房间数据（👨‍👩‍👧‍👦人数、💸消费、⏱️时长）、默认网页全屏、夜间模式。 【✅默认设置】左侧展开默认收起、弹幕简化（贵族弹幕）、聊天框消息简化（大部分系统消息）【✅屏蔽】屏蔽内容过多，这里就不展开了....
// @supportURL   https://github.com/wah0713/douyuRemoveAds/issues
// @updateURL    https://greasyfork.org/scripts/381934/code/download.user.js
// @author       wah0713
// @compatible   chrome
// @license      MIT
// @icon         https://www.douyu.com/favicon.ico
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @match        *://*.douyu.com/*
// @match        *://douyu.com/*
// @connect      doseeing.com
// @noframes     true
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  if (!/^\/\d+$/.test(window.location.pathname) && window.location.pathname.indexOf('topic') === -1) return false

  // 版本号
  const version = '2.4.4'
  // 更新说明
  const updateNotes = version + `：<br>
        1、PK条是否显示__本功能由【backuponeday】提出<br>
        2、屏蔽一些广告 <br>
        `
  // 房间id
  const rid = getRoomId()
  // layoutMain的初始MarginTop
  let originalLayoutMainMarginTop = null
  // layoutMain的初始OffsetTop
  let originalayoutMainOffsetTop = null
  let sign = 0
  // Background-holder的原始paddingTop值
  let InitiaGuessGameHeight = 0
  // 计时器
  let showRoomDataInterval = null

  // 只执行一次
  const once = {
    backgroundIsShow: true,
    InitiaGuessGameHeight: true,
  }

  function getRoomId() {
    try {
      return $('html').html().match(/(?<=\$ROOM\.room_id \= )\d+/)[0]
    } catch (error) {
      return unsafeWindow.rid || unsafeWindow.apm_room_id || null
    }
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
    if (params.type === 'warning') {
      $('#wah0713-alert').removeClass().addClass('warning').children('i').text('x')

      $('#wah0713-alert >span').html(params.message)

      $('#wah0713-alert').show()
      setTimeout(() => {
        $('#wah0713-alert').hide()
      }, params.time * 1000)

    } else if (params.type === 'info') {

      $('#wah0713-alert').removeClass().addClass('info').children('i').text('i')

      params.dom.off("mouseleave").mouseleave(() => {
        $('#wah0713-alert').hide()
      })
      params.dom.off("mouseenter").mouseenter(() => {
        $('#wah0713-alert >span').html(params.message)
        params.callBack && params.callBack()
        $('#wah0713-alert').show()
      })
    }
  }

  // 右侧自定义按钮模块
  $('body').append(`
        <div id="wah0713">
            <div class="gear" style="display: none;"><img src="https://s11.ax1x.com/2023/03/11/ppuTXKf.png">
                <div class="redDot"></div>
            </div>
        </div>
        `)
  $('#wah0713').off("mouseenter").mouseenter(() => {
    $('#wah0713 .gear').fadeOut("slow")
    myAlert({
      message: updateNotes,
      type: 'info',
      dom: $('#wah0713 >.tip'),
      callBack: () => {
        // 提示用户更新内容
        GM_setValue('version', version)
        $('#wah0713').removeClass('hasUpdate')
      }
    })
  }).off("mouseleave").mouseleave(() => {
    $('#wah0713 .gear').fadeIn("slow")
  })

  setTimeout(() => {
    $('#wah0713 .gear').fadeIn("slow")
  }, 3 * 1000);

  // 版本号和提示语
  $("#wah0713").append(`<p class='tip'>${version}版本(更新内容详情)</p>`)
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
    $(`#wah0713 .${localStorageName}`).off("click").click(() => {
      const value = !config[localStorageName]
      config[localStorageName] = value
      GM_setValue(localStorageName, value)
      btnInit()
      if (typeof (once[localStorageName]) !== 'undefined') {
        once[localStorageName] = true
      }
    })
  }

  // 用户默认配置
  const defaultConfig = {
    adjustClarity: {
      name: '默认最高画质',
      description: '开启当前房间最高画质，可能会闪一次屏__本功能由【noob-one】提出',
      value: false,
      firstDelayTime: 10 * 1000,
      action: (value) => {
        if (!value) return false

        if ($('.adjustClarity')[0].style.display !== 'none' && value) {
          let ul = $('.c5-6a3710[value="画质 "]~ul')
          let firstChild = $('.c5-6a3710[value="画质 "]~ul li:first-child')
          if (ul && !firstChild.hasClass('selected-3a8039')) {
            firstChild.click()
          }
          ul = null
          firstChild = null
        }

      }
    },
    isWebFullScreen: {
      name: '默认网页全屏',
      description: '进入页面时选择网页全屏__本功能由【shadow XX】提出',
      value: false,
      action: async (value) => {
        if (value) {
          // 双击事件
          $('._1GyzL9trVIbYlAVmuA9KJ1')[0].dispatchEvent(new CustomEvent('dblclick'))
        }
      }
    },
    danmuMove: {
      name: '弹幕悬停',
      description: '播放器内弹幕被选中时悬停__本功能由【noob-one】提出',
      value: false,
    },
    guessIsShow: {
      name: '竞猜显示',
      description: '竞猜是否显示__本功能由【noob-one】提出',
      value: false,
    },
    hidePk: {
      name: 'PK条显示',
      description: 'PK条是否显示__本功能由【backuponeday】提出',
      value: true,
      action: async (value) => {
        if (value) {
          $('html').removeClass('hidePk');
        } else {
          $('html').addClass('hidePk');
        }
      }
    },
    lotteryIsShow: {
      name: '抽奖显示',
      description: '抽奖是否显示__本功能由【lv88ff】提出',
      value: false,
    },
    isShowHighEnergyBarrageContainer: {
      name: '高能弹幕显示',
      description: '高能弹幕是否显示__本功能由【随机的名字】提出',
      value: false,
    },
    backgroundIsShow: {
      name: '背景显示',
      description: '背景是否显示__本功能由【dongliang zhang】提出',
      value: false,
    },
    playerBottomSimplification: {
      name: '礼物栏简化',
      description: '播放器下方礼物栏简化__本功能由【evenora】提出',
      value: true,
    },
    chatBoxCleaning: {
      name: '聊天框简化',
      description: '聊天框头部去除主播公告、贡献周榜、贵宾、粉丝团和主播通知__本功能由【dongliang zhang】提出',
      value: true,
    },
    forbiddenMessage: {
      name: '禁言消息显示',
      description: '聊天框内用户被禁言消息是否显示__本功能由【lv88ff】提出',
      value: false,
    },
    isShowNickName: {
      name: '用户铭牌显示',
      description: '聊天框用户铭牌是否显示__本功能由【W.ast】和【BerryBarry11】提出',
      value: false,
      action: async (value) => {
        const $barrageList = await walk(() => findDom('.Barrage-list'))
        if (!value) {
          $barrageList.addClass('trim')
        } else {
          $barrageList.removeClass('trim')
        }
      }
    },
    isShowRoomData: {
      name: '显示房间数据',
      description: '显示房间数据(时间范围今天00:00到今晚24:00),12分钟刷新数据一次__本功能由【BerryBarry11】提出',
      value: true,
      firstDelayTime: 10 * 1000,
      action: (value) => {
        clearInterval(showRoomDataInterval)
        if (value) {
          showRoomData()
          showRoomDataInterval = setInterval(showRoomData, 12 * 60 * 1000)
        } else {
          hideRoomData()
        }
      }
    },
    isblackMode: {
      name: '夜间模式',
      description: '夜间模式__本功能由【超新星燃烧小行星带】提出',
      value: false,
      action: (value) => {
        if (value) {
          $('html').addClass('black')
        } else {
          $('html').removeClass('black')
        }
      }
    },
  }

  const config = new Proxy({}, {
    set: function (target, propKey, value, receiver) {
      const {
        firstDelayTime,
        action
      } = defaultConfig[propKey]

      if (firstDelayTime && action) {
        // 首次延迟
        requestAnimationFrame(() => {
          $(`button.${propKey}`).attr("disabled", true)
          setTimeout(() => {
            action(value)
            defaultConfig[propKey].firstDelayTime = 0
            $(`button.${propKey}`).attr("disabled", false)
          }, firstDelayTime)
        })
      } else if (action) {
        action(value)
      }
      return Reflect.set(target, propKey, value, receiver);
    }
  })

  for (let key in defaultConfig) {
    const {
      name,
      description,
      value
    } = defaultConfig[key]
    config[key] = GM_getValue(key, value)
    // 按钮事件
    btnListFun(key, name, description)
  }

  // 左侧展开默认收起
  if ($(".Aside-main--shrink").width() > 100) {
    $(".Aside-toggle").click()
  }

  // 提示用户更新
  const [large1, medium1] = version.split('.').map(Number)
  const [large2, medium2] = GM_getValue('version', '0.0.0').split('.').map(Number)
  // todo
  if (GM_getValue('2.04', false) || medium1 === medium2 && large1 === large2) {
    $('#wah0713').removeClass('hasUpdate')
  } else {
    $('#wah0713').addClass('hasUpdate')
  }

  let body = $('body')[0]
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

  const observer = new MutationObserver(function () {

    // 获取初始竞猜高度
    if (once.InitiaGuessGameHeight && $('.Bottom-guessGame-placeholder').length) {
      InitiaGuessGameHeight = $('.Bottom-guessGame-placeholder').height()
      once.InitiaGuessGameHeight = false
    }

    // 自定义按钮显示条件
    if ($('.UnLogin').length) {
      $('.adjustClarity').hide()
      $('.danmuMove').hide()
    } else {
      $('.adjustClarity').show()
      $('.danmuMove').show()
    }

    // 抽奖显示
    if (config.lotteryIsShow) {
      // 抽奖中间部提示框
      $(".LotteryContainer").show()
      // 抽奖(播放器左下角)
      $(".UPlayerLotteryEnter").removeClass('is-hide')
      // 中奖播放器中显示
      $(".LotteryContainer-svgaWrap").show()
      // 粉丝福利社抽奖
      $('.LotteryDrawEnter').show()

    } else {
      // 抽奖中间部提示框
      $(".LotteryContainer").hide()
      // 抽奖(播放器左下角)
      $(".UPlayerLotteryEnter").addClass('is-hide')
      // 中奖播放器中显示
      $(".LotteryContainer-svgaWrap").hide()
      // 粉丝福利社抽奖
      $('.LotteryDrawEnter').hide()
    }

    // 屏蔽播放器内大多活动
    $('.player-dialog').children().each((index, dom) => {
      if (config.lotteryIsShow) {
        if (!$(dom).find('.LotteryContainer').length && !$(dom).has('.DoublePlayerList').length) {
          $(dom).hide()
        } else {
          $(dom).show()
        }
      } else if (!$(dom).has('.DoublePlayerList').length) {
        $(dom).hide()
      } else {
        $(dom).show()
      }
    })


    if (config.playerBottomSimplification) {
      $('.ActivityItem').removeClass('is-hide')
      if (!config.guessIsShow) {
        $('.ActiviesExpanel').addClass('is-hide')
      } else {
        $('.ActiviesExpanel').removeClass('is-hide')
        $('.ActiviesExpandPanel').css({
          width: 'auto',
          'margin-left': '0',
        })
      }
      $('.ActivityItem:not(.ActivityItem[data-flag="room_level"]):not(.ActivityItem[data-flag="anchor_quiz"])').addClass('is-hide')
      $('.PlayerToolbar-Task').addClass('is-hide')
      $('.RomanticAct').addClass('is-hide')
      $('.ActCenterPkEntry').addClass('is-hide')
      $('.PartyEntry').addClass('is-hide')
      $('.ToolbarActivityArea>div:last-child>div>div:not(.LotteryDrawEnter)').addClass('is-hide')
    } else {
      $('.ActivityItem').removeClass('is-hide')
      $('.ActiviesExpanel').removeClass('is-hide')
      $('.PlayerToolbar-Task').removeClass('is-hide')
      $('.RomanticAct').removeClass('is-hide')
      $('.ActCenterPkEntry').removeClass('is-hide')
      $('.PartyEntry').removeClass('is-hide')
      $('.ToolbarActivityArea>div:last-child>div>div:not(.LotteryDrawEnter)').removeClass('is-hide')
    }

    // 主播公告、贡献周榜、贵宾和粉丝团
    if (config.chatBoxCleaning) {
      $(".layout-Player-asideMainTop").addClass("hide")
    } else {
      $(".layout-Player-asideMainTop").removeClass("hide")
    }

    // 是否显示【高能弹幕】
    if (config.isShowHighEnergyBarrageContainer) {
      $(".HighEnergyBarrageContainer").removeClass("is-hide")
    } else {
      $(".HighEnergyBarrageContainer").addClass("is-hide")
    }

    // 弹幕悬停关闭
    if ($('.danmuMove')[0].style.display !== 'none' && config.danmuMove) {
      $('.room-Player-Box').removeClass('mark')
    } else {
      $('.room-Player-Box').addClass('mark')
    }

    // 竞猜显示
    if (config.guessIsShow) {
      // 聊天框用户竞猜获奖
      $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').show()
      $('.ActivityItem[data-flag="anchor_quiz"]').show()
      $('.GuessGameMiniPanelB-wrapper').show()
      $('.guessGameContainer').show()
      $('.Bottom-guessGame-placeholder').height(InitiaGuessGameHeight)
    } else {
      // 聊天框用户竞猜获奖
      $('.Barrage-list .Barrage-guess').parent('.Barrage-listItem').hide()
      $('.ActivityItem[data-flag="anchor_quiz"]').hide()
      $('.GuessGameMiniPanelB-wrapper').hide()
      $('.guessGameContainer').hide()
      $('.Bottom-guessGame-placeholder').height(0)
    }

    // 背景图
    let $layoutMain = $('.layout-Main')
    if (config.backgroundIsShow && !$('.is-fullScreenPage').length) {
      if (once.backgroundIsShow) {
        $('html').removeClass('no-background')
        // 恢复除播放器以外的多余bc-wrapper元素
        $('.bc-wrapper').show()

        $('.wm-general').show().removeClass('top100')

        $('.wm-general-bgblur').removeClass('background-image-hide')

        $layoutMain[0].style = ""
        setTimeout(() => {
          window.scrollTo(0, $('.layout-Player').offset().top - 100)
        }, 200)
        once.backgroundIsShow = false
      }
    } else if (!$('.is-fullScreenPage').length) {
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
          $(dom).addClass('top100')
        } else {
          $(dom).hide()
        }
      })
      $('.wm-general-bgblur').addClass('background-image-hide')

      $('.bc-wrapper').not($('.bc-wrapper')[sign]).hide()
    }

    // 输入框上方送礼3000毫米淡出
    $('#js-player-barrage .BarrageBanner').children().delay(1000 * 3).fadeOut('slow')

    // 聊天框用户点赞 (parents多个s)
    $('.Barrage-list .roomDianzanIcon').parents('.Barrage-listItem').hide()

    // 聊天框用户相关消息广播
    // 系统提示(例如禁言)Barrage-notice--red
    $('.Barrage-list .Barrage-icon--sys').each((idx, dom) => {
      let domParent = $(dom).parent('.Barrage-listItem')
      if (config.forbiddenMessage) {
        if (domParent.find('.Barrage-text').text().indexOf("禁言") === -1) {
          domParent.hide()
        } else {
          domParent.show()
        }
      } else {
        domParent.hide()
      }
      domParent = null
    })

  })
  const observerConfig = {
    subtree: true,
    childList: true,
  }
  observer.observe(body, observerConfig)
  body = null

  // 获取房间数据
  function getRoomData(rid) {
    return new Promise(resolve => {
      //  rid 房间号
      //  dt 统计周期 0(今天) 1(昨天) 7(7天内 ) 30(30天)thismonth(本月)
      GM_xmlhttpRequest({
        method: "POST",
        url: `https://www.doseeing.com/xeee/room/aggr`,
        data: `{"m":"${window.btoa(`rid=${rid}&dt=0`).split("").reverse().join("")}"}`,
        responseType: "json",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Origin": "https://www.doseeing.com",
          "Referer": "https://www.doseeing.com/room/" + rid,
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        },
        onload: function (res) {
          resolve(res.response.data);
        }
      })
    })
  }
  // 显示房间数据
  async function showRoomData() {
    const data = await getRoomData(rid)
    if (!data) return false
    const {
      // 总礼物价值
      "gift.all.price": giftAllPrice,
      // 总礼物送礼人数
      "gift.all.uv": giftAllUv,
      // 总付费礼物
      "gift.paid.price": giftPaidPrice,
      // 总付费送礼人数
      "gift.paid.uv": giftPaidUv,
      // 总弹幕数
      "chat.pv": chatPv,
      // 总发弹幕人数
      "chat.uv": chatUv,
      // 直播时间(分)
      "online.minutes": onlineMinutes,
      // 活跃人数
      "active.uv": activeUv,
    } = data
    const firstRow = `💬弹幕数:${formatData(chatPv)} 👨‍👩‍👧‍👦发弹幕人数:${formatData(chatUv)} ⏱️直播时间:${formatData(onlineMinutes)}分 🔥活跃人数:${formatData(activeUv)}`
    const secondRow = `🎁礼物价值:${(formatPrice(giftAllPrice))}元 🎅🏻礼物送礼人数:${formatData(giftAllUv)} 💸付费礼物:${formatPrice(giftPaidPrice)}元 🤴🏻付费送礼人数:${formatData(giftPaidUv)}`
    if (!$('.PlayerToolbar-Wealth .first').length) {
      $('.PlayerToolbar-Wealth').prepend('<div class="first"></div>')
    }
    $('.PlayerToolbar-Wealth .first').html(`${firstRow}
${secondRow}`)

    myAlert({
      message: `房间数据<br/>
${firstRow}<br/>
${secondRow}<br/>
  `,
      type: 'info',
      dom: $('.PlayerToolbar-Wealth .first')
    })
  }

  // 隐藏显示房间数据
  function hideRoomData() {
    $('.PlayerToolbar-Wealth .first').html('')
  }
  // 数据格式化
  function formatData(num) {
    return String(num).replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }
  // 金钱格式化
  function formatPrice(num) {
    const str = String(num)
    const integer = formatData(str / 100 | 0)
    const decimal = String(str % 100).padStart(2, '0')
    return `${integer}.${decimal}`
  }

  // 寻找DOM
  function findDom(selectorStr) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const $Dom = $(selectorStr)
        if ($Dom.length === 0) {
          resolve(false)
        } else {
          resolve($Dom)
        }
      }, 200)
    })
  }

  // 轮询
  async function walk(callBack) {
    const res = await callBack()
    if (!res) {
      return await walk(callBack)
    } else {
      return res
    }
  }

  GM_addStyle(`
css
`)
  // // debugJS
  // unsafeWindow.$ = $
})()