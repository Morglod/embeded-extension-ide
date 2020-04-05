export const text = `
import { Entry, Log } from 'har-format';

declare global {
    export type HARFormatEntry = Entry;
    export type HARFormatLog = Log;
}
`;

export const path = 'node_modules/@types/chrome/har-format/index.d.ts';