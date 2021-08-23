import axios from 'axios';
import $ from 'jquery';
import validator from 'validator';

import parse from './parser';

/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor":
  ["visualState", "structuralState", "urlElem"] }]
*/

const getVisualStateParams = (mode, message) => {
  const modeList = {
    submit: ['waiting ...', true, true, undefined, undefined],
    valid: ['', false, undefined, true, false],
    invalid: [message || 'invalid url', true, false, false, false],
    start: ['', true, false, true, true],
  };

  return modeList[mode];
};

const changeVisualState = (visualState, mode, message) => {
  const [help, submitDisabled, inputDisabled, valid, inputToClean] =
    getVisualStateParams(mode, message);

  visualState.addingProcess.help = help;
  visualState.addingProcess.submitDisabled = submitDisabled;
  visualState.addingProcess.inputDisabled = inputDisabled;
  visualState.addingProcess.valid = valid;
  visualState.addingProcess.inputToClean = inputToClean;
};

const handleGetFeed = (
  response,
  visualState,
  structuralState,
  url,
  isReload,
) => {
  const { feed, articles } = parse(response.data, 'application/xml');
  if (!isReload) {
    structuralState.feeds.set(url, feed);
    structuralState.newFeed = feed;
  }
  const articlesList = [];
  articles.forEach((article) => {
    const { link } = article;
    if (!isReload || !structuralState.articles.has(link)) {
      structuralState.articles.set(link, article);
      articlesList.push(article);
    }
  });
  structuralState.newArticleList = articlesList;
  if (!isReload) {
    changeVisualState(visualState, 'start');
  }
};

const getFeed = (visualState, structuralState, url, isReload = true) => {
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  axios
    .get(`${proxy}${url}`)
    .then((response) =>
      handleGetFeed(response, visualState, structuralState, url, isReload),
    )
    .catch((e) => {
      if (!isReload) {
        if (!e.response) {
          const message = e.message || 'Network Error';
          changeVisualState(visualState, 'invalid', message);
        } else {
          changeVisualState(visualState, 'invalid');
        }
      }
      console.error(e);
    });
};

const reloadFeeds = (visualState, structuralState) => {
  const reloadList = [...structuralState.feeds.keys()].map((url) =>
    getFeed(visualState, structuralState, url),
  );
  window.setTimeout(() => {
    Promise.all(reloadList)
      .then(() => reloadFeeds(visualState, structuralState))
      .catch((err) => console.error(err));
  }, 5000);
};

const validateUrl = (visualState, urlElem) => {
  if (urlElem.value === '') {
    changeVisualState(visualState, 'start');
  } else if (!validator.isURL(urlElem.value.toLowerCase().trim())) {
    changeVisualState(visualState, 'invalid');
  } else {
    changeVisualState(visualState, 'valid');
  }
};

const app = (visualState, structuralState) => {
  const urlElem = document.getElementById('url');
  const formElem = document.getElementById('form');
  const myModal = document.getElementById('modal');

  myModal.addEventListener('show.bs.modal', (event) => {
    $('.modal-body p').text($(event.relatedTarget).data('description'));
  });

  urlElem.addEventListener('input', () => validateUrl(visualState, urlElem));

  formElem.addEventListener('submit', (event) => {
    event.preventDefault();
    changeVisualState(visualState, 'submit');
    const url = urlElem.value.toLowerCase().trim();
    if (structuralState.feeds.has(url)) {
      const message = 'current address has already been added';
      changeVisualState(visualState, 'invalid', message);
    } else {
      getFeed(visualState, structuralState, url, false);
    }
  });
};

export { app, reloadFeeds };
