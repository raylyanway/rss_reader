import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import state from './state';
import { isExists, isArticleExists } from './util';
import { renderFeed, renderArticle } from './renderers';

const labelElem = document.getElementById('label');
const urlElem = document.getElementById('url');
const addElem = document.getElementById('add');
const helpElem = document.getElementById('help');
const feedElem = document.getElementById('feeds');
const articleElem = document.getElementById('articles');

watch(state, 'newFeed', () => {
  feedElem.insertBefore(renderFeed(state.newFeed), feedElem.firstChild);
});

watch(state, 'newArticleList', () => {
  state.newArticleList.forEach((article) => {
    articleElem.insertBefore(renderArticle(article), articleElem.firstChild);
  });
});

watch(state.addingProcess, 'submitHidden', () => {
  if (state.addingProcess.submitHidden) {
    addElem.classList.add('invisible');
  } else {
    addElem.classList.remove('invisible');
  }
});

watch(state.addingProcess, 'valid', () => {
  helpElem.textContent = state.addingProcess.help;

  if (state.addingProcess.valid) {
    urlElem.classList.remove('is-invalid');
    urlElem.classList.add('is-valid');
    labelElem.classList.remove('text-danger');
    labelElem.classList.add('text-success');
    helpElem.classList.add('invisible');
  } else {
    urlElem.classList.remove('is-valid');
    urlElem.classList.add('is-invalid');
    labelElem.classList.remove('text-success');
    labelElem.classList.add('text-danger');
    helpElem.classList.remove('invisible');
  }
});

$('#exampleModal').on('show.bs.modal', (event) => {
  $('.modal-body p').text($(event.relatedTarget).data('description'));
});

const getFeed = (url, isReload = true) => {
  const domParser = new DOMParser();
  const proxy = 'https://cors-anywhere.herokuapp.com/';
  axios.get(`${proxy}${url}`)
    .then((response) => {
      const data = domParser.parseFromString(response.data, 'application/xml');
      if (!isReload) {
        const feed = {
          title: data.querySelector('channel title').textContent,
          description: data.querySelector('channel description').textContent,
          url,
        };
        state.feeds.push(feed);
        state.newFeed = feed;
      }
      const articlesList = [];
      data.querySelectorAll('item').forEach((item) => {
        const link = item.querySelector('link').textContent;
        const article = {
          title: item.querySelector('title').textContent,
          link,
          description: item.querySelector('description').textContent,
        };
        if (!isReload || !isArticleExists(link, state)) {
          state.articles.push(article);
          articlesList.push(article);
        }
      });
      state.newArticleList = articlesList;
      if (!isReload) {
        urlElem.value = '';
        state.addingProcess.submitHidden = true;
      }
    })
    .catch((e) => {
      state.addingProcess.valid = false;
      state.addingProcess.submitHidden = true;
      state.addingProcess.help = e;
    });
};

const reloadFeeds = () => {
  const reloadList = state.feeds.map(feed => getFeed(feed.url));
  window.setTimeout(() => {
    Promise.all(reloadList)
      .then(() => reloadFeeds())
      .catch(err => console.error(err));
  }, 5000);
};

reloadFeeds();

urlElem.addEventListener('keyup', () => {
  if (urlElem.value === '') {
    state.addingProcess.valid = true;
    state.addingProcess.submitHidden = true;
    state.addingProcess.help = '';
  } else if (!validator.isURL(urlElem.value.toLowerCase().trim())) {
    state.addingProcess.valid = false;
    state.addingProcess.submitHidden = true;
    state.addingProcess.help = 'invalid url';
  } else {
    state.addingProcess.valid = true;
    state.addingProcess.submitHidden = false;
    state.addingProcess.help = '';
  }
});

addElem.addEventListener('click', () => {
  if (isExists(urlElem.value.toLowerCase().trim(), state)) {
    state.addingProcess.valid = false;
    state.addingProcess.submitHidden = true;
    state.addingProcess.help = 'current address has already been added';
  } else {
    getFeed(urlElem.value.toLowerCase().trim(), false);
  }
});
