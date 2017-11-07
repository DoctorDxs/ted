
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nomore: false,
    myAttention: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestData()
  },
  addTitle: function (requireData, collect_id, i) {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + collect_id + '&related=user_wxa',
        method: "get",
        data: {},
        header: {
          'content-type': 'application/json',
          "x-qingful-appid": '498129089531',
          "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
          "Authorization": wx.getStorageSync('Authorization')
        },
        success: function (res) {
          // 时间
          var nowTime = new Date()
          var titleData = res.data.data[0] || {};
          var title = titleData.title;
          var avatarUrl = titleData.user_wxa.avatarUrl || '';
          requireData[i].title = title;
          requireData[i].checks = titleData.checks;
          requireData[i].avatarUrl = avatarUrl;
          requireData[i].status = titleData.status;
          var startTime = new Date(titleData.created_at)
          var tTime = Math.ceil((nowTime - startTime) / 1000 / 60);
          if (tTime > 0) {
            if (tTime < 60) {
              requireData[i].tDate = tTime + '分钟前';
            } else {
              tTime = Math.ceil(tTime / 60);
              if (tTime < 24) {
                requireData[i].tDate = tTime + '小时前';
              } else {
                tTime = Math.ceil(tTime / 24);
                if (tTime < 30) {
                  requireData[i].tDate = tTime + '天前'
                } else {
                  tTime = Math.ceil(tTime / 30);
                  if (tTime < 12) {
                    requireData[i].tDate = tTime + '月前'
                  } else {
                    tTime = Math.ceil(tTime / 12);
                    requireData[i].tDate = tTime + '年前'
                  }
                }
              }
            }
          } else {
            requireData[i].tDate = 1 + '分钟前';
          }
          resolve(requireData)
        }
      })
    })
  },
  requestData: function () {
    var that = this
    var user_id = wx.getStorageSync('user_wxa').user_id
    // 我的关注
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/concern?where=${encodeURIComponent("user_id=" + user_id + ' and status=1')}`,
      method: 'get',
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var myAttention = res.data.data;
        if (myAttention.length == 0) {
          that.setData({
            nomore: true
          })
        }
        var hash = {};
        myAttention = myAttention.reduce(function (item, next) {
          hash[next.collect_id] ? '' : hash[next.collect_id] = true && item.push(next);
          return item
        }, [])
        for (let i = 0; i < myAttention.length; i++) {
          var collect_id = myAttention[i].collect_id;
          that.addTitle(myAttention, collect_id, i).then((requireData) => {
            that.setData({
              myAttention: requireData
            })
          })
        }
        wx.stopPullDownRefresh()
      }
    })
  },
  lookDetial: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/index/details/helpDetail?id=' + id
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