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
 * Handle incoming runtime messages
 * @param {Object} message
 */
function handleMessage(message) {
    if (typeof message.target == 'string' && message.target != 'background') {
        return;
    }
    switch (message.command.toUpperCase()) {
        case 'FEEDBACK':
            openFeedback();
            break;
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

/**
 * Set up uninstall page
 */
 function setUninstallPage() {
    getSystemDetails((details) => {
        browser.runtime.setUninstallURL(`${webBase}/uninstall/?browser=${details.browser}&os=${details.os}&version=${details.version}`);
    });
}

/**
 * Open feedback window
 */
function openFeedback() {
    getSystemDetails((details) => {
        browser.windows.create({
            height: 700,
            width: 450,
            type: browser.windows.CreateType.PANEL,
            url: `${webBase}/feedback/?browser=${details.browser}&os=${details.os}&version=${details.version}`
        });
    });
}

/**
 * Send system details to callback
 * @param {Function} callback
 */
function getSystemDetails(callback) {
    browser.runtime.getPlatformInfo((platform) => {
        callback({
            browser: 'firefox',
            version: browser.runtime.getManifest().version,
            os: platform.os
        });
    });
}

const webBase = 'https://addons.wesleybranton.com/addon/website-blocker';
let filter = [];
let showError = true;
createBlocker();
browser.storage.onChanged.addListener(createBlocker);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onMessage.addListener(handleMessage);
browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});
checkData();
setUninstallPage();
