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
	return {redirectUrl: browser.runtime.getURL('/blocked/blockpage.html')};
}

// Handles missing data
async function checkData() {
	let data = await browser.storage.sync.get();
	if (!data.urlList) {
		console.log("Create");
		browser.storage.sync.set({urlList:[]});
	} else {
		console.log("Exists");
	}
}

var filter = [];
createBlocker();
browser.storage.onChanged.addListener(createBlocker);
checkData();