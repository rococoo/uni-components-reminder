import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const isValidTag = (v: unknown): v is string => {
    return typeof v === 'string' && v.includes('-');
};

const getTagName = (document: vscode.TextDocument, position: vscode.Position): string => {
    const line = document.lineAt(position.line);
    const text = line.text;
    const range = document.getWordRangeAtPosition(position);
    if (!range) {
        return "";
    }
    let start = range.start.character - 1;
    if (start < 0) {
        return "";
    }
    if (!["/", "<"].includes(text.charAt(start))) {
        return "";
    }
    const tag = text.slice(start, range.end.character);
    return tag?.replace?.(/[<\/]/, "") ?? "";
};

export const vueHoverProvider = vscode.languages.registerHoverProvider("vue", {
    provideHover: (document, position) => {
        const eltTag = getTagName(document, position);
        if (!isValidTag(eltTag)) {
            return;
        }
        const fileIn = document.fileName;
        let dirName = path.dirname(fileIn);
        const relatePath = `components/${eltTag}/${eltTag}.md`;
        let str = null;
        while (dirName) {
            const fileName = path.resolve(dirName, relatePath);
            if (fs.existsSync(fileName)) {
                str = fs.readFileSync(fileName, { encoding: 'utf-8' });
                break;
            }
            const n = path.dirname(dirName);
            if (n === dirName) {
                break;
            }
            dirName = n;
        }
        if (str) {
            return new vscode.Hover(str);
        }
    }
});