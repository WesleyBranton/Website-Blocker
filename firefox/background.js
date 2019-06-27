// Create block handler
async function createBlocker() {
	// Remove previous listener
	browser.webRequest.onBeforeRequest.removeListener(block);
	
	// Load URLs from storage
	let urls = await browser.storage.sync.get();
	
	// Check if there are URLs to load
	if (urls.urlList) {
		// Create URL fliter list
		filter = [];
		for (i = 0; i < urls.urlList.length; i++) {
			filter.push(urls.urlList[i]);
		}
		
		// Create listener
		browser.webRequest.onBeforeRequest.addListener(block, {urls: filter}, ["blocking"]);
	}
}

// Handle blocked URL
function block(requestDetails) {
	return {redirectUrl: browser.runtime.getURL('/blocked/blockpage.html')};
}

// Handles missing data
async function checkData() {
	// Load URLs from storage
	let data = await browser.storage.sync.get();
	
	// Create blank URL list in storage if required
	if (!data.urlList) {
		browser.storage.sync.set({urlList:[]});
	}
}

var filter = [];
createBlocker();
browser.storage.onChanged.addListener(createBlocker);
checkData();