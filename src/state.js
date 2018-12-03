const initVisualState = () => ({
  addingProcess: {
    valid: true,
    submitDisabled: true,
    inputDisabled: false,
    inputToClean: false,
    help: '',
  },
});

const initStructuralState = () => ({
  newFeed: '',
  newArticleList: [],
  feeds: new Map(),
  articles: new Map(),
});

export { initVisualState, initStructuralState };
