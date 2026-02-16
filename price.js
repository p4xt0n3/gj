/* price helper: exposes window.getPrice(type, draft) 
   type: 'SFW' or 'NSFW'
   draft: '线稿' or '涂色'
   returns numeric price (without currency symbol)
*/
(function () {
  window.getPrice = function (type, draft) {
    if (!type || !draft) return null;
    // SFW: 线稿 3￥, 涂色 5￥
    // NSFW: 线稿 4￥, 涂色 6￥
    if (type === 'SFW') {
      if (draft === '线稿') return 3;
      if (draft === '涂色') return 5;
    } else if (type === 'NSFW') {
      if (draft === '线稿') return 4;
      if (draft === '涂色') return 6;
    }
    return null;
  };
})();