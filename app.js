App({
  onLaunch: function () {
    // 调用微信登录
    if (wx.getStorageSync('user_wxa')){
      return false;
    }else {
      this.wx_login();
    }
  },
  // 微信登录
  wx_login:function(){
    var that = this;
    wx.login({
      success: function (res1) {
        var code = res1.code;
        wx.getUserInfo({
          success: function (res2) {
            wx.request({
              url: "https://api.qingful.com/api/public/wxa_login",
              method: "POST",
              header: {},
              data: {
                code: code,
                encryptedData: res2.encryptedData,
                iv: res2.iv
              },
              success: function (res3) {
                wx.setStorageSync("Authorization", res3.data.data.token);
                wx.setStorageSync('user_wxa', res3.data.data.user.user_wxa);   
                if(!wx.getStorageSync('firstLogin')){
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              },
              fail: function (err3) {
                console.log(err3)
              }
            })
          },
          fail: function (err2) {
            console.log(err2)
          }
        })
      },
      fail: function (err1) {
        console.log(err1)
      }
    })
  },
  //请求平台基本数据
  configs: function (callBack) {
    var that = this;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/config',
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        callBack(res.data.data[0])
        // that.globalData.configs = res.data.data[0]
      }
    })
  }, 
  globalData:{
    configs:null,
    firstOnshow: true,
    id:null
  }
})


