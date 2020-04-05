import { h, Component, Fragment } from 'preact';

import './styles.scss';

export type SitePatternLabelProps = {
    sitePattern: string,
    onDelete: () => any,
    onSave: (newPattern: string) => any,
    onClick: () => any,
};

export class SitePatternLabel extends Component<SitePatternLabelProps> {
    state = {
        value: this.props.sitePattern,
        editMode: false,
    };

    handleEditClick = (e: MouseEvent) => {
        e.stopPropagation();
        this.setState({ editMode: true })
    };
    handleCancelEditClick = (e: MouseEvent) => {
        e.stopPropagation();
        this.setState({ editMode: false, value: this.props.sitePattern });
    };
    handleSaveEditClick = (e: MouseEvent) => {
        e.stopPropagation();
        this.setState({ editMode: false });
        this.props.onSave(this.state.value);
    };

    handleInputChange = (e: any) => {
        this.setState({ value: e.target.value });
    };

    render() {
        return (
            <div
                className={"code-editor-workspace__model --pattern"}
                title={this.props.sitePattern}
                onClick={this.props.onClick}
            >
                {!this.state.editMode && (
                    <Fragment>
                        <div
                            className="code-editor-workspace__small-btn"
                            onClick={this.props.onDelete}
                        >🗑️</div>
                        <div
                            className="code-editor-workspace__small-btn"
                            onClick={this.handleEditClick}
                        >✏️</div>
                        "{this.state.value}"
                    </Fragment>
                )}
                {this.state.editMode && (
                    <Fragment>
                        <div
                            className="code-editor-workspace__small-btn"
                            onClick={this.handleCancelEditClick}
                        >❌</div>
                        <div
                            className="code-editor-workspace__small-btn"
                            onClick={this.handleSaveEditClick}
                        >✔️</div>
                        <input onChange={this.handleInputChange} value={this.state.value} />
                    </Fragment>
                )}
            </div>
        )
    }
}