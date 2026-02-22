// Course data is loaded from course-data.js (shared with rounds.js)
// getCourseData(courseName) returns the course object or null
// courseData is resolved per-round based on currentRound.course
let courseData = null;

// Current round state
let currentRound = null;
let activeRoundsUnsubscribe = null;
let completedRoundsUnsubscribe = null;

// Admin mode state
let isAdminMode = false;

// Cached data from both listeners for merging into the leaderboard
let cachedActiveRounds = [];
let cachedCompletedRounds = [];
let modalRoundData = null;

// Snake hiss sound effect for 3-putt events
const snakeHissSoundSrc = 'sounds/snake-hiss-laugh.mp3';

// Pickup sound effect for when players pick up
const pickupSoundSrc = 'sounds/you-suck-jackass.mp3';

// Shared AudioContext for Web Audio API playback (created on first user gesture)
let snakeAudioContext = null;
let snakeAudioBuffer = null;
let pickupAudioBuffer = null;

// Initialize the AudioContext and pre-load sound buffers.
// Must be called from a user gesture (tap/click) to satisfy iOS autoplay policy.
async function initAudio() {
    if (snakeAudioContext) return; // Already initialised

    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        snakeAudioContext = new AudioCtx();

        // Fetch and decode both audio files into buffers for instant playback
        const [snakeResponse, pickupResponse] = await Promise.all([
            fetch(snakeHissSoundSrc),
            fetch(pickupSoundSrc)
        ]);
        
        const [snakeArrayBuffer, pickupArrayBuffer] = await Promise.all([
            snakeResponse.arrayBuffer(),
            pickupResponse.arrayBuffer()
        ]);
        
        [snakeAudioBuffer, pickupAudioBuffer] = await Promise.all([
            snakeAudioContext.decodeAudioData(snakeArrayBuffer),
            snakeAudioContext.decodeAudioData(pickupArrayBuffer)
        ]);
    } catch (e) {
        console.warn('Failed to init audio:', e);
    }
}

// Play the snake hiss sound effect at maximum volume without blocking UI.
// Uses the Web Audio API with a GainNode set to maximum so the output is as
// loud as the device media volume allows.
// Each call creates a new BufferSource so:
//   - the full sound always plays to completion even if the user keeps tapping
//   - overlapping plays don't cut each other off
//   - playback never blocks or delays any player action
function playSnakeHissSound() {
    // Quick vibration pattern like a snake bite 🐍
    // Two short sharp bursts: buzz-pause-buzz
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
    }

    // Lazy-init on first call (always inside a user gesture / tap handler)
    if (!snakeAudioContext) {
        initAudio().then(() => _playBuffer('snake'));
        return;
    }
    _playBuffer('snake');
}

function playPickupSound() {
    // Single longer vibration for pickup
    if (navigator.vibrate) {
        navigator.vibrate([300]);
    }

    // Lazy-init on first call (always inside a user gesture / tap handler)
    if (!snakeAudioContext) {
        initAudio().then(() => _playBuffer('pickup'));
        return;
    }
    _playBuffer('pickup');
}

function _playBuffer(soundType) {
    try {
        const audioBuffer = soundType === 'snake' ? snakeAudioBuffer : pickupAudioBuffer;
        const fallbackSrc = soundType === 'snake' ? snakeHissSoundSrc : pickupSoundSrc;
        
        if (!snakeAudioContext || !audioBuffer) {
            // Fallback to basic Audio if Web Audio API failed to init
            const audio = new Audio(fallbackSrc);
            audio.volume = 1.0;
            audio.muted = false;
            audio.play().catch(() => {});
            return;
        }

        // Resume context if it was suspended (iOS requires this per user gesture)
        if (snakeAudioContext.state === 'suspended') {
            snakeAudioContext.resume();
        }

        // Create a new source node (one-shot, cannot be reused)
        const source = snakeAudioContext.createBufferSource();
        source.buffer = audioBuffer;

        // GainNode at maximum volume (1.0 = 0 dB, no attenuation)
        const gainNode = snakeAudioContext.createGain();
        gainNode.gain.value = 1.0;

        source.connect(gainNode);
        gainNode.connect(snakeAudioContext.destination);
        source.start(0);
    } catch (e) {
        console.warn(`${soundType} sound error:`, e);
    }
}

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
    const adminParam = urlParams.get('admin');

    // Detect admin mode from URL param
    if (adminParam === '1') {
        isAdminMode = true;
    }

    if (roundId && scoreId) {
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
    if (pendingRoundParams) {
        loadRoundFromParams(pendingRoundParams.roundId, pendingRoundParams.scoreId);
        pendingRoundParams = null;
    }
};

// Show one of the three main states: 'round-loading', 'no-round', or 'score-entry'
function showState(activeId) {
    ['round-loading', 'no-round', 'score-entry'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = id === activeId ? 'block' : 'none';
    });
}
function showLoadingState()    { showState('round-loading'); }
function showNoRoundState()    { showState('no-round'); }
function showScoreEntryState() { showState('score-entry'); }

