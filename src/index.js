import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { initVisualState, initStructuralState } from './state';
import initWatchers from './watchers';
import { app, reloadFeeds } from './app';

const visualState = initVisualState();
const structuralState = initStructuralState();

initWatchers(visualState, structuralState);
app(visualState, structuralState);
reloadFeeds(visualState, structuralState);
