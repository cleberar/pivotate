var id = 100;
var url = '';

chrome.runtime.onMessage.addListener(openPivotate);


function openPivotate(request, sender, sendResponse) {
    chrome.tabs.captureVisibleTab(function(screenshotUrl) {
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
                        view.pivotate.setTabData({url: request.location.href});
                        view.pivotate.setScreenShot(screenshotUrl, currentId);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });

}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
        // Dummy code for future use
        code: 'chrome.runtime.sendMessage({location: window.location})'
    });
});
