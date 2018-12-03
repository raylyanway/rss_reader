const visualState = () => ({
  addingProcess: {
    valid: true,
    submitDisabled: true,
    inputDisabled: false,
    help: '',
  },
});

const structuralState = () => ({
  newFeed: '',
  newArticleList: [],
  feeds: new Map(),
  articles: new Map(),
});

export { visualState, structuralState };
