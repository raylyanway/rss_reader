import { watch } from 'melanke-watchjs';
import { renderFeed, renderArticle, renderForm } from './renderers';

export default (visualState, structuralState) => {
  const feedElem = document.getElementById('feeds');
  const articleElem = document.getElementById('articles');

  watch(structuralState, 'newFeed', () => {
    feedElem.insertBefore(renderFeed(structuralState.newFeed), feedElem.firstChild);
  });

  watch(structuralState, 'newArticleList', () => {
    structuralState.newArticleList.forEach((article) => {
      articleElem.insertBefore(renderArticle(article), articleElem.firstChild);
    });
  });

  watch(visualState.addingProcess, () => renderForm(visualState));
};
