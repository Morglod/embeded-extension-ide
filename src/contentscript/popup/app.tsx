import { h, Component, createRef } from 'preact';

import './styles.scss';
import { MonacoEditor } from '../runtime-editor';

export class App extends Component {
    render() {
        return (
            <MonacoEditor />
        )
    }
}