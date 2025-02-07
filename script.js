const booster = document.getElementById("booster");
const boosterImg = document.getElementById("booster-img"); // New booster image element
const cardsContainer = document.getElementById("cards-container");
const revealNextButton = document.getElementById("reveal-next");
const resetButton = document.getElementById("reset");
const setSelect = document.getElementById("set-select");

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

    setTimeout(() => {
        revealNextButton.style.display = "inline-block";
    }, 500);

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
