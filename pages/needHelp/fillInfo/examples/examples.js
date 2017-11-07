// pages/needHelp/fillInfo/examples/examples.js
var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },


  agreeAndContinue:function(){
    wx.navigateBack({
      delta:1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      config: app.globalData.configs,
      tag:options.tag
    })
    if (options.tag==3){
      wx.setNavigationBarTitle({
        title: '上传指南',
      })
    }
  },
})