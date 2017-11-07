// pages/myInfo/myWallet/getMoney/getMoney.js
var is_click= true;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('user_wxa')
    this.setData({
      maxMoney: options.maxMoney,
      userInfo: userInfo,
      id: options.id
    })
  },
  getMoney: function (e) {
    if (is_click) {
      is_click = false;
      var that = this;
      var name = e.detail.value.name;
      var phone = e.detail.value.phone;
      var wxhao = e.detail.value.wxhao;
      var money = e.detail.value.money;
      var data = {
        user_id: this.data.userInfo.user_id,
        name: name,
        phone: phone,
        wxhao: wxhao,
        money: money,
        wxa_id: this.data.userInfo.wxa_id,
        user_wxa_id: this.data.userInfo.id,
      }
      if (name.length == 0 || phone.length == 0 || wxhao.length == 0) {
        wx.showModal({
          title: '提示',
          content: '请输入完整',
        })
        is_click = true;        
      } else if (!/^[1][3,4,5,7,8][0-9]{9}$/.test(phone)) {
        wx.showModal({
          title: '提示',
          content: '手机号填写有误',
        })
        is_click = true;
      } else {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/user_txlog',
          method: 'post',
          data: data,
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            is_click = true;
            wx.request({
              url: 'https://baas.qingful.com/1.0/class/api/table/user_pay',
              method: 'POST',
              data: {
                user_id: that.data.userInfo.user_id,
                price: 0,
                id: that.data.id,
                user_wxa_id: that.data.userInfo.id,
                wxa_id: that.data.userInfo.wxa_id,
                custom_id: that.data.userInfo.custom_id
              },
              header: {
                'content-type': 'application/json',
                "x-qingful-appid": '498129089531',
                "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
                "Authorization": wx.getStorageSync('Authorization')
              },
              success: function (res) {
                wx.showModal({
                  title: '提示',
                  content: '申请已成功提交，后台审核完成后钱将转到您的账户！如有疑问请联系客服！',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.switchTab({
                        url: '/pages/myInfo/myInfo',
                      })
                    }
                  }
                })
                is_click = true;
              },
              fail: function () {
                wx.showModal({
                  title: '提示',
                  content: '体现申请失败',
                })
                is_click = true;
              }
            })
          },
          fail: function () {
            wx.showModal({
              title: '提示',
              content: '体现申请失败',
              showCancel: false
            })
            is_click = true;
          }
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '操作频繁请稍候再试',
        showCancel: false
      })
      is_click = true;
    }
  }
})