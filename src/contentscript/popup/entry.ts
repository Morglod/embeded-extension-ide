import { render, h } from "preact";
import { App } from "./app";

import './styles.scss';

document.addEventListener('DOMContentLoaded', () => {
    render(h(App, {}), document.body, document.getElementById('root')!);
});