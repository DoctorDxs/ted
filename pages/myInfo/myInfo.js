// pages/myInfo/myInfo.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    myHelp: [],
    myAttention: [],
    myProject: [],
    myHeleDataSy: [], 
    pageHelp:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取登陆缓存信息
    var userInfo = wx.getStorageSync('user_wxa');
    this.setData({
      userInfo: userInfo,
      config: app.globalData.configs
    })
  },
  onShow: function () {
    if (wx.getStorageSync('edit')) {
      wx.removeStorageSync('edit')
    }
    app.globalData.firstOnshow = true;
    app.globalData.id=null
    this.myProjectData()
  },
  // 我的项目
  myProjectData:function(){
    // 我的项目
    var that = this
    var user_id = this.data.userInfo.user_id;
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=user_id=' + user_id + '&limit=20&offset=' + (that.data.page - 1) * 20 + '&related=user_wxa',
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
        if (myProject.length!=0){
          myProject = that.data.myHeleDataSy.concat(myProject)
          that.setData({
            page:that.data.page+1,
            myHeleDataSy: myProject
          })
          that.myProjectData()
        }else{
          that.myHeleData(that.data.myHeleDataSy) 
          that.setData({
            myHeleDataSy: [],
            page:1
          }) 
        }      
      }
    })
  },
  // 我的帮助
  myHeleData: function (myProject){ 
    var that = this
    var user_id = this.data.userInfo.user_id;
    // 我的帮助
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/donation?where=${encodeURIComponent("user_id=" + user_id + " and pay_status=1")}&related=user_wxa&limit=20&offset=${(that.data.pageHelp - 1) * 20}`,
      method: 'get',
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var myHelp = res.data.data;
        if (myHelp.length != 0) {
          var hash = {};
          var myHelpEqu = myHelp.reduce(function (item, next) {
            hash[next.collect_id] ? '' : hash[next.collect_id] = true && item.push(next);
            return item
          }, [])
          myHelp = that.data.myHeleDataSy.concat(myHelpEqu)
          that.setData({
            pageHelp: that.data.pageHelp + 1,
            myHeleDataSy: myHelp
          })
          that.myHeleData(myProject)
        } else {
          that.myAttentionData(myProject, that.data.myHeleDataSy)
          that.setData({
            myHeleDataSy: [],
            pageHelp: 1
          }) 
        } 
      }
    })
  },
// 我的关注
  myAttentionData: function (myProject, myHelp){
    var that = this
    var user_id = this.data.userInfo.user_id;
    // 我的关注
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/concern?where=${encodeURIComponent("user_id=" + user_id + ' and status= 1')}`,
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
        var hash = {};
        myAttention = myAttention.reduce(function (item, next) {
          hash[next.collect_id] ? '' : hash[next.collect_id] = true && item.push(next);
          return item
        }, [])
        that.setData({
          myAttention: myAttention,
          myProject: myProject,
          myHelp: myHelp
        })

      }
    })
  },
  // 我的项目详情
  myProject: function () {
    var that = this;
    wx.navigateTo({
      url: 'myProject/myProject',
    })
  },
  // 我的帮助详情
  myHelped: function () {
    var that = this;
    wx.navigateTo({
      url: 'myHelped/myHelped',
    })
  },
  // 我的关注详情
  myAttention: function () {
    var that = this;
    wx.navigateTo({
      url: 'myAttention/myAttention',
    })
  },
  // 我的钱包
  myWallet: function () {
    wx.navigateTo({
      url: 'myWallet/myWallet',
    })
  },
  // 拨打电话
  telCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.config.phone
    })
  }
})