// rank.js
var Api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ranks: [],
  },

  getTypeRank: function(rankType, name, res) {
    const ranks = [];
    ranks.push({ type: -1, title: name });
    var isCollapse = 0;
    var rankIndex = 0;
    for (var item of res.data[rankType]) {
      if (rankType === 'female') {
        item.type = 1;
      }else {
        item.type = 0;
      }
      if (item.collapse && isCollapse === 0) {
        isCollapse = 1;
        ranks.push({
          type: 2,
          collapse: false,
          _id: rankType + '_otherRank',
          title: '别人家的排行榜',
          cover: '/ranking-cover/142319144267827',
        });
        ranks.push(item);
      } else {
        ranks.push(item);
      }
    }
    return ranks;
  },

  /**
   * 点击排行榜的详情列表
   */
  onRankClick: function (e){
    console.log(e);
    const type = e.currentTarget.dataset.statu;
    const id = e.currentTarget.id;
    var ranks = this.data.ranks;
    if (id.split('_').length > 1) {
      // 如果点击的是别人家的排行榜时，这里就要进行伸展或收缩处理
      
      var isOtherRank = false;
      for (const item of ranks) {
        if (isOtherRank && item.type === -1) {
          break;
        }
        
        if (item._id === id) {
          isOtherRank = true;
        }

        if (isOtherRank) {
          item.collapse = !item.collapse;
        }
      }
      this.setData({
        ranks: ranks,
      })
    }else {
      // 这里就是进行跳转了
      var rankItem = {};
      for (const item of ranks) {
        if (item._id === id) {
          rankItem = item;
          break;
        }
      }
      wx.setStorageSync('rankItem', rankItem);
      wx.navigateTo({url: 'rankDetail/rankDetail?title=' + rankItem.title});
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    wx.setNavigationBarTitle({
      title: decodeURIComponent('排行榜')
    })
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: Api.getBookRank(),
      success: function (res) {
        const maleRanks = self.getTypeRank('male', '男生', res);
        const femaleRanks = self.getTypeRank('female', '女生', res);
        const ranks = maleRanks.concat(femaleRanks);
        console.log(ranks);
        self.setData({
          ranks: ranks,
        }, () => {
          wx.hideLoading();
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})