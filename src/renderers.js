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
    <button type="button" data-description="${article.description}" class="btn btn-primary" data-toggle="modal" data-target="#modal">
      Description
    </button>`;
  return li;
};

const renderForm = (visualState) => {
  const labelElem = document.getElementById('label');
  const urlElem = document.getElementById('url');
  const addElem = document.getElementById('add');
  const helpElem = document.getElementById('help');

  urlElem.disabled = visualState.addingProcess.inputDisabled;
  addElem.disabled = visualState.addingProcess.submitDisabled;
  helpElem.textContent = visualState.addingProcess.help;

  if (visualState.addingProcess.inputToClean) {
    urlElem.value = '';
  }

  if (visualState.addingProcess.help) {
    helpElem.classList.remove('invisible');
  } else {
    helpElem.classList.add('invisible');
  }

  if (visualState.addingProcess.valid) {
    urlElem.classList.remove('is-invalid');
    urlElem.classList.add('is-valid');
    labelElem.classList.remove('text-danger');
    labelElem.classList.add('text-success');
  } else {
    urlElem.classList.remove('is-valid');
    urlElem.classList.add('is-invalid');
    labelElem.classList.remove('text-success');
    labelElem.classList.add('text-danger');
  }
};

export { renderFeed, renderArticle, renderForm };
