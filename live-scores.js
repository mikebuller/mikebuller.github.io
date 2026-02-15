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
    initializeQuickNav();
    
    // Check for round/score URL parameters (coming from rounds.html)
    checkUrlForRoundParams();
    
    setTimeout(checkForTodaysActiveRounds, 1000);
});

// Store pending round params for loading after Firebase init
let pendingRoundParams = null;

// Check URL for round and score parameters
function checkUrlForRoundParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const roundId = urlParams.get('round');
    const scoreId = urlParams.get('score');
    
    if (roundId && scoreId) {
        console.log('Loading round from URL params:', roundId, scoreId);
        // Show loading state
        showLoadingState();
        
        // If Firebase is already ready, load immediately
        if (window.db && window.firestoreHelpers) {
            loadRoundFromParams(roundId, scoreId);
        } else {
            // Store params and wait for Firebase ready callback
            pendingRoundParams = { roundId, scoreId };
        }
    } else {
        // No round params - show "no round" state
        showNoRoundState();
    }
}

// Called by firebase-init.js when Firebase is ready
window.onFirebaseReady = function() {
    console.log('Firebase ready, checking for pending round load...');
    if (pendingRoundParams) {
        loadRoundFromParams(pendingRoundParams.roundId, pendingRoundParams.scoreId);
        pendingRoundParams = null;
    }
};

// Show loading state
function showLoadingState() {
    const loading = document.getElementById('round-loading');
    const noRound = document.getElementById('no-round');
    const scoreEntry = document.getElementById('score-entry');
    
    if (loading) loading.style.display = 'block';
    if (noRound) noRound.style.display = 'none';
    if (scoreEntry) scoreEntry.style.display = 'none';
}

// Show no round state
function showNoRoundState() {
    const loading = document.getElementById('round-loading');
    const noRound = document.getElementById('no-round');
    const scoreEntry = document.getElementById('score-entry');
    
    if (loading) loading.style.display = 'none';
    if (noRound) noRound.style.display = 'block';
    if (scoreEntry) scoreEntry.style.display = 'none';
}

// Show score entry state
function showScoreEntryState() {
    const loading = document.getElementById('round-loading');
    const noRound = document.getElementById('no-round');
    const scoreEntry = document.getElementById('score-entry');
    
    if (loading) loading.style.display = 'none';
    if (noRound) noRound.style.display = 'none';
    if (scoreEntry) scoreEntry.style.display = 'block';
}

// Load round and score from Firebase using URL parameters
async function loadRoundFromParams(roundId, scoreId) {
    if (!window.db || !window.firestoreHelpers) {
        console.error('Firebase not initialized when loadRoundFromParams called');
        alert('Failed to connect to database. Please refresh the page.');
        showNoRoundState();
        return;
    }
    
    try {
        const { doc, getDoc } = window.firestoreHelpers;
        
        // Fetch the round data
        const roundRef = doc(window.db, 'rounds', roundId);
        const roundSnap = await getDoc(roundRef);
        
        if (!roundSnap.exists()) {
            console.error('Round not found:', roundId);
            alert('Round not found. Please try again.');
            return;
        }
        
        const roundData = roundSnap.data();
        
        // Fetch the score data
        const scoreRef = doc(window.db, 'scores', scoreId);
        const scoreSnap = await getDoc(scoreRef);
        
        if (!scoreSnap.exists()) {
            console.error('Score not found:', scoreId);
            alert('Score entry not found. Please try again.');
            return;
        }
        
        const scoreData = scoreSnap.data();
        
        // Initialize current round with the loaded data
        currentRound = {
            roundId: roundId,
            scoreId: scoreId,
            entryType: scoreData.entryType || 'player',
            playerId: scoreData.playerId,
            playerName: scoreData.playerName,
            teamName: scoreData.teamName,
            handicap: scoreData.handicap || 18,
            tees: scoreData.tees || roundData.settings?.tees || 'tallwood',
            course: roundData.settings?.course || 'Bonville Golf Resort',
            date: roundData.date,
            currentHole: 1,
            scores: scoreData.scores || {},
            putts: scoreData.putts || {},
            fir: scoreData.fir || {},
            gir: scoreData.gir || {}
        };
        
        // Find the last hole with a score to resume from
        for (let i = 18; i >= 1; i--) {
            if (currentRound.scores[i] !== undefined) {
                currentRound.currentHole = Math.min(i + 1, 18);
                break;
            }
        }
        
        // Update UI
        document.getElementById('current-player-name').textContent = currentRound.playerName;
        const teesDisplay = document.getElementById('current-tees-display');
        if (teesDisplay) {
            teesDisplay.textContent = currentRound.tees.charAt(0).toUpperCase() + currentRound.tees.slice(1);
        }
        
        // Show score entry
        showScoreEntryState();
        
        // Initialize hole display
        updateHoleDisplay();
        
        // Show header leaderboard and start listening for updates
        showHeaderLeaderboard();
        
        console.log('Round loaded successfully:', currentRound);
        
    } catch (error) {
        console.error('Error loading round:', error);
        alert('Failed to load round. Please try again.');
    }
}

