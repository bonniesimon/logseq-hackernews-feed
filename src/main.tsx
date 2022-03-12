import "@logseq/libs";
import "virtual:windi.css";

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);
const magicKey = `__${PL.id}__loaded__`;

const isDev = process.env.NODE_ENV === "development";

function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app")
  );

	logseq.Editor.registerSlashCommand('Random sheet', async () => {
		console.log("Wowwww it works");
	});
  
}

// @ts-expect-error
if (isDev && top[magicKey]) {
  // Currently there is no way to reload plugins
  location.reload();
} else {
  logseq.ready(main).catch(console.error);
}
