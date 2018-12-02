const isExists = (url, state) => {
  let res = false;
  state.feeds.forEach((feed) => {
    if (url === feed.url) {
      res = true;
    }
  });
  return res;
};

const isArticleExists = (link, state) => {
  let res = false;
  state.articles.forEach((article) => {
    if (link === article.link) {
      res = true;
    }
  });
  return res;
};

export { isExists, isArticleExists };
