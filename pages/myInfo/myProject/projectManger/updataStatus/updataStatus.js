// pages/myInfo/myProject/projectManger/updataStatus/updataStatus.js
var is_click = true;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgs: [],
    imgUrls: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userInfo = wx.getStorageSync('user_wxa');
    this.setData({
      userInfo: userInfo,
      collect_id: options.collect_id
    })
  },
  onShow: function () {
    this.setData({
      config: app.globalData.configs
    })
  },
  updataStatus: function (e) {
    if (is_click) {
      is_click=false;
      var that = this,
        urlStr = JSON.stringify(this.data.imgs);
      var content_text = e.detail.value.content;
      if (content_text.length > 0) {
        var content = content_text;
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/dynamic',
          method: "post",
          data: {
            user_id: that.data.userInfo.user_id,
            user_wxa_id: that.data.userInfo.id,
            wxa_id: that.data.userInfo.wxa_id,
            custom_id: that.data.userInfo.custom_id,
            collect_id: that.data.collect_id,
            file: urlStr,
            content: content,
            status: 1
          },
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            is_click = true;
            wx.redirectTo({
              url: "/pages/index/details/helpDetail?id=" + that.data.collect_id + '&project=1',
            })
          },
          fail: function () {
            is_click = true;
            wx.showModal({
              title: '提示',
              content: '更新失败',
              showCancel: false
            })           
          }
        })
      } else {
        is_click = true;
        wx.showModal({
          title: '提示',
          content: '请填写更新内容',
          showCancel: false
        })
      }
    }else{      
      is_click = true;
      wx.showModal({
        title: '提示',
        content: '请填写更新内容',
        showCancel: false
      })
    }
  },
  //第一次选择图片
  upLoadImg: function () {
    var that = this;
    wx.chooseImage({
      count: 8,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res1) {
        var tempFilePaths = res1.tempFilePaths;
        if (tempFilePaths.length > 0) {
          var hideAdd = true;
        }
        that.setData({
          imgUrls: tempFilePaths,
          hideAdd: hideAdd
        });
        // 现传图片
        for (var i = 0; i < that.data.imgUrls.length; i++) {
          that.starUpLoadImgs(i)
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  // 点击添加图片
  addImg: function () {
    this.setData({
      imgs: []
    })
    var that = this;
    wx.chooseImage({
      count: 8 - that.data.imgUrls.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res1) {
        var addTempFilePaths = res1.tempFilePaths;
        var addTempFilePathsList = {};
        for (var i = 0; i < addTempFilePaths.length; i++) {
          addTempFilePathsList[that.data.imgUrls.length + i] = addTempFilePaths[i];
        }
        var imgUrls = Object.assign(that.data.imgUrls, addTempFilePathsList)
        that.setData({
          imgUrls: imgUrls,
        });
        // 现传图片
        for (var i = 0; i < that.data.imgUrls.length; i++) {
          that.starUpLoadImgs(i)
        }
      },
    })
  },
  // 取消不用上传的图片
  closeImg: function (e) {
    this.setData({
      imgs: []
    })
    var index = e.currentTarget.dataset.index;
    // 最终要上传的图片 
    for (let k = 0; k < this.data.imgUrls.length; k++) {
      if (index == k) {
        this.data.imgUrls.splice(index, 1);
      }
    }
    this.setData({
      imgUrls: this.data.imgUrls
    })
    // 现传图片
    for (var i = 0; i < this.data.imgUrls.length; i++) {
      this.starUpLoadImgs(i)
    }
  },
  // 开始上传
  starUpLoadImgs: function (i) {
    wx.showLoading();
    var that = this;
    if (/^http:\/\/img\.qingful\.com/.test(that.data.imgUrls[i])) {
      var imgurl = that.data.imgUrls[i];
      that.setData({
        imgurl: imgurl
      })
      that.uploadImgUrl(i);
    } else {
      wx.uploadFile({
        url: 'https://baas.qingful.com/1.0/class/api/image/upload',
        filePath: that.data.imgUrls[i],
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data",
          "x-qingful-appid": '498129089531',
          "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
          "Authorization": wx.getStorageSync('Authorization')
        },
        success: function (res) {
          var imgStr = res.data
          var imgurl = JSON.parse(imgStr).data;
          that.setData({
            imgurl: imgurl
          })
          that.uploadImgUrl(i);
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '上传图片失败，请重新选择图片',
          })
          wx.hideLoading()
        }
      })
    }
  },
  // 上传图片到数据表
  uploadImgUrl: function (i) {
    var that = this
    wx.request({
      url: 'https://baas.qingful.com/1.0/class/api/table/file',
      method: 'post',
      data: {
        url: that.data.imgurl,
        custom_id: that.data.userInfo.custom_id,
      },
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        that.data.imgs.push(res.data.data.url);
        if (that.data.imgUrls.length - 1 == i) {
          wx.hideLoading()
        }
      },
      fail: function (err) {
        wx.showModal({
          title: '提示',
          content: '图片上传失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              return false
            }
          }
        })
        wx.hideLoading()
      }
    })
  },
})