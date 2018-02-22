browser.menus.create({
    id: "click-me",
    title: "View Saved Comics",
    contexts: ["browser_action"]
  });
  
  browser.menus.onClicked.addListener((info, tab) => {
    browser.sidebarAction.open();
  });