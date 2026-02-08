// Player data
const allPlayers = [
    { id: 1, name: "Marty Buller", handicap: 19 },
    { id: 2, name: "Alan Pankhurst", handicap: 24 },
    { id: 3, name: "Scott Hooper", handicap: 15 },
    { id: 4, name: "Sam Buller", handicap: 18 },
    { id: 5, name: "David Buller", handicap: 21 },
    { id: 6, name: "Matt Buller", handicap: 22 },
    { id: 7, name: "Simon Pannell", handicap: 32 },
    { id: 8, name: "Cameron Jones", handicap: 10 }
];

// Course data
const courseData = {
    par: 71,
    holes: {
        1: { par: 4, si: 2, tallwood: 380, bloodwood: 353 },
        2: { par: 4, si: 12, tallwood: 346, bloodwood: 308 },
        3: { par: 3, si: 8, tallwood: 183, bloodwood: 170 },
        4: { par: 5, si: 14, tallwood: 485, bloodwood: 465 },
        5: { par: 3, si: 16, tallwood: 147, bloodwood: 139 },
        6: { par: 4, si: 6, tallwood: 335, bloodwood: 328 },
        7: { par: 5, si: 18, tallwood: 487, bloodwood: 453 },
        8: { par: 3, si: 4, tallwood: 182, bloodwood: 158 },
        9: { par: 4, si: 10, tallwood: 324, bloodwood: 304 },
        10: { par: 5, si: 13, tallwood: 456, bloodwood: 419 },
        11: { par: 3, si: 9, tallwood: 190, bloodwood: 150 },
        12: { par: 4, si: 1, tallwood: 425, bloodwood: 372 },
        13: { par: 4, si: 3, tallwood: 370, bloodwood: 346 },
        14: { par: 5, si: 15, tallwood: 505, bloodwood: 466 },
        15: { par: 4, si: 7, tallwood: 357, bloodwood: 326 },
        16: { par: 4, si: 5, tallwood: 372, bloodwood: 340 },
        17: { par: 3, si: 11, tallwood: 142, bloodwood: 131 },
        18: { par: 4, si: 17, tallwood: 460, bloodwood: 436 }
    }
};

// Current round state
let currentRound = null;
let activeRoundsUnsubscribe = null;
let modalRoundData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeLiveScoresPlayers();
    initializeQuickNav();
    document.getElementById('score-date').valueAsDate = new Date();
    setTimeout(checkForTodaysActiveRounds, 1000);
});
