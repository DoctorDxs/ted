
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    myHelp: [],
    nomore: false,
    myHeleDataSy: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('user_wxa')
    this.setData({
      userInfo: userInfo
    })
    this.requestData()
  },
  lookDetial: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/index/details/helpDetail?id=' + id
    })
  },
  // 加载数据
  requestData: function () {
    var that = this
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/donation?where=${encodeURIComponent("user_id=" + that.data.userInfo.user_id + " and pay_status=1")}&limit=20&offset=${(that.data.page - 1) * 20}`,
      method: 'get',
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var helpList = res.data.data;
        if (helpList.length != 0) {

          var hash = {};
          helpList = helpList.reduce(function (item, next) {
            hash[next.collect_id] ? '' : hash[next.collect_id] = true && item.push(next);
            return item
          }, [])
          helpList = that.data.myHeleDataSy.concat(helpList)
          that.setData({
            page: that.data.page + 1,
            myHeleDataSy: helpList
          })
          that.requestData()
        } else {
          that.addTitle(that.data.myHeleDataSy)
            .then((myHelp) => {
              that.setData({
                myHelp: myHelp,
                page: 1,
                myHeleDataSy: []
              })
            })
        };

        wx.stopPullDownRefresh()
      }
    })
  },
  addTitle: function (helpList) {
    var that = this;
    let o = 0;
    return new Promise(function (resolve, reject) {
      for (let i = 0; i < helpList.length; i++) {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + helpList[i].collect_id + '&related=user_wxa',
          method: "get",
          data: {},
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            var nowTime = new Date();
            var titleData = res.data.data[0];
            var title = titleData.title;
            helpList[i].title = title;
            helpList[i].status = titleData.status;
            helpList[i].checks = titleData.checks;
            helpList[i].user_wxa = titleData.user_wxa;
            var startTime = new Date(titleData.created_at)
            var tTime = Math.ceil((nowTime - startTime) / 1000 / 60);
            if (tTime > 0) {
              if (tTime < 60) {
                helpList[i].tDate = tTime + '分钟前';
              } else {
                tTime = Math.ceil(tTime / 60);
                if (tTime < 24) {
                  helpList[i].tDate = tTime + '小时前';
                } else {
                  tTime = Math.ceil(tTime / 24);
                  if (tTime < 30) {
                    helpList[i].tDate = tTime + '天前'
                  } else {
                    tTime = Math.ceil(tTime / 30);
                    if (tTime < 12) {
                      helpList[i].tDate = tTime + '月前'
                    } else {
                      tTime = Math.ceil(tTime / 12);
                      helpList[i].tDate = tTime + '年前'
                    }
                  }
                }
              }
            } else {
              helpList[i].tDate = 1 + '分钟前';
            }
            o++;
            if (o == helpList.length) {
              resolve(helpList)
            }
          }
        })
      }
    })
  },
  // 刷新
  onPullDownRefresh: function () {
    this.requestData()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})