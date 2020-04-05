import { h, Component, createRef } from 'preact';

import type monacoEditor from 'monaco-editor';
declare const monaco: typeof monacoEditor;

import runtimeTypes from './runtime-types';

import './styles.scss';
import { SiteManager, defaultSiteScript } from '../site-manager';
import { SitePatternLabel } from './site-pattern-label';

const initialCode = `
// open dev tools by right clicking white space in this popup and click 'inspect element'
// then go console

function printTabs() {
	chrome.tabs.getAllInWindow(tabs => {
		console.log(JSON.stringify(tabs.map(x => x.url)))
	})
}

function openTabs(tabUrls) {
	for (const tabUrl of tabUrls) {
		chrome.tabs.create({
			url: tabUrl
		})
	}
}

// printTabs();
// openTabs([ 'https://google.com' ]);
`;

function getTemplateCode() {
    return localStorage.getItem('__MORGLOD_EXT_CODE_EDITOR_TEMPLATE_') || initialCode;
}

function setTemplateCode(code: string) {
    return localStorage.setItem('__MORGLOD_EXT_CODE_EDITOR_TEMPLATE_', code);
}

function getTempCode() {
    return localStorage.getItem('__MORGLOD_EXT_CODE_EDITOR_TEMP_') || getTemplateCode();
}

function setTempCode(code: string) {
    return localStorage.setItem('__MORGLOD_EXT_CODE_EDITOR_TEMP_', code);
}

export class MonacoEditor extends Component {
    state = {
        models: [] as {
            model: monacoEditor.editor.ITextModel,
            name: string
        }[],
        sitePatterns: [] as string[],
        selectedModel: null as monacoEditor.editor.ITextModel|null,
        interactiveModel: null as monacoEditor.editor.ITextModel|null,
    };

    componentWillMount() {
        this.refreshSitePatternList();
    }

    componentDidMount() {
        for (const [path,code] of Object.entries(runtimeTypes)) {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code, path.replace('node_modules/@types/', ''));
            monaco.languages.typescript.javascriptDefaults.addExtraLib(code, path.replace('node_modules/@types/', ''));
        }

        const monacoModel = monaco.editor.createModel(getTempCode(), 'javascript');

        const editor = monaco.editor.create(this.$div.current, {
            model: monacoModel,
        });

        this.$editor = editor;
        const currentModel = this.$editor.getModel()!;

        this.setState({
            models: [
                {
                    model: currentModel!,
                    name: 'interactive'
                }
            ],
            selectedModel: currentModel,
            interactiveModel: currentModel,
        });
    }

    refreshSitePatternList = () => {
        return SiteManager.instance.listSitePatterns().then(patterns => {
            this.setState({
                sitePatterns: patterns
            });
        });
    };

    $editor!: monacoEditor.editor.IStandaloneCodeEditor;
    $div = createRef();

    getCurrentSelectedPattern = () => {
        return this.state.models.find(x => x.model === this.state.selectedModel)?.name;
    };

    handleRun = () => {
        const code = this.$editor.getValue();
        setTempCode(code);

        if (this.state.selectedModel === this.state.interactiveModel) {
            eval(code);
        } else {
            chrome.tabs.executeScript({
                code: code,
            });
        }
    };
    handleSaveCodeAsInitial = () => {
        const code = this.$editor.getValue();
        setTemplateCode(code);
    };
    handleResetCodeToTemplate = () => {
        const code = getTemplateCode();
        this.$editor.setValue(code);
    };
    handleResetTemplateToInital = () => {
        setTemplateCode(initialCode);
    };

    handleSelectModel = (model: monacoEditor.editor.ITextModel) => {
        this.$editor.setModel(model);
        this.setState({ selectedModel: model })
    };

    handleCreateSitePattern = async () => {
        return new Promise(resolve => {
            chrome.tabs.getSelected(async tab => {
                const pattern = tab.url + '_' + Math.round(Math.random() * 999).toString(16);
                await SiteManager.instance.createPattern(pattern, defaultSiteScript(pattern));
                this.refreshSitePatternList().then(() => resolve());
            });
        });
    };

    handleDeleteSitePattern = async (pattern: string) => {
        await SiteManager.instance.deletePatterns([pattern]);
        return this.refreshSitePatternList();
    };

    handleSaveSitePattern = async (oldName: string, newPattern: string) => {
        await SiteManager.instance.renamePattern(oldName, newPattern);
        return this.refreshSitePatternList();
    };

    handleSitePatternClick = async (pattern: string) => {
        let opennedModel = this.state.models.find(x => x.name === pattern);
        if (!opennedModel) {
            const data = await SiteManager.instance.getPatternData(pattern);
            const monacoModel = monaco.editor.createModel(data!.code, 'javascript');
            opennedModel = {
                name: pattern,
                model: monacoModel
            };
            this.setState({
                models: [
                    ...this.state.models,
                    opennedModel,
                ]
            })
        }

        this.$editor.setModel(opennedModel.model);
        this.setState({
            selectedModel: opennedModel.model,
        });
    };

    handleSavePatternCodeClick = async () => {
        const code = this.$editor.getValue();
        const selectedPattern = this.getCurrentSelectedPattern()!;

        await SiteManager.instance.partialUpdateSitePatterns({
            [selectedPattern]: { code: code }
        });

        this.refreshSitePatternList();
    };

    render() {
        return (
            <div>
                <div>
                    <button onClick={this.handleRun}>Run</button>
                    {this.state.selectedModel !== this.state.interactiveModel && (
                        <button onClick={this.handleSavePatternCodeClick}>Save pattern</button>
                    )}
                    <span style="float:right">
                        <button onClick={this.handleSaveCodeAsInitial}>Save code as template</button>
                        <button onClick={this.handleResetCodeToTemplate}>Reset code to template</button>
                        <button onClick={this.handleResetTemplateToInital}>Reset template to initial</button>
                    </span>
                </div>
                <div class="code-editor-workspace">
                    <div class="code-editor-workspace__sidebar">
                        {this.state.models.map(model => (
                            <div
                                className={"code-editor-workspace__model " + (model.model === this.state.selectedModel ? '--selected ' : '')}
                                onClick={() => this.handleSelectModel(model.model)}
                                key={model.model.id}
                            >
                                {model.name}
                            </div>
                        ))}
                        {this.state.sitePatterns.map(sitePattern => (
                            <SitePatternLabel
                                sitePattern={sitePattern}
                                onDelete={() => this.handleDeleteSitePattern(sitePattern)}
                                onSave={(newName) => this.handleSaveSitePattern(sitePattern, newName)}
                                onClick={() => this.handleSitePatternClick(sitePattern)}
                            />
                        ))}
                        <div
                            className={"code-editor-workspace__model --btn"}
                            onClick={this.handleCreateSitePattern}
                        >
                            Create site pattern
                        </div>
                    </div>
                    <div
                        ref={this.$div}
                        className="code-editor"
                    />
                </div>
            </div>
        )
    }
}