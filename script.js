const booster = document.getElementById("booster");
const cardsContainer = document.getElementById("cards-container");
const revealNextButton = document.getElementById("reveal-next");
const resetButton = document.getElementById("reset");

let cards = [];
let currentCardIndex = 0;
let isOpening = false;

// URL for the GitHub raw JSON (specific set)
const jsonUrl = "https://raw.githubusercontent.com/PokemonTCG/pokemon-tcg-data/master/cards/en/swsh12pt5.json";

// Fetch the card data from the GitHub JSON
async function fetchCards() {
    try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Map the data to extract the necessary information
            const cardData = data.map(card => ({
                name: card.name,
                imageUrl: card.images.large, // Large image
                rarity: card.rarity,
            }));

            return cardData;
        } else {
            console.error("No cards found in the JSON data");
            return [];
        }
    } catch (error) {
        console.error("Failed to fetch card data:", error);
        return [];
    }
}

// Shuffle function to randomize the array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Open the pack and reveal cards one by one
async function openPack() {
    if (isOpening) return; // Prevent multiple clicks during opening
    isOpening = true;

    // Hide the booster and display the reveal button
    booster.style.opacity = "0";
    setTimeout(() => {
        booster.style.display = "none";
        revealNextButton.style.display = "inline-block"; // Show the next card button
    }, 500);

    // Fetch the cards from the JSON
    cards = await fetchCards();

    // Shuffle the cards and select 5 random cards
    if (cards.length > 0) {
        shuffleArray(cards);
        cards = cards.slice(0, 5); // Pick the first 5 shuffled cards
    }

    // Check if cards are available
    if (!cards || cards.length === 0) {
        console.error("No cards to display");
        return;
    }

    // Show the first card
    revealNextCard();
}

// Reveal the next card in the sequence
function revealNextCard() {
    if (currentCardIndex >= 5) {
        resetPack();
        return;
    }

    const cardData = cards[currentCardIndex];
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    // Create the card image
    const img = document.createElement("img");
    img.src = cardData.imageUrl;

    // Create the star symbol for collection
    const star = document.createElement("div");
    star.classList.add("star");
    star.innerHTML = "★";

    // Add the image and star to the card
    cardDiv.appendChild(img);
    cardDiv.appendChild(star);

    // Display the card
    cardsContainer.appendChild(cardDiv);

    // Fade in the card
    setTimeout(() => {
        cardDiv.style.opacity = "1";
    }, 100);

    // Increase the index and prepare for the next card
    currentCardIndex++;
}

// Reset the pack after all cards are revealed
function resetPack() {
    resetButton.style.display = "inline-block"; // Show the reset button
    revealNextButton.style.display = "none"; // Hide the reveal button
    isOpening = false;
}

// Event listeners
booster.addEventListener("click", openPack);
revealNextButton.addEventListener("click", revealNextCard);
resetButton.addEventListener("click", () => {
    // Reset the container and reappear the booster
    cardsContainer.innerHTML = "";
    currentCardIndex = 0;
    resetButton.style.display = "none";
    booster.style.display = "inline-block";
    booster.style.opacity = "1";
});
