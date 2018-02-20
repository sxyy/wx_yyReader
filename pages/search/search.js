var Api = require('../../utils/api.js');
Page({
  data: {
    inputValue: '',
    books: [],
    chapters: [],
    sourceId: '',
    sourceLink: '',
    inputShowed: false,
    isSearch: false,
    scrollViewMargin: 10,
  },

  onLoad: function (options) {
    if (wx.getStorageInfoSync('night')) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#C60000'
      })
    }else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#383838'
      })
    }
  },

  onHide:function() {
    console.log('hide')
  },

  onShow: function() {
    if (!this.data.isSearch) {
      this.setData({
        books: wx.getStorageSync('collect') === '' ? [] : wx.getStorageSync('collect')
      });
    }
    
  },

  showInput: function () {
    this.setData({
      inputShowed: true,
    });
  },

  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false,
      isSearch: false,
      books: wx.getStorageSync('collect') === '' ? [] : wx.getStorageSync('collect')
    });
  },

  

  searchBook: function() {
    this.setData({
      isSearch: true,
      books: [],
      inputShowed: true,
    })
  },

  fetchBookSource: function (bookName, bookAuthor, bookCover, obj) {
    var self = this;
    var originSourceId = '';
    const collectBooks = wx.getStorageSync('collect');
    for (const item of collectBooks) {
      if (obj.book === item['_id'] && typeof(item.sourceId) !== 'undefined') {
        originSourceId = item.sourceId;
        break;
      }
    }
    wx.request({
      url: Api.getBookSource(obj),
      success: function (res) {
        console.log(res);

        var sourceId = originSourceId === '' ? (res.data.length > 1 ? res.data[1]._id : res.data[0]._id) : originSourceId;
        var sourceLink = res.data.length > 1 ? res.data[1].link : res.data[0].link;
        console.log(sourceId);
        self.setData({
          sourceId: originSourceId === '' ? sourceId : originSourceId,
          sourceLink: sourceLink
        })
        wx.setStorageSync("sourceIds", res.data);
        wx.hideToast();
        wx.navigateTo({ url: '/pages/detail/detail?sourceId=' + sourceId + '&book=' + obj.book + '&bookName=' + bookName + '&bookAuthor=' + bookAuthor + '&bookCover=' + bookCover + '&sourceLink=' + sourceLink })
        
      }
    });
  },

  fetchData: function (obj) {
    var self = this;
    wx.request({
      url: Api.getBookSearchResults(obj),
      success: function (res) {
        console.log(res);
        res.data.books.map(book => {
          if (book.cover.indexOf("http://statics.zhuishushenqi.com/") === -1) {
            book.cover = "http://statics.zhuishushenqi.com" + book.cover;
          }
          book.shortIntro = book.shortIntro.replace(/[\r\n]/g, '');
          return book;
        })
        self.setData({
          books: res.data.books
        });
        setTimeout(function () {
          self.setData({
            hidden: true
          });
        }, 300);
      }
    });
  },

  /**
   * 点击选择书籍
   */
  didSelectCell(e) {
    var index = e.currentTarget.id;
    wx.navigateTo({ url: '/pages/bookIntro/bookIntro?bookId=' + this.data.books[index]._id})
  },


  inputTyping: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
    if (e.detail.value !== '') {
      this.fetchData({ query: e.detail.value, start: 0, limit: 20 });
    }
  },




})