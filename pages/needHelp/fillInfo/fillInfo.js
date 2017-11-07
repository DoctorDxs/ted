// pages/needHelp/fillInfo/fillInfo.js
var app = getApp();
var is_click = true;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reminderShow: false,
    edit: false,
    imgs: [],
    imgUrls: [],
    agree: false,
    thisInfo: [],
    editFill: true,
    inputText: ''
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      config: app.globalData.configs,
      userInfo: wx.getStorageSync('user_wxa'),
    })
  },
  onShow: function (options) {
    is_click = true;
    if (app.globalData.firstOnshow) {
      var that = this;
      if (wx.getStorageSync('edit').edit == 1) {
        this.setData({
          edit: true,
          id: wx.getStorageSync('edit').id,
          agree: true,
          userInfo: wx.getStorageSync('user_wxa')
        })
        // 编辑项目
        wx.showLoading()
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect?where=id=' + that.data.id + '&related=user_wxa',
          method: "get",
          data: {},
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            var thisInfo = res.data.data[0];
            thisInfo.file = JSON.parse(thisInfo.file)
            that.setData({
              thisInfo: thisInfo,
              imgUrls: thisInfo.file
            })
            wx.hideLoading()
            wx.setNavigationBarTitle({
              title: '编辑项目',
            })
          }
        })
      } else {
        this.setData({
          edit: false,
          imgs: [],
          imgUrls: [],
          agree: false,
          thisInfo: []
        })
      }
    }
    app.globalData.firstOnshow = false
    app.globalData.id = null
    app.configs(function (res) {
      app.globalData.configs = res;
    })
  },
  // 是否同意
  agree_click: function () {
    if (!this.data.agree) {
      this.setData({
        agree: true
      })
    } else {
      this.setData({
        agree: false
      })
    }
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
  // 提交
  submitHelpInfo: function (e) {
    var that = this,
      helpTitle = e.detail.value.helpTitle,
      helpMoney = e.detail.value.helpMoney,
      helpText = e.detail.value.helpText,
      user_id = this.data.userInfo.user_id,
      user_wxa_id = this.data.userInfo.id,
      wxa_id = this.data.userInfo.wxa_id,
      custom_id = this.data.userInfo.custom_id,
      urlStr = JSON.stringify(this.data.imgs);
    // 判断是否符合填写条件
    if (helpMoney.length <= 0 || isNaN(helpMoney) || helpMoney == 0) {
      wx.showModal({
        title: '提示',
        content: '填写金额不符合规范',
        showCancel: false
      })
    } else if (helpTitle.length < 4) {
      wx.showModal({
        title: '提示',
        content: '标题不得少于4个字',
        showCancel: false
      })
    } else if (helpText.length < 10) {
      wx.showModal({
        title: '提示',
        content: '求助说明不少于10个汉字',
        showCancel: false
      })
    } else {
      // 提交筹款信息
      this.setData({
        price: helpMoney
      })
      var formData = {
        title: helpTitle,
        price: helpMoney,
        content: helpText,
        user_id: user_id,
        wxa_id: wxa_id,
        custom_id: custom_id,
        user_wxa_id: user_wxa_id,
        file: urlStr,
      }
      if (this.data.id) {
        formData.id = this.data.id;
        var data = formData;
      } else {
        var data = formData;
      }
      wx.showLoading()
      if (is_click) {
        is_click = false
        wx.request({
          url: 'https://baas.qingful.com/1.0/class/api/table/collect',
          method: 'post',
          data: data,
          header: {
            'content-type': 'application/json',
            "x-qingful-appid": '498129089531',
            "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
            "Authorization": wx.getStorageSync('Authorization')
          },
          success: function (res) {
            that.setData({
              collect_id: res.data.data.id
            })
            // 发起项目成功同时更新动态
            if (!that.data.edit) {
              that.updataStatus()
            } else {
              wx.hideLoading()
              wx.showToast({
                title: '修改成功',
                duration: 2000,
                success: function () {
                  wx.reLaunch({
                    url: '/pages/index/index',
                  })
                }
              })
            }
          },
          fail: function (res) {
            is_click = true;
            wx.showModal({
              title: '提示',
              content: '信息提交失败',
              showCancel: false
            })
          }
        });
      } else {
        is_click = true;
        wx.showModal({
          title: '提示',
          content: '操作频繁请稍候再试！',
          showCancel: false
        })
      }
    }
  },
  // 发起项目成功同时更新动态
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
        collect_id: that.data.collect_id,
        file: '',
        content: '目标金额：' + Number(that.data.price).toFixed(2) + '元',
        status: 1
      },
      header: {
        'content-type': 'application/json',
        "x-qingful-appid": '498129089531',
        "x-qingful-appkey": 'wfaQOkLl5no30gcL2Onevdr0',
        "Authorization": wx.getStorageSync('Authorization')
      },
      success: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '已提交',
          duration: 2000,
          success: function () {
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        })
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '更新失败',
        })
      }
    })
  },
  // textarear获取焦点出现提示
  textareaFocus: function () {
    this.setData({
      reminderShow: true
    })
  },
  // 失去焦点
  textareaBlur: function () {
    this.setData({
      reminderShow: false
    })
  },
  // 参考实例
  example: function (e) {
    var tag = e.target.dataset.tag
    wx.navigateTo({
      url: 'examples/examples?tag=' + tag,
    })
  },
  //第一次选择图片
  upLoadImg: function () {
    this.setData({
      editFill: false
    })
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
        that.forUpload()
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  // 点击添加图片
  addImg: function () {
    this.setData({
      editFill: false
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
        that.forUpload()
      },
    })
  },
  // 取消不用上传的图片
  closeImg: function (e) {
    var index = e.currentTarget.dataset.index;
    // 最终要上传的图片 
    for (let k = 0; k < this.data.imgUrls.length; k++) {
      if (index == k) {
        this.data.imgUrls.splice(index, 1);
        this.data.imgs.splice(index, 1);
      }
    }
    this.setData({
      imgUrls: this.data.imgUrls
    })
    wx.showLoading()
    this.forUpload()
    wx.hideLoading()
  },
  // 循环遍历上传图片
  forUpload: function () {
    var imgUrls=this.data.imgUrls
    // 现传图片
    for (var i = 0; i < imgUrls.length; i++) {
      this.starUpLoadImgs(i)
    }
  },
  // 开始上传
  starUpLoadImgs: function (i) {
    var that = this;
    if (/^http:\/\/img\.qingful\.com/.test(that.data.imgUrls[i])) {
      var imgurl = that.data.imgUrls[i];
      that.setData({
        imgurl: imgurl
      })
      that.uploadImgUrl(i);
    } else {
      wx.showLoading()
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
    }


  },
  // 上传图片到数据表
  uploadImgUrl: function (i) {
    var that = this;
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
          content: '上传失败',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              return false
            }
          }
        })
      }
    })
  },

  // 拨打电话
  telCall: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: String(that.data.config.phone),
      success: function (res) {
        console.log(res)
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  onPullDownRefresh: function () {
    app.configs(function (res) {
      app.globalData.configs = res;
      wx.stopPullDownRefresh()
    })
  }
})