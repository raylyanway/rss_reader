import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import state from './state';
import isExists from './util';
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
  if (isExists(urlElem.value, state)) {
    state.addingProcess.valid = false;
    state.addingProcess.submitHidden = true;
    state.addingProcess.help = 'current address has already been added';
  } else {
    const domParser = new DOMParser();
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const url = urlElem.value.trim();
    axios.get(`${proxy}${url}`)
      .then((response) => {
        const data = domParser.parseFromString(response.data, 'application/xml');
        const feed = {
          title: data.querySelector('channel title').textContent,
          description: data.querySelector('channel description').textContent,
          url,
        };
        state.feeds.push(feed);
        state.newFeed = feed;
        const articlesList = [];
        data.querySelectorAll('item').forEach((item) => {
          const article = {
            title: item.querySelector('title').textContent,
            link: item.querySelector('link').textContent,
          };
          state.articles.push(article);
          articlesList.push(article);
        });
        state.newArticleList = articlesList;
        urlElem.value = '';
        state.addingProcess.submitHidden = true;
      })
      .catch((e) => {
        state.addingProcess.valid = false;
        state.addingProcess.submitHidden = true;
        state.addingProcess.help = e;
      });
  }
});