// Initialize player dropdown
function initializeLiveScoresPlayers() {
    const select = document.getElementById('score-player');
    if (!select) return;
    
    // Clear existing options except first
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add players
    allPlayers.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (HCP: ${player.handicap})`;
        option.dataset.handicap = player.handicap;
        select.appendChild(option);
    });
}

// Toggle between player and team entry type
function toggleEntryType() {
    const entryType = document.querySelector('input[name="entry-type"]:checked')?.value;
    const playerField = document.getElementById('player-select-field');
    const teamField = document.getElementById('team-name-field');
    
    if (entryType === 'team') {
        playerField.style.display = 'none';
        teamField.style.display = 'block';
    } else {
        playerField.style.display = 'block';
        teamField.style.display = 'none';
    }
}

// Initialize quick navigation grid
function initializeQuickNav() {
    const grid = document.getElementById('quick-nav-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 1; i <= 18; i++) {
        const btn = document.createElement('button');
        btn.className = 'quick-nav-btn';
        btn.textContent = i;
        btn.onclick = () => goToHole(i);
        grid.appendChild(btn);
    }
}

// Check for today's active rounds
function checkForTodaysActiveRounds() {
    // Placeholder - can be implemented to show active rounds
    console.log('Checking for active rounds...');
}

// Start a new round
function startRound() {
    const entryType = document.querySelector('input[name="entry-type"]:checked')?.value || 'player';
    const tees = document.querySelector('input[name="tees"]:checked')?.value || 'tallwood';
    const date = document.getElementById('score-date')?.value;
    
    let playerName, handicap, playerId, teamName;
    
    if (entryType === 'player') {
        const playerSelect = document.getElementById('score-player');
        if (!playerSelect.value) {
            alert('Please select a player');
            return;
        }
        playerId = parseInt(playerSelect.value);
        const player = allPlayers.find(p => p.id === playerId);
        playerName = player.name;
        handicap = player.handicap;
    } else {
        teamName = document.getElementById('team-name')?.value?.trim();
        if (!teamName) {
            alert('Please enter a team name');
            return;
        }
        playerName = teamName;
        handicap = 18; // Default team handicap
    }
    
    // Initialize current round
    currentRound = {
        entryType: entryType,
        playerId: playerId || null,
        playerName: playerName,
        teamName: entryType === 'team' ? teamName : null,
        handicap: handicap,
        tees: tees,
        date: date,
        currentHole: 1,
        scores: {},
        putts: {},
        fir: {},
        gir: {}
    };
    
    // Update UI
    document.getElementById('current-player-name').textContent = playerName;
    const teesDisplay = document.getElementById('current-tees-display');
    if (teesDisplay) {
        teesDisplay.textContent = tees.charAt(0).toUpperCase() + tees.slice(1);
    }
    
    // Show score entry, hide setup
    document.getElementById('round-setup').style.display = 'none';
    document.getElementById('score-entry').style.display = 'block';
    
    // Initialize first hole
    updateHoleDisplay();
    
    // Save active round to Firebase and show header leaderboard
    saveActiveRoundToFirebase();
    showHeaderLeaderboard();
}

// Exit current round
function exitRound() {
    if (confirm('Do you want to exit this round? You can continue the round after exiting.')) {
        currentRound = null;
        window.location.href = 'rounds.html';
    }
}

// Navigate to previous hole
function prevHole() {
    if (currentRound && currentRound.currentHole > 1) {
        currentRound.currentHole--;
        updateHoleDisplay();
    }
}

// Navigate to next hole
function nextHole() {
    if (currentRound && currentRound.currentHole < 18) {
        currentRound.currentHole++;
        updateHoleDisplay();
    }
}

// Go to specific hole
function goToHole(holeNum) {
    if (currentRound && holeNum >= 1 && holeNum <= 18) {
        currentRound.currentHole = holeNum;
        updateHoleDisplay();
    }
}

// Update hole display
function updateHoleDisplay() {
    if (!currentRound) return;
    
    const hole = currentRound.currentHole;
    const holeData = courseData.holes[hole];
    const tees = currentRound.tees;
    
    document.getElementById('current-hole-number').textContent = `Hole ${hole}`;
    
    const holeDetailsEl = document.getElementById('current-hole-details');
    const isBonville = (currentRound.course || '').toLowerCase().includes('bonville');
    if (isBonville) {
        holeDetailsEl.textContent = `Par ${holeData.par} • ${holeData[tees]}m • Index ${holeData.si}`;
        holeDetailsEl.style.display = '';
    } else {
        holeDetailsEl.style.display = 'none';
    }
    
    // Update score and putts display
    const score = currentRound.scores[hole];
    const putts = currentRound.putts[hole];
    document.getElementById('current-score').textContent = score !== undefined ? score : '-';
    document.getElementById('current-putts').textContent = putts !== undefined ? putts : '-';
    
    // Update FIR and GIR checkboxes
    const firCheckbox = document.getElementById('current-fir');
    const girCheckbox = document.getElementById('current-gir');
    if (firCheckbox) firCheckbox.checked = !!currentRound.fir[hole];
    if (girCheckbox) girCheckbox.checked = !!currentRound.gir[hole];
    
    // Update navigation buttons
    document.getElementById('prev-hole-btn').disabled = hole === 1;
    document.getElementById('next-hole-btn').disabled = hole === 18;
    
    // Update quick nav
    updateQuickNav();
    
    // Update totals
    updateTotals();
}

// Adjust score
function adjustScore(delta) {
    if (!currentRound) return;
    
    const hole = currentRound.currentHole;
    const holeData = courseData.holes[hole];
    let current = currentRound.scores[hole];
    
    if (current === undefined) {
        current = holeData.par; // Start at par
    }
    
    const newScore = Math.max(1, current + delta);
    currentRound.scores[hole] = newScore;
    document.getElementById('current-score').textContent = newScore;
    
    updateQuickNav();
    updateTotals();
    
    // Save to Firebase for real-time leaderboard updates
    saveActiveRoundToFirebase();
}

// Adjust putts
function adjustPutts(delta) {
    if (!currentRound) return;
    
    const hole = currentRound.currentHole;
    let current = currentRound.putts[hole];
    
    if (current === undefined) {
        current = 0; // Start at 0, so first click of +1 gives 1
    }
    
    const newPutts = Math.max(0, current + delta);
    currentRound.putts[hole] = newPutts;
    document.getElementById('current-putts').textContent = newPutts;
    
    // Track when a 3+ putt occurs (the snake!)
    // The snake goes to whoever MOST RECENTLY recorded a 3+ putt
    const currentHolePutts = currentRound.putts[hole];
    
    if (currentHolePutts >= 3) {
        // This hole has 3+ putts - update the timestamp to NOW
        // This means this player just got the snake
        currentRound.lastThreePuttTime = new Date().toISOString();
        currentRound.lastThreePuttHole = hole;
    } else {
        // Check if player still has any 3+ putts on other holes
        let stillHasThreePutt = false;
        for (let i = 1; i <= 18; i++) {
            if (currentRound.putts[i] >= 3) {
                stillHasThreePutt = true;
                break;
            }
        }
        // If no more 3+ putts, clear the timestamp so snake can go back to previous holder
        if (!stillHasThreePutt) {
            currentRound.lastThreePuttTime = null;
            currentRound.lastThreePuttHole = null;
        }
    }
    
    // Update totals display
    updateTotals();
    
    // Save to Firebase for real-time leaderboard updates
    saveActiveRoundToFirebase();
}

// Toggle Fairway In Regulation
function toggleFIR() {
    if (!currentRound) return;
    const hole = currentRound.currentHole;
    const checkbox = document.getElementById('current-fir');
    currentRound.fir[hole] = checkbox.checked;
    updateTotals();
    saveActiveRoundToFirebase();
}

// Toggle Green In Regulation
function toggleGIR() {
    if (!currentRound) return;
    const hole = currentRound.currentHole;
    const checkbox = document.getElementById('current-gir');
    currentRound.gir[hole] = checkbox.checked;
    updateTotals();
    saveActiveRoundToFirebase();
}

// Update quick nav to show completed holes
function updateQuickNav() {
    if (!currentRound) return;
    
    const buttons = document.querySelectorAll('.quick-nav-btn');
    buttons.forEach((btn, index) => {
        const holeNum = index + 1;
        btn.classList.remove('active', 'completed');
        
        if (holeNum === currentRound.currentHole) {
            btn.classList.add('active');
        }
        if (currentRound.scores[holeNum] !== undefined) {
            btn.classList.add('completed');
        }
    });
}

// Update running totals
function updateTotals() {
    if (!currentRound) return;
    
    const handicap = currentRound.handicap || 0;
    
    // Helper to calculate stableford points for a hole
    const calcStablefordPoints = (score, par, si) => {
        if (!score) return 0;
        let strokes = 0;
        if (handicap >= si) strokes++;
        if (handicap >= 18 + si) strokes++;
        const adjustedPar = par + strokes;
        const diff = adjustedPar - score;
        if (diff <= -2) return 0;
        return diff + 2;
    };
    
    let front9Score = 0, back9Score = 0, front9Count = 0, back9Count = 0;
    let front9Par = 0, back9Par = 0;
    let front9Stableford = 0, back9Stableford = 0;
    let front9Putts = 0, back9Putts = 0;
    
    for (let i = 1; i <= 9; i++) {
        front9Par += courseData.holes[i].par;
        if (currentRound.scores[i] !== undefined) {
            front9Score += currentRound.scores[i];
            front9Count++;
            front9Stableford += calcStablefordPoints(currentRound.scores[i], courseData.holes[i].par, courseData.holes[i].si);
        }
        if (currentRound.putts[i] !== undefined) {
            front9Putts += currentRound.putts[i];
        }
    }
    
    for (let i = 10; i <= 18; i++) {
        back9Par += courseData.holes[i].par;
        if (currentRound.scores[i] !== undefined) {
            back9Score += currentRound.scores[i];
            back9Count++;
            back9Stableford += calcStablefordPoints(currentRound.scores[i], courseData.holes[i].par, courseData.holes[i].si);
        }
        if (currentRound.putts[i] !== undefined) {
            back9Putts += currentRound.putts[i];
        }
    }
    
    const totalScore = front9Score + back9Score;
    const totalPutts = front9Putts + back9Putts;
    const totalStableford = front9Stableford + back9Stableford;
    const net = Math.round(totalScore - handicap);
    
    // Format relative to par display
    const formatRelativeToPar = (score, par, hasScores) => {
        if (!hasScores) return '-';
        const diff = score - par;
        if (diff === 0) return 'E';
        return diff > 0 ? `+${diff}` : `${diff}`;
    };
    
    // Calculate par for holes played only
    let front9ParPlayed = 0, back9ParPlayed = 0;
    for (let i = 1; i <= 9; i++) {
        if (currentRound.scores[i] !== undefined) {
            front9ParPlayed += courseData.holes[i].par;
        }
    }
    for (let i = 10; i <= 18; i++) {
        if (currentRound.scores[i] !== undefined) {
            back9ParPlayed += courseData.holes[i].par;
        }
    }
    
    // Update display
    document.getElementById('stableford-total').textContent = (front9Count + back9Count) > 0 ? totalStableford : '-';
    document.getElementById('putts-total').textContent = totalPutts > 0 ? totalPutts : '-';
    document.getElementById('front-9-total').textContent = formatRelativeToPar(front9Score, front9ParPlayed, front9Count > 0);
    document.getElementById('back-9-total').textContent = formatRelativeToPar(back9Score, back9ParPlayed, back9Count > 0);
    document.getElementById('gross-total').textContent = (front9Count + back9Count) > 0 ? totalScore : '-';
    document.getElementById('net-total').textContent = (front9Count + back9Count) > 0 ? net : '-';
    
    // Calculate FIR and GIR totals
    let firCount = 0, girCount = 0, holesPlayed = front9Count + back9Count;
    for (let i = 1; i <= 18; i++) {
        if (currentRound.fir[i]) firCount++;
        if (currentRound.gir[i]) girCount++;
    }
    document.getElementById('fir-total').textContent = holesPlayed > 0 ? firCount : '-';
    document.getElementById('gir-total').textContent = holesPlayed > 0 ? girCount : '-';
}

// Fire confetti celebration
function fireConfetti() {
    const duration = 6000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confetti from both sides
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#006747', '#C9A227', '#FFD700', '#FFFFFF']
        }));
        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#006747', '#C9A227', '#FFD700', '#FFFFFF']
        }));
    }, 250);
}

// Save round to Firebase
async function saveRound() {
    if (!currentRound) {
        alert('No active round to save');
        return;
    }
    
    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    if (!confirm('You will not be able to update scores once a round is complete. Are you sure you want to submit?')) {
        return;
    }
    
    try {
        const { doc, setDoc, updateDoc, deleteDoc } = window.firestoreHelpers;
        
        // Calculate totals for the completed round
        let totalScore = 0;
        let totalStableford = 0;
        const handicap = currentRound.handicap || 0;
        
        for (let i = 1; i <= 18; i++) {
            if (currentRound.scores[i] !== undefined) {
                totalScore += currentRound.scores[i];
                // Calculate stableford points
                const par = courseData.holes[i].par;
                const si = courseData.holes[i].si;
                let strokes = 0;
                if (handicap >= si) strokes++;
                if (handicap >= 18 + si) strokes++;
                const adjustedPar = par + strokes;
                const diff = adjustedPar - currentRound.scores[i];
                totalStableford += diff <= -2 ? 0 : diff + 2;
            }
        }
        
        // Use existing scoreId if we have one (from joining a round), otherwise create new
        const scoreId = currentRound.scoreId || `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scoreData = {
            id: scoreId,
            tournamentId: null,
            roundId: currentRound.roundId || null,
            playerId: currentRound.playerId,
            playerName: currentRound.playerName,
            entryType: currentRound.entryType,
            teamName: currentRound.teamName,
            handicap: currentRound.handicap,
            tees: currentRound.tees,
            date: currentRound.date,
            scores: currentRound.scores,
            putts: currentRound.putts,
            fir: currentRound.fir,
            gir: currentRound.gir,
            status: 'completed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(window.db, 'scores', scoreId), scoreData);
        
        // Mark as finished in activeRounds collection so leaderboard shows "F"
        if (currentRound.roundId && currentRound.scoreId) {
            const activeRoundId = `${currentRound.roundId}_${currentRound.scoreId}`;
            try {
                await updateDoc(doc(window.db, 'activeRounds', activeRoundId), {
                    status: 'finished',
                    updatedAt: new Date().toISOString()
                });
                console.log('Marked active round as finished:', activeRoundId);
            } catch (e) {
                console.log('Could not update active round (may not exist):', e);
            }
        }
        
        // Remove from joinedRounds in sessionStorage
        if (currentRound.roundId) {
            let joinedRounds = JSON.parse(sessionStorage.getItem('joinedRounds') || '[]');
            joinedRounds = joinedRounds.filter(r => r.roundId !== currentRound.roundId || r.scoreId !== currentRound.scoreId);
            sessionStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));
        }
        
        // Add to completedRounds in localStorage
        const completedRounds = JSON.parse(localStorage.getItem('completedRounds') || '[]');
        completedRounds.unshift({
            id: scoreId,
            roundId: currentRound.roundId,
            name: currentRound.playerName + ' - Round',
            playerName: currentRound.playerName,
            course: currentRound.course || 'Bonville Golf Resort',
            date: currentRound.date,
            handicap: currentRound.handicap,
            tees: currentRound.tees,
            scores: currentRound.scores,
            putts: currentRound.putts,
            fir: currentRound.fir,
            gir: currentRound.gir,
            totalScore: totalScore,
            stablefordPoints: totalStableford,
            joinCode: ''
        });
        localStorage.setItem('completedRounds', JSON.stringify(completedRounds));
        
        // Fire confetti celebration!
        fireConfetti();
        //
        // // Show success message
        // alert('🎉 Round saved successfully!');
        
        // Reset
        currentRound = null;
        
        // Redirect back to rounds page after a short delay to show confetti
        setTimeout(() => {
            window.location.href = `rounds.html?completed=${scoreId}`;
        }, 2000);
        
    } catch (error) {
        console.error('Error saving round:', error);
        alert('Failed to save round. Please try again.');
    }
}

