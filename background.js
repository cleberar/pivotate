var id = 100;
var url = '';
chrome.browserAction.onClicked.addListener(function(tab) {
    url = tab.url;
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        chrome.tabs.captureVisibleTab(null, function(screenshotUrl) {
            var currentId = id++;
            var viewTabUrl = chrome.extension.getURL('pivotate.html?id=' + (currentId));
            chrome.tabs.create({url: viewTabUrl}, function(tab) {
                var targetId = tab.id;
                var addSnapshotImageToTab = function(tabId, changedProps) {
                    if (tabId != targetId || changedProps.status != "complete") {
                        return;
                    }

                    chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);
                    var views = chrome.extension.getViews();
                    for (var i = 0; i < views.length; i++) {
                        var view = views[i];
                        if (view.location.href == viewTabUrl) {
                            console.log('background',url);
                            alert(url);
                            view.pivotate.setTabData({url: url});
                            view.pivotate.setScreenShot(screenshotUrl, currentId);
                            break;
                        }
                    }
                };
                chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
            });
        });


    });
    chrome.tabs.executeScript({
        code: 'chrome.runtime.sendMessage({location: window.location})'
    });
});