// Load round and score from Firebase using URL parameters
async function loadRoundFromParams(roundId, scoreId) {
    if (!window.db || !window.firestoreHelpers) {
        console.error('Firebase not initialized when loadRoundFromParams called');
        alert('Failed to connect to database. Please refresh the page.');
        showNoRoundState();
        return;
    }

    // Verify admin access if in admin mode
    if (isAdminMode) {
        const hasAccess = await checkAdminAccess();
        if (!hasAccess) {
            alert('Admin access denied.');
            window.location.href = 'rounds.html';
            return;
        }
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

        // Fetch the score data — in admin mode, also check completedRounds and archivedRounds
        let scoreSnap = await getDoc(doc(window.db, 'scores', scoreId));
        let scoreSource = 'scores'; // track where we found it

        if (!scoreSnap.exists() && isAdminMode) {
            scoreSnap = await getDoc(doc(window.db, 'completedRounds', scoreId));
            scoreSource = 'completedRounds';
        }
        if (!scoreSnap.exists() && isAdminMode) {
            scoreSnap = await getDoc(doc(window.db, 'archivedRounds', scoreId));
            scoreSource = 'archivedRounds';
        }

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
            scoreSource: isAdminMode ? scoreSource : 'scores',
            entryType: scoreData.entryType || 'player',
            playerId: scoreData.playerId,
            playerName: scoreData.playerName,
            teamName: scoreData.teamName,
            handicap: scoreData.handicap || scoreData.playerHandicap || 18,
            tees: scoreData.tees || roundData.settings?.tees || 'tallwood',
            course: roundData.settings?.course || 'Unknown Course',
            roundName: roundData.name || 'Round',
            holePrizes: roundData.settings?.holePrizes || [],
            date: roundData.date,
            currentHole: 1,
            scores: scoreData.scores || {},
            putts: scoreData.putts || {},
            fir: scoreData.fir || {},
            gir: scoreData.gir || {},
            ctp: scoreData.ctp || {},
            longestDrive: scoreData.longestDrive || {}
        };

        // For completed/archived rounds loaded in admin mode, extract scores from holes format
        if (isAdminMode && !Object.keys(currentRound.scores).length && scoreData.holes) {
            for (let i = 1; i <= 18; i++) {
                if (scoreData.holes[i]) {
                    if (scoreData.holes[i].score !== null && scoreData.holes[i].score !== undefined) {
                        currentRound.scores[i] = scoreData.holes[i].score;
                    }
                    if (scoreData.holes[i].putts !== null && scoreData.holes[i].putts !== undefined) {
                        currentRound.putts[i] = scoreData.holes[i].putts;
                    }
                    if (scoreData.holes[i].fir) currentRound.fir[i] = true;
                    if (scoreData.holes[i].gir) currentRound.gir[i] = true;
                }
            }
        }

        // Find the last hole with a score to resume from
        for (let i = 18; i >= 1; i--) {
            if (currentRound.scores[i] !== undefined) {
                currentRound.currentHole = Math.min(i + 1, 18);
                break;
            }
        }

        // Resolve course data from shared course-data.js
        courseData = getCourseData(currentRound.course);

        // Update UI
        document.getElementById('current-course-name').textContent = currentRound.course || 'Course';
        const teesDisplay = document.getElementById('current-tees-display');
        if (teesDisplay) {
            teesDisplay.textContent = currentRound.tees.charAt(0).toUpperCase() + currentRound.tees.slice(1);
        }

        // Show "-" for stableford if course data is not available
        if (!courseData) {
            const stablefordValue = document.querySelector('.total-stableford .total-value');
            if (stablefordValue) stablefordValue.textContent = '-';
        }

        // Show admin banner if in admin mode
        if (isAdminMode) {
            showAdminBanner();
        }

        // Show score entry
        showScoreEntryState();

        // Initialize hole display
        updateHoleDisplay();

        // Show header leaderboard and start listening for updates
        showHeaderLeaderboard();
    } catch (error) {
        console.error('Error loading round:', error);
        alert('Failed to load round. Please try again.');
    }
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