// Close scorecard modal
function closeScorecardModal() {
    document.getElementById('scorecard-modal').style.display = 'none';
}

// Show hole image modal
function showHoleImage() {
    if (!currentRound) return;
    const hole = currentRound.currentHole;
    const holeData = courseData.holes[hole];
    const tees = currentRound.tees || 'tallwood';
    const distance = holeData[tees];
    const modal = document.getElementById('hole-image-modal');
    const img = document.getElementById('hole-image-display');
    const caption = document.getElementById('hole-image-caption');
    
    img.src = `holes/hole-${hole}.jpg`;
    caption.textContent = `Hole ${hole} - Par ${holeData.par} • SI ${holeData.si} • ${distance}m`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close hole image modal
function closeHoleImage() {
    document.getElementById('hole-image-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// ========================================
// HEADER LEADERBOARD FUNCTIONS
// ========================================

// Position the header leaderboard below navbar
function positionHeaderLeaderboard() {
    const headerLb = document.getElementById('header-leaderboard');
    const navbar = document.querySelector('.navbar');
    
    if (headerLb && navbar) {
        const navbarHeight = navbar.offsetHeight;
        headerLb.style.top = navbarHeight + 'px';
    }
    
    updateSectionPadding();
}

function updateSectionPadding() {
    const headerLb = document.getElementById('header-leaderboard');
    const navbar = document.querySelector('.navbar');
    const section = document.getElementById('live-scores');
    
    if (!section || !navbar) return;
    
    if (headerLb && headerLb.style.display !== 'none') {
        const navbarHeight = navbar.offsetHeight;
        const lbHeight = headerLb.offsetHeight;
        section.style.paddingTop = (navbarHeight + lbHeight - 55) + 'px';
    }
}

// Recalculate padding after leaderboard collapse/expand transition ends
document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('header-leaderboard-content');
    if (content) {
        content.addEventListener('transitionend', () => {
            updateSectionPadding();
        });
    }
});

// Show the header leaderboard
function showHeaderLeaderboard() {
    const headerLb = document.getElementById('header-leaderboard');
    if (!headerLb) return;
    
    headerLb.style.display = 'block';
    document.body.classList.add('header-lb-active');
    
    // Position header leaderboard and section padding (must be after display:block)
    positionHeaderLeaderboard();
    
    // Re-position on window resize
    window.addEventListener('resize', positionHeaderLeaderboard);
    
    // Start real-time listener
    startActiveRoundsListener();
}

// Hide the header leaderboard
function hideHeaderLeaderboard() {
    const headerLb = document.getElementById('header-leaderboard');
    if (!headerLb) return;
    
    headerLb.style.display = 'none';
    document.body.classList.remove('header-lb-active');
    
    // Reset section padding
    const section = document.getElementById('live-scores');
    if (section) {
        section.classList.remove('with-leaderboard');
        section.style.paddingTop = '';
    }
    
    // Remove resize listener
    window.removeEventListener('resize', positionHeaderLeaderboard);
    
    // Stop real-time listener
    stopActiveRoundsListener();
}

// Start real-time listener for active rounds
function startActiveRoundsListener() {
    if (!window.db || !window.firestoreHelpers) {
        console.log('Firebase not initialized, will retry...');
        setTimeout(startActiveRoundsListener, 500);
        return;
    }
    
    // Stop any existing listener first
    stopActiveRoundsListener();
    
    try {
        const { collection, query, where, onSnapshot } = window.firestoreHelpers;
        
        // Get the current round ID to filter by
        const currentRoundId = currentRound?.roundId || null;
        
        let roundsQuery;
        if (currentRoundId) {
            // Filter by the current round
            roundsQuery = query(
                collection(window.db, 'activeRounds'),
                where('roundId', '==', currentRoundId)
            );
            console.log('Setting up listener for roundId:', currentRoundId);
        } else {
            // Fallback to all active rounds (for backwards compatibility)
            roundsQuery = collection(window.db, 'activeRounds');
            console.log('Setting up listener for all active rounds');
        }
        
        activeRoundsUnsubscribe = onSnapshot(
            roundsQuery,
            (snapshot) => {
                const activeRounds = [];
                snapshot.forEach(doc => {
                    activeRounds.push({ id: doc.id, ...doc.data() });
                });
                
                console.log('Received active rounds update:', activeRounds.length, 'rounds');
                
                // Update the leaderboard with new data
                renderHeaderLeaderboard(activeRounds);
            },
            (error) => {
                console.error('Error listening to active rounds:', error);
            }
        );
        
        console.log('Real-time listener started for active rounds');
    } catch (error) {
        console.error('Error starting listener:', error);
    }
}

// Stop real-time listener
function stopActiveRoundsListener() {
    if (activeRoundsUnsubscribe) {
        activeRoundsUnsubscribe();
        activeRoundsUnsubscribe = null;
        console.log('Real-time listener stopped');
    }
}

// Toggle header leaderboard collapse/expand
function toggleHeaderLeaderboard() {
    const content = document.getElementById('header-leaderboard-content');
    const chevron = document.getElementById('header-leaderboard-chevron');
    
    if (!content) return;
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        if (chevron) chevron.textContent = '▲';
    } else {
        content.classList.add('collapsed');
        if (chevron) chevron.textContent = '▼';
    }
    
    updateSectionPadding();
}

