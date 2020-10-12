// pages/article/article.js
const app = getApp()
const WxParse = require('../../utils/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    time:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getArticleContentInfo(options.id);
  },
  getArticleContentInfo:function(articleId){
    wx.request({
      url: app.globalData.url + '/userIndex/articleContentInfo',
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        articleId: articleId,
      },
      success: (res) => {
        if(res && res.data.code == 1000){
          //富文本解析
          this.setData({
            title:res.data.data.title,
            time:res.data.data.time
          })
          let article = res.data.data.content;
          let that = this;
          WxParse.wxParse('article', 'html', article, that, 20*app.globalData.windowWidth/750);
        }else{
          wx.showToast({
            icon:'none',
            title: '加载失败',
          })
        }
      }
    })
  }
})