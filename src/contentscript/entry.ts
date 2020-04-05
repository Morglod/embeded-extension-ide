import { applyStyles } from "./utils";
import { SiteManager } from "./site-manager";

async function main() {
    const patterns = await SiteManager.instance.listSitePatterns();
    for (const pattern of patterns) {
        SiteManager.instance.getPatternData(pattern).then(data => {
            if (data) {
                eval(data.code);
            }
        });
    }
}

main();