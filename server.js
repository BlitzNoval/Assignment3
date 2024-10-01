const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;
const STEAM_API_KEY = '437465E2F36D1E763C9DD80350678FDB';

app.get('/api/steam-top-games', async (req, res) => {
    try {
        const response = await fetch(`http://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${STEAM_API_KEY}`);
        const appList = await response.json();
        // Process and filter top 20 games, then get player counts
        // This is just a simplified example, you will need to refine it
        res.json(appList.applist.apps.slice(0, 20)); // Adjust to fetch player counts
    } catch (error) {
        res.status(500).send("Error fetching data from Steam API");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});