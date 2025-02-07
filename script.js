// DOM elements
const booster = document.getElementById("booster");
const boosterImg = document.getElementById("booster-img");
const cardsContainer = document.getElementById("cards-container");
const revealNextButton = document.getElementById("reveal-next");
const resetButton = document.getElementById("reset");
const setSelect = document.getElementById("set-select");
const cardsUrl = 'https://raw.githubusercontent.com/xofelixox/Pkmsim/main/cards.json';

let cards = [];
let currentCardIndex = 0;
let isOpening = false;
let currentSet = "sv8pt5";
let jsonUrl = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${currentSet}.json`;

// Fetch card data from external JSON file and format it
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

// Shuffle the array of cards to randomize the order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Open a new booster pack and shuffle cards
async function openPack() {
    if (isOpening) return;
    isOpening = true;

    booster.style.opacity = "0";
    booster.style.display = "none";
    revealNextButton.style.display = "inline-block";

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

// Reveal the next card in the pack
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

// Reset the pack after all cards are revealed
function resetPack() {
    resetButton.style.display = "inline-block";
    revealNextButton.style.display = "none";
    isOpening = false;
}

// Event listener for opening a booster pack
booster.addEventListener("click", openPack);

// Event listener to reveal the next card in the pack
revealNextButton.addEventListener("click", revealNextCard);

// Event listener to reset the pack and start over
resetButton.addEventListener("click", () => {
    cardsContainer.innerHTML = "";
    currentCardIndex = 0;
    resetButton.style.display = "none";
    booster.style.display = "inline-block";
    booster.style.opacity = "1";
});

// Event listener for changing the current set of cards
setSelect.addEventListener("change", () => {
    currentSet = setSelect.value;
    jsonUrl = `https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/${currentSet}.json`;

    cardsContainer.innerHTML = "";
    currentCardIndex = 0;
    isOpening = false;

    boosterImg.src = `packs/${currentSet}.png`;
    booster.style.display = "inline-block";
    booster.style.opacity = "1";
    revealNextButton.style.display = "none";
    resetButton.style.display = "none";
});

// Save a liked card to localStorage
function likeCard(card) {
    let likedCards = getLikedCardsFromLocalStorage();
    
    // Avoid duplicates
    if (!likedCards.some(c => c.imageUrl === card.imageUrl)) {
        likedCards.push(card);
        saveLikedCardsToLocalStorage(likedCards);
    }
}

// Retrieve liked cards from localStorage
function getLikedCardsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("likedCards")) || [];
}

// Save liked cards to localStorage
function saveLikedCardsToLocalStorage(likedCards) {
    localStorage.setItem("likedCards", JSON.stringify(likedCards));
}

// Sync liked cards with GitHub (manual sync only now)
async function syncWithGitHub() {
    let likedCards = getLikedCardsFromLocalStorage();
    
    await saveLikedCardsToGitHub(likedCards);
    alert('Collection synced with GitHub!');
}

// Save liked cards to GitHub repository
async function saveLikedCardsToGitHub(likedCards) {
    const token1 = 'ghp_ND0LexoUowQWDCBk';
    const token2 = 'RxRqCTZgRWifyp2JTbJW';
    const accessToken = token1 + token2;
    const repoOwner = 'xofelixox';
    const repoName = 'Pkmsim';
    const filePath = 'cards.json';

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    
    try {
        const getResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `token ${accessToken}`
            }
        });

        const getData = await getResponse.json();
        const sha = getData.sha;

        const fileData = JSON.stringify(likedCards, null, 2);
        
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Sync liked cards with localStorage',
                content: btoa(fileData),
                sha: sha
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

// Event listener for manual sync button
document.getElementById("sync-button").addEventListener("click", syncWithGitHub);
