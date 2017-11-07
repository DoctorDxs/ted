// pages/index/details/helpDetail.js
var app = getApp()
// 防连续点击
var clickTag = 0
Page({

  data: {
    // 文字折叠
    "textFold": true,
    // 筹款动态/资金公示
    thisInfo: {
      num: 0,
      relay: 0
    },
    page: 1,
    project: '',
    helpData: [],
    nomore: false,
    tclass: '',
    collectionStatus: []
  },


  /* 生命周期函数--监听页面加载*/
  // 连接参数传递
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('user_wxa');
    if (options.project) {
      var project = true
    }
    app.globalData.id = options.id
    this.setData({
      userInfo: userInfo,
      id: options.id,
      project: project,
      config: app.globalData.configs,
      checks: options.checks
    })
    // 此页面主要数据
    this.helpDetail()
    // 筹款动态
    this.conllectionStatu();
    // 帮助列表
    this.helpList();
    // 收藏信息
    this.myCollection()
  },
  onShow: function () {
    app.configs(function (res) {
      app.globalData.configs = res;
    })
  },
  // 此页面主要数据
  helpDetail: function () {
    var that = this;
    var thisUrl = 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + that.data.id + '&related=user_wxa';
    //请求当前连接的数据详情
    wx.request({
      url: thisUrl,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var thisInfo = res.data.data[0]
        thisInfo.progress = (thisInfo.money / thisInfo.price * 100).toFixed(2);
        thisInfo.file = JSON.parse(thisInfo.file);
        thisInfo.price = thisInfo.price.toFixed(2)
        thisInfo.money = thisInfo.money.toFixed(2)
        var check_time = thisInfo.check_time;
        var check_time = new Date(check_time)
        //  现在时间
        var nowTime = new Date();
        // 时间差
        var t = nowTime - check_time;
        var tday = Math.ceil(t / 1000 / 60);
        thisInfo.tday = tday
        if (tday > 0) {
          if (tday < 60) {
            thisInfo.tday = tday;
            thisInfo.tclass = 1
          } else {
            tday = Math.ceil(tday / 60);
            if (tday < 24) {
              thisInfo.tday = tday;
              thisInfo.tclass = 2;
            } else {
              tday = Math.ceil(tday / 24);
              if (tday < 30) {
                thisInfo.tday = tday;
                thisInfo.tclass = 3;
              } else {
                tday = Math.ceil(tday / 30);
                if (tday < 12) {
                  thisInfo.tday = tday;
                  thisInfo.tclass = 4;
                } else {
                  tday = Math.ceil(tday / 12);
                  thisInfo.tday = tday;
                  thisInfo.tclass = 5;
                }
              }
            }
          }
        } else {
          thisInfo.tday = 1
          thisInfo.tclass = 1
        }
        // 动态设置当前页面标题
        wx.setNavigationBarTitle({
          title: thisInfo.title
        });
        that.setData({
          thisInfo: thisInfo
        })
        wx.stopPullDownRefresh()

      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '请求失败',
          showCancel: false
        })
      }
    })
  },

  // 筹款动态  数据
  conllectionStatu: function () {
    var that = this;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/dynamic?where=collect_id=' + that.data.id + '&related=comment.user_wxa,user_wxa',
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var collectionStatus = res.data.data;
        var nowDate = new Date()
        for (let j = 0; j < collectionStatus.length; j++) {
          // 图片
          if (collectionStatus[j].file.length > 0) {
            collectionStatus[j].file = JSON.parse(collectionStatus[j].file);
          } else {
            collectionStatus[j].file = []
          }
          // 时间差
          var starTime = new Date(collectionStatus[j].created_at);
          var tTime = Math.ceil((nowDate - starTime) / 1000 / 60);
          if (tTime > 0) {
            if (tTime < 60) {
              collectionStatus[j].tDate = tTime + '分钟前';
            } else {
              tTime = Math.ceil(tTime / 60);
              if (tTime < 24) {
                collectionStatus[j].tDate = tTime + '小时前';
              } else {
                tTime = Math.ceil(tTime / 24);
                collectionStatus[j].tDate = tTime + '天前'
              }
            }
          } else {
            collectionStatus[j].tDate = 1 + '分钟前'
          }
        };
        that.setData({
          collectionStatus: collectionStatus
        })
      },
    })
  },

  // 帮助列表  数据
  helpList: function () {
    var that = this;
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/donation?where=${encodeURIComponent("collect_id=" + that.data.id + " and pay_status=1")}&related=comment.user_wxa,user_wxa&limit=20&offset=${(that.data.page - 1) * 20}`,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var helpData = res.data.data;
        if (helpData.length == 0) {
          that.setData({
            nomore: true
          })
        }
        var nowDate = new Date()
        for (let o = 0; o < helpData.length; o++) {
          helpData[o].price = helpData[o].price.toFixed(2)
          var starTime = new Date(helpData[o].created_at);
          var tTime = Math.ceil((nowDate - starTime) / 1000 / 60);
          if (tTime > 0) {
            if (tTime < 60) {
              helpData[o].tDate = tTime + '分钟前';
            } else {
              tTime = Math.ceil(tTime / 60);
              if (tTime < 24) {
                helpData[o].tDate = tTime + '小时前';
              } else {
                tTime = Math.ceil(tTime / 24);
                helpData[o].tDate = tTime + '天前';
              }
            }
          } else {
            helpData[o].tDate = 1 + '分钟前';
          }
        };
        var helpData = that.data.helpData.concat(helpData);
        that.setData({
          helpData: helpData
        });
      }
    })
  },
  // 收藏信息数据
  myCollection: function () {
    var that = this;
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/concern?where=${encodeURIComponent("user_id=" + that.data.userInfo.user_id + " and collect_id=" + that.data.id)}`,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var thisCollection = res.data.data;
        if (thisCollection.length == 0) {
          that.setData({
            status: 0,
            thisCollection: null
          })
        } else if (thisCollection[0].status == 0) {
          that.setData({
            status: 0,
            thisCollection: thisCollection[0].id
          })
        } else if (thisCollection[0].status == 1) {
          that.setData({
            status: 1,
            thisCollection: thisCollection[0].id
          })
        }
      }
    })
  },

  // 跳转至资金流向说明
  illustration: function () {
    var that = this;
    wx.navigateTo({
      url: 'illustration/illustration?id=' + that.data.thisInfo.id,
    })
  },
  // 点击阅读全文
  expandText: function () {
    this.setData({
      "textFold": false
    })
  },
  // 筹款动态消息回复
  reply: function (e) {
    var dynamic = e.currentTarget.dataset.dynamic;
    var that = this
    wx.redirectTo({
      url: 'reply/reply?type=2' + '&id=' + that.data.id + '&to_uid=' + that.data.thisInfo.user_wxa.user_id + '&to_wxa_id=' + that.data.thisInfo.user_wxa.id + '&dynamic=' + dynamic,
    })
  },
  // 捐款列表消息回复
  helpReply: function (e) {
    var donation = e.currentTarget.dataset.donation;
    var that = this
    wx.redirectTo({
      url: 'reply/reply?type=1' + '&id=' + that.data.id + '&to_uid=' + that.data.thisInfo.user_wxa.user_id + '&to_wxa_id=' + that.data.thisInfo.user_wxa.id + '&donation=' + donation,
    })
  },

  // 跳转至首页
  tabHome: function () {
    wx.switchTab({
      url: '../index',
    })
  },

  // 点击收藏/取消收藏
  attention: function () {
    if (clickTag == 0) {
      if (this.data.status == 1) {
        this.cancleConllection();
      } else {
        this.addCollection();
      }
      clickTag = 1;
    } else {
      wx.showModal({
        title: '提示',
        content: '操作过于频繁，请稍后操作！',
        showCancel: false
      })
    }
  },
  // 添加收藏
  addCollection: function () {
    var that = this;
    if (this.data.thisCollection == null) {
      var data = {
        user_id: that.data.userInfo.user_id,
        collect_id: that.data.id,
        wxa_id: that.data.userInfo.wxa_id,
        custom_id: that.data.userInfo.custom_id,
        status: 1
      }
    } else {
      var data = {
        id: that.data.thisCollection,
        user_id: that.data.userInfo.user_id,
        collect_id: that.data.id,
        wxa_id: that.data.userInfo.wxa_id,
        custom_id: that.data.userInfo.custom_id,
        status: 1
      }
    }
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/concern?where=${encodeURIComponent("user_id=" + that.data.userInfo.user_id + " and collect_id=" + that.data.id)}`,
      method: 'post',
      data: data,
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + that.data.id + '&increment=num+',
          method: "get",
          data: {},
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            wx.showToast({
              title: '已关注',
            })
            that.data.thisInfo.num = that.data.thisInfo.num + 1;
            that.setData({
              thisInfo: that.data.thisInfo,
              status: 1
            })
            clickTag = 0
          }
        })
      }
    })
  },
  // 取消收藏
  cancleConllection: function () {
    var that = this;
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/concern?where=${encodeURIComponent("user_id=" + that.data.userInfo.user_id + " and collect_id=" + that.data.id)}`,
      method: 'post',
      data: {
        id: that.data.thisCollection,
        user_id: that.data.userInfo.user_id,
        collect_id: that.data.id,
        wxa_id: that.data.userInfo.wxa_id,
        custom_id: that.data.userInfo.custom_id,
        status: 0
      },
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + that.data.id + '&decrement=num+',
          method: "get",
          data: {},
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            wx.showToast({
              title: '已取消',
            })

            that.data.thisInfo.num = that.data.thisInfo.num - 1;
            that.setData({
              thisInfo: that.data.thisInfo,
              status: 0
            })
            clickTag = 0
          }
        })
      }
    })
  },
  // 点击帮助
  helpHim: function () {
    if ((this.data.thisInfo.checks == 1) && (this.data.thisInfo.status == 1)) {
      var that = this
      wx.redirectTo({
        url: 'helpHim/helpHim?id=' + that.data.thisInfo.id,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '未经过审核、审核未通过或已结束项目不能进行筹款！',
        showCancel: false
      })
    }
  },
  // 点击图片放大
  bigImg: function (e) {
    var index = e.currentTarget.dataset.imgindex;
    var urls = this.data.thisInfo.file;
    wx.previewImage({
      current: urls[index],
      urls: urls,
    })
  },
  // 点击放大图片
  bigImga: function (e) {
    var index = e.currentTarget.dataset.imgindexa,
      id = e.currentTarget.dataset.statusid;
    var files = this.data.collectionStatus;
    for (let i = 0; i < files.length; i++) {
      if (files[i].id == id) {
        var urls = files[i].file
      }
    }
    wx.previewImage({
      current: urls[index],
      urls: urls,
    })
  },
  // 上啦加载
  onReachBottom: function () {
    var page = this.data.page + 1
    this.setData({
      page: page
    })
    this.helpList()
  },

  /* 用户点击右上角分享   */
  onShareAppMessage: function () {
    var that = this
    return {
      title: this.data.thisInfo.title,
      path: '/pages/index/details/helpDetail?id=' + this.data.id,
      success: function (res) {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + that.data.id + '&increment=relay+',
          method: "get",
          data: {},
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            that.data.thisInfo.relay = that.data.thisInfo.relay + 1;
            that.setData({
              thisInfo: that.data.thisInfo
            })
          }
        })
      },
    }
  },
  onPullDownRefresh: function (e) {
    this.setData({
      helpData: [],
      page: 1
    })
    app.configs(function (res) {
      app.globalData.configs = res;
    })
    this.helpDetail();
    this.conllectionStatu();
    // 帮助列表
    this.helpList();
    // 收藏信息
    this.myCollection()
  },
})