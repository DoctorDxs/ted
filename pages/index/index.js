//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    // 更换导航栏样式
    borderActive: true,
    page:1,
    info:[],
    imgs:[],
    nomore: false
  },
  // 加载数据
  onLoad: function () {
    // 加载个人救助数据   
    // 获取用户信息
    var that = this
    var userInfo = wx.getStorageSync('user_wxa');
    if (userInfo) { 
      this.setData({
        userInfo: userInfo
      })
      this.requestPersonal();  
    }else{
      app.wx_login()
    }
  },
  onShow:function(){
    var that = this;
    if (wx.getStorageSync('edit')) {
      wx.removeStorageSync('edit')
    };
    app.globalData.firstOnshow = true;
    var id = app.globalData.id;
    if (id != null){
      wx.request({
        url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + id +'&related=user_wxa',
        method: "get",
        data: {},
        header: {
          'content-type': 'application/json',
          "x-qingful-appid": '498129089531',
          "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
          "Authorization": wx.getStorageSync('Authorization')
        },
        success:function(res){
          var info = that.data.info
          var thisInfo = res.data.data[0];
          thisInfo.progress = (thisInfo.money / thisInfo.price * 100).toFixed(2);
          thisInfo.price = thisInfo.price.toFixed(2)
          thisInfo.money = thisInfo.money.toFixed(2)
          if (thisInfo.file.length > 0) {
            thisInfo.file = JSON.parse(thisInfo.file)
          } else {
            thisInfo.file = [];
          }           
          for(let i=0;i<info.length;i++){
            if (res.data.data[0].status == 2 && info[i].id == res.data.data[0].id) {
              var index = info.indexOf(info[i]);
              info.splice(index, 1);
              that.setData({
                info: info
              })
            } else if (res.data.data[0].status == 1 && info[i].id == id){
              info[i] = res.data.data[0];
              that.setData({
                info:info
              })
            }
          }
        }
      })
    };
    app.configs(function (res) {
      app.globalData.configs = res;
      wx.setNavigationBarTitle({
        title: res.name,
      })
    })
  },
  
  // 加载个人救助数据
  requestPersonal: function () {
    this.setData({
      nomore:false
    })
    var that = this
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/collect?where=${encodeURIComponent("type=1 and status=1 and checks=1")}&limit=20&offset=${(that.data.page - 1) * 20}&related=user_wxa`,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        var infoData = res.data.data;
        if (infoData.length == 0) {
          that.setData({
            nomore: true
          })
        }
        for (let i = 0; i < infoData.length;i++){
          infoData[i].progress = (infoData[i].money / infoData[i].price * 100).toFixed(2);
          infoData[i].price = infoData[i].price.toFixed(2)
          infoData[i].money = infoData[i].money.toFixed(2)
          if (infoData[i].file.length>0){
            infoData[i].file = JSON.parse(infoData[i].file)
          }else{
            infoData[i].file=[];
          }       
        }
        var info = that.data.info.concat(infoData);
        that.setData({
          info: info
        })
        wx.setStorageSync('firstLogin', false)
        wx.stopPullDownRefresh()     
      },
      fail: function (err) {
        wx.stopPullDownRefresh()
        wx.showModal({
          title: '提示',
          content: '加载失败',
          showCancel:false,
          success:function(res){
            if(res.confirm){
              that.requestPersonal()                
            }
          }
        })
      }
    })
  },
  // 加载轻松公益数据
  requestPublic: function () {
    this.setData({
      nomore: false
    })
   
    var that = this
    wx.request({
      url: `https://baas.qingful.com/1.0/class/api/table/collect?where=${encodeURIComponent("type=2 and status=1 and checks=1")}&limit=20&offset=${(that.data.page - 1) * 20}&related=user_wxa`,
      method: "get",
      data: {},
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
        },
      success: function (res) {
        var infoData = res.data.data;
        if (infoData.length == 0) {
          that.setData({
            nomore: true
          })
        }
        for (let i = 0; i < infoData.length; i++) {
          infoData[i].progress = (infoData[i].money / infoData[i].price * 100).toFixed(2);
          infoData[i].price = infoData[i].price.toFixed(2)
          infoData[i].money = infoData[i].money.toFixed(2)
          infoData[i].file = JSON.parse(infoData[i].file)
        }
        var info = that.data.info.concat(infoData);
        that.setData({
          info: info
        })
        wx.stopPullDownRefresh()       
      },
      fail: function (err) {
        wx.stopPullDownRefresh()
        wx.showModal({
          title: '提示',
          content: '加载失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.requestPublic()
            }
          }
        })
      }
    })
  },
  // 点击显示个人救助并 重新加载数据
  personalHelp: function () {
    this.setData({
      borderActive: true,
      info:[],
      nomroe: true,
      page: 1
    })
    this.requestPersonal();
  },
  // 点击加载轻松公益数据
  easyWelfare: function () {
    this.setData({
      borderActive: false,
      info:[],
      nomroe: true,
      page:1
    })
    this.requestPublic()
  },

  // 上拉加载
  onReachBottom: function () {
    if (this.data.borderActive == true) {
      var page = this.data.page+1;
      this.setData({
        page:page
      })
      this.requestPersonal()
    } else {
      var page = this.data.page + 1;
      this.setData({
        page: page
      })
      this.requestPublic()
    }
  },
  //监听用户下拉刷新
  onPullDownRefresh: function (e) {
    if (this.data.borderActive == true){
      this.setData({
        page:1,
        info:[]
      })
      this.requestPersonal();
    }else{
      this.setData({
        page: 1,
        info:[]
      })
      this.requestPublic()
    }
    app.configs(function (res) {
      app.globalData.configs = res;
      wx.setNavigationBarTitle({
        title: res.name,
      })
    })
  },

  // 详情
  navTo: function (e) {
    // 获取点击的下标
    var id = e.currentTarget.dataset.id;
    //  将获取的值传递给下一页面
    wx.navigateTo({
      url: 'details/helpDetail?id=' + id 
    })
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: '轻松筹',
      path: '/pages/index/index',
      success: function (res) {      
      },
    }
  },
})