// Update header leaderboard with current scores from Firebase (manual fetch)
async function updateHeaderLeaderboard() {
    const container = document.getElementById('header-leaderboard-content');
    if (!container) return;
    
    // Fetch active rounds from Firebase
    let activeRounds = [];
    const currentRoundId = currentRound?.roundId || null;
    
    if (window.db && window.firestoreHelpers) {
        try {
            const { collection, query, where, getDocs } = window.firestoreHelpers;
            
            let roundsQuery;
            if (currentRoundId) {
                // Filter by the current round
                roundsQuery = query(
                    collection(window.db, 'activeRounds'),
                    where('roundId', '==', currentRoundId)
                );
            } else {
                // Fallback to all active rounds
                roundsQuery = collection(window.db, 'activeRounds');
            }
            
            const snapshot = await getDocs(roundsQuery);
            
            snapshot.forEach(doc => {
                activeRounds.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error fetching active rounds:', error);
        }
    }
    
    // If no active rounds in Firebase, check if current local round exists
    if (activeRounds.length === 0 && currentRound) {
        // Fallback to local current round
        activeRounds.push({
            playerId: currentRound.playerId,
            playerName: currentRound.playerName,
            playerHandicap: currentRound.handicap,
            holes: currentRound.scores,
            currentHole: currentRound.currentHole,
            roundId: currentRound.roundId
        });
    }
    
    // Render using the shared function
    renderHeaderLeaderboard(activeRounds);
}

// Helper function to calculate stableford points
function getStablefordPoints(score, par, si, handicap) {
    let strokes = 0;
    if (handicap >= si) strokes++;
    if (handicap >= 18 + si) strokes++;
    const adjustedPar = par + strokes;
    const diff = adjustedPar - score;
    if (diff <= -2) return 0;
    return diff + 2;
}

// Render header leaderboard with provided active rounds data
function renderHeaderLeaderboard(activeRounds) {
    const container = document.getElementById('header-leaderboard-content');
    const headerLb = document.getElementById('header-leaderboard');
    if (!container) return;
    
    console.log('renderHeaderLeaderboard called with', activeRounds?.length || 0, 'rounds');
    
    // Filter to only rounds with at least one score entered
    const roundsWithScores = (activeRounds || []).filter(round => {
        if (!round.holes) {
            console.log('Round has no holes data:', round.playerName);
            return false;
        }
        // Check if any hole has a score
        for (let i = 1; i <= 18; i++) {
            if (round.holes[i] && round.holes[i].score !== null && round.holes[i].score !== undefined) {
                console.log('Round has score for hole', i, ':', round.holes[i].score, 'player:', round.playerName);
                return true;
            }
        }
        console.log('Round has no scores:', round.playerName, 'holes:', JSON.stringify(round.holes));
        return false;
    });
    
    console.log('Rounds with scores:', roundsWithScores.length);
    
    // If no rounds with scores, show empty state but keep leaderboard visible
    if (roundsWithScores.length === 0) {
        container.innerHTML = '<div class="header-lb-empty">Waiting for scores...</div>';
        // Don't hide - keep it visible so users know it's there
        return;
    }
    
    // Show the leaderboard (only when there are scores)
    if (headerLb) {
        headerLb.style.display = 'block';
        positionHeaderLeaderboard();
    }
    
    // Find who has the snake (most recent 3+ putt across all players)
    // Only consider players who CURRENTLY have at least one 3+ putt
    let snakePlayerKey = null;
    let snakeTimestamp = null;
    
    console.log('Snake detection - checking all rounds:');
    roundsWithScores.forEach(round => {
        console.log(`  Player: ${round.playerName}, lastThreePuttTime: ${round.lastThreePuttTime}`);
        
        // Check if this player currently has any 3+ putts
        let hasThreePutt = false;
        if (round.holes) {
            for (let i = 1; i <= 18; i++) {
                if (round.holes[i] && round.holes[i].putts >= 3) {
                    console.log(`    Has 3+ putts on hole ${i}: ${round.holes[i].putts} putts`);
                    hasThreePutt = true;
                    break;
                }
            }
        }
        
        if (!hasThreePutt) {
            console.log(`    No 3+ putts found`);
        }
        
        // Only consider for snake if they currently have a 3+ putt AND have a timestamp
        if (hasThreePutt && round.lastThreePuttTime) {
            const timestamp = new Date(round.lastThreePuttTime);
            console.log(`    Eligible for snake with timestamp: ${timestamp}`);
            if (!snakeTimestamp || timestamp > snakeTimestamp) {
                snakeTimestamp = timestamp;
                // Use a unique key - prefer id, fallback to scoreId, then playerName
                snakePlayerKey = round.id || round.scoreId || round.playerName;
                console.log(`    NEW snake holder: ${snakePlayerKey}`);
            }
        }
    });
    
    console.log(`Snake result: ${snakePlayerKey}`);
    
    // Build leaderboard data from rounds with scores only
    const leaderboardData = roundsWithScores.map(round => {
        let holesPlayed = 0;
        let totalScore = 0;
        let totalPar = 0;
        let stablefordPoints = 0;
        const handicap = round.playerHandicap || 0;
        
        // Calculate scores from holes data
        for (let i = 1; i <= 18; i++) {
            if (round.holes && round.holes[i] && round.holes[i].score !== null) {
                holesPlayed = i;
                totalScore += round.holes[i].score;
                totalPar += courseData.holes[i].par;
                stablefordPoints += getStablefordPoints(
                    round.holes[i].score,
                    courseData.holes[i].par,
                    courseData.holes[i].si,
                    handicap
                );
            }
        }
        
        // Use a unique key for this round - prefer id, fallback to scoreId, then playerName
        const roundKey = round.id || round.scoreId || round.playerName;
        
        return {
            id: round.playerId,
            uniqueKey: roundKey,
            name: round.playerName,
            handicap: handicap,
            holesPlayed: holesPlayed,
            currentHole: round.currentHole || holesPlayed,
            totalScore: totalScore,
            totalPar: totalPar,
            scoreToPar: totalScore - totalPar,
            stablefordPoints: stablefordPoints,
            isCurrentPlayer: currentRound && (currentRound.playerId == round.playerId || currentRound.playerName == round.playerName),
            isFinished: round.status === 'finished',
            hasSnake: roundKey === snakePlayerKey
        };
    });
    
    // Sort by stableford points (highest first), then by holes played (more holes first)
    leaderboardData.sort((a, b) => {
        // Players with scores come first
        if (a.holesPlayed > 0 && b.holesPlayed === 0) return -1;
        if (b.holesPlayed > 0 && a.holesPlayed === 0) return 1;
        if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0;
        
        // Sort by stableford points (highest first)
        if (a.stablefordPoints !== b.stablefordPoints) return b.stablefordPoints - a.stablefordPoints;
        
        // If tied, more holes played is better
        return b.holesPlayed - a.holesPlayed;
    });
    
    // Render leaderboard
    container.innerHTML = leaderboardData.map((player, index) => {
        const pos = index + 1;
        let scoreClass = 'even-par';
        let scoreDisplay = 'E';
        let parDisplay = 'E';
        
        if (player.holesPlayed > 0) {
            if (player.scoreToPar < 0) {
                scoreClass = 'under-par';
                parDisplay = player.scoreToPar.toString();
            } else if (player.scoreToPar > 0) {
                scoreClass = 'over-par';
                parDisplay = '+' + player.scoreToPar;
            }
            // Format: "-5 (12)" where -5 is to par and 12 is stableford
            scoreDisplay = `${parDisplay} (${player.stablefordPoints})`;
        } else {
            scoreDisplay = '-';
        }
        
        let playerClass = 'header-lb-player';
        if (pos === 1 && player.holesPlayed > 0) playerClass += ' leader';
        if (player.isCurrentPlayer) playerClass += ' current-player';
        if (!player.isFinished) playerClass += ' live';
        if (player.isFinished) playerClass += ' finished';
        
        const holeDisplay = player.isFinished ? 'F' : (player.currentHole > 0 ? `H${player.currentHole}` : 'Tee');
        const snakeIcon = player.hasSnake ? '🐍' : '';
        
        return `
            <div class="${playerClass}" onclick="openScorecardModal('${player.id}')">
                <span class="header-lb-pos">${pos}</span>
                <span class="header-lb-snake">${snakeIcon}</span>
                <span class="header-lb-name">${player.name}</span>
                <span class="header-lb-hole">${holeDisplay}</span>
                <span class="header-lb-score ${scoreClass}">${scoreDisplay}</span>
            </div>
        `;
    }).join('');
    
    // Recalculate section padding now that leaderboard content has changed
    updateSectionPadding();
    
    // Start auto-scroll if needed (desktop only)
    setTimeout(() => startLeaderboardAutoScroll(), 500);
}

// Auto-scroll variables
let autoScrollInterval = null;
let autoScrollPaused = false;

// Media query for desktop detection
const desktopMediaQuery = window.matchMedia('(min-width: 993px)');

// Listen for screen size changes to start/stop auto-scroll
desktopMediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
        // Switched to desktop - start auto-scroll
        startLeaderboardAutoScroll();
    } else {
        // Switched to mobile - stop auto-scroll and reset position
        stopLeaderboardAutoScroll();
        const container = document.getElementById('header-leaderboard-content');
        if (container) {
            container.scrollLeft = 0;
        }
    }
});

