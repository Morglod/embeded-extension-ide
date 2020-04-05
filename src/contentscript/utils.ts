export function applyStyles(target: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
    for (const k in styles) {
        target.style[k] = styles[k] as any;
    }
}