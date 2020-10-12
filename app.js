//app.js
//import tim from './utils/tim.js';
//import genTestUserSig from './utils/GenerateTestUserSig.js';
App({
  onLaunch: function (o) {
    if(o.query['projectId'] && o.query['adviserId']){
      wx.setStorageSync('adviserId', o.query['adviserId']);
      wx.setStorageSync('projectId', o.query['projectId']);
    }else{
      if(o.scene == 1037){//小程序进入
        wx.setStorageSync('adviserId', o.referrerInfo.extraData.adviserId);
        wx.setStorageSync('projectId', o.referrerInfo.extraData.projectId);
      }else if(o.scene == 1007 || o.scene == 1008){//分享卡片进入
        wx.setStorageSync('adviserId', o.query.adviserId);
        wx.setStorageSync('projectId', o.query.projectId);
      }else if(o.scene == 1047 || o.scene == 1012 || o.scene == 1048){
        let projectId = decodeURIComponent(o.query.scene).split('#')[0];
        let adviserId = decodeURIComponent(o.query.scene).split('#')[1];
        wx.setStorageSync('adviserId', adviserId);
        wx.setStorageSync('projectId', projectId);
      }else{
        if(!wx.getStorageSync('adviserId')){
          wx.setStorageSync('adviserId', 158);
          wx.setStorageSync('projectId',53);
        }
      }
    }
    
    //携带参数 置业顾问id 置业顾问聊天id 楼盘id
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        wx.getLocation({
          type: 'wgs84',
          success: (res) => {
            this.globalData.addInfo = res;
          }
        })
      },
      fail: () => {
      }
    })
    wx.login({
      success: res => {
        wx.request({
          url: this.globalData.url + '/user/login',
          data: {
            code: res.code,
            roleType:1
          },
          success:(res)=>{
            this.globalData.showIndex = true;
            //用户是否登录,如果已登录,globalData.userInfo有数据,否则无数据
            //如果有数据,记录用户行为
            this.globalData.userInfo = res.data.data;
            if (this.userInfoReadyCallback){
              this.userInfoReadyCallback();
            }
            console.log(res)
          }
        })
      }
    })

    // let userSig = genTestUserSig('测试2号').userSig
    // //userID 唯一值
    // let promise = tim.login({ userID: '测试2号', userSig });
    // promise.then(function (imResponse) {
    //   console.log('登录成功')
    //   console.log(imResponse.data); // 登录成功
    // }).catch(function (imError) {
    //   console.log('登录失败')
    //   console.warn('login error:', imError); // 登录失败的相关信息
    // });
    
    //从参数中获取置业顾问id
    // o.id=2;
    // if(o.id){
    //   //缓存置业顾问id
    //   wx.setStorageSync('id',o.id);
    //   if (this.callback){
    //     this.callback()
    //   }
    // }
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
  },
  onShow:function(){
    this.globalData.beginTime = new Date() - 0;
  },
  onHide:function(){
    this.globalData.endTime = new Date() - 0;
    let programLength = Math.ceil((this.globalData.endTime - this.globalData.beginTime)/1000/60);
    if (this.globalData.userInfo && this.globalData.userInfo.token && ((this.globalData.endTime - this.globalData.beginTime > 10000))){
      this.addBrowsing(programLength)
    }
  },
  addBrowsing: function (programLength){
    let projectId = wx.getStorageSync('projectId');
    wx.request({
      url: this.globalData.url + '/userIndex/addBrowsing',
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        token: this.globalData.userInfo.token,
        programLength: programLength,
        projectId: projectId,
        jsonArray: JSON.stringify([])
      },
      success: (res) => {
        console.log(res)
      }
    })
  },
  globalData: {
    showIndex:false,//控制首页回调
    userInfo: null,//用户信息
    addInfo:null,//用户地址信息
    url: 'https://xiecong123.online/egm',
    // url: 'http://192.168.3.7:8180/egm',
    beginTime:0,
    endTime:0,
    windowWidth:wx.getSystemInfoSync()['windowWidth'],
    pixelRatio:wx.getSystemInfoSync()['pixelRatio'],
  }
})