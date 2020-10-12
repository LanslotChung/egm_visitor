// pages/webview/webview.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:null,
    productName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let adviserName = encodeURIComponent(options.adviserName);
    console.log(adviserName)
    let adviserLevelName = encodeURIComponent(options.adviserLevelName);
    let adviserHeadPic = encodeURIComponent(options.adviserHeadPic);
    let address = encodeURIComponent(options.address);
    let name = encodeURIComponent(options.name);
    this.productName = options.name;
    let t = new Date()-0;
    this.setData({
      url: `https://xiecong123.online/dist/index.html?adviserId=${options.adviserId}&projectId=${options.projectId}&longitude=${options.longitude}&latitude=${options.latitude}&adviserMobile=${options.adviserMobile}&token=${options.token}&adviserHeadPic=${adviserHeadPic}&adviserName=${adviserName}&adviserLevelName=${adviserLevelName}&address=${address}&name=${name}&t=${t}`
    })
    // this.setData({
    //   url: `http://192.168.3.4:8080?adviserId=${options.adviserId}&projectId=${options.projectId}&longitude=${options.longitude}&latitude=${options.latitude}&adviserMobile=${options.adviserMobile}&token=${options.token}&adviserHeadPic=${adviserHeadPic}&adviserName=${adviserName}&adviserLevelName=${adviserLevelName}&address=${address}&name=${name}`
    // })
    console.log(this.data.url)
  },
  
  onShareAppMessage: function (e) {
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
    console.log(11);
    //记录分享次数加1
    return {
      title: this.productName,
      path: '/pages/index/index?adviserId=' + adviserId + '&projectId=' + projectId
    }
  },
})