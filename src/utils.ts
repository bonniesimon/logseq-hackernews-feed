import React, { useState } from "react";
import { useMountedState } from "react-use";

const useAppVisible = () => {
  const [visible, setVisible] = useState(logseq.isMainUIVisible);
  const isMounted = useMountedState();
  React.useEffect(() => {
    const eventName = "ui:visible:changed";
    const handler = async ({ visible }: any) => {
      if (isMounted()) {
        setVisible(visible);
      }
    };
    logseq.on(eventName, handler);
    return () => {
      logseq.off(eventName, handler);
    };
  }, []);
  return visible;
};

const useSidebarVisible = () => {
  const [visible, setVisible] = useState(false);
  const isMounted = useMountedState();
  React.useEffect(() => {
    logseq.App.onSidebarVisibleChanged(({ visible }) => {
      if (isMounted()) {
        setVisible(visible);
      }
    });
  }, []);
  return visible;
};

const getStoryEndpoint = (id: number | string) => {
	return `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
}

const loadHackerNewsData = async () => {
	const topStoriesEndpoint: string = "https://hacker-news.firebaseio.com/v0/topstories.json";

	const res = await fetch(topStoriesEndpoint);
	const topStoryIDs500: number[] = await res.json();
	const topStoryIDs = topStoryIDs500.slice(0, 21);

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
		return `${index}. [${title}](${url}) [:small.opacity-50 "🔥 ${score} 💬 ${kids?.length}"]`;
  })


	return storiesToString;
}


export {loadHackerNewsData, useAppVisible, useSidebarVisible};
