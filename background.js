var id = 100;
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
        console.log(request.greeting);
        alert(request.greeting);
    });
    chrome.tabs.executeScript({
        code: 'chrome.runtime.sendMessage({greeting: window.location})'
    });
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
                        view.pivotate.setScreenShot(screenshotUrl, currentId);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });
});
