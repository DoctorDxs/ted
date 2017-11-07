// pages/index/details/reply/reply.js
var is_click = true;
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
    var replyType = options.type;
    this.setData({
      userInfo: wx.getStorageSync('user_wxa'),
      id: options.id,
      replyType: replyType,
      userInfo: wx.getStorageSync('user_wxa'),
      to_uid: options.to_uid,
      to_wxa_id: options.to_wxa_id,
      donation: options.donation,
      dynamic: options.dynamic
    })
  },
  subContent: function (e) {
    if (is_click) {
      is_click = false;
      var that = this;
      var content = e.detail.value.sub;
      if (content.length > 0) {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/comment',
          method: "post",
          data: {
            user_id: that.data.userInfo.user_id,
            user_wxa_id: that.data.userInfo.id,
            to_uid: that.data.to_uid,
            to_wxa_id: that.data.to_wxa_id,
            donation_id: that.data.donation,
            dynamic_id: that.data.dynamic,
            wxa_id: that.data.userInfo.wxa_id,
            custom_id: that.data.userInfo.custom_id,
            'type': that.data.replyType,
            content: content,
          },
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            is_click = true
            wx.redirectTo({
              url: '../helpDetail?id=' + that.data.id,
            })
          },
          fail:function(){
            is_click = true;
            wx.showModal({
              title: '提示',
              content: '评论失败，请重新提交！',
              showCancel:false
            })
          },
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '评论内容不能为空',
          showCancel: false
        })
        is_click = true
      }
    }else{
      is_click = true;
      wx.showModal({
        title: '提示',
        content: '提交中，请稍候再试！',
        showCancel: false
      })
    }
  }
})