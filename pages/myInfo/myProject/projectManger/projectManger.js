// pages/myInfo/myProject/projectManger/projectManger.js
var app = getApp()
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
    this.setData({
      projectid:options.projectid,
      userInfo:wx.getStorageSync('user_wxa'),
      price: options.price,
      status: options.status,
      project: options.project,
      checks: options.checks,
      is_check: options.is_check
    })
  },
 // 支持记录
  supportRecorde: function (e) {
    var that = this;
    wx.navigateTo({
      url: "/pages/myInfo/myProject/projectManger/supportRecorde/supportRecorde?id=" + that.data.projectid
    })
  },
  // 编辑项目
  projectEdit: function (e) { 
    if(this.data.status==2){
      wx.showModal({
        title: '提示',
        content: '已结束项目不能再次编辑！',
        showCancel:false
      })
    } else if (this.data.checks == -1) {
      wx.showModal({
        title: '提示',
        content: '审核未通过项目不能再次编辑！',
        showCancel: false
      })
    }else{
      var that = this;
      wx.switchTab({
        url: "/pages/needHelp/fillInfo/fillInfo"
      })
    }  
  },

  // 状态更新
  updataStatus_click:function(e){
    if (this.data.status == 2) {
      wx.showModal({
        title: '提示',
        content: '已结束项目不能更新状态！',
        showCancel: false
      })
    } else if (this.data.checks == 0){
      wx.showModal({
        title: '提示',
        content: '审核中的项目不能更新状态！',
        showCancel: false
      })
    } else if (this.data.checks == -1){
      wx.showModal({
        title: '提示',
        content: '审核未通过项目不能更新状态！',
        showCancel: false
      })
    } else if (this.data.checks == 1 && this.data.type != 0 ){
      var that =this;
      wx.navigateTo({
        url: 'updataStatus/updataStatus?collect_id=' + that.data.projectid,
      })
    }
  },
  // 提前结束
  stopProject:function(){
    var that = this;
    if(this.data.status==2){
      wx.showModal({
        title: '提示',
        content: '项目已结束',
        showCancel:false
      })
    } else if (this.data.checks == -1){
      wx.showModal({
        title: '提示',
        content: '审核未通过项目已是结束状态！',
        showCancel: false
      })
    } else if (this.data.checks == 0) {
      wx.showModal({
        title: '提示',
        content: '审核中的项目不能提前结束！',
        showCancel: false
      })
    }else{
      if (this.data.checks == 1){
        var data = {
          id: that.data.projectid,
          status: 2,
        }
      }else {
        var data = {
          id: that.data.projectid,
          status: 2,
          checks:-1
        }
      }
      wx.showModal({
        title: '提示',
        content: '是否确定提前结束项目',
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: 'https://baas.qingful.com/1.0/class/api/table/collect',
              method: 'POST',
              data: data,
              header: {
                'content-type': 'application/json',
                "x-qingful-appid": '498129089531',
                "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
                "Authorization": wx.getStorageSync('Authorization')
              },
              success: function (res) {
                wx.showToast({
                  title: '项目已结束',
                  icon: 'success',
                  duration:2000,
                  success:function(){
                    that.updataStatus()
                  }
                })              
              }
            })
          }
        }
      }) 
    }  
  },
  // 结束项目同时更新动态
  updataStatus: function () {
    var that = this;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/dynamic',
      method: "post",
      data: {
        user_id: that.data.userInfo.user_id,
        user_wxa_id: that.data.userInfo.id,
        wxa_id: that.data.userInfo.wxa_id,
        custom_id: that.data.userInfo.custom_id,
        collect_id: that.data.projectid,
        file: '',
        content: '已筹金额：' + that.data.price
      },
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }
    })
  },
  // 联系客服
  contact:function(){
    var that = this;
    wx.makePhoneCall({
      phoneNumber: app.globalData.configs.phone
    })
  },
  // 申请提现
  applyPay:function(){
    var that = this;
    console.log(that.data.projectid)
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/collect',
      method:'POST',
      data:{
        id: that.data.projectid,
        is_check:0
      },
      header:{
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success:function(res){
        wx.showModal({
          title: '提示',
          content: '结项申请已发出，如有疑问请联系客服！',
          showCancel: false
        })
      },
      fail:function(){
        wx.showModal({
          title: '提示',
          content: '申请提交失败，请重新提交！',
          showCancel:false
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})