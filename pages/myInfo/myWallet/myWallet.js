// pages/myInfo/myWallet/myWallet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('user_wxa');
    this.setData({
      userInfo: userInfo
    })
    this.showMoney()
  },
  showMoney: function () {
      var that = this;
      var user_id = this.data.userInfo.user_id;
      wx.request({
        url: 'https://baas.qingful.com/1.0/class/api/table/user_pay?where=user_id=' + user_id + '&related=user_wxa',
        method: 'get',
        data: {},
        header: {
          'content-type': 'application/json',
          "x-qingful-appid": '498129089531',
          "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
          "Authorization": wx.getStorageSync('Authorization')
        },
        success: function (res) {
          that.setData({
            money: res.data.data[0].price||0,
            id: res.data.data[0].id
          })
          wx.stopPullDownRefresh()
        }
      })

    
  },
  getMoney: function (e) {
    var that = this
    wx.navigateTo({
      url: 'getMoney/getMoney?maxMoney=' + that.data.money + '&id=' + that.data.id,
    })
  },
  onPullDownRefresh: function () {
    this.showMoney()
  }
})