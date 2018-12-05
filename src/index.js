import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { initVisualState, initStructuralState } from './state';
import initWatchers from './watchers';
import { app, reloadFeeds } from './app';
import { renderForm } from './renderers';

const visualState = initVisualState();
const structuralState = initStructuralState();

renderForm(visualState);
initWatchers(visualState, structuralState);
app(visualState, structuralState);
reloadFeeds(visualState, structuralState);
