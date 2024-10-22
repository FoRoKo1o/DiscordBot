import fetch from 'node-fetch';
import fs from 'fs';

const clanId = process.env['wwoClanId'];
const wwokey = "bot " + process.env['WWOKEY'];

let client;
export function init(discordClient) {
    client = discordClient;
}

// Fetch members from WWO API
export async function fetchMembers() {
    const response = await fetch(`https://api.wolvesville.com/clans/${clanId}/members`, {
        method: 'GET',
        headers: {
            'Authorization': wwokey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const members = await response.json();
    return members;
}

// Fetch members from WWO API and calculate XP change
export async function fetchMembersWithXPChange() {
    const response = await fetch(`https://api.wolvesville.com/clans/${clanId}/members`, {
        method: 'GET',
        headers: {
            'Authorization': wwokey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const members = await response.json();
    const formattedList = formatMembersListWithXPChange(members);
  
    // Save previousXPData to a file
    fs.writeFileSync('previous_xp_data.json', JSON.stringify(members));
  
    return formattedList;
}

// Format the members list with XP change into a readable format
export function formatMembersListWithXPChange(members) {
    let formattedList = `Members List (last checked ${getDaysSinceLastCheck()} days ago):\n`;
    const today = new Date();
  
    const maxLength = Math.max(...members.map((member) => member.username.length));
  
    members
        .filter((member) => !['Beathrice', 'Grafin', 'FoRoKo', 'Agama'].includes(member.username))
        .sort((a, b) => new Date(a.lastOnline) - new Date(b.lastOnline))
        .forEach((member, index) => {
            const lastOnline = new Date(member.lastOnline);
            const daysSinceLastLogin = Math.floor((today - lastOnline) / (1000 * 60 * 60 * 24));
  
            const username = member.username.padEnd(maxLength, ' ');
            const xpChange = calculateXPChange(member.playerId, member.xp);
            formattedList += `${username}  ${daysSinceLastLogin} d XP +${xpChange}\n`;
  
            // Update the previous XP data
            previousXPData[member.playerId] = member.xp;
        });
  
    // Save previousXPData to a file
    fs.writeFileSync('previous_xp_data.json', JSON.stringify(previousXPData));
    return '```\n' + formattedList + '\n```';
}

// Get the number of days since the last check
export function getDaysSinceLastCheck() {
    const LAST_CHECK_FILE = 'last_check_date.txt';
    let lastCheckDate = new Date(0);
  
    // Check if the last check file exists, read the last check date if available
    if (fs.existsSync(LAST_CHECK_FILE)) {
        const lastCheckDateStr = fs.readFileSync(LAST_CHECK_FILE, 'utf-8');
        lastCheckDate = new Date(lastCheckDateStr);
    }
  
    const today = new Date();
    const timeDifference = today.getTime() - lastCheckDate.getTime();
    const daysSinceLastCheck = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    // Save today's date as the new last check date
    fs.writeFileSync(LAST_CHECK_FILE, today.toISOString());
  
    return daysSinceLastCheck;
}

// Calculate XP change based on previous XP data
export function calculateXPChange(playerId, currentXP) {
    if (previousXPData.hasOwnProperty(playerId)) {
        const previousXP = previousXPData[playerId];
        const xpChange = currentXP - previousXP;
        return xpChange;
    } else {
        // No previous XP data available
        return 'N/A';
    }
}
