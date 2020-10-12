const WSCoordinate = require('../../utils/WSCoordinate.js')
Page({
  data: {
    onec:true
  },
  onLoad:function(o){
    const latitude = o.latitude - 0;
    const longitude = o.longitude - 0;
    const name =o.name;
    const address = o.address;
    console.log(longitude,latitude,name,address);
    let res = WSCoordinate.transformFromWGSToGCJ(latitude, longitude);
    console.log(res)
    wx.openLocation({
      latitude:res.latitude,
      longitude:res.longitude,
      name, // 位置名
      address, // 地址详情说明
      scale: 18
    })
    setTimeout(()=>{
      this.setData({
        onec:false
      })
    },100)
  },
  onShow:function(){
    if(!this.data.onec){
      wx.navigateBack({
        delta: 1
      })
    }
  }
})