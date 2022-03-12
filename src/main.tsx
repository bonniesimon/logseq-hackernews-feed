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

const loadHackerNews = async () => {};

const main = (baseInfo: LSPluginBaseInfo) => {
    const pluginId = logseq.baseInfo.id;
    console.info(`#${pluginId}: MAIN`);
    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById("app")
    );

    logseq.provideModel({ loadHackerNews });

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
