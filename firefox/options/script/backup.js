/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Create a backup text
 * @async
 */
async function backup() {
    // Load list from storage
    let list = '';
    let data = await browser.storage.sync.get();

    // Generate text
    const output = document.getElementById('backuptext');
    for (i = 0; i < data.urlList.length; i++) {
        list += data.urlList[i] + ',';
    }

    // Display text
    output.value = list.slice(0, -1);
}

/**
 * Copy text to clipboard
 */
function clipboard() {
    document.getElementById('backuptext').select();
    document.execCommand('copy');
}

/**
 * Import blocked list from text
 * @async
 */
async function importURLs() {
    const inputBox = document.getElementById('restoretext');
    const input = inputBox.value;

    // Check if there are no URLs
    if (input.trim().length < 1) {
        return;
    }

    const overwrite = document.getElementById('overwrite').checked;
    let urls = input.split(',');

    // Check whether to overwrite or not
    if (overwrite) {
        // Remove previous data (overwrite)
        let removed = await browser.storage.sync.remove('urlList');
    } else {
        // Merge with previous data (don't overwrite)
        let data = await browser.storage.sync.get();
        urls = data.urlList.concat(urls);
    }

    // Save URL list to storage
    let saved = await browser.storage.sync.set({
        urlList: urls
    });

    // Clear textarea & reload page
    inputBox.value = '';
    window.location.reload();
}
