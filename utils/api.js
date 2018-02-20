var HOST_URI = 'https://api.zhuishushenqi.com/';
var HOST2_URI = 'https://chapter2.zhuishushenqi.com/'

var GET_TOPICS = 'topics.json';
var GET_TOPIC_BY_ID = 'topics/';
var GET_TOPIC_ADS = 'ads.json';
var GET_TOPIC_REPLIES = '/replies.json';
var GET_SEARCH_RESULT = 'book/fuzzy-search';
var GET_BOOK_INTRO = 'book/'
var GET_BOOK_SOURCE = 'toc';
var GET_BOOK_CHAPTER_DETAIL = 'chapter/';
var GET_BOOK_RANK = 'ranking/gender';
var GET_RANK_OF_BOOKS = 'ranking/'

function obj2uri (obj) {
    return Object.keys(obj).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
    }).join('&');
}

module.exports = {
    getBookSearchResults: function(obj) {
      return HOST_URI + GET_SEARCH_RESULT + '?' + obj2uri(obj);
    },
    getBookSource: (obj) => {
      return HOST_URI + GET_BOOK_SOURCE + '?' + obj2uri(obj);
    },
    getBookChapters: (sourceId, obj) => {
      return HOST_URI + GET_BOOK_SOURCE + '/' + sourceId + '?' + obj2uri(obj);
    },
    getBookChapterDetail: (link, obj) => {
      return HOST2_URI + GET_BOOK_CHAPTER_DETAIL  + link + '?' + obj2uri(obj);
    },
    getBookIntro: function (bookId) {
      return HOST_URI + GET_BOOK_INTRO + bookId;
    },
    getBookRank: function () {
      return HOST_URI + GET_BOOK_RANK;
    },
    getRankOfBooks: function (rankId) {
      return HOST_URI + GET_RANK_OF_BOOKS + rankId;
    }
};