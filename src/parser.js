export default (response, type) => {
  const domParser = new DOMParser();
  const data = domParser.parseFromString(response, type);
  if (!data.querySelector('rss')) {
    throw new Error('No RSS at this address');
  }
  const feed = {
    title: data.querySelector('channel title').textContent,
    description: data.querySelector('channel description').textContent,
  };
  const articles = [];
  data.querySelectorAll('item').forEach((item) => {
    articles.push({
      link: item.querySelector('link').textContent,
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
    });
  });
  return { feed, articles };
};
