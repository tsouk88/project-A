import fs from 'fs/promises';
const historyfile = './AI/history.json';
export async function getHistory(sessionID) {
    try {
        const data = await fs.readFile(historyfile, 'utf-8');
        const history = JSON.parse(data);
        return history[sessionID] || [];
    }
    catch (error) {
        return [];
    }
}
export async function addHistory(sessionID, role, message) {
    let history = {};
    try {
        const data = await fs.readFile(historyfile, 'utf-8');
        history = JSON.parse(data);
    }
    catch (error) {
        history = {};
    }
    if (!history[sessionID]) {
        history[sessionID] = [];
    }
    const timestamp = new Date().toLocaleString("el-GR", { timeZone: "Europe/Athens" });
    history[sessionID].push({ role, parts: [{ text: message }], timestamp: timestamp });
    await fs.writeFile(historyfile, JSON.stringify(history, null, 2));
}
