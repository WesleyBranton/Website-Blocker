/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Toggle menu tabs
 * @param {MouseEvent} tab
 */
function changeMenu(tab) {
    const page = tab.target.className;

    // Check for invalid page
    if (page != 'add' && page != 'remove' && page != 'backup') {
        return;
    }

    // Change the page
    const main = document.getElementById('main');
    document.getElementById('selected').id = '';
    tab.target.id = 'selected';
    main.className = 'page ' + page;
}

/**
 * Show/hide empty list text
 */
function checkList() {
    const text = document.getElementById('url-list-none');

    if (urlData.length > 0) {
        // Hide text
        text.className = 'hide';
    } else {
        // Show text
        text.className = '';
    }
}

/**
 * Load settings from browser storage
 * @async
 */
async function restore() {
    // Load list from storage
    let data = await browser.storage.sync.get();
    urlData = data.urlList;

    // Add items to GUI table
    for (i = 0; i < data.urlList.length; i++) {
        createItem(data.urlList[i]);
    }
}

/**
 * Save settings to browser storage
 */
function save() {
    browser.storage.sync.set({
        urlList: urlData
    });
}

let urlData;

// Run when page loads
window.onload = () => {
    restore();
    changePlaceholder();
    document.getElementsByTagName('header')[0].addEventListener('click', changeMenu);
    document.getElementById('add-button').addEventListener('click', addItem);
    document.getElementById('url-list').addEventListener('click', removeItem);
    document.getElementById('search-button').addEventListener('click', searchList);
    document.getElementById('restore').addEventListener('click', loadFile);
    document.getElementById('backup-generate').addEventListener('click', backup);
    document.getElementById('wildcardInfo').addEventListener('click', () => {
        window.open('https://github.com/WesleyBranton/Website-Blocker/wiki/Using-wildcards', '_blank')
    });
    document.getElementById('add-mode').addEventListener('change', changePlaceholder);
};
