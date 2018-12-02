const renderFeed = (feed) => {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `<h3>${feed.title}</h3><p>${feed.description}</p>`;
  return li;
};

const renderArticle = (article) => {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `<a href="${article.link}">${article.title}</a>
    <button type="button" data-description="${article.description}" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
      Description
    </button>`;
  return li;
};

export { renderFeed, renderArticle };
