export default (url, state) => {
  let res = false;
  state.feeds.forEach((feed) => {
    if (url === feed.url) {
      res = true;
    }
  });
  return res;
};
