import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator';
import axios from 'axios';
import parse from './parser';
import { initVisualState, initStructuralState } from './state';
import initWatchers from './watchers';

const visualState = initVisualState();
const structuralState = initStructuralState();
initWatchers(visualState, structuralState);

const changeVisualState = (mode, message) => {
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
      break;
    case 'invalid':
      visualState.addingProcess.valid = false;
      visualState.addingProcess.submitDisabled = true;
      visualState.addingProcess.help = message || 'invalid url';
      visualState.addingProcess.inputDisabled = false;
      break;
    case 'start':
      visualState.addingProcess.valid = true;
      visualState.addingProcess.submitDisabled = true;
      visualState.addingProcess.help = '';
      visualState.addingProcess.inputDisabled = false;
      break;
    default:
  }
};

const urlElem = document.getElementById('url');
const formElem = document.getElementById('form');

const getFeed = (url, isReload = true) => {
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  axios.get(`${proxy}${url}`)
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
        urlElem.value = '';
        changeVisualState('start');
      }
    })
    .catch((e) => {
      if (!isReload) {
        if (!e.response) {
          const message = e.message || 'Network Error';
          changeVisualState('invalid', message);
        } else {
          changeVisualState('invalid');
        }
      }
      console.error(e);
    });
};

const reloadFeeds = () => {
  const reloadList = [...structuralState.feeds.keys()].map(url => getFeed(url));
  window.setTimeout(() => {
    Promise.all(reloadList)
      .then(reloadFeeds)
      .catch(err => console.error(err));
  }, 5000);
};

reloadFeeds();

const validateUrl = () => {
  if (urlElem.value === '') {
    changeVisualState('start');
  } else if (!validator.isURL(urlElem.value.toLowerCase().trim())) {
    changeVisualState('invalid');
  } else {
    changeVisualState('valid');
  }
};

$('#exampleModal').on('show.bs.modal', (event) => {
  $('.modal-body p').text($(event.relatedTarget).data('description'));
});

urlElem.addEventListener('input', validateUrl);

formElem.addEventListener('submit', (event) => {
  event.preventDefault();
  changeVisualState('submit');
  const url = urlElem.value.toLowerCase().trim();
  if (structuralState.feeds.has(url)) {
    changeVisualState('invalid', 'current address has already been added');
  } else {
    getFeed(url, false);
  }
});
