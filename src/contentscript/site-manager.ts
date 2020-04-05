// type StoredData = {
//     // site href pattern keys
//     scriptedSitePatterns: string[],

//     [script_ + 'script pattern from scriptSites']: { code: string },
// };

type StoredData = {
    scriptedSitePatterns: string[],
} & SiteScripts;

type SiteScripts = {
    // [script_ + 'script pattern from scriptSites']
    [k: string]: SiteScriptData
}

type SiteScriptData = {
    code: string
}

async function getScriptedSitePatterns(): Promise<string[]> {
    return new Promise(resolve => {
        chrome.storage.sync.get('scriptedSitePatterns', items => {
            resolve(items.scriptedSitePatterns || []);
        });
    });
}

async function getSiteData(pattern: string): Promise<SiteScriptData|null> {
    return new Promise(resolve => {
        chrome.storage.sync.get('script_' + pattern, items => {
            resolve(items['script_' + pattern] || null);
        });
    });
}

async function updateScriptedSitePatterns(data: {
    [sitePattern: string]: SiteScriptData
}) {
    const keys = await getScriptedSitePatterns();
    const keySet = new Set(keys);
    for (const k of Object.keys(data)) {
        keySet.add(k);
    }

    const storedDataUpdate: StoredData = {
        scriptedSitePatterns: Array.from(keySet),
    } as any;

    return new Promise(resolve => {
        chrome.storage.sync.set(
            Object.entries(data).reduce((sum, [pattern, scriptData]) => (
                Object.assign(sum, {
                    ['script_' + pattern]: scriptData
                })
            ),
            storedDataUpdate
        ), () => {
            resolve();
        });
    });
}

async function deleteScriptedSitePatterns(patterns: string[]) {
    const keys = await getScriptedSitePatterns();

    const keySet = new Set(keys);
    for (const k of patterns) {
        keySet.delete(k);
    }

    return Promise.all([
        new Promise(resolve => {
            chrome.storage.sync.remove((
                patterns.map(x => ('script_' + x))
            ), () => {
                resolve();
            });
        }),
        new Promise(resolve => {
            chrome.storage.sync.set({
                scriptedSitePatterns: Array.from(keySet),
            }, () => {
                resolve();
            })
        }),
    ])
}

export const defaultSiteScript = (sitePattern: string) => `
if (new RegExp(${JSON.stringify(sitePattern)}).test(location.href)) {
    main();
}

function main() {
    document.body.style.background = 'red';
}
`;

export class SiteManager {
    private constructor() {}
    private static _instance: SiteManager;

    static get instance() {
        if (!SiteManager._instance) SiteManager._instance = new SiteManager;
        return SiteManager._instance;
    }

    listSitePatterns = () => {
        return getScriptedSitePatterns();
    }

    partialUpdateSitePatterns = (data: {
        [sitePattern: string]: SiteScriptData
    }) => {
        return updateScriptedSitePatterns(data);
    };

    createPattern = (pattern: string, initialCode: string) => {
        return updateScriptedSitePatterns({
            [pattern]: {
                code: initialCode
            },
        });
    };

    getPatternData = (pattern: string) => {
        return getSiteData(pattern);
    };

    deletePatterns = (patterns: string[]) => {
        return deleteScriptedSitePatterns(patterns);
    };

    renamePattern = async (oldName: string, newName: string) => {
        const olddata = await this.getPatternData(oldName);
        await this.deletePatterns([ oldName ]);
        return this.createPattern(newName, olddata!.code);
    };
}