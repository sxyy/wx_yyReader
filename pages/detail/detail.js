// detail.js
var Api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sourceId: '',
    sourceLink: '',
    book: '',
    bookName: '',
    bookAuthor: '',
    bookCover: '',
    content: '',
    title: '',
    nextContent: '',
    nextTitle: '',
    chapterIndex: 0,
    toView: '',
    showModalStatus: false,
    modalFlag: true,
    showModalStatus1: false,
    chapters: [],
    toChapterView: '',
    night: false,
    chapterStatus: true,
    showSettingStatus: false,
    bookSourceStatus: false,
    collect: false,
  },

  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    setTimeout(() => {
      if (currentStatu === 'open') {
        this.setData({
          toChapterView: 'chapter-' + (this.data.chapterIndex - 5),
        })
      }
    }, 500)
    this.setData({
      showModalStatus: false,
    })
    this.util(currentStatu)
  },

  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例
    var animation = wx.createAnimation({
      duration: 200, //动画时长
      timingFunction: "linear", //线性
      delay: 0 //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;

    // 第3步：执行第一组动画
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function () {
      // 执行第二组动画
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })

      //关闭
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus1: false
          }
        );
      }
    }.bind(this), 200)

    // 显示
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus1: true
        }
      );
    }
  },

  /**
   * 关闭目录
   */
  closeFolder: function () {
    this.setData(
      {
        showModalStatus1: false
      }
    );
  },

  /**
   * 初始化章节
   */
  initChapterContent: function (chapters, chapterIndex) {
    var self = this;
    wx.request({
      url: Api.getBookChapterDetail(encodeURIComponent(chapters[chapterIndex].link), { k: '2124b73d7e2e1945', t: 1468223717 }),
      success: (res => {
        console.log(res);
        self.setData({
          content: res.statusCode === 200 ? (res.data.chapter.body.indexOf('最新版追书') !== -1 ? res.data.chapter.cpContent.split('\n') : res.data.chapter.body.split('\n')) : '内容无法查看',
          title: res.statusCode === 200 ? res.data.chapter.title : '内容无法查看',
          chapterStatus: false,
        }, () => {
          wx.hideToast();
          self.setData({
            toView: 'top'
          })
        })
        
      }),
      fail: (() => {
        wx.showToast({
          title: '网络异常',
          icon: 'loading',
          duration: 2000
        })
      })
    })

    wx.request({
      url: Api.getBookChapterDetail(encodeURIComponent(chapters[chapterIndex + 1].link), { k: '2124b73d7e2e1945', t: 1468223717 }),
      success: (res => {
        console.log(res);
        self.setData({
          chapterIndex: chapterIndex + 1,
          nextContent: res.statusCode === 200 ? (res.data.chapter.body.indexOf('最新版追书') !== -1 ? res.data.chapter.cpContent.split('\n') : res.data.chapter.body.split('\n')) : '内容无法查看',
          nextTitle: res.statusCode === 200 ? res.data.chapter.title : '内容无法查看',
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad');
    var self = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
    var sourceId = options.sourceId;
    var sourceLink = options.sourceLink;
    var book = options.book;
    var value = wx.getStorageSync(book)
    var collectBooks = wx.getStorageSync("collect");
    if (collectBooks !== '') {
      collectBooks.map(item => {
        if (item._id === book) {
          self.setData({
            collect: true,
          })
          return;
        }
      })
    }
    var fontSize = wx.getStorageSync('fontSize');
    if (fontSize === '') {
      wx.setStorage({
        key: 'fontSize',
        data: 16,
      });
      // 初始化的时候同时也需要设置字体大小到当前页面
      self.setData({
        fontSize: 16
      })
    } else {
      self.setData({
        fontSize: fontSize
      })
    }

    var night = wx.getStorageSync('night');
    if (night === '' || night === false) {
      this.setData({
        night: false,
      })
      this.setNavigationBar(false);
    } else {
      this.setData({
        night: true,
      })
      this.setNavigationBar(true);
    }

    this.setData({
      sourceId: sourceId,
      sourceLink: sourceLink,
      book: book,
      bookName: options.bookName,
      bookAuthor: decodeURIComponent(options.bookAuthor),
      bookCover: options.bookCover,
      chapterIndex: wx.getStorageSync(book) === '' ? 0 : wx.getStorageSync(book),
      sourceIds: wx.getStorageSync('sourceIds')
    });
    wx.setNavigationBarTitle({
      title: decodeURIComponent(options.bookName)
    })
    wx.request({
      url: Api.getBookChapters(sourceId, { view: 'chapters' }),
      success: (res) => {
        self.setData({
          chapters: res.data.chapters
        })

        self.initChapterContent(res.data.chapters, wx.getStorageSync(book) === '' ? 0 : wx.getStorageSync(book));
      }
    })
  },

  /**
   * 设置导航栏
   */
  setNavigationBar: function (flag) {
    if (flag) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#383838'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#C60000'
      })
    }
  },

  /**
   * 显示书源
   */
  openBookSource: function () {
    this.setData({
      bookSourceStatus: true,
      showModalStatus: false,
    })
  },

  /**
   * 关闭书源的显示
   */
  closeBookSource: function () {
    this.setData({
      bookSourceStatus: false,
    })
  },

  /**
   * 选择书源
   */
  selectSource: function (e) {
    const id = e.currentTarget.id;
    const self = this;
    if (id !== this.data.sourceId) {
      this.setData({
        sourceId: id,
        bookSourceStatus: false,
      })
      wx.showToast({
        title: '加载中',
        icon: 'loading'
      });
      wx.request({
        url: Api.getBookChapters(id, { view: 'chapters' }),
        success: (res) => {
          self.setData({
            chapters: res.data.chapters
          })

          self.initChapterContent(res.data.chapters, 0);
        }
      })

      //如果书籍已收藏需要更新书源
      var collectBooks = wx.getStorageSync('collect');
      for (const item of collectBooks) {
        if (item['_id'] === this.data.book) {
          item.sourceId = id;
          break
        }
      }
      wx.setStorageSync('collect', collectBooks)
    }


  },

  /**
   *上一章节 
   */
  lastChapter: function () {
    var self = this;
    if (this.data.chapterIndex !== 1) {
      wx.showToast({
        title: '加载中',
        icon: 'loading'
      });
      wx.request({
        url: Api.getBookChapterDetail(encodeURIComponent(self.data.chapters[self.data.chapterIndex - 2].link), { k: '2124b73d7e2e1945', t: 1468223717 }),
        success: (res => {
          self.setData({
            chapterIndex: self.data.chapterIndex - 1,
            nextContent: self.data.content,
            nextTitle: self.data.title,
          })
          var content = res.data.chapter.body.indexOf('最新版追书') !== -1 ? res.data.chapter.cpContent.split('\n') : res.data.chapter.body.split('\n');
          self.setData({
            content: content,
            title: res.data.chapter.title,
          }, () => {
            self.setData({
              toView: 'top'
            })
            wx.hideToast();
          })
          if (self.data.collect) {
            wx.setStorage({
              key: self.data.book,
              data: self.data.chapterIndex - 1,
            })
          }
        }),
        fail: (() => {
          wx.showToast({
            title: '网络异常',
            icon: 'fail',
            duration: 2000
          })
        })
      })
    }

  },

  /**
   * 下一章节
   */
  nextChapter: function () {
    var self = this;
    if ((this.data.chapters.length - 1) > this.data.chapterIndex) {
      if (self.data.nextContent.join(',') !== self.data.content.join(',')) {
        self.setData({
          content: self.data.nextContent,
          title: self.data.nextTitle,
        }, () => {
          self.setData({
            toView: 'top'
          })
        })
        wx.request({
          url: Api.getBookChapterDetail(encodeURIComponent(self.data.chapters[self.data.chapterIndex + 1].link), { k: '2124b73d7e2e1945', t: 1468223717 }),
          success: (res => {
            self.setData({
              chapterIndex: self.data.chapterIndex + 1,
              nextContent: res.data.chapter.body.indexOf('最新版追书') !== -1 ? res.data.chapter.cpContent.split('\n') : res.data.chapter.body.split('\n'),
              nextTitle: res.data.chapter.title,
            })
            if (self.data.collect) {
              wx.setStorage({
                key: self.data.book,
                data: self.data.chapterIndex - 1,
              })
            }
          })
        })
      } else {
        console.log('重新进行请求下一章内容')
        wx.showToast({
          title: '加载中',
          icon: 'loading'
        });
        self.initChapterContent(self.data.chapters, self.data.chapterIndex + 1);
        self.setData({
          chapterIndex: self.data.chapterIndex,
        })
      }

    }

  },

  /**
   * 选择章节
   */
  selectChapter(e) {
    var chpaterIndex = parseInt(e.currentTarget.id.split('-')[1]);
    //只有收藏栏以后才会记录读的章节
    if (this.data.collect) {
      wx.setStorage({
        key: this.data.book,
        data: chpaterIndex,
      })
    }
    this.setData({
      chapterStatus: true,
    })
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
    this.initChapterContent(this.data.chapters, chpaterIndex);
    this.powerDrawer(e);
  },

  /**
   * 收藏或取消收藏书籍
   */
  addToShelfOrDeleteFromShelf: function() {
    var self = this;
    var collectBooks = wx.getStorageSync("collect");
    if (this.data.collect) {
      collectBooks = collectBooks.filter(item => {
        return item._id !== this.data.book;
      })
    }else {
      if (collectBooks === '') {
        collectBooks = [{
          _id: self.data.book,
          title: self.data.bookName,
          author: self.data.bookAuthor,
          cover: self.data.bookCover,
          sourceId: self.data.sourceId
        }]
      }else {
        collectBooks.push({
          _id: self.data.book,
          title: self.data.bookName,
          author: self.data.bookAuthor,
          cover: self.data.bookCover,
          sourceId: self.data.sourceId
        })
      }
    }
    wx.setStorage({
      key: 'collect',
      data: collectBooks,
    })
    this.setData({
      collect: !this.data.collect,
    })
  },


  /**
   * 显示设置项动画
   */
  showSettingModal: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation;
    animation.translateY(300).step();
    this.setData({
      animationData2: animation.export(),
      showSettingStatus: true,
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData2: animation.export()
      })
    }.bind(this), 200)
  },
  /**
   * 显示底部按钮
   */
  showModal: function (e) {
    if (e.currentTarget.id === "content") {
      this.setData({

        showModalStatus: true,
      })
    } else {
      this.setData({
        showSettingStatus: true,
      })
    }
  },

  hideModal: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    var animation2 = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    animation.translateY(-300).step()
    var animationDataTemp = animation.export();

    this.setData({
      animationData: animationDataTemp,
      animationData2: animationDataTemp,
    })
    setTimeout(function () {
      animation.translateY(0).step()
      animationDataTemp = animation.export();
      this.setData({
        animationData: animationDataTemp,
        animationData2: animationDataTemp,
        showModalStatus: false,
        showSettingStatus: false,
      })
    }.bind(this), 200)
  },

  /**
   * 切换夜间模式
   */
  changeDayMode() {
    console.log(this.data.night);
    this.setNavigationBar(!this.data.night)
    wx.setStorageSync('night', !this.data.night);
    this.setData({
      night: !this.data.night
    })


  },


  fontChangeSmall: function (e) {
    console.log(this.data.fontSize);
    if (this.data.fontSize >= 14) {
      wx.setStorage({
        key: 'fontSize',
        data: this.data.fontSize - 1,
      })
      this.setData({
        fontSize: this.data.fontSize - 1,
      })

    }
  },

  /**
   * 字体变大
   */
  fontChangeBig: function (e) {
    console.log(this.data.fontSize);
    if (this.data.fontSize <= 18) {
      wx.setStorage({
        key: 'fontSize',
        data: this.data.fontSize + 1,
      })
      this.setData({
        fontSize: this.data.fontSize + 1,
      })
    }
  },

  lower() {
    // this.nextChapter();
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
    var collectBooks = wx.getStorageSync("collect");
    var self = this;
    var bookIndexTemp = -1;
    for (var index in collectBooks) {
      if (collectBooks[index]._id === self.data.book) {
        collectBooks[index].recentBookRead = self.data.chapters[self.data.chapterIndex - 1].title;
        break;
      }
    }
    wx.setStorageSync('collect', collectBooks);
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