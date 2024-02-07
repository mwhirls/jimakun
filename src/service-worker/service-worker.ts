import * as commands from './commands'
import * as messages from './messages'
import * as settings from './settings'
import * as tabs from './tabs'
import * as database from './database'

async function onInstallExtension() {
    try {
        // session storage can't be accessed from content scripts by default
        chrome.storage.session.setAccessLevel({
            accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
        });
        await database.initializeDatabase();
    } catch (e) {
        console.error(e);
    }
}

function onExecuteServiceWorker() {
    chrome.runtime.onStartup.addListener(onStartup);
    chrome.runtime.onInstalled.addListener(onInstalled);
    tabs.registerListeners();
    messages.registerListeners();
    commands.registerListeners();
    settings.loadAppSettings();
}

function onStartup() {
    console.debug('onStartup event');
    onInstallExtension();
}

function onInstalled() {
    console.debug('onInstalled event');
    onInstallExtension();
}

onExecuteServiceWorker();