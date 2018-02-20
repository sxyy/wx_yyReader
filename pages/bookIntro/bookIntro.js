var Api = require('../../utils/api.js');
var Util = require('../../utils/util.js');
// bookIntro.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookInfo: {},
    isInShelf: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    const bookId = options.bookId;
    self.setData({
      bookId: bookId,
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
    wx.request({
      url: Api.getBookIntro(bookId),
      success: function (res) {
        wx.hideToast();
        res.data.cover = res.data.cover.indexOf("http://statics.zhuishushenqi.com/") === -1 ? "http://statics.zhuishushenqi.com" + res.data.cover : res.data.cover;
        res.data.wordCount = parseInt(res.data.wordCount / 10000) === 0 ? res.data.wordCount : (parseInt(res.data.wordCount / 10000) + '万');
        res.data.updated = Util.getDateDiff(Util.getDateTimeStamp(res.data.updated));
        wx.setNavigationBarTitle({
          title: decodeURIComponent(res.data.title)
        })
        self.setData({
          bookInfo: res.data,
        })
      }
    });
  },

  /**
  * 点击选择书籍
  */
  didSelectBook(e) {
    var index = e.currentTarget.id;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
    this.fetchBookSource({ view: 'summary', book: this.data.bookId});
  },


  /**
   * 获取书籍的书源
   */
  fetchBookSource: function (obj) {
    var self = this;
    var originSourceId = '';
    const collectBooks = wx.getStorageSync('collect');
    for (const item of collectBooks) {
      if (obj.book === item['_id'] && typeof (item.sourceId) !== 'undefined') {
        originSourceId = item.sourceId;
        break;
      }
    }
    wx.request({
      url: Api.getBookSource(obj),
      success: function (res) {
        var sourceId = originSourceId === '' ? (res.data.length > 1 ? res.data[1]._id : res.data[0]._id) : originSourceId;
        var sourceLink = res.data.length > 1 ? res.data[1].link : res.data[0].link;
        self.setData({
          sourceId: originSourceId === '' ? sourceId : originSourceId,
          sourceLink: sourceLink
        })
        wx.setStorageSync("sourceIds", res.data);
        wx.hideToast();
        wx.navigateTo({ url: '/pages/detail/detail?sourceId=' + sourceId + '&book=' + obj.book + '&bookName=' + self.data.bookInfo.title + '&bookAuthor=' + self.data.bookInfo.author + '&bookCover=' + self.data.bookInfo.cover + '&sourceLink=' + sourceLink })

      }
    });
  },

  /**
   * 追更或取消追更
   */
  addToShelfOrDeleteFromShelf: function() {
    var collectBooks = wx.getStorageSync("collect");
    if (collectBooks === '') {
      collectBooks = [];
    }
    const self = this;
    if (this.data.isInShelf) {
      collectBooks = collectBooks.filter((item) => {
        return item['_id'] !== self.data.bookId;
      })
    }else {
      collectBooks.push({
        '_id': self.data.bookId,
        title: self.data.bookInfo.title,
        author: self.data.bookInfo.author,
        cover: self.data.bookInfo.cover,
      })
    }
    self.setData({
      isInShelf: !self.data.isInShelf,
    })
    wx.setStorageSync('collect', collectBooks)
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
    // 判断是否已收藏
    const self = this;
    self.setData({
      isInShelf: false,
    })
    var collectBooks = wx.getStorageSync("collect");
    if (collectBooks !== '') {
      for (const item of collectBooks) {
        console.log(item);
        if (item._id === this.data.bookId) {
          self.setData({
            isInShelf: true,
          })
          break;
        }
      }
    }
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