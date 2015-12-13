var rAssist;
var bookmarksTree;
var RAsearches;

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
        RAsearches.innerHTML += "<li> <a href='" + bmNodes[i].url + "'>" + bmNodes[i].title + " </a> </li>";
      }
    }
  });
}


function init() {
  RAsearches = document.getElementById("RAsearches");
  setBookmarkRoot(function (rAssistNode) {
    rAssist = rAssistNode;
    getChildren(rAssist);
  /*chrome.bookmarks.getChildren(rAssist.id, function (bmNodes) {
      for (var i=0; i<bmNodes.length; i++)
      {
        //probably shouldn't be doing it this way with html as text...
        if (!bmNodes[i].url) //later this could be logic for starting a sub ul
          continue;
        RAsearches.innerHTML += "<li> <a href='" + bmNodes[i].url + "'>'" + bmNodes[i].title + " </a> </li>";
        console.log(bmNodes[i]);
      }
      console.log(bmNodes);
    }); */
  });
}


window.onload = function() {
  init();
}
