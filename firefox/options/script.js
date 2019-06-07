// Load settings
async function restore() {
	var list = document.getElementById('url-list');
	let data = await browser.storage.sync.get();
	urlData = data.urlList;
	for (i = 0; i < data.urlList.length; i++) {
		createItem(data.urlList[i]);
	}
}

// Save settings
function save() {
	browser.storage.sync.set({urlList:urlData});
}

// Add item
function addItem() {
	var urlbox = document.getElementById('add-url');
	var urlmode = document.getElementById('add-mode').value;
	
	// Strip protocol
	var url = '*://';
	var urlMod = urlbox.value;
	if (urlMod.indexOf('://') >= 0) {
		urlMod = urlMod.slice(urlMod.indexOf('://')+3);
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
	urlbox.value = '';
	createItem(url);
	urlData.push(url);
	save();
}

// Create item GUI
function createItem(url) {
	var list = document.getElementById('url-list');
	
	// Create item container
	var container = document.createElement('div');
	container.className = 'list-item';
	
	// Create item text label
	var label = document.createElement('span');
	label.textContent = url;
	
	// Create item delete button
	var btnDelete = document.createElement('button');
	btnDelete.className = 'delItem';
	btnDelete.textContent = '\u00D7';
	
	// Merge items
	container.appendChild(label);
	container.appendChild(btnDelete);
	list.appendChild(container);
}

// Remove item
function removeItem(item) {
	if (item.target.className == 'delItem') {
		item = item.target.parentNode;
		var url = item.querySelector('span').textContent;
		var urlKey = urlData.indexOf(url);
		if (urlKey >= 0) {
			urlData.splice(urlKey,1);
			item.parentNode.removeChild(item);
			save();
		}
	}
}

// Search
function searchList() {
	var searchTerm = document.getElementById('search-box').value;
	var items = document.getElementsByTagName('span');
	for (i = 0; i < items.length; i++) {
		if (items[i].textContent.search(searchTerm) >= 0) {
			items[i].parentNode.className = 'list-item';
		} else {
			items[i].parentNode.className = 'list-item hide';
		}
	}
}

// Change URL placeholder
function changePlaceholder() {
	var urlmode = document.getElementById('add-mode').value;
	var textbox = document.getElementById('add-url');
	var mode;
	if (urlmode == 'domain') {
		// Domain only
		mode = 'example.com';
	} else if (urlmode == 'subdomain') {
		// Domain and all subdomains
		mode = 'test.example.com';
	} else if (urlmode == 'page') {
		// Specific page
		mode = 'example.com/page';
	} else if (urlmode == 'custom') {
		// Custom URL string
		mode = 'Custom URL Pattern';
	}
	textbox.placeholder = mode;
}

var urlData;
// Run when page loads
window.onload = function(){
	restore();
	changePlaceholder();
	document.getElementById('add-button').addEventListener('click',addItem);
	document.getElementById('url-list').addEventListener('click',removeItem);
	document.getElementById('search-button').addEventListener('click',searchList);
	document.getElementById('add-mode').addEventListener('change',changePlaceholder);
};