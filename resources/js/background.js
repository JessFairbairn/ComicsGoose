browser.menus.create({
    id: "click-me",
    title: "View Saved Comics",
    contexts: ["browser_action"]
  });
  
  browser.menus.onClicked.addListener((_info, _tab) => {
    browser.sidebarAction.open();
  });

function onInstalledActions(details) {
  const currentVersionText = browser.runtime.getManifest().version;
  const currentVersion = getMinorReleaseNumber(currentVersionText);

  const previousVersionText = details.previousVersion;
  const previousVersion = getMinorReleaseNumber(previousVersionText);

  const reason = details.reason;

  console.log(`Previous Version: ${previousVersionText}`);
  console.log(`Current Version: ${currentVersionText}`);

  switch (reason) {
    case 'install':
        console.log('New User installed the extension.')

        browser.notifications.create('onInstalled', {
          title: `Comics Goose Installed!`,
          message: `Click here to see options.`,
          type: 'basic'
        });

        browser.notifications.onClicked.addListener(() => {
          browser.notifications.clear('onInstalled');
          browser.runtime.openOptionsPage();
        });

        // Set default settings
        
        break;

    case 'update':
        console.log('User has updated their extension.');
        
        if (previousVersion < 0.4){
          browser.notifications.create('onUpdated', {
            title: `Comics Goose Updated: ${previousVersionText} - ${currentVersionText}`,
            message: `New features available, click here to see options.`,
            type: 'basic',

          });
        }
        browser.notifications.onClicked.addListener(() => {
          browser.notifications.clear('onUpdated');
          browser.runtime.openOptionsPage();
        });
        

        break;
    case 'chrome_update':
    case 'shared_module_update':
    default:
        console.log('Other install events within the browser')
        break;
  }

  
}

browser.runtime.onInstalled.addListener(onInstalledActions);

function getMinorReleaseNumber(version_string) {
  if (!version_string){
    return null;
  }
  const digits = version_string.split('.');
  const decimalDigits = digits.slice(1, version_string.length).join('');
  return Number(digits[0] + '.' + decimalDigits);
}