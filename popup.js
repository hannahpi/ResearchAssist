var rAssist;
var bookmarksTree;
var RAsearches;
var markCount=0;

function setBookmarkRoot(callback) {
  chrome.bookmarks.search({'title': 'Research Assist'}, function (tmp) {
    if (tmp.length < 1) {
      chrome.bookmarks.create({'title': 'Research Assist'},
                             function(newFolder) {
              rAssistN = newFolder;
            });
    } else {
      rAssistN = tmp[0]; //node is hopefully in the first slot here.
    }
    callback(rAssistN);
  });
}

function getChildren(node) {
  chrome.bookmarks.getChildren(node.id, function(bmNodes) {
    for (var i=0; i<bmNodes.length; i++)
    {
      if (!bmNodes[i].url)
        getChildren(bmNodes[i]);
      else {
        markCount++;
        RAsearches.innerHTML += "<li> <a href='" + bmNodes[i].url + "' target='_blank'>" + bmNodes[i].title + " </a> </li>";
        chrome.browserAction.setBadgeText({'text':markCount.toString()});
      }
    }
  });
}


function init() {
  RAsearches = document.getElementById("RAsearches");
  setBookmarkRoot(function (rAssistNode) {
    rAssist = rAssistNode;
    getChildren(rAssist);
  });
}


window.onload = function() {
  init();
}
