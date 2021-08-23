import axios from 'axios';
import $ from 'jquery';
import validator from 'validator';

import parse from './parser';

/* eslint no-param-reassign:
  ["error", { "props": true, "ignorePropertyModificationsFor":
  ["visualState", "structuralState", "urlElem"] }]
*/

const changeVisualState = (visualState, mode, message) => {
  switch (mode) {
    case 'submit':
      visualState.addingProcess.submitDisabled = true;
      visualState.addingProcess.inputDisabled = true;
      visualState.addingProcess.help = 'waiting ...';
      break;
    case 'valid':
      visualState.addingProcess.valid = true;
      visualState.addingProcess.submitDisabled = false;
      visualState.addingProcess.help = '';
      visualState.addingProcess.inputToClean = false;
      break;
    case 'invalid':
      visualState.addingProcess.valid = false;
      visualState.addingProcess.submitDisabled = true;
      visualState.addingProcess.help = message || 'invalid url';
      visualState.addingProcess.inputDisabled = false;
      visualState.addingProcess.inputToClean = false;
      break;
    case 'start':
      visualState.addingProcess.valid = true;
      visualState.addingProcess.submitDisabled = true;
      visualState.addingProcess.help = '';
      visualState.addingProcess.inputDisabled = false;
      visualState.addingProcess.inputToClean = true;
      break;
    default:
  }
};

const getFeed = (visualState, structuralState, url, isReload = true) => {
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  axios
    .get(`${proxy}${url}`)
    .then((response) => {
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
      console.log(structuralState);
    })
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
