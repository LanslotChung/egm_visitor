//index.js
//获取应用实例
const app = getApp()
const utils = require('../../utils/util.js');
Page({
  data: {
    loading:true,
    login:false,
    getUserInfoShow:false,
    getPhoneNumberShow:false,
    rawData:null,
    signature:null,
    indexInfo:null,
    beginTime:0,
    endTime:0,
    shortAddrs:"",
    options:null
  },
  onLoad:function(o){
    if(o["projectId"] && o["adviserId"]){
      this.data.options = o;
    }
    //设置登录回调
    if (app.globalData.showIndex){
      this.setData({
        //loading: false,
        login: app.globalData.userInfo?true:false
      })
      //根据是否有token判断调用哪个接口去获取首页信息
      if (app.globalData.userInfo && app.globalData.userInfo.token) {
        this.getIndexInfoByToken();
      } else {
        this.getIndexInfo();
      }
    }else{
      app.userInfoReadyCallback = () => {
        this.setData({
          //loading: false,
          login: app.globalData.userInfo ? true : false
        })
        //根据是否有token判断调用哪个接口去获取首页信息
        if (app.globalData.userInfo && app.globalData.userInfo.token) {
          this.getIndexInfoByToken();
        } else {
          this.getIndexInfo();
        }
      }
    }
  },
  getIndexInfoByToken:function(){
    let adviserId = wx.getStorageSync('adviserId');
    let projectId = wx.getStorageSync('projectId');
    let latitude = app.globalData.addInfo ? app.globalData.addInfo.latitude:'';
    let longitude = app.globalData.addInfo ? app.globalData.addInfo.longitude:'';
    if(latitude&&longitude){
      wx.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/?location='+latitude+','+longitude+'&key=V6KBZ-NKF3D-6364J-H6XJ4-R2XT5-3TB44&get_poi=1',
        success: (res) => {
          console.log(111,res)
          wx.request({
            url: app.globalData.url + '/userIndex/info',
            method:"post",
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            data: {
              token: app.globalData.userInfo.token,
              adviserId: adviserId,
              projectId: projectId,
              latitude:latitude,
              longitude:longitude,
              address:res.data.result.address
            },
            success: (res) => {
              console.log(res)
              if (res.data && res.data.code == 1000){
                this.setData({
                  indexInfo: res.data.data,
                  loading:false
                })
                this.splitAddr(res.data.data);
              }
            }
          })
        }
      })
    }else{
      wx.request({
        url: app.globalData.url + '/userIndex/info',
        method:"post",
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          token: app.globalData.userInfo.token,
          adviserId: adviserId,
          projectId: projectId,
          latitude:'',
          longitude:'',
          address:''
        },
        success: (res) => {
          console.log(res)
          if (res.data && res.data.code == 1000){
            this.setData({
              indexInfo: res.data.data,
              loading:false
            })
            this.splitAddr(res.data.data);
          }
        }
      })
    }
  },
  getIndexInfo:function(){
    let adviserId = wx.getStorageSync('adviserId');
    let projectId = wx.getStorageSync('projectId');
    wx.request({
      url: app.globalData.url + '/userIndex/autoInfo',
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        adviserId: adviserId,
        projectId: projectId
      },
      success: (res) => {
        console.log(res)
        if (res.data && res.data.code == 1000) {
          this.setData({
            indexInfo: res.data.data,
            loading:false
          })
          this.splitAddr(res.data.data);
        }
      }
    })
  },
  splitAddr:function(res){
    let _shortAddr = []
    var addrs = res.productObj.address.split("/");
    _shortAddr.push(addrs[1]);
    this.setData({
      shortAddrs:_shortAddr
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    console.log(e)
    let adviserId = wx.getStorageSync('adviserId');
    let projectId = wx.getStorageSync('projectId');
    wx.request({
      url: app.globalData.url + '/userIndex/share',
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        projectId: projectId,
        token: app.globalData.userInfo.token,
        adviserId: adviserId
      },
      success: (res) => {
        console.log(res)
      }
    })
    //记录分享次数加1
    return {
      title: this.data.indexInfo.productObj.name,
      path: '/pages/index/index?adviserId=' + adviserId + '&projectId=' + projectId
    }
  },
  saveContactsFn:function(e){//保存联系人
    if (this.data.login){
      wx.addPhoneContact({
        firstName: this.data.indexInfo.adviserName,
        mobilePhoneNumber: this.data.indexInfo.adviserMobile,
      })
    }else{
      wx.getSetting({// 获取用户信息
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            this.setData({
              getPhoneNumberShow: true,
            })
          }else{
            this.setData({
              getUserInfoShow: true
            })
          }
        }
      })
    }
  },
  callPhone: function (e) {
    if (this.data.login) {
      wx.makePhoneCall({
        phoneNumber: this.data.indexInfo.adviserMobile
      })
    } else {
      wx.getSetting({// 获取用户信息
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            this.setData({
              getPhoneNumberShow: true,
            })
          } else {
            this.setData({
              getUserInfoShow: true
            })
          }
        }
      })
    }
  },
  textPaste: function () {
    if (this.data.login) {
      wx.setClipboardData({
        data: this.data.indexInfo.adviserWxNumber,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              console.log(res.data) // data
              wx.showToast({
                title: '复制成功',
              })
            }
          })
        }
      })
    } else {
      wx.getSetting({// 获取用户信息
        success: res => {
          console.log(res.authSetting)
          if (res.authSetting['scope.userInfo']) {
            this.setData({
              getPhoneNumberShow: true,
            })
          } else {
            this.setData({
              getUserInfoShow: true
            })
          }
        }
      })
    }
  },
  cancelGetUserInfoFn:function(){
    this.setData({
      getUserInfoShow: false
    })
  },
  hideUserInfoFn:function(){
    this.setData({
      getUserInfoShow:false
    })
  },
  getuserinfoFn:function(e){
    console.log(e)
    this.setData({
      getUserInfoShow:false
    })
    if (e.detail && e.detail.rawData){
      this.setData({
        getPhoneNumberShow:true,
        rawData: e.detail.rawData,
        signature: e.detail.signature
      })
    }
  },
  cancelGetPhoneNumberFn: function () {
    this.setData({
      getPhoneNumberShow: false
    })
  },
  hidePhoneFn:function(){
    this.setData({
      getPhoneNumberShow: false
    })
  },
  getPhoneNumberFn:function(e){
    console.log(e)
    this.setData({
      getPhoneNumberShow: false,
    })
    if (e.detail && e.detail.encryptedData) {
      wx.getSetting({// 获取用户信息
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                let rawData = res.rawData;
                let signature = res.signature;
                wx.login({
                  success: res => {
                    wx.request({
                      url: app.globalData.url + '/user/info',
                      data: {
                        code: res.code,
                        rawData: rawData,
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv,
                        signature: signature,
                        roleType:1
                      },
                      success: (res) => {
                        console.log(res)
                        app.globalData.userInfo = res.data.data;
                        //用户是否登录,如果已登录,globalData.userInfo有数据,否则无数据
                        //如果有数据,记录用户行为,重新获取首页信息
                        if (app.globalData.userInfo){
                          this.getIndexInfoByToken();
                        }
                        this.setData({
                          getPhoneNumberShow: false,
                          login: app.globalData.userInfo?true:false
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        }
      })
    }
  },
  goWebView:function(){
    if (this.data.login) {
      let adviserId = wx.getStorageSync('adviserId');//置业顾问id
      let projectId = wx.getStorageSync('projectId');//项目id
      let longitude = this.data.indexInfo.productObj.longitude;//楼盘经度
      let latitude = this.data.indexInfo.productObj.latitude;//楼盘纬度
      let adviserMobile = this.data.indexInfo.adviserMobile;//置业顾问电话
      let token = app.globalData.userInfo.token;//用户token
      let adviserHeadPic = this.data.indexInfo.adviserHeadPic;//置业顾问头像
      let adviserName = this.data.indexInfo.adviserName;//置业顾问名字
      let adviserLevelName = this.data.indexInfo.adviserLevelName;//置业顾问职称
      let address = this.data.indexInfo.productObj.address;
      let name = this.data.indexInfo.productObj.name;
      wx.navigateTo({
        url: `/pages/webview/webview?adviserId=${adviserId}&projectId=${projectId}&longitude=${longitude}&latitude=${latitude}&adviserMobile=${adviserMobile}&token=${token}&adviserHeadPic=${adviserHeadPic}&adviserName=${adviserName}&adviserLevelName=${adviserLevelName}&address=${address}&name=${name}`,
      })
    } else {
      wx.getSetting({// 获取用户信息
        success: res => {
          console.log(res.authSetting)
          if (res.authSetting['scope.userInfo']) {
            this.setData({
              getPhoneNumberShow: true,
            })
          } else {
            this.setData({
              getUserInfoShow: true
            })
          }
        }
      })
    }
  },
  onShow:function(){
    this.setData({
      beginTime: new Date() - 0
    })
  },
  onHide:function(){
    this.setData({
      endTime:new Date() - 0
    })
    if (app.globalData.userInfo && app.globalData.userInfo.token && (this.data.endTime - this.data.beginTime>10000)){
      let jsonArray = [{
        title: '查看了你的名片',
        seeTime: utils.formatTime(new Date(this.data.beginTime)),
        seconds: ((this.data.endTime - this.data.beginTime) / 1000).toFixed(0)
      }];
      let projectId = wx.getStorageSync('projectId');
      wx.request({
        url: app.globalData.url + '/userIndex/addBrowsing',
        method: "post",
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          token: app.globalData.userInfo.token,
          programLength: 0,
          projectId: projectId,
          jsonArray: JSON.stringify(jsonArray)
        },
        success: (res) => {
          console.log(res)
        }
      })
    }
  },
  goArticle:function(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/article/article?id='+e.currentTarget.dataset.id,
    })
  }
})
