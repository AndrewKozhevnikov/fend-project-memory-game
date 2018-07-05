const open = 'open';
const match = 'match';
const incorrect = 'incorrect';

const startOpenAnimation = 'start_open_anim';
const endOpenAnimation = 'end_open_anim';
const closeAnimation = 'close_anim';
const matchAnimation = 'match_anim';
const incorrectAnimation = 'incorrect_anim';

const starIcon = 'fa-star';
const starBorderIcon = 'fa-star-o';

const container = document.querySelector('.container');
const restart = document.querySelector('.restart');
let cards = [...document.querySelectorAll('.card')];
let prevCard = null;

const stars = document.querySelectorAll('.stars li i');
const movesSpan = document.querySelector('.moves');
let moves = 0;
let starsCount = 3;

let matchedCardsCount = 0;

const timerSpan = document.querySelector('.timer');
const timer = new Timer();

timer.addEventListener('secondsUpdated', updateTimerSpan);
timer.addEventListener('reset', updateTimerSpan);

document.addEventListener('DOMContentLoaded', restartGame);
restart.addEventListener('click', restartGame);

/**
 * Update timer UI
 */
function updateTimerSpan() {
    timerSpan.textContent = timer.getTimeValues().toString();
}

/**
 * Restart game.
 * Reset all game statistics values.
 * Shuffle cards.
 */
function restartGame() {
    timer.reset();

    document.querySelector('.deck').remove();

    cards = shuffle(cards);
    cards = cleanCardsClassList(cards);

    const deck = document.createElement('UL');
    deck.classList.add('deck');
    for (let i = 0; i < cards.length; i++) {
        deck.appendChild(cards[i]);
    }

    deck.addEventListener('click', onCardClick);

    container.appendChild(deck);

    prevCard = null;

    moves = 0;
    updateScorePanel(moves);

    matchedCardsCount = 0;
}

/**
 * Handle on card click
 * @param event
 */
function onCardClick(event) {
    let card = event.target;

    if (card.tagName !== 'LI') {
        return;
    }

    if (cardIsOpenedOrMatched(card)) {
        return;
    }

    if (prevCard == null) {
        openCard(card);
        prevCard = card;
    } else {
        updateScorePanel(++moves);

        if (cardsAreMatched(prevCard, card)) {
            matchCards(prevCard, card);
        } else {
            incorrectGuess(prevCard, card);
        }

        prevCard = null;
    }
}

/**
 * Update score UI
 * @param moves
 */
function updateScorePanel(moves) {
    movesSpan.textContent = moves;

    for (let i = 0; i < stars.length; i++) {
        stars.item(i).classList.remove(starIcon, starBorderIcon);
    }

    const maxStars = 3;

    if (moves <= 10) {
        starsCount = maxStars;
    } else if (moves <= 20) {
        starsCount = maxStars - 1;
    } else {
        starsCount = maxStars - 2;
    }

    let i = 0;
    for (i; i < starsCount; i++) {
        stars.item(i).classList.add(starIcon);
    }
    for (i; i < maxStars; i++) {
        stars.item(i).classList.add(starBorderIcon);
    }
}

/**
 * Check if card is opened or matched
 * @param card
 * @returns {boolean}
 */
function cardIsOpenedOrMatched(card) {
    return (card.classList.contains(open)) || (card.classList.contains(match));
}

/**
 * Open card with animation
 * @param card
 */
function openCard(card) {
    function onHalfAnimationEnd() {
        card.removeEventListener('animationend', onHalfAnimationEnd);
        cleanCardClassList(card);
        card.classList.add(open, endOpenAnimation);
    }

    cleanCardClassList(card);
    card.addEventListener('animationend', onHalfAnimationEnd);
    card.classList.add(startOpenAnimation);
}

/**
 * Match cards with animation
 * @param prevCard
 * @param card
 */
function matchCards(prevCard, card) {
    cleanCardClassList(prevCard);
    cleanCardClassList(card);
    prevCard.classList.add(match, matchAnimation);
    card.classList.add(match, matchAnimation);

    matchedCardsCount += 2;

    const winCondition = 16;
    if (matchedCardsCount === winCondition) {
        const time = timer.getTimeValues().toString();
        timer.stop();
        showWinAlert(moves, starsCount, time);
    }
}

/**
 * Check if cards are matched
 * @param prevCard
 * @param card
 * @returns {boolean}
 */
function cardsAreMatched(prevCard, card) {
    const prevValue = prevCard.querySelector('i').classList[1];
    const value = card.querySelector('i').classList[1];

    return (prevValue === value);
}

/**
 * Show incorrect guess animation.
 * Then close cards with animation.
 * @param prevCard
 * @param card
 */
function incorrectGuess(prevCard, card) {
    function onAnimationEnd() {
        card.removeEventListener('animationend', onAnimationEnd);
        cleanCardClassList(prevCard);
        cleanCardClassList(card);

        prevCard.classList.add(closeAnimation);
        card.classList.add(closeAnimation);
    }

    card.addEventListener('animationend', onAnimationEnd);
    prevCard.classList.add(incorrect, incorrectAnimation);
    card.classList.add(incorrect, incorrectAnimation);
}

/**
 * Shuffle function from http://stackoverflow.com/a/2450976
 * @param array
 * @returns array
 */
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Remove all card classes except "card" class
 * @param card
 */
function cleanCardClassList(card) {
    card.classList.remove(match, open, incorrect,
        startOpenAnimation, endOpenAnimation, closeAnimation,
        matchAnimation, incorrectAnimation);
}

/**
 * Remove all card classes except "card" class
 * @param cards array
 * @returns cards array
 */
function cleanCardsClassList(cards) {
    for (let i = 0; i < cards.length; i++) {
        cleanCardClassList(cards[i]);
    }

    return cards;
}

/**
 * Show win dialog with game statistics
 * @param moves
 * @param stars
 * @param time
 */
function showWinAlert(moves, stars, time) {
    swal({
        title: 'Congratulations! You Won!',
        html:
            `With ${moves} Moves and ${stars} Stars.<br>` +
            `Time taken to win the game: ${time}<br>` +
            `Woohooo!`,
        type: 'success',
        confirmButtonText: 'Play again!',
        confirmButtonColor: '#02ccba'
    }).then(() => {
        restartGame();
    });
}
