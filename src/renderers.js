const renderFeed = (feed) => {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `<h3>${feed.title}</h3><br><p>${feed.description}</p>`;
  return li;
};

const renderArticle = (article) => {
  const a = document.createElement('a');
  a.className = 'list-group-item list-group-item-action';
  a.href = article.link;
  a.textContent = article.title;
  return a;
};

export { renderFeed, renderArticle };
