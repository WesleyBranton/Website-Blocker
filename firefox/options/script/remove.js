/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

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
