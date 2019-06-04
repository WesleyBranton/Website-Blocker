// Create block handler
async function createBlocker() {
	browser.webRequest.onBeforeRequest.removeListener(block);
	let urls = await browser.storage.sync.get();
	if (urls.urlList) {
		filter = [];
		for (i = 0; i < urls.urlList.length; i++) {
			filter.push(urls.urlList[i]);
		}
		browser.webRequest.onBeforeRequest.addListener(block, {urls: filter}, ["blocking"]);
	}
}

// Handle blocked URL
function block(requestDetails) {
	return {cancel: true};
}

var filter = [];
createBlocker();
browser.storage.onChanged.addListener(createBlocker);