// Start auto-scroll for leaderboard on large screens
function startLeaderboardAutoScroll() {
    const container = document.getElementById('header-leaderboard-content');
    if (!container) return;
    
    // Clear existing interval
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
    }
    
    // Only auto-scroll on desktop and when there's overflow
    if (!desktopMediaQuery.matches) return;
    
    const needsScroll = container.scrollWidth > container.clientWidth;
    if (!needsScroll) return;
    
    // Auto-scroll every 3 seconds
    autoScrollInterval = setInterval(() => {
        if (autoScrollPaused) return;
        
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 10) {
            container.scrollLeft = 0;
        } else {
            container.scrollLeft += 150;
        }
    }, 3000);
    
    // Pause on hover
    container.addEventListener('mouseenter', () => { autoScrollPaused = true; });
    container.addEventListener('mouseleave', () => { autoScrollPaused = false; });
}

// Stop auto-scroll
function stopLeaderboardAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Open scorecard modal for a player
async function openScorecardModal(playerId) {
    // Fetch player's round data from Firebase
    if (!window.db || !window.firestoreHelpers) {
        console.log('Firebase not initialized');
        return;
    }
    
    try {
        const { collection, query, where, getDocs } = window.firestoreHelpers;
        
        // First try to find by the activeRounds document ID pattern
        const currentRoundId = currentRound?.roundId || null;
        let roundData = null;
        
        // Query activeRounds for this player in the current round
        const activeRoundsRef = collection(window.db, 'activeRounds');
        const snapshot = await getDocs(activeRoundsRef);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            // Match by playerId or playerName, and optionally by roundId
            if ((data.playerId == playerId || data.playerName == playerId) && 
                (!currentRoundId || data.roundId == currentRoundId)) {
                roundData = data;
            }
        });
        
        if (!roundData) {
            console.log('No active round found for player:', playerId);
            return;
        }
        
        modalRoundData = roundData;
        
        // Populate modal header
        document.getElementById('modal-player-name').textContent = modalRoundData.playerName;
        
        // Generate scorecard table
        generateModalScorecard();
        
        // Show modal
        document.getElementById('scorecard-modal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error fetching player round:', error);
    }
}

