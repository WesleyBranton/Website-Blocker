/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

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
