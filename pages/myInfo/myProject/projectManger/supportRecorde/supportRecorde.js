// pages/myInfo/myProject/projectManger/supportRecorde/supportRecorde.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    helpData: [],
    nomore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    var that = this;
    var url = 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + options.id + '&related=user_wxa';
    wx.request({
      url: url,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        that.setData({
          thisInfo: res.data.data[0]
        })
      }
    })
    this.helpList()
  },
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
                helpData[o].tDate = tTime + '天前'
              }
            }
          } else {
            helpData[o].tDate = 1 + '分钟前';
          }
        };
        var helpData = that.data.helpData.concat(helpData)
        that.setData({
          helpData: helpData
        })
      }
    })
  },
  helpReply: function (e) {
    var donation = e.currentTarget.dataset.donation;
    var that = this
    wx.reLaunch({
      url: '/pages/index/details/reply/reply?type=1' + '&id=' + that.data.id + '&to_uid=' + that.data.thisInfo.user_wxa.user_id + '&to_wxa_id=' + that.data.thisInfo.user_wxa.id + '&donation=' + donation,
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
})