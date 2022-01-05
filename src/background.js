/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Create block listener
 * @async
 */
async function createBlocker() {
    // Remove previous listener
    browser.webRequest.onBeforeRequest.removeListener(block);

    // Load URLs from storage
    const storage = await browser.storage.sync.get();
    showError = (typeof storage.showError == 'boolean') ? storage.showError : true;

    // Check if there are URLs to load
    if (storage.urlList) {
        // Create listener
        if (storage.urlList.length > 0) {
            browser.webRequest.onBeforeRequest.addListener(block, {
                urls: storage.urlList
            }, ["blocking"]);
        }
    }
}

/**
 * Handle blocked URL
 * @param {Object} requestDetails
 */
function block(requestDetails) {
    if (showError) {
        return {
            redirectUrl: browser.runtime.getURL('/blocked/blockpage.html')
        };
    } else {
        return {
            cancel: true
        };
    }
}

/**
 * Handles missing storage data
 * @async
 */
async function checkData() {
    // Load URLs from storage
    let data = await browser.storage.sync.get();

    // Create blank URL list in storage if required
    if (!data.urlList) {
        browser.storage.sync.set({
            urlList: []
        });
    }
}

/**
 * Handles the installation/update of the add-on
 */
function handleInstalled(details) {
    if (details.reason == 'install') {
        browser.runtime.openOptionsPage();
    }
}

let filter = [];
let showError = true;
createBlocker();
browser.storage.onChanged.addListener(createBlocker);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});
checkData();
