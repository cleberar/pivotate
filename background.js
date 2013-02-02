chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.captureVisibleTab(null, function(img) {
        var screenshotUrl = img;
        var viewTabUrl = chrome.extension.getURL('pivotate.html');
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
                        view.pivotate.init(screenshotUrl);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });
});
