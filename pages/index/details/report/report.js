// pages/index/details/report/report.js
var is_click = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    submitDisabled: true,
    imgs: [],
    imgUrls: []
  },
  onLoad: function (options) {
    // 加载个人救助数据
    var userInfo = wx.getStorageSync('user_wxa');
    this.setData({
      userInfo: userInfo,
      id: options.projectid
    })
  },
  // 举报
  reportSubmit: function (e) {
    if (is_click) {
      is_click =false;
      var that = this
      // 举报人姓名
      var realNmae = e.detail.value.realNmae;
      // 举报人身份证号
      var idCard = e.detail.value.idCard;
      // 举报内容
      var reportText = e.detail.value.reportText;
      // 图片地址
      var urlStr = JSON.stringify(this.data.imgs);
      // 是否填写完整
      if (realNmae.length == 0) {
        wx.showModal({
          title: '提示',
          content: "请填写完整",
          showCancel: false
        })
        is_click = true;
      } else if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/).test(idCard)) {
        wx.showModal({
          title: '提示',
          content: '请输入身份证号码或重新输入！',
          showCancel: false
        })
        is_click = true;
      } else if (reportText.length < 30) {
        wx.showModal({
          title: '提示',
          content: '举报理由至少30个字',
          showCancel: false
        })
        is_click = true;
      } else {
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/report',
          method: "post",
          data: {
            user_id: that.data.userInfo.user_id,
            wxa_id: that.data.userInfo.wxa_id,
            custom_id: that.data.userInfo.custom_id,
            user_wxa_id: that.data.userInfo.id,
            name: realNmae,
            num: idCard,
            sub: reportText,
            file: urlStr,
            collect_id: that.data.id
          },
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            is_click = true;
            wx.showToast({
              title: '举报成功',
            })
            wx.navigateBack()
          },
          fail: function () {
            wx.showModal({
              title: '提示',
              content: '提交失败',
              showCancel: false
            })
            is_click = true;
          }
        })
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '提交中，请稍后再试',
        showCancel: false
      })
      is_click = true;
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
    if (/^http:\/\/img\.qingful\.com/.test(that.data.imgUrls[i])) {
      var imgurl = that.data.imgUrls[i];
      that.setData({
        imgurl: imgurl
      })
      that.uploadImgUrl(i);
    } else {
      wx.showLoading()
      var that = this;
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
            content: '图片上传失败，请重新选择图片',
            showCancel: false
          })
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
        console.log(i)
        if (that.data.imgUrls.length - 1 == i) {
          wx.hideLoading()
        }
      },
      fail: function (err) {

      }
    })
  },
})