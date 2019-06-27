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
	checkList();
	save();
}

// Toggle "no websites blocked" text
function checkList() {
	if (urlData.length > 0) {
		document.getElementById('url-list-none').className = 'hide';
	} else {
		document.getElementById('url-list-none').className = '';
	}
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
	checkList();
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
	checkList();
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

// Toggle menu pages
function changeMenu(e) {
	var page = e.target.className;
	if (page != 'add' && page != 'remove' && page != 'backup') {
		return;
	}
	var currentPage = document.getElementById('selected').className;
	var main = document.getElementById('main');
	document.getElementById('selected').id = '';
	e.target.id = 'selected';
	main.className = 'page ' + page;
	if (page == 'backup') {
		backup();
	}
}

// Generate backup text
async function backup() {
	var output = document.getElementById('backuptext');
	var list = '';
	let data = await browser.storage.sync.get();
	for (i = 0; i < data.urlList.length; i++) {
		list += data.urlList[i] + ',';
	}
	output.value = list.slice(0,-1);
}

// Import URLs from text
async function importURLs() {
	var inputBox = document.getElementById('restoretext');
	var input = inputBox.value;
	
	if (input.trim().length < 1) {
		return;
	}
	
	var overwrite = document.getElementById('overwrite').checked;
	var urls = input.split(',');
	
	if (overwrite) {
		let removed = await browser.storage.sync.remove('urlList');
	} else {
		let data = await browser.storage.sync.get();
		urls = data.urlList.concat(urls);
	}
	
	let saved = await browser.storage.sync.set({urlList:urls});
	
	inputBox.value = '';
	window.location.reload();
}

// Copy text to clipboard
function clipboard() {
	document.getElementById('backuptext').select();
	document.execCommand('copy');
}

var urlData;
// Run when page loads
window.onload = function(){
	restore();
	changePlaceholder();
	document.getElementsByTagName('header')[0].addEventListener('click',changeMenu);
	document.getElementById('add-button').addEventListener('click',addItem);
	document.getElementById('url-list').addEventListener('click',removeItem);
	document.getElementById('search-button').addEventListener('click',searchList);
	document.getElementById('restore').addEventListener('click',importURLs);
	document.getElementById('copytext').addEventListener('click',clipboard);
	document.getElementById('wildcardInfo').addEventListener('click',function(){window.open("https://github.com/WesleyBranton/Website-Blocker/wiki/Using-wildcards","_blank")});
	document.getElementById('backuptext').addEventListener('click',function(){this.select()});
	document.getElementById('add-mode').addEventListener('change',changePlaceholder);
};