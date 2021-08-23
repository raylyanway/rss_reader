const renderFeed = (feed) => {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `<h3>${feed.title}</h3><p>${feed.description}</p>`;
  return li;
};

const renderArticle = (article) => {
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.innerHTML = `<div class="mb-2"><a href="${article.link}">${article.title}</a></div>
    <button type="button" data-description="${article.description}" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal">
      Description
    </button>`;
  return li;
};

const toggleClasses = (params) => {
  const labelElem = document.getElementById('label');
  const urlElem = document.getElementById('url');

  urlElem.classList.remove(params[0]);
  urlElem.classList.add(params[1]);
  labelElem.classList.remove(params[2]);
  labelElem.classList.add(params[3]);
};

const renderForm = (visualState) => {
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

  const params = visualState.addingProcess.valid
    ? ['is-invalid', 'is-valid', 'text-danger', 'text-success']
    : ['is-valid', 'is-invalid', 'text-success', 'text-danger'];

  toggleClasses(params);
};

export { renderFeed, renderArticle, renderForm };
