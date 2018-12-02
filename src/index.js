import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import parse from './parser';
import { visualState, structuralState } from './state';
import { renderFeed, renderArticle } from './renderers';

const labelElem = document.getElementById('label');
const urlElem = document.getElementById('url');
const addElem = document.getElementById('add');
const helpElem = document.getElementById('help');
const feedElem = document.getElementById('feeds');
const articleElem = document.getElementById('articles');
const formElem = document.getElementById('form');

watch(structuralState, 'newFeed', () => {
  feedElem.insertBefore(renderFeed(structuralState.newFeed), feedElem.firstChild);
});

watch(structuralState, 'newArticleList', () => {
  structuralState.newArticleList.forEach((article) => {
    articleElem.insertBefore(renderArticle(article), articleElem.firstChild);
  });
});

watch(visualState.addingProcess, 'inputDisabled', () => {
  urlElem.disabled = visualState.addingProcess.inputDisabled;
});

watch(visualState.addingProcess, 'submitDisabled', () => {
  addElem.disabled = visualState.addingProcess.submitDisabled;
});

watch(visualState.addingProcess, 'help', () => {
  helpElem.textContent = visualState.addingProcess.help;
  if (visualState.addingProcess.help) {
    helpElem.classList.remove('invisible');
  } else {
    helpElem.classList.add('invisible');
  }
});

watch(visualState.addingProcess, 'valid', () => {
  if (visualState.addingProcess.valid) {
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
        visualState.addingProcess.help = '';
      }
      visualState.addingProcess.inputDisabled = false;
      console.log(structuralState);
    })
    .catch((e) => {
      if (!isReload) {
        if (!e.response) {
          visualState.addingProcess.help = e.message || 'Network Error';
        } else {
          visualState.addingProcess.valid = false;
          visualState.addingProcess.help = 'invalid url';
        }
      }
      visualState.addingProcess.inputDisabled = false;
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

$('#modal').on('show.bs.modal', (event) => {
  $('.modal-body p').text($(event.relatedTarget).data('description'));
});

urlElem.addEventListener('input', () => {
  if (urlElem.value === '') {
    visualState.addingProcess.valid = true;
    visualState.addingProcess.submitDisabled = true;
    visualState.addingProcess.help = '';
  } else if (!validator.isURL(urlElem.value.toLowerCase().trim())) {
    visualState.addingProcess.valid = false;
    visualState.addingProcess.submitDisabled = true;
    visualState.addingProcess.help = 'invalid url';
  } else {
    visualState.addingProcess.valid = true;
    visualState.addingProcess.submitDisabled = false;
    visualState.addingProcess.help = '';
  }
});

formElem.addEventListener('submit', (event) => {
  event.preventDefault();
  visualState.addingProcess.submitDisabled = true;
  visualState.addingProcess.inputDisabled = true;
  visualState.addingProcess.help = 'waiting ...';
  const url = urlElem.value.toLowerCase().trim();
  if (structuralState.feeds.has(url)) {
    visualState.addingProcess.valid = false;
    visualState.addingProcess.help = 'current address has already been added';
  } else {
    getFeed(url, false);
  }
});
