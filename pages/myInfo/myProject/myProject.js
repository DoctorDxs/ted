// pages/myInfo/myProject/myProject.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    myProjects: [],
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
  },
  onShow: function () {
    this.requestData()
  },
  lookDetial: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    var checks = e.currentTarget.dataset.checks;
    wx.setStorageSync('edit', { "id": id, "edit": 1 })
    app.globalData.firstOnshow = true
    wx.navigateTo({
      url: '/pages/index/details/helpDetail?id=' + id + '&project=1' + '&checks=' + checks
    })
  },
  requestData: function () {
    var that = this;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=user_id=' + that.data.userInfo.user_id + '&limit=20&offset=' + (that.data.page - 1) * 20 + '&related=user_wxa',
      method: 'get',
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var myProject = res.data.data;
        var nowTime = new Date()
        if (myProject.length != 0) {
          for (let i = 0; i < myProject.length; i++) {
            var startTime = new Date(myProject[i].created_at)
            var tTime = Math.ceil((nowTime - startTime) / 1000 / 60);
            if (tTime > 0) {


              if (tTime < 60) {
                myProject[i].tDate = tTime + '分钟前';
              } else {
                tTime = Math.ceil(tTime / 60);
                if (tTime < 24) {
                  myProject[i].tDate = tTime + '小时前';
                } else {
                  tTime = Math.ceil(tTime / 24);
                  if (tTime < 30) {
                    myProject[i].tDate = tTime + '天前'
                  } else {
                    tTime = Math.ceil(tTime / 30);
                    if (tTime < 12) {
                      myProject[i].tDate = tTime + '月前'
                    } else {
                      tTime = Math.ceil(tTime / 12);
                      myProject[i].tDate = tTime + '年前'
                    }
                  }
                }
              }
            } else {
              myProject[i].tDate = 1 + '分钟前';
            }
          }
          myProject = that.data.myHeleDataSy.concat(myProject)
          that.setData({
            page: that.data.page + 1,
            myHeleDataSy: myProject
          })
          that.requestData()
        } else {
          that.setData({
            myHeleDataSy: [],
            page: 1,
            myProjects: that.data.myHeleDataSy
          })
        };
      }
    })
    wx.stopPullDownRefresh()
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