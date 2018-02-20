// rankDetail.js
var Api = require('../../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    offset: 0,
    weekRank: '#000000',
    monthRank: '#cbcccd',
    totalRank: '#cbcccd',
    rankItem: {},
    books:[],
    scrollViewMargin: 10,
    isActive: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    wx.setNavigationBarTitle({
      title: decodeURIComponent(options.title),
    })
      
    var rankItem = wx.getStorageSync('rankItem');
    if (typeof(rankItem.totalRank) === 'undefined') {
      rankItem.isTabBar = false;
    }else {
      rankItem.isTabBar = true;
    }
    this.setData({
      rankItem: rankItem,
      scrollViewMargin: rankItem.isTabBar ? 36 : 10,
    })
    wx.showLoading({
      title: '加载中',
    })
    this.fetchBookList(rankItem._id);
    
  },


  fetchBookList: function(id) {
    const self = this;
    wx.request({
      url: Api.getRankOfBooks(id),
      success: function (res) {
        res.data.ranking.books = res.data.ranking.books.slice(0,30);
        res.data.ranking.books = res.data.ranking.books.map(item => {
          if (item.cover.indexOf("http://statics.zhuishushenqi.com/") === -1) {
            item.cover = "http://statics.zhuishushenqi.com" + item.cover;
          }
          item.shortIntro = item.shortIntro.replace(/[\r\n]/g, '');
          item.cat = item.minorCate;
          return item;
        })

        self.setData({
          books: res.data.ranking.books,
        }, () => {
          setTimeout(() => {
            wx.hideLoading();
          }, 800)
          
        })
      }
    });
  },


  didSelectCell:function(e) {
    var index = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/bookIntro/bookIntro?bookId=' + this.data.books[index]._id })
  },

  onTapTag: function(e) {
    const self = this;
    var tab = e.currentTarget.id;
    var rankId = e.currentTarget.dataset.statu;
    var index = e.target.dataset.index;
    // 初始化动画数据
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 0
    })
    // 距离左边位置
    animation.left((index * 250) + 'rpx').step()
    // 设置动画
    self.setData({
      isActive: parseInt(index),
      animationData: animation.export(),
    })
    wx.showLoading({
      title: '加载中',
    })
    this.fetchBookList(rankId);
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