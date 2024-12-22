import { aleiLog, logLevel } from "./log.js";

export let newUpdate = false;

export function doALEIUpdate() {
    unsafeWindow.open(GM_info.script.downloadURL);
    newUpdate = false;
}

export async function checkForUpdates() {
    let resp = await GM.xmlHttpRequest({  url: GM_info.script.updateURL  }).catch(e => console.error(e));
    if (resp === undefined) {
        aleiLog(logLevel.SWARN, "Update check request failed");
        return;
    }

    let latestVersion = getVersionFromResponse(resp.responseText);
    if (latestVersion === null) {
        aleiLog(logLevel.SWARN, "Failed to find version line in update check response");
        return;
    }

    if (isVersionNew(latestVersion)) {
        newUpdate = true;
        aleiLog(logLevel.INFO, `New update: ${latestVersion}`);
        NewNote(
            `ALEI: There is new update: ${latestVersion}, you are currently in ${GM_info.script.version}<br>` + 
            `Press Ctrl + Shift + U to update`, 
        "#FFFFFF");
    }
    else {
        aleiLog(logLevel.INFO, `REMOTE: ${latestVersion}, LOCAL: ${GM_info.script.version} => No update detected.`);
    }
}

/**
 * finds the line containing "@version" in the response text and returns the version number. returns null if the version line wasn't found
 * @param {string} response 
 * @returns {string|null}
 */
function getVersionFromResponse(response) {
    const lines = response.split("\n");
    const versionLine = lines.find(line => line.includes("@version"));
    return versionLine !== undefined ? versionLine.split(" ").at(-1) : null;
}

function isVersionNew(version) {
    return parseInt(version.replaceAll(".", "")) > parseInt(GM_info.script.version.replaceAll(".", ""));
}