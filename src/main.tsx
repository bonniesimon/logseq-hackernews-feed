import "@logseq/libs";
import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin";
import "virtual:windi.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);
const magicKey = `__${PL.id}__loaded__`;

const isDev = process.env.NODE_ENV === "development";

const delay = (t = 100) => new Promise(r => setTimeout(r, t));

const getStoryEndpoint = (id: number | string) => {
	return `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
}

const loadHackerNewsData = async () => {
	const topStoriesEndpoint: string = "https://hacker-news.firebaseio.com/v0/topstories.json";

	const res = await fetch(topStoriesEndpoint);
	const topStoryIDs500: number[] = await res.json();
	const topStoryIDs = topStoryIDs500.slice(0, 21);
	console.log(topStoryIDs);

	let storyEndpoint: string;
	const storiesPromises: any = topStoryIDs.map(async (topStoryID) => {
		storyEndpoint = getStoryEndpoint(topStoryID);	
		const res = await fetch(storyEndpoint);
		const data = await res.json();
		return data;
	});

	const stories = await Promise.all(storiesPromises);

	const storiesToString: any = stories.map((story,index) => {
		const {title, url, score, by, kids} = story;
		return `${index}. [${title}](${url}) [:small.opacity-50 "🔥 ${score} 💬 ${kids?.length}"]
		collapsed:: true    
		> ${title}`
	})


	return storiesToString;
}

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

			logseq.App.pushState('page', {name: pageName});

			await delay(300);

			loading = true;

			try {
				const currentPage = await logseq.Editor.getCurrentPage();
				
				if(currentPage?.originalName !== pageName) throw new Error('page error');

				const pageBlockTree = await logseq.Editor.getCurrentPageBlocksTree();
				console.log(pageBlockTree[0]);	
				let targetBlock = pageBlockTree[0]!;

				let blocks: any = await loadHackerNewsData();
				console.log(blocks);

				const blocksInContent= blocks.map((it: any) => ({ content: it }))

				await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocksInContent, {
				sibling: false
				})

				await logseq.Editor.updateBlock(targetBlock.uuid, `## 🔖 HackerNews - ${blockTitle}`)
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
