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

function updateTimerSpan() {
    timerSpan.textContent = timer.getTimeValues().toString();
}

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

function onCardClick(event) {
    let card = event.target;

    if (card.tagName !== 'LI') {
        return;
    }

    if (cardIsOpenedOrMatched(card)) {
        return;
    }

    updateScorePanel(++moves);

    if (prevCard == null) {
        openCard(card);
        prevCard = card;
    } else {
        if (cardsAreMatched(prevCard, card)) {
            matchCards(prevCard, card);
        } else {
            incorrectGuess(prevCard, card);
        }

        prevCard = null;
    }
}

function updateScorePanel(moves) {
    movesSpan.textContent = moves;

    for (let i = 0; i < stars.length; i++) {
        stars.item(i).classList.remove(starIcon, starBorderIcon);
    }

    const maxStars = 3;

    if (moves <= 20) {
        starsCount = maxStars;
    } else if (moves <= 40) {
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

function cardIsOpenedOrMatched(card) {
    return (card.classList.contains(open)) || (card.classList.contains(match));
}

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

function cardsAreMatched(prevCard, card) {
    const prevValue = prevCard.querySelector('i').classList[1];
    const value = card.querySelector('i').classList[1];

    return (prevValue === value);
}

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

// Shuffle function from http://stackoverflow.com/a/2450976
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

function cleanCardClassList(card) {
    card.classList.remove(match, open, incorrect,
        startOpenAnimation, endOpenAnimation, closeAnimation,
        matchAnimation, incorrectAnimation);
}

function cleanCardsClassList(cards) {
    for (let i = 0; i < cards.length; i++) {
        cleanCardClassList(cards[i]);
    }

    return cards;
}

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
