const booster = document.getElementById("booster");
const boosterImg = document.getElementById("booster-img"); // New booster image element
const cardsContainer = document.getElementById("cards-container");
const revealNextButton = document.getElementById("reveal-next");
const resetButton = document.getElementById("reset");
const setSelect = document.getElementById("set-select");
const cardsUrl = 'https://raw.githubusercontent.com/xofelixox/Pkmsim/main/cards.json';

let cards = [];
let currentCardIndex = 0;
let isOpening = false;

// Default set URL & booster image
let currentSet = "sv8pt5";
let jsonUrl = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${currentSet}.json`;

// Fetch card data based on the selected set
async function fetchCards() {
    try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            return data.map(card => ({
                name: card.name,
                imageUrl: card.images.large,
                rarity: card.rarity
            }));
        } else {
            console.error("No cards found in the JSON data");
            return [];
        }
    } catch (error) {
        console.error("Failed to fetch card data:", error);
        return [];
    }
}

// Shuffle function
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Open a new booster pack
async function openPack() {
    if (isOpening) return;
    isOpening = true;

    booster.style.opacity = "0";
    booster.style.display = "none";

    revealNextButton.style.display = "inline-block";

    // Fetch new cards based on the selected set
    cards = await fetchCards();

    if (cards.length > 0) {
        shuffleArray(cards);
        cards = cards.slice(0, 5);
    }

    if (!cards || cards.length === 0) {
        console.error("No cards to display");
        return;
    }

    revealNextCard();
}

// Reveal the next card
function revealNextCard() {
    if (currentCardIndex >= 5) {
        resetPack();
        return;
    }

    const cardData = cards[currentCardIndex];
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    const img = document.createElement("img");
    img.src = cardData.imageUrl;

    const star = document.createElement("div");
    star.classList.add("star");
    star.innerHTML = "★";

     // Add click event to save to collection
     star.addEventListener("click", () => {
        likeCard(cardData);
        star.style.color = "red";
    });

    cardDiv.appendChild(img);
    cardDiv.appendChild(star);

    cardsContainer.appendChild(cardDiv);

    setTimeout(() => {
        cardDiv.style.opacity = "1";
    }, 100);

    currentCardIndex++;
}

// Reset the pack
function resetPack() {
    resetButton.style.display = "inline-block";
    revealNextButton.style.display = "none";
    isOpening = false;
}

// Event listeners
booster.addEventListener("click", openPack);
revealNextButton.addEventListener("click", revealNextCard);
resetButton.addEventListener("click", () => {
    cardsContainer.innerHTML = "";
    currentCardIndex = 0;
    resetButton.style.display = "none";
    booster.style.display = "inline-block";
    booster.style.opacity = "1";
});

// Update JSON URL and reset when a new set is selected
setSelect.addEventListener("change", () => {
    currentSet = setSelect.value;
    jsonUrl = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${currentSet}.json`;

    // Reset everything and update booster pack image
    cardsContainer.innerHTML = "";
    currentCardIndex = 0;
    isOpening = false;

    boosterImg.src = `packs/${currentSet}.png`; // Update booster image
    booster.style.display = "inline-block";
    booster.style.opacity = "1";
    revealNextButton.style.display = "none";
    resetButton.style.display = "none";
});

const apiUrl = 'https://api.github.com/repos/xofelixox/Pkmsim/contents/cards.json';

// Handle liking a card and update GitHub JSON
function likeCard(card) {
    let likedCards = getLikedCardsFromLocalStorage();
    
    // Avoid duplicates
    if (!likedCards.some(c => c.imageUrl === card.imageUrl)) {
        likedCards.push(card);
        saveLikedCardsToLocalStorage(likedCards);
    }
}

function getLikedCardsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("likedCards")) || [];
}

function saveLikedCardsToLocalStorage(likedCards) {
    localStorage.setItem("likedCards", JSON.stringify(likedCards));
}

// Set the interval in milliseconds (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get the last sync time from localStorage
function getLastSyncTime() {
    return parseInt(localStorage.getItem("lastSyncTime")) || 0;
}

// Update the last sync time in localStorage
function setLastSyncTime() {
    const currentTime = new Date().getTime();
    localStorage.setItem("lastSyncTime", currentTime);
}

// Sync the liked cards with GitHub
async function syncWithGitHub() {
    let likedCards = getLikedCardsFromLocalStorage();
    
    // Optionally sync cards with GitHub here if needed
    await saveLikedCardsToGitHub(likedCards);
    alert('Collection synced with GitHub!');
    
    // Update the sync time after the sync is done
    setLastSyncTime();
}

// Check if sync is needed when the page loads
function checkSyncNeeded() {
    const lastSyncTime = getLastSyncTime();
    const currentTime = new Date().getTime();

    // Check if 5 minutes have passed since the last sync
    if (currentTime - lastSyncTime >= SYNC_INTERVAL) {
        syncWithGitHub(); // Sync if 5 minutes have passed
    }
}

// Start the sync process when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
    checkSyncNeeded();

    // Optionally set a timer to sync every 5 minutes
    setInterval(syncWithGitHub, SYNC_INTERVAL);
});

// Save the liked cards from localStorage to GitHub's cards.json
async function saveLikedCardsToGitHub(likedCards) {
    const accessToken = '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'; // Replace with your GitHub token
    const repoOwner = 'xofelixox'; // Replace with your GitHub username
    const repoName = 'Pkmsim'; // Replace with your GitHub repository name
    const filePath = 'cards.json'; // Path to your JSON file in the repository

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    
    try {
        // First, fetch the current file data from GitHub to get the sha (if it exists)
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        });

        const getData = await getResponse.json();
        const sha = getData.sha; // Get the sha of the existing file to update it

        // Prepare data to be saved to the file
        const fileData = JSON.stringify(likedCards, null, 2);
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Sync liked cards with localStorage',
                content: btoa(fileData), // Convert the JSON to base64 encoding
                sha: sha // Include the sha to update the existing file
            })
        });

        if (response.ok) {
            console.log('Cards synced with GitHub successfully!');
        } else {
            console.error('Failed to sync cards with GitHub:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error syncing with GitHub:', error);
    }
}

document.getElementById("sync-button").addEventListener("click", syncWithGitHub);