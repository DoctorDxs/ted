// pages/index/details/helpHim/helpHim.js
var app = getApp()
var clickTag = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    anonymous: false,
    totaltMoney: 0
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this;
    var userInfo = wx.getStorageSync('user_wxa')
    this.setData({
      userInfo: userInfo,
      id: options.id
    })
  },
  anonymousChecked: function () {
    var anonymous = !this.data.anonymous;
    this.setData({
      anonymous: anonymous
    })
  },
  // input框内值同步到view
  supportMoney: function (e) {
    var totaltMoney = e.detail.value;
    var totaltMoneyStr = totaltMoney.toString()
    if (totaltMoneyStr.split('.').length == 2) {
      if (totaltMoneyStr.split('.')[1].length > 2) {
        return Math.floor(totaltMoney * 100) / 100
      }
    }
    this.setData({
      totaltMoney: totaltMoney
    })
  },
  onShow:function(){
    clickTag=0
  },
  // 保留两位小数
  watchNum: function (e) {
    var num = e.detail.value;
    var numStr = num.toString()
    if (numStr.split('.').length == 2) {
      if (numStr.split('.')[1].length > 2) {
        return Math.floor(num * 100) / 100
      }
    }
  },
  // 提交表单
  mySupport: function (e) {
    var that = this;
    var price = e.detail.value.price;
    var sub = e.detail.value.sub;
    if (this.data.anonymous) {
      var status = 0
    } else {
      var status = 1
    }
    if (price > 0) {
      var timeNow = Date.now().toString();
      var rand = "";
      for (var i = 0; i < 3; i++) {
        var r = Math.floor(Math.random() * 10);
        rand += r;
      }
      var orderid = rand + timeNow;
      var data = {
        price: price,
        sub: sub,
        status: status,
        collect_id: that.data.id,
        user_id: that.data.userInfo.user_id,
        wxa_id: that.data.userInfo.wxa_id,
        custom_id: that.data.userInfo.custom_id,
        user_wxa_id: that.data.userInfo.id,
        orderid: orderid,
      }
      that.setData({
        data: data
      })
      if(clickTag==0){
        that.payStep1();
        clickTag = 1;
      }else{
        wx.showModal({
          title: '提示',
          content: '操作过于频繁，请稍后操作！',
          showCancel: false,

        })
        clickTag = 0;
        wx.hideLoading()
      }     
    } else{
      wx.showModal({
        title: '提示',
        content: '请输入金额',
        showCancel: false
      })
    }
  },
  //上传数据
  payStep1: function () {
    wx.showLoading();
    var that = this;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/donation',
      method: "post",
      data: that.data.data,
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        that.payStep2()
      },
      fail: function () {
        clickTag = 0
      }
    })
  },
  // 获取 id
  payStep2: function () {
    var that = this;
    wx.request({
      url: 'https://api.qingful.com/api/base/wxpay_add',
      method: 'post',
      data: {
        ump_id: 30,
        tradeid: that.data.data.orderid,
        money: that.data.data.price,
        notify_url: 'https://baas.qingful.com/1.0/class/pay/function/payCollectDonation?x-qingful-appid=498129089531&x-qingful-appkey=wfaQOkLl5no30gcL2Onevdr0'
      },
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var id = res.data.data.id;
        that.payStep3(id)
      },
      fail:function(){
        clickTag = 0
      }
    })
  },
  // 获取 调用支付接口的 数据 
  payStep3: function (id) {
    var that = this
    wx.request({
      url: 'https://api.qingful.com/pay/wxpay/index?id=' + id,
      method: 'get',
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        wx.hideLoading()
        var paymentData = res.data.data;
        wx.requestPayment({
            'timeStamp': paymentData.timeStamp,
            'nonceStr': paymentData.nonceStr,
            'package': paymentData.package,
            'signType': paymentData.signType,
            'paySign': paymentData.paySign,
            'success': function (res) {
              wx.redirectTo({
                url: '../helpDetail?id=' + that.data.id,
              })
              clickTag = 0              
            },
            fail:function(){
              clickTag = 0
            }
        })
      },
      fail:function(){      
          clickTag = 0
      }
    })
  },
})