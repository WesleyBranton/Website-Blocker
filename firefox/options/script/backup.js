/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Create a backup text
 * @async
 */
async function backup() {
    const data = await browser.storage.sync.get();
    const file = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const fileURL = URL.createObjectURL(file);
    browser.downloads.download({
        filename: `website-blocker-backup-${Date.now()}.json`,
        url: fileURL
    });
}

async function loadFile() {
    const fileInput = document.getElementById('file');
    if (fileInput.files.length != 1) return false;
    const overwrite = document.getElementById('overwrite').checked;
    const file = fileInput.files[0];
    const data = JSON.parse(await file.text());
    fileInput.value = '';
    if (data.urlList) return importURLs(data.urlList, overwrite);
}

/**
 * Import blocked list from text
 * @async
 */
async function importURLs(list, overwrite) {
    if (list.length < 1) return;

    // Check whether to overwrite or not
    if (overwrite) {
        // Remove previous data (overwrite)
        await browser.storage.sync.remove('urlList');
    } else {
        // Merge with previous data (don't overwrite)
        const data = await browser.storage.sync.get();
        list = data.urlList.concat(list);
    }

    // Save URL list to storage
    await browser.storage.sync.set({
        urlList: list
    });

    // Reload page
    window.location.reload();
}