// Show admin mode banner
function showAdminBanner() {
    // Create and insert admin banner if it doesn't already exist
    if (document.getElementById('admin-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'admin-banner';
    banner.className = 'admin-banner';
    banner.innerHTML = `<span>⚡ God Mode — Editing as <strong>${currentRound.playerName || 'Unknown'}</strong></span>`;

    // Insert at top of score-entry section
    const scoreEntry = document.getElementById('score-entry');
    if (scoreEntry) {
        scoreEntry.insertBefore(banner, scoreEntry.firstChild);
    }
}

// Exit current round
function exitRound() {
    currentRound = null;
    window.location.href = isAdminMode ? 'admin.html' : 'rounds.html';
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
    const tees = currentRound.tees;
    const holeData = courseData ? courseData.holes[hole] : null;

    document.getElementById('current-hole-number').textContent = `Hole ${hole}`;

    const holeDetailsEl = document.getElementById('current-hole-details');
    if (holeData) {
        const distance = getHoleDistance(holeData, tees);
        const parts = [`Par ${getHolePar(holeData, tees)}`];
        if (distance) parts.push(`${distance}m`);
        const si = getHoleSI(holeData, tees);
        if (si !== undefined) parts.push(`Index ${si}`);
        holeDetailsEl.textContent = parts.join(' • ');
        holeDetailsEl.style.display = '';
    } else {
        holeDetailsEl.style.display = 'none';
    }

    // Update score and putts display
    const score = currentRound.scores[hole];
    const putts = currentRound.putts[hole];
    updateScoreDisplay(score, hole);
    updatePuttsDisplay(score, putts);

    // Ensure score minus button label is correct on hole change
    const scoreMinusBtn = document.getElementById('score-minus-btn');
    if (scoreMinusBtn && (score === undefined || score === null)) {
        scoreMinusBtn.textContent = 'P';
    }

    // Update FIR and GIR checkboxes
    const firCheckbox = document.getElementById('current-fir');
    const girCheckbox = document.getElementById('current-gir');
    if (firCheckbox) firCheckbox.checked = !!currentRound.fir[hole];
    if (girCheckbox) girCheckbox.checked = !!currentRound.gir[hole];

    // Update navigation buttons
    document.getElementById('prev-hole-btn').disabled = hole === 1;
    document.getElementById('next-hole-btn').disabled = hole === 18;

    // Update hole prize indicator and input
    updateHolePrizeDisplay(hole);

    // Update quick nav
    updateQuickNav();

    // Update totals
    updateTotals();
}

// Update hole prize indicator and input row
function updateHolePrizeDisplay(hole) {
    const prizeRow = document.getElementById('prize-input-row');
    const prizeLabel = document.getElementById('prize-input-label');
    const prizeDistance = document.getElementById('prize-distance');
    const prizeUnit = document.getElementById('prize-unit');

    if (!prizeRow || !currentRound) return;

    // Find prize for this hole
    const prizes = currentRound.holePrizes || [];
    const prize = prizes.find(p => parseInt(p.hole) === hole);

    const prizeDivider = document.getElementById('prize-divider');

    if (prize) {
        const isCtp = prize.type === 'ctp';
        const emoji = isCtp ? '⛳' : '💪';
        const label = isCtp ? 'Closest to Pin' : 'Longest Drive';

        // Show divider and input row
        if (prizeDivider) prizeDivider.style.display = '';
        prizeRow.style.display = '';
        prizeLabel.textContent = `${emoji} ${label}`;
        prizeUnit.textContent = isCtp ? 'cm' : 'm';

        // Set current value
        const dataKey = isCtp ? 'ctp' : 'longestDrive';
        prizeDistance.value = currentRound[dataKey][hole] || '';
    } else {
        if (prizeDivider) prizeDivider.style.display = 'none';
        prizeRow.style.display = 'none';
    }
}

// Update prize distance value
function updatePrizeDistance() {
    if (!currentRound) return;

    const hole = currentRound.currentHole;
    const prizes = currentRound.holePrizes || [];
    const prize = prizes.find(p => parseInt(p.hole) === hole);

    if (!prize) return;

    const value = parseFloat(document.getElementById('prize-distance').value) || 0;
    const dataKey = prize.type === 'ctp' ? 'ctp' : 'longestDrive';
    currentRound[dataKey][hole] = value;

    saveActiveRoundToFirebase();
}

// Update the score display with stableford points when available
function updateScoreDisplay(score, hole) {
    const el = document.getElementById('current-score');
    const minusBtn = document.getElementById('score-minus-btn');
    el.classList.remove('stepper-value-small');

    // Update minus button label based on current score
    if (minusBtn) {
        if (score === undefined || score === null) {
            minusBtn.textContent = 'P';
        } else if (score === 1) {
            minusBtn.textContent = 'P';
        } else {
            minusBtn.textContent = '−';
        }
    }
    if (score === undefined || score === null) {
        el.innerHTML = '-';
        return;
    }
    if (score === 'P') {
        el.classList.add('stepper-value-small');
        el.innerHTML = 'P <span class="stepper-stableford">(pickup)</span>';
        return;
    }
    const holeData = courseData ? courseData.holes[hole] : null;
    if (holeData && currentRound) {
        const pts = calcStablefordPoints(score, getHolePar(holeData, currentRound.tees), getHoleSI(holeData, currentRound.tees), currentRound.handicap || 0);
        el.innerHTML = `${score} <span class="stepper-stableford">(${pts}pts)</span>`;
    } else {
        el.innerHTML = `${score}`;
    }
}

// Update the putts display and enable/disable putts stepper based on pickup state
function updatePuttsDisplay(score, putts) {
    const puttsEl = document.getElementById('current-putts');
    const minusBtn = document.getElementById('putts-minus-btn');
    const plusBtn = document.getElementById('putts-plus-btn');
    const isPickup = score === 'P';

    if (isPickup) {
        puttsEl.textContent = '-';
        puttsEl.classList.remove('stepper-value-small');
        if (minusBtn) minusBtn.disabled = true;
        if (plusBtn) plusBtn.disabled = true;
    } else {
        puttsEl.textContent = putts !== undefined ? (putts === 0 ? 'Holed Out' : putts) : '-';
        puttsEl.classList.toggle('stepper-value-small', putts === 0);
        if (minusBtn) minusBtn.disabled = false;
        if (plusBtn) plusBtn.disabled = false;
    }
}

// Toggle running totals expand/collapse
function toggleRunningTotals() {
    const content = document.getElementById('running-totals-content');
    const chevron = document.getElementById('totals-chevron');
    if (content.style.display === 'none') {
        content.style.display = 'grid';
        chevron.textContent = '▲';
    } else {
        content.style.display = 'none';
        chevron.textContent = '▼';
    }
}

// Adjust score
function adjustScore(delta) {
    if (!currentRound) return;

    const hole = currentRound.currentHole;
    const holeData = courseData ? courseData.holes[hole] : null;
    let current = currentRound.scores[hole];

    if (current === undefined) {
        if (holeData) {
            if (delta > 0) {
                // First tap of +1 sets to par
                current = getHolePar(holeData, currentRound.tees) - delta; // +1: par - 1 + 1 = par
            } else {
                // First tap of -1 (P button) sets to pickup
                currentRound.scores[hole] = 'P';
                playPickupSound();
                updateScoreDisplay('P', hole);
                delete currentRound.putts[hole];
                updatePuttsDisplay('P', undefined);
                updateQuickNav();
                updateTotals();
                saveActiveRoundToFirebase();
                return;
            }
        } else {
            // No course data: first tap of +1 starts at 1; first tap of -1 sets to pickup
            if (delta > 0) {
                current = 0; // 0 + 1 = 1
            } else {
                currentRound.scores[hole] = 'P';
                playPickupSound();
                updateScoreDisplay('P', hole);
                delete currentRound.putts[hole];
                updatePuttsDisplay('P', undefined);
                updateQuickNav();
                updateTotals();
                saveActiveRoundToFirebase();
                return;
            }
        }
    }

    // Handle pickup transitions
    if (current === 'P' && delta > 0) {
        // Going up from pickup → back to 1
        currentRound.scores[hole] = 1;
        updateScoreDisplay(1, hole);
        updatePuttsDisplay(1, currentRound.putts[hole]);
        updateQuickNav();
        updateTotals();
        saveActiveRoundToFirebase();
        return;
    }

    if (current === 'P' && delta < 0) {
        // Going down from pickup → clear the score entirely
        delete currentRound.scores[hole];
        updateScoreDisplay(undefined, hole);
        updatePuttsDisplay(undefined, currentRound.putts[hole]);
        updateQuickNav();
        updateTotals();
        saveActiveRoundToFirebase();
        return;
    }

    const newScore = current + delta;

    if (newScore <= 0) {
        // Score goes to 0 or below → pickup
        currentRound.scores[hole] = 'P';
        playPickupSound();
        updateScoreDisplay('P', hole);
        // Clear putts on pickup and disable putts stepper
        delete currentRound.putts[hole];
        updatePuttsDisplay('P', undefined);
    } else {
        currentRound.scores[hole] = newScore;
        updateScoreDisplay(newScore, hole);
        // Re-enable putts stepper when coming back from pickup
        updatePuttsDisplay(newScore, currentRound.putts[hole]);
    }

    updateQuickNav();
    updateTotals();

    // Save to Firebase for real-time leaderboard updates
    saveActiveRoundToFirebase();
}

// Adjust putts
function adjustPutts(delta) {
    if (!currentRound) return;

    const hole = currentRound.currentHole;

    // Don't allow putts adjustment during pickup
    if (currentRound.scores[hole] === 'P') return;

    let current = currentRound.putts[hole];

    if (current === undefined) {
        if (delta > 0) {
            current = 0; // Start at 0, so first click of +1 gives 1
        } else {
            // First click of -1 → Holed Out (0 putts)
            currentRound.putts[hole] = 0;
            const puttsEl = document.getElementById('current-putts');
            puttsEl.textContent = 'Holed Out';
            puttsEl.classList.add('stepper-value-small');
            updateTotals();
            saveActiveRoundToFirebase();
            return;
        }
    }

    // Going down from Holed Out (0) → clear putts entirely
    if (current === 0 && delta < 0) {
        delete currentRound.putts[hole];
        const puttsEl = document.getElementById('current-putts');
        puttsEl.textContent = '-';
        puttsEl.classList.remove('stepper-value-small');
        updateTotals();
        saveActiveRoundToFirebase();
        return;
    }

    const newPutts = Math.max(0, current + delta);
    currentRound.putts[hole] = newPutts;
    const puttsEl = document.getElementById('current-putts');
    puttsEl.textContent = newPutts === 0 ? 'Holed Out' : newPutts;
    puttsEl.classList.toggle('stepper-value-small', newPutts === 0);

    // Play the snake hiss sound when putts first reach 3 on this hole
    if (newPutts === 3 && current < 3) {
        playSnakeHissSound();
    }

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

// Toggle FIR/GIR checkboxes
function toggleStat(field, checkboxId) {
    if (!currentRound) return;
    currentRound[field][currentRound.currentHole] = document.getElementById(checkboxId).checked;
    updateTotals();
    saveActiveRoundToFirebase();
}
function toggleFIR() { toggleStat('fir', 'current-fir'); }
function toggleGIR() { toggleStat('gir', 'current-gir'); }

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
    const hasCourseData = !!courseData;
    const t = calcRoundTotals(currentRound.scores, currentRound.putts, courseData, handicap, currentRound.tees);
    const net = Math.round(t.totalScore - handicap);

    // Format relative to par for holes actually played (excluding pickups)
    const formatRelativeToPar = (score, half) => {
        if (!half.count || !hasCourseData) return '-';
        // Recalculate par for played holes only (skip pickups)
        let parPlayed = 0;
        const start = half === t.front9 ? 1 : 10;
        const end = half === t.front9 ? 9 : 18;
        for (let i = start; i <= end; i++) {
            if (currentRound.scores[i] !== undefined && currentRound.scores[i] !== 'P') parPlayed += getHolePar(courseData.holes[i], currentRound.tees) || 0;
        }
        const diff = score - parPlayed;
        return diff === 0 ? 'E' : (diff > 0 ? `+${diff}` : `${diff}`);
    };

    // Update display
    document.getElementById('stableford-total').textContent = t.holesPlayed > 0 && hasCourseData ? t.totalStableford : '-';
    document.getElementById('putts-total').textContent = t.totalPutts > 0 ? t.totalPutts : '-';
    document.getElementById('front-9-total').textContent = formatRelativeToPar(t.front9.score, t.front9);
    document.getElementById('back-9-total').textContent = formatRelativeToPar(t.back9.score, t.back9);
    document.getElementById('gross-total').textContent = t.holesPlayed > 0 ? t.totalScore : '-';
    document.getElementById('net-total').textContent = t.holesPlayed > 0 ? net : '-';

    // Calculate FIR and GIR totals (count even for pickup holes)
    let firCount = 0, girCount = 0;
    let anyHoleStarted = t.holesPlayed > 0;
    for (let i = 1; i <= 18; i++) {
        if (currentRound.fir[i]) firCount++;
        if (currentRound.gir[i]) girCount++;
        if (currentRound.scores[i] !== undefined) anyHoleStarted = true;
    }
    document.getElementById('fir-total').textContent = anyHoleStarted ? firCount : '-';
    document.getElementById('gir-total').textContent = anyHoleStarted ? girCount : '-';
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

    const confirmMsg = isAdminMode
        ? 'Save admin changes to this round?'
        : 'You will not be able to update scores once a round is complete. Are you sure you want to submit?';
    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const { doc, setDoc, deleteDoc } = window.firestoreHelpers;

        // Calculate totals for the completed round
        const handicap = currentRound.handicap || 0;
        const t = calcRoundTotals(currentRound.scores, currentRound.putts || {}, courseData, handicap, currentRound.tees);
        const totalScore = t.totalScore;
        const totalStableford = t.totalStableford;

        // Build holes format for leaderboard compatibility (same format as activeRounds)
        const holes = {};
        for (let i = 1; i <= 18; i++) {
            if (currentRound.scores[i] !== undefined || currentRound.putts[i] !== undefined) {
                holes[i] = {
                    score: currentRound.scores[i] !== undefined ? currentRound.scores[i] : null,
                    putts: currentRound.putts[i] !== undefined ? currentRound.putts[i] : null,
                    fir: !!currentRound.fir[i],
                    gir: !!currentRound.gir[i],
                    ctp: currentRound.ctp[i] || 0,
                    longestDrive: currentRound.longestDrive[i] || 0
                };
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
            name: currentRound.roundName,
            entryType: currentRound.entryType,
            teamName: currentRound.teamName,
            handicap: currentRound.handicap,
            playerHandicap: currentRound.handicap,
            tees: currentRound.tees,
            course: currentRound.course || 'Unknown Course',
            date: currentRound.date,
            scores: currentRound.scores,
            putts: currentRound.putts,
            fir: currentRound.fir,
            gir: currentRound.gir,
            ctp: currentRound.ctp,
            longestDrive: currentRound.longestDrive,
            holes: holes,
            currentHole: currentRound.currentHole,
            lastThreePuttTime: currentRound.lastThreePuttTime || null,
            totalScore: totalScore,
            stablefordPoints: totalStableford,
            status: 'finished',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // In admin mode, save back to the original collection
        if (isAdminMode && currentRound.scoreSource && currentRound.scoreSource !== 'scores') {
            await setDoc(doc(window.db, currentRound.scoreSource, scoreId), scoreData);
        } else {
            // Save to completedRounds collection
            await setDoc(doc(window.db, 'completedRounds', scoreId), scoreData);

            // Delete from scores collection — data is now in completedRounds
            try {
                await deleteDoc(doc(window.db, 'scores', scoreId));
            } catch (e) {
                console.warn('Could not delete from scores:', e);
            }

            // Delete from activeRounds — the completedRounds listener will show
            // this player as "F" (finished) on other players' leaderboards
            if (currentRound.roundId && currentRound.scoreId) {
                const activeRoundId = `${currentRound.roundId}_${currentRound.scoreId}`;
                try {
                    await deleteDoc(doc(window.db, 'activeRounds', activeRoundId));
                } catch (e) {
                }
            }

            // Remove from joinedRounds in localStorage
            if (currentRound.roundId) {
                let joinedRounds = JSON.parse(localStorage.getItem('joinedRounds') || '[]');
                joinedRounds = joinedRounds.filter(r => r.roundId !== currentRound.roundId || r.scoreId !== currentRound.scoreId);
                localStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));
            }
        }

        fireConfetti();

        // Reset
        currentRound = null;

        // Redirect back appropriately
        const redirectUrl = isAdminMode ? 'admin.html' : `rounds.html?completed=${scoreId}`;
        setTimeout(() => {
            window.location.href = redirectUrl;
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

// Show hole image modal (image by default, fallback to video, then placeholder)
function showHoleImage() {
    if (!currentRound) return;

    const hole = currentRound.currentHole;
    const holeData = courseData ? courseData.holes[hole] : null;
    const tees = currentRound.tees || 'tallwood';
    const imagePath = getHoleImagePath(currentRound.course, hole);
    const flyover = getHoleFlyover(currentRound.course, hole);
    const modal = document.getElementById('hole-image-modal');
    const img = document.getElementById('hole-image-display');
    const videoContainer = document.getElementById('hole-video-display');
    const caption = document.getElementById('hole-image-caption');
    const flyoverBtn = document.getElementById('hole-flyover-btn');

    // Build caption from available data
    const parts = [`Hole ${hole}`];
    if (holeData) {
        parts.push(`Par ${getHolePar(holeData, tees)}`);
        const si = getHoleSI(holeData, tees);
        if (si !== undefined) parts.push(`SI ${si}`);
        const distance = getHoleDistance(holeData, tees);
        if (distance) parts.push(`${distance}m`);
    }
    caption.textContent = parts.join(' - ');

    // Reset state
    videoContainer.style.display = 'none';
    videoContainer.innerHTML = '';
    flyoverBtn.style.display = 'none';

    if (imagePath) {
        // Show image (default)
        img.style.display = 'block';
        img.src = imagePath;
        // If flyover also available, show the flyover button
        if (flyover) {
            flyoverBtn.style.display = 'inline-block';
        }
    } else if (flyover) {
        // No image, show video flyover directly
        img.style.display = 'none';
        showFlyoverVideo(flyover);
    } else {
        // No image or video — show placeholder
        img.style.display = 'block';
        img.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect fill="%23002D1A" width="800" height="500"/><text x="400" y="240" text-anchor="middle" fill="%23C9A227" font-family="serif" font-size="32" font-weight="600">No Image Available</text><text x="400" y="290" text-anchor="middle" fill="%2399875A" font-family="serif" font-size="20">Hole ' + hole + '</text></svg>')}`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Switch from image to flyover video within the modal
function switchToFlyover() {
    if (!currentRound) return;

    const flyover = getHoleFlyover(currentRound.course, currentRound.currentHole);
    if (!flyover) return;

    const img = document.getElementById('hole-image-display');
    const flyoverBtn = document.getElementById('hole-flyover-btn');
    const caption = document.getElementById('hole-image-caption');
    const modalContent = document.getElementById('hole-image-modal').querySelector('.hole-image-modal-content');

    img.style.display = 'none';
    flyoverBtn.style.display = 'none';
    caption.style.display = 'none';
    modalContent.classList.add('fullscreen-video');
    showFlyoverVideo(flyover);
}

// Render a flyover video iframe into the video container
function showFlyoverVideo(flyover) {
    const videoContainer = document.getElementById('hole-video-display');
    videoContainer.style.display = 'block';
    let iframeSrc = '';
    if (flyover.type === 'vimeo') {
        iframeSrc = `https://player.vimeo.com/video/${flyover.id}?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0`;
    } else if (flyover.type === 'youtube') {
        iframeSrc = `https://www.youtube.com/embed/${flyover.id}?autoplay=1&rel=0`;
    }
    videoContainer.innerHTML = `<iframe src="${iframeSrc}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></iframe>`;
}

// Close hole image/video modal
function closeHoleImage() {
    const modal = document.getElementById('hole-image-modal');
    const videoContainer = document.getElementById('hole-video-display');
    const caption = document.getElementById('hole-image-caption');
    const modalContent = modal.querySelector('.hole-image-modal-content');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    // Reset fullscreen video state
    if (caption) caption.style.display = '';
    if (modalContent) modalContent.classList.remove('fullscreen-video');
    // Stop any playing video by clearing the iframe
    if (videoContainer) {
        videoContainer.innerHTML = '';
        videoContainer.style.display = 'none';
    }
}

// ========================================
// HEADER LEADERBOARD FUNCTIONS
// ========================================

// Position the header leaderboard - no longer needed with normal document flow
function positionHeaderLeaderboard() {
    // No-op: leaderboard is in normal document flow
}

function updateSectionPadding() {
    // No-op: no padding calculations needed with normal document flow
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

// Start real-time listeners for active rounds AND completed rounds
function startActiveRoundsListener() {
    if (!window.db || !window.firestoreHelpers) {
        setTimeout(startActiveRoundsListener, 500);
        return;
    }

    // Stop any existing listeners first
    stopActiveRoundsListener();

    try {
        const { collection, query, where, onSnapshot } = window.firestoreHelpers;

        // Get the current round ID to filter by
        const currentRoundId = currentRound?.roundId || null;

        // --- Listener 1: Active rounds (players still playing) ---
        let activeQuery;
        if (currentRoundId) {
            activeQuery = query(
                collection(window.db, 'activeRounds'),
                where('roundId', '==', currentRoundId)
            );
        } else {
            activeQuery = collection(window.db, 'activeRounds');
        }

        activeRoundsUnsubscribe = onSnapshot(
            activeQuery,
            (snapshot) => {
                cachedActiveRounds = [];
                snapshot.forEach(doc => {
                    cachedActiveRounds.push({ id: doc.id, ...doc.data() });
                });
                // Merge both sources and render
                renderHeaderLeaderboard([...cachedActiveRounds, ...cachedCompletedRounds]);
            },
            (error) => {
                console.error('Error listening to active rounds:', error);
            }
        );

        // --- Listener 2: Completed rounds (finished players, shown as "F") ---
        if (currentRoundId) {
            const completedQuery = query(
                collection(window.db, 'completedRounds'),
                where('roundId', '==', currentRoundId)
            );

            completedRoundsUnsubscribe = onSnapshot(
                completedQuery,
                (snapshot) => {
                    cachedCompletedRounds = [];
                    snapshot.forEach(doc => {
                        cachedCompletedRounds.push({ id: doc.id, ...doc.data() });
                    });
                    // Merge both sources and render
                    renderHeaderLeaderboard([...cachedActiveRounds, ...cachedCompletedRounds]);
                },
                (error) => {
                    console.error('Error listening to completed rounds:', error);
                }
            );
        }

    } catch (error) {
        console.error('Error starting listener:', error);
    }
}

// Stop real-time listeners
function stopActiveRoundsListener() {
    if (activeRoundsUnsubscribe) {
        activeRoundsUnsubscribe();
        activeRoundsUnsubscribe = null;
    }
    if (completedRoundsUnsubscribe) {
        completedRoundsUnsubscribe();
        completedRoundsUnsubscribe = null;
    }
    cachedActiveRounds = [];
    cachedCompletedRounds = [];
}

// Toggle header leaderboard collapse/expand
// Store the expanded leaderboard height so we can set targets instantly
let expandedLeaderboardHeight = 0;

function toggleHeaderLeaderboard() {
    const content = document.getElementById('header-leaderboard-content');
    const chevron = document.getElementById('header-leaderboard-chevron');

    if (!content) return;

    const isCollapsing = !content.classList.contains('collapsed');

    if (isCollapsing) {
        // Lock current height, force reflow, then animate to 0
        content.style.height = content.scrollHeight + 'px';
        content.offsetHeight;
        content.classList.add('collapsed');
        content.style.height = '0px';
        if (chevron) chevron.textContent = '▼';
    } else {
        // Remove collapsed, start from 0, animate to natural height
        content.classList.remove('collapsed');
        content.style.height = '0px';
        content.offsetHeight;
        const targetHeight = content.scrollHeight;
        content.style.height = targetHeight + 'px';
        if (chevron) chevron.textContent = '▲';

        // After transition, remove explicit height so content adapts naturally
        content.addEventListener('transitionend', function handler() {
            content.style.height = '';
            content.removeEventListener('transitionend', handler);
        });
    }
}

// Update header leaderboard with current scores from Firebase (manual fetch)

// Render header leaderboard with provided active rounds data
function renderHeaderLeaderboard(activeRounds) {
    const container = document.getElementById('header-leaderboard-content');
    const headerLb = document.getElementById('header-leaderboard');
    if (!container) return;
    // Filter to only rounds with at least one score entered
    const roundsWithScores = (activeRounds || []).filter(round => {
        if (!round.holes) {
            return false;
        }
        // Check if any hole has a score
        for (let i = 1; i <= 18; i++) {
            if (round.holes[i] && round.holes[i].score !== null && round.holes[i].score !== undefined) {
                return true;
            }
        }
        return false;
    });
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

    roundsWithScores.forEach(round => {

        // Check if this player currently has any 3+ putts
        let hasThreePutt = false;
        if (round.holes) {
            for (let i = 1; i <= 18; i++) {
                if (round.holes[i] && round.holes[i].putts >= 3) {
                    hasThreePutt = true;
                    break;
                }
            }
        }

        // Only consider for snake if they currently have a 3+ putt AND have a timestamp
        if (hasThreePutt && round.lastThreePuttTime) {
            const timestamp = new Date(round.lastThreePuttTime);
            if (!snakeTimestamp || timestamp > snakeTimestamp) {
                snakeTimestamp = timestamp;
                // Use a unique key - prefer id, fallback to scoreId, then playerName
                snakePlayerKey = round.id || round.scoreId || round.playerName;
            }
        }
    });
    // Build leaderboard data from rounds with scores only
    const leaderboardData = roundsWithScores.map(round => {
        let holesPlayed = 0;
        let totalScore = 0;
        let totalPar = 0;
        let stablefordPoints = 0;
        const handicap = round.playerHandicap || 0;

        // Calculate scores from holes data (skip pickups)
        for (let i = 1; i <= 18; i++) {
            if (round.holes && round.holes[i] && round.holes[i].score !== null && round.holes[i].score !== undefined) {
                holesPlayed = i;
                if (round.holes[i].score !== 'P') {
                    totalScore += round.holes[i].score;
                    if (courseData) {
                        totalPar += getHolePar(courseData.holes[i], round.tees) || 0;
                        stablefordPoints += calcStablefordPoints(round.holes[i].score, getHolePar(courseData.holes[i], round.tees), getHoleSI(courseData.holes[i], round.tees), handicap);
                    }
                }
            }
        }

        // Use a unique key for this round - prefer id, fallback to scoreId, then playerName
        const roundKey = round.id || round.scoreId || round.playerName;

        return {
            id: round.playerId || round.playerName,
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
            hasSnake: roundKey === snakePlayerKey,
            ctp: round.ctp || {},
            longestDrive: round.longestDrive || {}
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

    // Determine prize winners across all players
    const holePrizes = currentRound?.holePrizes || [];
    const prizeWinners = new Map(); // key: "type-hole", value: player id

    for (const p of holePrizes) {
        const h = parseInt(p.hole);
        let bestPlayerId = null;
        let bestValue = null;

        for (const pl of leaderboardData) {
            let val = null;
            if (p.type === 'ctp' && pl.ctp[h] && pl.ctp[h] !== '-') {
                val = parseFloat(pl.ctp[h]);
            } else if (p.type === 'ld' && pl.longestDrive[h] && pl.longestDrive[h] !== '-') {
                val = parseFloat(pl.longestDrive[h]);
            }

            if (val !== null && !isNaN(val)) {
                if (p.type === 'ctp' && (bestValue === null || val < bestValue)) {
                    bestValue = val;
                    bestPlayerId = pl.id;
                } else if (p.type === 'ld' && (bestValue === null || val > bestValue)) {
                    bestValue = val;
                    bestPlayerId = pl.id;
                }
            }
        }

        if (bestPlayerId) {
            prizeWinners.set(`${p.type}-${h}`, bestPlayerId);
        }
    }

    // Render leaderboard
    container.innerHTML = leaderboardData.map((player, index) => {
        const pos = index + 1;
        let scoreClass = 'even-par';
        let scoreDisplay = 'E';
        let parDisplay = 'E';

        if (player.holesPlayed > 0) {
            if (courseData) {
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
                // No course data — show gross score only
                scoreDisplay = `${player.totalScore}`;
            }
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

        // Build prize emojis — only show if this player is the current winner
        const prizeEmojis = [];
        for (const p of holePrizes) {
            const h = parseInt(p.hole);
            const winnerId = prizeWinners.get(`${p.type}-${h}`);
            if (winnerId === player.id) {
                prizeEmojis.push(p.type === 'ctp' ? '🎯' : '💪');
            }
        }
        const prizesDisplay = prizeEmojis.join(' ');

        return `
            <div class="${playerClass}" onclick="openScorecardModal('${player.id}')">
                <span class="header-lb-pos">${pos}</span>
                <span class="header-lb-snake">${snakeIcon}</span>
                <span class="header-lb-name">${player.name}</span>
                <span class="header-lb-hole">${holeDisplay}</span>
                <span class="header-lb-prizes">${prizesDisplay}</span>
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
    try {
        // Search cached data (both active and completed rounds) instead of re-fetching
        const allCached = [...(cachedActiveRounds || []), ...(cachedCompletedRounds || [])];
        let roundData = allCached.find(r =>
            (r.playerId == playerId || r.playerName == playerId)
        );

        if (!roundData) {
            return;
        }

        modalRoundData = roundData;

        // Populate modal header
        const handicapDisplay = modalRoundData.playerHandicap !== undefined ? ` (${modalRoundData.playerHandicap})` : '';
        const courseName = modalRoundData.course || '';
        const tees = modalRoundData.tees || '';
        const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
        const courseInfoParts = [courseName, teeLabel].filter(Boolean);
        document.getElementById('modal-course-info').textContent = courseInfoParts.length ? courseInfoParts.join(' - ') : '';
        document.getElementById('modal-player-name').textContent = modalRoundData.playerName + handicapDisplay;
        const roundDate = modalRoundData.date ? formatLongDate(modalRoundData.date) : '';
        document.getElementById('modal-round-date').textContent = roundDate;

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
    const holes = modalRoundData.holes || {};
    const scores = {}, putts = {};
    for (let i = 1; i <= 18; i++) {
        if (holes[i]?.score !== undefined && holes[i]?.score !== null) scores[i] = holes[i].score;
        if (holes[i]?.putts !== undefined && holes[i]?.putts !== null) putts[i] = holes[i].putts;
    }
    // Determine which prizes this player won by comparing across all players
    const wonPrizes = {};
    const modalHolePrizes = currentRound?.holePrizes || [];
    for (const p of modalHolePrizes) {
        const h = parseInt(p.hole);
        let bestPlayerId = null;
        let bestValue = null;

        // Check all players in the round
        const allRounds = [...(cachedActiveRounds || []), ...(cachedCompletedRounds || [])];
        for (const r of allRounds) {
            let val = null;
            if (p.type === 'ctp' && r.ctp && r.ctp[h] && r.ctp[h] !== '-') {
                val = parseFloat(r.ctp[h]);
            } else if (p.type === 'ld' && r.longestDrive && r.longestDrive[h] && r.longestDrive[h] !== '-') {
                val = parseFloat(r.longestDrive[h]);
            }
            if (val !== null && !isNaN(val)) {
                if (p.type === 'ctp' && (bestValue === null || val < bestValue)) {
                    bestValue = val;
                    bestPlayerId = r.playerId || r.playerName;
                } else if (p.type === 'ld' && (bestValue === null || val > bestValue)) {
                    bestValue = val;
                    bestPlayerId = r.playerId || r.playerName;
                }
            }
        }

        const currentPlayerId = modalRoundData.playerId || modalRoundData.playerName;
        if (bestPlayerId === currentPlayerId) {
            if (!wonPrizes[h]) wonPrizes[h] = [];
            wonPrizes[h].push(p.type === 'ctp' ? '🎯' : '💪');
        }
    }

    const prizes = { wonPrizes };
    document.getElementById('modal-scorecard-table').innerHTML =
        generateScorecardHTML(scores, putts, courseData, modalRoundData.playerHandicap || 0, modalRoundData.tees, prizes);
}

// Close scorecard modal
function closeScorecardModal() {
    document.getElementById('scorecard-modal').style.display = 'none';
    modalRoundData = null;
}
// Save active round to Firebase
async function saveActiveRoundToFirebase() {
    if (!currentRound) {
        return;
    }
    if (!window.db || !window.firestoreHelpers) {
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
                    putts: currentRound.putts[i] !== undefined ? currentRound.putts[i] : null,
                    fir: !!currentRound.fir[i],
                    gir: !!currentRound.gir[i],
                    ctp: currentRound.ctp[i] || 0,
                    longestDrive: currentRound.longestDrive[i] || 0
                };
            }
        }
        // If we have a scoreId (from joining a round), update the scores collection too
        if (currentRound.scoreId) {
            const scoreRef = doc(window.db, 'scores', currentRound.scoreId);
            await updateDoc(scoreRef, {
                scores: currentRound.scores,
                putts: currentRound.putts,
                fir: currentRound.fir,
                gir: currentRound.gir,
                ctp: currentRound.ctp,
                longestDrive: currentRound.longestDrive,
                updatedAt: new Date().toISOString()
            });
        }

        const roundData = {
            playerId: currentRound.playerId || currentRound.playerName,
            playerName: currentRound.playerName,
            playerHandicap: currentRound.handicap,
            course: currentRound.course || '',
            tees: currentRound.tees,
            date: currentRound.date,
            currentHole: currentRound.currentHole,
            holes: holes,
            ctp: currentRound.ctp || {},
            longestDrive: currentRound.longestDrive || {},
            status: 'active',
            roundId: currentRound.roundId || null,
            updatedAt: new Date().toISOString()
        };

        // Include lastThreePuttTime for snake tracking (null if no snake)
        roundData.lastThreePuttTime = currentRound.lastThreePuttTime || null;

        // Use roundId_scoreId if available (from joined rounds), otherwise fallback to old format
        let activeRoundId;
        if (currentRound.roundId && currentRound.scoreId) {
            activeRoundId = `${currentRound.roundId}_${currentRound.scoreId}`;
        } else {
            activeRoundId = `round_${currentRound.playerId || currentRound.playerName}_${currentRound.date}`;
        }

        // Replace the entire document to ensure cleared scores/putts are removed
        await setDoc(doc(window.db, 'activeRounds', activeRoundId), roundData);

    } catch (error) {
        console.error('Error saving active round:', error);
    }
}

// Check for active rounds from today and show header leaderboard
async function checkForTodaysActiveRounds() {
    if (!window.db || !window.firestoreHelpers) {
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
            showHeaderLeaderboard();
        }
    } catch (error) {
        console.error('Error checking for active rounds:', error);
    }
}
