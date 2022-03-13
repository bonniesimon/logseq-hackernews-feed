import "@logseq/libs";
import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin";
import "virtual:windi.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { logseq as PL } from "../package.json";
import { loadHackerNewsData } from "./utils";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);
const magicKey = `__${PL.id}__loaded__`;

const isDev = process.env.NODE_ENV === "development";

const delay = (t = 100) => new Promise(r => setTimeout(r, t));


const main = (baseInfo: LSPluginBaseInfo) => {
    const pluginId = logseq.baseInfo.id;
    console.info(`#${pluginId}: MAIN`);
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById("app")
    );

	let loading: boolean = false;
    logseq.provideModel({ 
		async loadHackerNews(){
			const info = await logseq.App.getUserConfigs();
			if(loading) return;

			const pageName: string = "hackernews-logseq-feed";
			const blockTitle: string = (new Date()).toLocaleString()

			const currentPage = await logseq.Editor.getCurrentPage();

			const isPageExists = await logseq.Editor.getPage(pageName);
			if((currentPage?.originalName !== pageName) && isPageExists){
				await logseq.App.pushState('page', {name: pageName});
			}else if((currentPage?.originalName !== pageName)){
				await logseq.Editor.createPage(pageName, {redirect: true, createFirstBlock: true});
			}else{
				// pass
			}


			await delay(300);

			loading = true;

			try {
				let hackerNewsData: any = await loadHackerNewsData();
				// console.log(hackerNewsData);

				if(currentPage?.originalName !== pageName) throw new Error('page error');

				const pageBlockTree = await logseq.Editor.getCurrentPageBlocksTree();
				// console.log(pageBlockTree[0]);	
				let previousBlock = pageBlockTree[0]!;

				


				const newBlock = await logseq.Editor.insertBlock(previousBlock.uuid, `## 🔖 HackerNews - ${blockTitle}`, {before: true, sibling: false});
				await logseq.Editor.removeBlock(previousBlock.uuid);	
				
				if(newBlock){
					const hackerNewsDataInBlockFormat = hackerNewsData.map((it: any) => ({ content: it }))
					await logseq.Editor.insertBatchBlock(newBlock.uuid, hackerNewsDataInBlockFormat, {
					sibling: false, before: false
					})
				}
				
				
			}
			catch(e: any){
				logseq.App.showMsg(e.toString(), 'warning');
				console.log(e);
			}
			finally{
				loading = false;
			}
		}
	 });

    logseq.Editor.registerSlashCommand("Random sheet", async () => {
        console.log("cow it works");
    });

    logseq.App.registerUIItem("toolbar", {
        key: "logseq-hackernews",
        template: `
      <a data-on-click="loadHackerNews"
         class="button">
        <i class="ti ti-rss"></i>
      </a>
    `,
    });

    logseq.provideStyle(`
    [data-injected-ui=logseq-hackernews-${baseInfo.id}] {
      display: flex;
      align-items: center;
    }
  `);
};

// @ts-expect-error
if (isDev && top[magicKey]) {
    // Currently there is no way to reload plugins
    location.reload();
} else {
    logseq.ready(main).catch(console.error);
}
