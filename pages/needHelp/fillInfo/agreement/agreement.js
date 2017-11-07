// pages/needHelp/fillInfo/agreement/agreement.js
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
      id:options.id,
      config: app.globalData.configs
    })
    if (options.id==0){
      wx.setNavigationBarTitle({
        title: app.globalData.configs.name+'项目发起条款',
      })
    }else{
      wx.setNavigationBarTitle({
        title: '发起人承诺书',
      })
    }
  },
  agreeAndContinue: function () {
    wx.navigateBack({
      delta: 1
    })
  },
})