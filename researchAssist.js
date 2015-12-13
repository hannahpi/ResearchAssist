// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var rAssist;
var isSearching = false;
var search = "";
var prevSearch = "";
var searchFolder;
setBookmarkRoot();

/**
 * Creates a bookmark folder for all of research Assist's searches to go into.
 */
function setBookmarkRoot() {
  chrome.bookmarks.search({'title': 'Research Assist'}, function (tmp) {
    if (tmp.length < 1) {
      chrome.bookmarks.create({'title': 'Research Assist'},
                             function(newFolder) {
              rAssist = newFolder;
            });
    } else {
      rAssist = tmp[0]; //node is hopefully in the first slot here.
    }
  });
}

/**
 * Takes a searchTerm and creates a bookmark if it doesn't already exist.
 * After done, calls the callback supplying it with the bookmark folder.
 */
function getMarkSearchRoot(searchTerm, callback) {
  console.assert(typeof searchTerm == "string", "should be a string");
  chrome.bookmarks.search({'title': searchTerm },
  function (bmItems) {
    if (bmItems.length > 0)
      callback(bmItems[0]);
    else {
      chrome.bookmarks.create({"title": searchTerm, 'parentId': rAssist.id }, function (bmRoot) { // create folder
        callback(bmRoot);
      });
    }
  });
}

function createMark(searchTerm, url, title, callback) {
  getMarkSearchRoot(searchTerm, function (sFolder) {
    searchFolder = sFolder;
    chrome.bookmarks.search({'title':title, 'url':url }, function (bmsFound) {
                                  var bookmark=bmsFound[0];
                                  if (bmsFound.length < 1)
                                  {
                                      chrome.bookmarks.create({'parentId': searchFolder.id, 'title':title, 'url':url }, function(bm) {
                                        bookmark = bm;
                                      });
                                  }
                                  callback(bookmark);
                           });
    });
}

/**
 * Get the current Title.
 *
 * @param {function(tab)} callback - called when the current tab
 *   is found.
 */
 function getCurrentTab(callback) {
    var queryInfo = {
       active: true,
       currentWindow: true
    };
    chrome.tabs.query(queryInfo, function(tabs) {
       var tab = tabs[0];
       console.assert(typeof tab.title== "string", "Tab's Title should be a string");
       callback(tab);
    });
 }

 function getTabByURL(urlV,callback) {
   var queryInfo = {
     currentWindow:true,
     url:urlV
   };
   chrome.tabs.query(queryInfo, function(tabs) {
      var tab = tabs[0];
      console.assert(typeof tab.title== "string", "Tab's Title should be a string");
      callback(tab);
   });
 }

 chrome.webRequest.onCompleted.addListener(function (e) {
       var queryUrl = e.url.split("q=")[1] || e.url.split("t=")[1];
       var query = queryUrl.split("&")[0].split("%20").join(" ").split("+").join(" ").split("%27").join("'"); //replace "%20" or "+" with " "
       if (query.length > 0)
       {
         search = query;
         isSearching = true;
       }
 }, {urls: ["*://www.google.com/*q=*", "*://www.bing.com/*q=*", "*://www.yahoo.com/*t=*", "*://www.ask.com/*q=*", "*://search.aol.com/*q=*", "*://www.searchaol.com/*q=*", "*://*.wow.com/*q=*",
            "*://www.webcrawler.com/*q=*", "*://*.infospace.com/*q=*", "*://www.dogpile.com/*q=*"]});

chrome.webRequest.onCompleted.addListener(function (e) {
  if (isSearching) {
    getCurrentTab(function(tab) {
      prevSearch = search;
      createMark(search, tab.url, tab.title, function(bm) {
        return bm;
      });
    });
  }
}, {urls: ["*://*/*"], types: ["main_frame"]});
