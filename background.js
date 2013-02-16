var id = 1;
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.captureVisibleTab(null, function(screenshotUrl) {
        var viewTabUrl = chrome.extension.getURL('pivotate.html?id=' + (id++));
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
                        view.pivotate.setScreenShot(screenshotUrl);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });
});
