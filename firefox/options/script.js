/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

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

/**
 * Add URL to block list
 */
function addItem() {
    const urlbox = document.getElementById('add-url');
    const urlmode = document.getElementById('add-mode').value;

    // Strip protocol
    let url = '*://';
    let urlMod = urlbox.value;
    if (urlMod.indexOf('://') >= 0) {
        urlMod = urlMod.slice(urlMod.indexOf('://') + 3);
    }

    // Check if URL is empty
    if (urlMod.length < 1) {
        return;
    }

    // Generate URL string
    if (urlmode == 'domain') {
        // Domain only
        url += urlMod + '/*';
    } else if (urlmode == 'subdomain') {
        // Domain and all subdomains
        url += '*.' + urlMod + '/*';
    } else if (urlmode == 'page') {
        // Specific page
        url += urlMod + '*';
    } else if (urlmode == 'custom') {
        // Custom URL string
        url = urlbox.value;
    }

    // Clear input, create GUI item and save to storage
    urlbox.value = '';
    createItem(url);
    urlData.push(url);
    checkList();
    save();
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
 * Add URL to item list GUI
 * @param {String} url
 */
function createItem(url) {
    const list = document.getElementById('url-list');

    // Create item container
    const container = document.createElement('div');
    container.className = 'list-item';

    // Create item text label
    const label = document.createElement('span');
    label.textContent = url;

    // Create item delete button
    const btnDelete = document.createElement('button');
    btnDelete.className = 'delItem';
    btnDelete.textContent = '\u00D7';

    // Merge items
    container.appendChild(label);
    container.appendChild(btnDelete);
    list.appendChild(container);
    checkList();
}

/**
 * Remove URL from block list
 * @param {MouseEvent} item
 */
function removeItem(item) {
    if (item.target.className == 'delItem') {
        item = item.target.parentNode;
        const url = item.querySelector('span').textContent;
        const urlKey = urlData.indexOf(url);
        if (urlKey >= 0) {
            urlData.splice(urlKey, 1);
            item.parentNode.removeChild(item);
            save();
        }
    }
    checkList();
}

/**
 * Search for URL on the list
 */
function searchList() {
    const searchTerm = document.getElementById('search-box').value;
    const items = document.getElementsByTagName('span');

    for (i = 0; i < items.length; i++) {
        if (items[i].textContent.search(searchTerm) >= 0) {
            items[i].parentNode.className = 'list-item';
        } else {
            items[i].parentNode.className = 'list-item hide';
        }
    }
}

/**
 * Update URL placeholder GUI
 */
function changePlaceholder() {
    const urlmode = document.getElementById('add-mode').value;
    const textbox = document.getElementById('add-url');
    let mode;

    // Check which placeholder is valid
    if (urlmode == 'domain') {
        // Domain only
        mode = 'example.com or test.example.com';
    } else if (urlmode == 'subdomain') {
        // Domain and all subdomains
        mode = 'example.com';
    } else if (urlmode == 'page') {
        // Specific page
        mode = 'example.com/page';
    } else if (urlmode == 'custom') {
        // Custom URL string
        mode = 'Custom URL Pattern';
    }

    textbox.placeholder = mode;
}

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

    // Generate backup text if required
    if (page == 'backup') {
        backup();
    }
}

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

/**
 * Copy text to clipboard
 */
function clipboard() {
    document.getElementById('backuptext').select();
    document.execCommand('copy');
}

var urlData;
// Run when page loads
window.onload = () => {
    restore();
    changePlaceholder();
    document.getElementsByTagName('header')[0].addEventListener('click', changeMenu);
    document.getElementById('add-button').addEventListener('click', addItem);
    document.getElementById('url-list').addEventListener('click', removeItem);
    document.getElementById('search-button').addEventListener('click', searchList);
    document.getElementById('restore').addEventListener('click', importURLs);
    document.getElementById('copytext').addEventListener('click', clipboard);
    document.getElementById('wildcardInfo').addEventListener('click', () => {
        window.open('https://github.com/WesleyBranton/Website-Blocker/wiki/Using-wildcards', '_blank')
    });
    document.getElementById('backuptext').addEventListener('click', () => {
        this.select()
    });
    document.getElementById('add-mode').addEventListener('change', changePlaceholder);
};