// Generate the scorecard table for the modal
function generateModalScorecard() {
    if (!modalRoundData) return;
    
    const container = document.getElementById('modal-scorecard-table');
    const handicap = modalRoundData.playerHandicap || 0;
    const holes = modalRoundData.holes || {};
    
    // Helper to calculate stableford points
    const calcStablefordPoints = (score, par, si) => {
        if (!score) return 0;
        let strokes = 0;
        if (handicap >= si) strokes++;
        if (handicap >= 18 + si) strokes++;
        const adjustedPar = par + strokes;
        const diff = adjustedPar - score;
        if (diff <= -2) return 0;
        return diff + 2;
    };
    
    // Calculate totals
    let front9Score = 0, back9Score = 0, front9Par = 0, back9Par = 0;
    let front9Stableford = 0, back9Stableford = 0;
    let front9Putts = 0, back9Putts = 0;
    
    for (let i = 1; i <= 9; i++) {
        front9Par += courseData.holes[i].par;
        if (holes[i] && holes[i].score) {
            front9Score += holes[i].score;
            front9Stableford += calcStablefordPoints(holes[i].score, courseData.holes[i].par, courseData.holes[i].si);
        }
        if (holes[i] && holes[i].putts) front9Putts += holes[i].putts;
    }
    
    for (let i = 10; i <= 18; i++) {
        back9Par += courseData.holes[i].par;
        if (holes[i] && holes[i].score) {
            back9Score += holes[i].score;
            back9Stableford += calcStablefordPoints(holes[i].score, courseData.holes[i].par, courseData.holes[i].si);
        }
        if (holes[i] && holes[i].putts) back9Putts += holes[i].putts;
    }
    
    const totalScore = front9Score + back9Score;
    const totalPar = front9Par + back9Par;
    const totalStableford = front9Stableford + back9Stableford;
    const totalPutts = front9Putts + back9Putts;
    
    // Generate BOTH layouts - CSS will show/hide based on screen size
    let html = '';
    
    // ========== VERTICAL LAYOUT (Mobile) ==========
    html += '<table class="modal-scorecard modal-scorecard-vertical">';
    html += '<thead><tr style="border-bottom: 2px solid rgba(255,255,255,0.3);"><th>Hole</th><th>Par</th><th>Score</th><th>Pts</th><th>Putts</th></tr></thead>';
    html += '<tbody>';
    
    // Front 9
    for (let i = 1; i <= 9; i++) {
        const hole = holes[i] || {};
        const score = hole.score || '-';
        const putts = hole.putts || '-';
        const pts = hole.score ? calcStablefordPoints(hole.score, courseData.holes[i].par, courseData.holes[i].si) : '-';
        
        let scoreClass = '';
        if (hole.score) {
            if (hole.score < courseData.holes[i].par) scoreClass = 'under-par';
            else if (hole.score > courseData.holes[i].par) scoreClass = 'over-par';
        }
        
        html += `<tr>
            <td>${i}</td>
            <td>${courseData.holes[i].par}</td>
            <td class="${scoreClass}">${score}</td>
            <td>${pts}</td>
            <td>${putts}</td>
        </tr>`;
    }
    
    // Front 9 totals
    html += `<tr class="subtotal-row">
        <td>OUT</td>
        <td>${front9Par}</td>
        <td>${front9Score || '-'}</td>
        <td>${front9Stableford || '-'}</td>
        <td>${front9Putts || '-'}</td>
    </tr>`;
    
    // Back 9
    for (let i = 10; i <= 18; i++) {
        const hole = holes[i] || {};
        const score = hole.score || '-';
        const putts = hole.putts || '-';
        const pts = hole.score ? calcStablefordPoints(hole.score, courseData.holes[i].par, courseData.holes[i].si) : '-';
        
        let scoreClass = '';
        if (hole.score) {
            if (hole.score < courseData.holes[i].par) scoreClass = 'under-par';
            else if (hole.score > courseData.holes[i].par) scoreClass = 'over-par';
        }
        
        html += `<tr>
            <td>${i}</td>
            <td>${courseData.holes[i].par}</td>
            <td class="${scoreClass}">${score}</td>
            <td>${pts}</td>
            <td>${putts}</td>
        </tr>`;
    }
    
    // Back 9 totals
    html += `<tr class="subtotal-row">
        <td>IN</td>
        <td>${back9Par}</td>
        <td>${back9Score || '-'}</td>
        <td>${back9Stableford || '-'}</td>
        <td>${back9Putts || '-'}</td>
    </tr>`;
    
    // Grand total
    html += `<tr class="total-row">
        <td>TOT</td>
        <td>${totalPar}</td>
        <td>${totalScore || '-'}</td>
        <td>${totalStableford || '-'}</td>
        <td>${totalPutts || '-'}</td>
    </tr>`;
    
    html += '</tbody></table>';
    
    // ========== HORIZONTAL LAYOUT (Desktop) ==========
    html += '<div class="modal-scorecard-horizontal-wrapper">';
    html += '<table class="modal-scorecard modal-scorecard-horizontal">';
    
    // Hole numbers row
    html += '<thead><tr><th class="row-label">Hole</th>';
    for (let i = 1; i <= 9; i++) html += `<th>${i}</th>`;
    html += '<th class="subtotal-col">OUT</th>';
    for (let i = 10; i <= 18; i++) html += `<th>${i}</th>`;
    html += '<th class="subtotal-col">IN</th><th class="total-col">TOT</th></tr></thead>';
    
    html += '<tbody>';
    
    // Par row
    html += '<tr class="par-row"><td class="row-label">Par</td>';
    for (let i = 1; i <= 9; i++) html += `<td>${courseData.holes[i].par}</td>`;
    html += `<td class="subtotal-col">${front9Par}</td>`;
    for (let i = 10; i <= 18; i++) html += `<td>${courseData.holes[i].par}</td>`;
    html += `<td class="subtotal-col">${back9Par}</td><td class="total-col">${totalPar}</td></tr>`;
    
    // Score row
    html += '<tr class="score-row"><td class="row-label">Score</td>';
    for (let i = 1; i <= 9; i++) {
        const hole = holes[i] || {};
        const score = hole.score || '-';
        let scoreClass = '';
        if (hole.score) {
            if (hole.score < courseData.holes[i].par) scoreClass = 'under-par';
            else if (hole.score > courseData.holes[i].par) scoreClass = 'over-par';
        }
        html += `<td class="${scoreClass}">${score}</td>`;
    }
    html += `<td class="subtotal-col">${front9Score || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const hole = holes[i] || {};
        const score = hole.score || '-';
        let scoreClass = '';
        if (hole.score) {
            if (hole.score < courseData.holes[i].par) scoreClass = 'under-par';
            else if (hole.score > courseData.holes[i].par) scoreClass = 'over-par';
        }
        html += `<td class="${scoreClass}">${score}</td>`;
    }
    html += `<td class="subtotal-col">${back9Score || '-'}</td><td class="total-col">${totalScore || '-'}</td></tr>`;
    
    // Stableford points row
    html += '<tr class="pts-row"><td class="row-label">Pts</td>';
    for (let i = 1; i <= 9; i++) {
        const hole = holes[i] || {};
        const pts = hole.score ? calcStablefordPoints(hole.score, courseData.holes[i].par, courseData.holes[i].si) : '-';
        let ptsClass = '';
        if (hole.score) {
            if (pts >= 3) ptsClass = 'under-par';
            else if (pts === 0) ptsClass = 'over-par';
        }
        html += `<td class="${ptsClass}">${pts}</td>`;
    }
    html += `<td class="subtotal-col">${front9Stableford || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const hole = holes[i] || {};
        const pts = hole.score ? calcStablefordPoints(hole.score, courseData.holes[i].par, courseData.holes[i].si) : '-';
        let ptsClass = '';
        if (hole.score) {
            if (pts >= 3) ptsClass = 'under-par';
            else if (pts === 0) ptsClass = 'over-par';
        }
        html += `<td class="${ptsClass}">${pts}</td>`;
    }
    html += `<td class="subtotal-col">${back9Stableford || '-'}</td><td class="total-col">${totalStableford || '-'}</td></tr>`;
    
    // Putts row
    html += '<tr class="putts-row"><td class="row-label">Putts</td>';
    for (let i = 1; i <= 9; i++) {
        const hole = holes[i] || {};
        const putts = hole.putts || '-';
        let puttClass = hole.putts >= 3 ? 'over-par' : '';
        html += `<td class="${puttClass}">${putts}</td>`;
    }
    html += `<td class="subtotal-col">${front9Putts || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const hole = holes[i] || {};
        const putts = hole.putts || '-';
        let puttClass = hole.putts >= 3 ? 'over-par' : '';
        html += `<td class="${puttClass}">${putts}</td>`;
    }
    html += `<td class="subtotal-col">${back9Putts || '-'}</td><td class="total-col">${totalPutts || '-'}</td></tr>`;
    
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
}

// Close scorecard modal
function closeScorecardModal() {
    document.getElementById('scorecard-modal').style.display = 'none';
    modalRoundData = null;
}


// Save active round to Firebase
async function saveActiveRoundToFirebase() {
    if (!currentRound) {
        console.log('saveActiveRoundToFirebase: No current round');
        return;
    }
    if (!window.db || !window.firestoreHelpers) {
        console.log('saveActiveRoundToFirebase: Firebase not ready');
        return;
    }
    
    try {
        const { doc, setDoc, updateDoc, deleteField } = window.firestoreHelpers;
        
        // Convert scores to holes format expected by leaderboard
        const holes = {};
        for (let i = 1; i <= 18; i++) {
            // Include hole data if there's a score OR putts recorded
            if (currentRound.scores[i] !== undefined || currentRound.putts[i] !== undefined) {
                holes[i] = {
                    score: currentRound.scores[i] !== undefined ? currentRound.scores[i] : null,
                    putts: currentRound.putts[i] || 0,
                    fir: !!currentRound.fir[i],
                    gir: !!currentRound.gir[i]
                };
            }
        }
        
        console.log('saveActiveRoundToFirebase: Saving holes data:', JSON.stringify(holes));
        
        // If we have a scoreId (from joining a round), update the scores collection too
        if (currentRound.scoreId) {
            const scoreRef = doc(window.db, 'scores', currentRound.scoreId);
            await updateDoc(scoreRef, {
                scores: currentRound.scores,
                putts: currentRound.putts,
                fir: currentRound.fir,
                gir: currentRound.gir,
                updatedAt: new Date().toISOString()
            });
        }
        
        const roundData = {
            playerId: currentRound.playerId || currentRound.playerName,
            playerName: currentRound.playerName,
            playerHandicap: currentRound.handicap,
            tees: currentRound.tees,
            date: currentRound.date,
            currentHole: currentRound.currentHole,
            holes: holes,
            status: 'active',
            roundId: currentRound.roundId || null,
            updatedAt: new Date().toISOString()
        };
        
        // Include lastThreePuttTime for snake tracking
        if (currentRound.lastThreePuttTime) {
            roundData.lastThreePuttTime = currentRound.lastThreePuttTime;
        }
        // Note: If lastThreePuttTime is null, we don't include it - 
        // but setDoc replaces the whole document, so we need to use updateDoc 
        // or merge option to properly handle the snake field
        
        // Use roundId_scoreId if available (from joined rounds), otherwise fallback to old format
        let activeRoundId;
        if (currentRound.roundId && currentRound.scoreId) {
            activeRoundId = `${currentRound.roundId}_${currentRound.scoreId}`;
        } else {
            activeRoundId = `round_${currentRound.playerId || currentRound.playerName}_${currentRound.date}`;
        }
        
        // Use setDoc with merge to update only specified fields, 
        // then use updateDoc with deleteField to remove lastThreePuttTime if needed
        await setDoc(doc(window.db, 'activeRounds', activeRoundId), roundData, { merge: true });
        
        // If no snake, explicitly delete the lastThreePuttTime field
        if (!currentRound.lastThreePuttTime) {
            await updateDoc(doc(window.db, 'activeRounds', activeRoundId), {
                lastThreePuttTime: deleteField()
            });
        }
        
        console.log('Active round saved to Firebase:', activeRoundId, 'roundId:', roundData.roundId);
    } catch (error) {
        console.error('Error saving active round:', error);
    }
}

// Check for active rounds from today and show header leaderboard
async function checkForTodaysActiveRounds() {
    if (!window.db || !window.firestoreHelpers) {
        console.log('Firebase not ready, will retry...');
        setTimeout(checkForTodaysActiveRounds, 1000);
        return;
    }
    
    try {
        const { collection, getDocs, query, where } = window.firestoreHelpers;
        const today = new Date().toISOString().split('T')[0];
        
        const snapshot = await getDocs(collection(window.db, 'activeRounds'));
        
        let hasActiveRounds = false;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.date === today || data.status === 'active') {
                hasActiveRounds = true;
            }
        });
        
        if (hasActiveRounds) {
            console.log('Found active rounds, showing header leaderboard');
            showHeaderLeaderboard();
        }
    } catch (error) {
        console.error('Error checking for active rounds:', error);
    }
}
