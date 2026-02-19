// Rounds Management JavaScript
const allPlayers = [
    { id: 1, name: "Mike Buller", handicap: 9.0 },
    { id: 2, name: "Adrian Platas", handicap: 3.2 },
    { id: 3, name: "Darren Shadlow", handicap: 5.5 },
    { id: 4, name: "Hayden Nancarrow", handicap: 13.8 },
    { id: 5, name: "Nathan Pizzuto", handicap: 35.0 },
];

// State
let currentRoundData = null;
let createdRoundId = null;

// Generate a unique join code (10 characters, uppercase alphanumeric)
function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
    let code = '';
    for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Initialize the rounds page
async function initializeRoundsPage() {

    // Set default date to today
    const dateInput = document.getElementById('round-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Listen for course changes to update tee options
    const courseInput = document.getElementById('round-course');
    if (courseInput) {
        courseInput.addEventListener('input', updateTeeOptions);
        updateTeeOptions();
    }

    // Populate player dropdown
    populatePlayerDropdown();

    // Check for join code in URL
    checkUrlForJoinCode();

    // Load user's active rounds
    await loadMyActiveRounds();

    // Check if redirected from a completed round
    checkForCompletedRound();

    // Initialize mobile menu
    initializeMobileMenu();
}

// Populate the player selection dropdown
function populatePlayerDropdown() {
    const select = document.getElementById('join-player-select');
    if (!select) return;

    // Clear existing options except first two
    while (select.options.length > 2) {
        select.remove(2);
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

// Check if redirected from a completed round and highlight it
function checkForCompletedRound() {
    const urlParams = new URLSearchParams(window.location.search);
    const completedId = urlParams.get('completed');

    if (!completedId) return;

    // Switch to the Completed tab
    switchRoundsTab('completed');

    // Find the completed round card and highlight it
    const card = document.querySelector(`.my-round-card[data-score-id="${completedId}"]`);
    if (card) {
        card.classList.add('highlight-completed');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Remove highlight after 2 seconds
        setTimeout(() => {
            card.classList.remove('highlight-completed');
        }, 2000);
    }

    // Clean up the URL
    window.history.replaceState({}, '', 'rounds.html');
}

// Format tee value for display
function formatTeeName(tee, courseName) {
    // Try to find tee info from course data
    const course = courseName ? getCourseData(courseName) : null;
    if (course && course.tees) {
        const teeInfo = course.tees.find(t => t.key === tee);
        if (teeInfo) {
            const dist = teeInfo.totalDistance ? ` (${teeInfo.totalDistance.toLocaleString()}m)` : '';
            return `${teeInfo.label}${dist}`;
        }
    }
    // Fallback
    return tee.charAt(0).toUpperCase() + tee.slice(1) + ' Tees';
}

// Toggle optional settings section
function toggleOptionalSettings() {
    const content = document.getElementById('optional-settings');
    const chevron = document.getElementById('optional-chevron');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.textContent = '▲';
    } else {
        content.style.display = 'none';
        chevron.textContent = '▼';
    }
}

// Add a hole prize entry
let holePrizeCount = 0;
function addHolePrize() {
    holePrizeCount++;
    const list = document.getElementById('hole-prizes-list');

    const entry = document.createElement('div');
    entry.className = 'hole-prize-entry';
    entry.id = `hole-prize-${holePrizeCount}`;

    let holeOptions = '';
    for (let i = 1; i <= 18; i++) {
        holeOptions += `<option value="${i}">Hole ${i}</option>`;
    }

    entry.innerHTML = `
        <select class="prize-hole-select">
            ${holeOptions}
        </select>
        <select class="prize-type-select">
            <option value="ctp">⛳ Closest to pin</option>
            <option value="ld">💪 Longest drive</option>
        </select>
        <button type="button" class="remove-prize-btn" onclick="removeHolePrize('hole-prize-${holePrizeCount}')">✕</button>
    `;

    list.appendChild(entry);
}

// Remove a hole prize entry
function removeHolePrize(id) {
    const entry = document.getElementById(id);
    if (entry) entry.remove();
}

// Get configured hole prizes
function getHolePrizes() {
    const entries = document.querySelectorAll('.hole-prize-entry');
    const prizes = [];
    entries.forEach(entry => {
        const hole = entry.querySelector('.prize-hole-select').value;
        const type = entry.querySelector('.prize-type-select').value;
        prizes.push({ hole: parseInt(hole), type: type });
    });
    return prizes;
}

// Update tee options based on selected course
function updateTeeOptions() {
    const courseInput = document.getElementById('round-course');
    const teeOptions = document.getElementById('tee-options');
    if (!courseInput || !teeOptions) return;

    const courseName = courseInput.value.trim();
    const tees = getCourseTees(courseName);

    teeOptions.innerHTML = tees.map((tee, index) => {
        const distLabel = tee.totalDistance ? ` (${tee.totalDistance.toLocaleString()}m)` : '';
        return `
            <label class="tee-option">
                <input type="radio" name="tees" value="${tee.key}" ${index === 0 ? 'checked' : ''}>
                <span class="tee-label">${tee.label}${distLabel}</span>
            </label>
        `;
    }).join('');
}

// Check URL for join code parameter
function checkUrlForJoinCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');

    if (joinCode) {
        // Auto-fill and look up the round
        document.getElementById('join-code').value = joinCode.toUpperCase();
        showJoinRound();
        setTimeout(() => lookupRound(), 500); // Small delay to ensure Firebase is ready
    }
}

// Load all rounds (active + completed) and show the section
async function loadMyActiveRounds() {
    const currentPlayerName = localStorage.getItem('currentPlayerName');
    const allJoinedRounds = JSON.parse(localStorage.getItem('joinedRounds') || '[]');
    const joinedRounds = currentPlayerName
        ? allJoinedRounds.filter(r => r.playerName === currentPlayerName)
        : allJoinedRounds;

    // Check if we have any active rounds or if Firebase has completed/archived rounds
    const hasActiveRounds = joinedRounds.length > 0;
    let hasCompletedRounds = false;
    let hasArchivedRounds = false;

    if (window.db && window.firestoreHelpers && currentPlayerName) {
        try {
            const { collection, query, where, getDocs } = window.firestoreHelpers;
            const completedQ = query(
                collection(window.db, 'completedRounds'),
                where('playerName', '==', currentPlayerName)
            );
            const archivedQ = query(
                collection(window.db, 'archivedRounds'),
                where('playerName', '==', currentPlayerName)
            );
            const [completedSnap, archivedSnap] = await Promise.all([getDocs(completedQ), getDocs(archivedQ)]);
            hasCompletedRounds = !completedSnap.empty;
            hasArchivedRounds = !archivedSnap.empty;
        } catch (error) {
            console.error('Error checking rounds:', error);
        }
    }

    if (!hasActiveRounds && !hasCompletedRounds && !hasArchivedRounds) {
        document.getElementById('my-rounds-section').style.display = 'none';
        return;
    }

    document.getElementById('my-rounds-section').style.display = 'block';

    // Load active rounds
    await loadActiveRounds(joinedRounds);

    // Load completed rounds
    await loadMyCompletedRounds();
}

// Load active rounds from localStorage + Firebase
async function loadActiveRounds(joinedRounds) {
    const activeListContainer = document.getElementById('active-rounds-list');
    activeListContainer.innerHTML = '';

    for (const roundInfo of joinedRounds) {
        try {
            if (!window.db || !window.firestoreHelpers) continue;

            const { doc, getDoc } = window.firestoreHelpers;
            const roundRef = doc(window.db, 'rounds', roundInfo.roundId);
            const roundSnap = await getDoc(roundRef);

            if (roundSnap.exists()) {
                const roundData = roundSnap.data();
                const roundCard = createMyRoundCard(roundInfo.roundId, roundData, roundInfo.scoreId);
                activeListContainer.appendChild(roundCard);
            }
        } catch (error) {
            console.error('Error loading round:', error);
        }
    }

    if (joinedRounds.length === 0) {
        activeListContainer.innerHTML = '<p class="empty-rounds-message">No active rounds</p>';
    }
}

// Load completed rounds from Firebase
async function loadMyCompletedRounds() {
    const completedListContainer = document.getElementById('completed-rounds-list');
    completedListContainer.innerHTML = '';

    const currentPlayerName = localStorage.getItem('currentPlayerName');
    let completedRounds = [];

    if (window.db && window.firestoreHelpers && currentPlayerName) {
        try {
            const { collection, query, where, getDocs } = window.firestoreHelpers;
            const q = query(
                collection(window.db, 'completedRounds'),
                where('playerName', '==', currentPlayerName)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(docSnap => {
                completedRounds.push({ id: docSnap.id, ...docSnap.data() });
            });
        } catch (error) {
            console.error('Error loading completed rounds from Firebase:', error);
        }
    }

    // Sort by date, most recent first
    completedRounds.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    for (const completedRound of completedRounds) {
        const roundCard = createCompletedRoundCard(completedRound);
        completedListContainer.appendChild(roundCard);
    }

    if (completedRounds.length === 0) {
        completedListContainer.innerHTML = '<p class="empty-rounds-message">No completed rounds</p>';
    }
}

// Switch between Active and Completed tabs
function switchRoundsTab(tab) {
    const tabs = {
        active: document.getElementById('tab-active'),
        completed: document.getElementById('tab-completed'),
        archived: document.getElementById('tab-archived')
    };
    const lists = {
        active: document.getElementById('active-rounds-list'),
        completed: document.getElementById('completed-rounds-list'),
        archived: document.getElementById('archived-rounds-list')
    };

    // Deactivate all tabs and hide all lists
    Object.values(tabs).forEach(t => t && t.classList.remove('active'));
    Object.values(lists).forEach(l => { if (l) l.style.display = 'none'; });

    // Activate selected tab and show its list
    if (tabs[tab]) tabs[tab].classList.add('active');
    if (lists[tab]) lists[tab].style.display = 'flex';

    // Load data when switching tabs
    if (tab === 'completed') loadMyCompletedRounds();
    if (tab === 'archived') loadArchivedRounds();
}

// Create a card for completed rounds
function createCompletedRoundCard(completedRound) {
    const card = document.createElement('div');
    card.className = 'my-round-card completed';
    card.dataset.scoreId = completedRound.id;

    const dateStr = completedRound.date ? new Date(completedRound.date).toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : 'No date';

    const courseName = completedRound.course || 'Unknown Course';
    const tees = completedRound.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseLine = [courseName, teeLabel].filter(Boolean).join(' • ');
    const totalScore = completedRound.totalScore || '-';
    const stablefordPoints = completedRound.stablefordPoints || '-';
    const joinCode = completedRound.joinCode || '';
    const hasCourseInfo = !!getCourseData(courseName);
    const scoreSummary = hasCourseInfo
        ? `Score: ${totalScore} | Stableford: ${stablefordPoints}`
        : `Score: ${totalScore}`;

    card.innerHTML = `
        <button class="remove-btn corner-remove-btn" onclick="event.stopPropagation(); removeCompletedRound('${completedRound.id}')" title="Remove round">✕</button>
        <div class="my-round-info">
            <h4>${(completedRound.name || 'Completed Round').replace(/^.+ - /, '')}</h4>
            <p class="my-round-course">${courseLine}</p>
            <p class="my-round-date">${dateStr}</p>
            <p class="round-score-summary">${scoreSummary}</p>
        </div>
    `;

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openRoundModal(completedRound.id));

    return card;
}

// Create a card for "My Active Rounds"
function createMyRoundCard(roundId, roundData, scoreId) {
    const card = document.createElement('div');
    card.className = 'my-round-card active';

    const dateStr = roundData.date ? new Date(roundData.date).toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }) : 'No date';

    const courseName = roundData.settings?.course || 'Unknown Course';
    const tees = roundData.settings?.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseLine = [courseName, teeLabel].filter(Boolean).join(' • ');
    const joinCode = roundData.joinCode || '';

    card.innerHTML = `
        <button class="remove-btn corner-remove-btn" onclick="event.stopPropagation(); removeRound('${roundId}', '${scoreId}')" title="Remove round">✕</button>
        <button class="share-btn-corner" onclick="event.stopPropagation(); shareRound('${joinCode}')" title="Share round">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </button>
        <div class="my-round-info">
            <h4>${roundData.name || 'Unnamed Round'}</h4>
            <p class="my-round-course">${courseLine}</p>
            <p class="my-round-date">${dateStr}</p>
        </div>
    `;

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => continueRound(roundId, scoreId));

    return card;
}

// Remove a round from My Active Rounds
async function removeRound(roundId, scoreId) {
    if (!confirm('Are you sure you want to archive this round?')) {
        return;
    }

    // Remove from joinedRounds in localStorage
    let joinedRounds = JSON.parse(localStorage.getItem('joinedRounds') || '[]');
    joinedRounds = joinedRounds.filter(r => r.roundId !== roundId || r.scoreId !== scoreId);
    localStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));

    // Delete from activeRounds and move score to archivedRounds in Firebase
    if (window.db && window.firestoreHelpers && scoreId) {
        try {
            const { doc, getDoc, setDoc, deleteDoc } = window.firestoreHelpers;

            // Delete from activeRounds
            const activeRoundId = `${roundId}_${scoreId}`;
            try {
                await deleteDoc(doc(window.db, 'activeRounds', activeRoundId));
            } catch (e) {
            }

            // Move score to archivedRounds, enriching with round data
            const scoreSnap = await getDoc(doc(window.db, 'scores', scoreId));
            const roundSnap = await getDoc(doc(window.db, 'rounds', roundId));
            if (scoreSnap.exists()) {
                const scoreData = scoreSnap.data();
                scoreData.status = 'archived';
                scoreData.archivedAt = new Date().toISOString();
                // Ensure course name is included from round settings
                if (!scoreData.course && roundSnap.exists()) {
                    const roundSettings = roundSnap.data().settings || {};
                    scoreData.course = roundSettings.course || 'Unknown Course';
                    scoreData.tees = scoreData.tees || roundSettings.tees;
                    scoreData.date = scoreData.date || roundSnap.data().date;
                    scoreData.name = scoreData.name || roundSnap.data().name;
                }
                await setDoc(doc(window.db, 'archivedRounds', scoreId), scoreData);
                await deleteDoc(doc(window.db, 'scores', scoreId));
            }
        } catch (error) {
            console.error('Error archiving round:', error);
        }
    }

    // Refresh the list
    loadMyActiveRounds();
}

// Continue a previously joined round
function continueRound(roundId, scoreId) {
    window.location.href = `live-scores.html?round=${roundId}&score=${scoreId}`;
}

// Share a round by copying the join link
function shareRound(joinCode) {
    if (!joinCode) {
        alert('No join code available for this round');
        return;
    }

    const shareLink = `${window.location.origin}${window.location.pathname}?join=${joinCode}`;
    navigator.clipboard.writeText(shareLink).then(() => {
        showCopyFeedback('Link copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback - show the link in a prompt
        prompt('Copy this link to share:', shareLink);
    });
}

// Show/hide different views
const viewIds = ['rounds-hub', 'create-round-form', 'round-created-success', 'join-round-form', 'join-round-details'];

function showView(activeId) {
    viewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = id === activeId ? 'block' : 'none';
    });
    if (activeId === 'rounds-hub') loadMyActiveRounds();
}

function showRoundsHub()  { showView('rounds-hub'); }
function showCreateRound() { showView('create-round-form'); }
function showJoinRound()  { showView('join-round-form'); }
function showJoinDetails() { showView('join-round-details'); }

// Create a new round
async function createRound() {
    const name = document.getElementById('round-name').value.trim();
    const course = document.getElementById('round-course').value;
    const date = document.getElementById('round-date').value;
    const holes = document.querySelector('input[name="holes"]:checked')?.value || '18';
    const tees = document.querySelector('input[name="tees"]:checked')?.value || 'tallwood';

    // Validation
    if (!name) {
        alert('Please enter a round name');
        return;
    }
    if (!date) {
        alert('Please select a date');
        return;
    }

    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const { collection, doc, setDoc } = window.firestoreHelpers;

        // Generate unique join code
        const joinCode = generateJoinCode();

        // Create round document
        const roundId = `round_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const roundData = {
            id: roundId,
            name: name,
            joinCode: joinCode,
            tournamentId: null, // Ready for tournaments later
            createdBy: null, // Creator not auto-joined
            createdAt: new Date().toISOString(),
            date: date,
            status: 'active',
            settings: {
                course: course,
                holes: parseInt(holes),
                tees: tees,
                scoringFormat: 'stableford',
                holePrizes: getHolePrizes()
            },
            invitedPlayers: []
        };

        await setDoc(doc(window.db, 'rounds', roundId), roundData);

        // Store for success screen
        createdRoundId = roundId;
        currentRoundData = roundData;

        // Show success screen
        const shareLink = `${window.location.origin}${window.location.pathname}?join=${joinCode}`;
        document.getElementById('created-share-link').value = shareLink;

        // Generate QR code
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareLink)}`;
        document.getElementById('created-qr-code').src = qrUrl;

        document.getElementById('create-round-form').style.display = 'none';
        document.getElementById('round-created-success').style.display = 'block';


    } catch (error) {
        console.error('Error creating round:', error);
        alert('Failed to create round. Please try again.');
    }
}

// Copy join code to clipboard
function copyJoinCode() {
    const code = document.getElementById('created-join-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showCopyFeedback('Code copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Copy share link to clipboard
function copyShareLink() {
    const link = document.getElementById('created-share-link').value;
    navigator.clipboard.writeText(link).then(() => {
        showCopyFeedback('Link copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show copy feedback
function showCopyFeedback(message) {
    // Create temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Join the round that was just created
function joinCreatedRound() {
    if (createdRoundId && currentRoundData) {
        // Pre-fill the join flow
        document.getElementById('join-round-name').textContent = currentRoundData.name;

        const dateStr = new Date(currentRoundData.date).toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const courseName = currentRoundData.settings?.course || 'Unknown Course';
        const teeLabel = formatTeeName(currentRoundData.settings.tees);
        document.getElementById('join-round-course-info').textContent = `${courseName} - ${teeLabel}`;
        document.getElementById('join-round-date-info').textContent = dateStr;

        showJoinDetails();
    }
}

// Look up a round by join code
async function lookupRound() {
    const joinCode = document.getElementById('join-code').value.trim().toUpperCase();

    if (!joinCode || joinCode.length < 5) {
        alert('Please enter a valid join code');
        return;
    }

    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const { collection, query, where, getDocs } = window.firestoreHelpers;

        // Query for round with matching join code
        const roundsRef = collection(window.db, 'rounds');
        const q = query(roundsRef, where('joinCode', '==', joinCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert('No round found with that code. Please check and try again.');
            return;
        }

        // Get the first (should be only) matching round
        const roundDoc = querySnapshot.docs[0];
        currentRoundData = roundDoc.data();
        createdRoundId = roundDoc.id;

        // Display round details
        document.getElementById('join-round-name').textContent = currentRoundData.name;

        const dateStr = new Date(currentRoundData.date).toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const courseName = currentRoundData.settings?.course || 'Unknown Course';
        const teeLabel = formatTeeName(currentRoundData.settings.tees);
        document.getElementById('join-round-course-info').textContent = `${courseName} - ${teeLabel}`;
        document.getElementById('join-round-date-info').textContent = dateStr;

        showJoinDetails();

    } catch (error) {
        console.error('Error looking up round:', error);
        alert('Failed to find round. Please try again.');
    }
}

// Toggle between player and team entry types for joining
function toggleJoinEntryType() {
    const entryType = document.querySelector('input[name="join-entry-type"]:checked')?.value;

    document.getElementById('join-player-section').style.display =
        entryType === 'player' ? 'block' : 'none';
    document.getElementById('new-player-fields').style.display = 'none';
    document.getElementById('join-team-section').style.display =
        entryType === 'team' ? 'block' : 'none';
}

// Toggle new player input fields
function toggleNewPlayerFields() {
    const select = document.getElementById('join-player-select');
    const newPlayerFields = document.getElementById('new-player-fields');

    if (select.value === 'new') {
        newPlayerFields.style.display = 'block';
    } else {
        newPlayerFields.style.display = 'none';
    }
}

// Join a round
async function joinRound() {
    if (!currentRoundData || !createdRoundId) {
        alert('No round selected. Please look up a round first.');
        return;
    }

    const entryType = document.querySelector('input[name="join-entry-type"]:checked')?.value || 'player';

    let playerName, handicap, playerId, teamName;

    if (entryType === 'player') {
        const playerSelect = document.getElementById('join-player-select');

        if (playerSelect.value === 'new') {
            // New player
            playerName = document.getElementById('new-player-name').value.trim();
            handicap = parseInt(document.getElementById('new-player-handicap').value) || 18;
            playerId = null;

            if (!playerName) {
                alert('Please enter your name');
                return;
            }
        } else if (playerSelect.value) {
            // Existing player
            playerId = parseInt(playerSelect.value);
            const player = allPlayers.find(p => p.id === playerId);
            playerName = player.name;
            handicap = player.handicap;
        } else {
            alert('Please select a player or enter your name');
            return;
        }
    } else {
        // Team entry
        teamName = document.getElementById('join-team-name').value.trim();
        handicap = parseInt(document.getElementById('join-team-handicap').value) || 18;
        playerName = teamName;
        playerId = null; // Teams don't have a player ID

        if (!teamName) {
            alert('Please enter a team name');
            return;
        }
    }

    // Save player identity to localStorage
    localStorage.setItem('currentPlayerName', playerName);

    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const { doc, setDoc, updateDoc, arrayUnion, collection, query, where, getDocs } = window.firestoreHelpers;

        // Check if this player/team has already joined this round (check active scores)
        const scoresRef = collection(window.db, 'scores');
        const existingQuery = query(scoresRef,
            where('roundId', '==', createdRoundId),
            where('playerName', '==', playerName)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            const existingScore = existingDocs.docs[0];
            const resume = confirm(`${playerName} has already joined this round. Would you like to resume scoring?`);
            if (resume) {
                window.location.href = `live-scores.html?round=${createdRoundId}&score=${existingScore.id}`;
            }
            return;
        }

        // Check if this player has already completed this round
        const completedRef = collection(window.db, 'completedRounds');
        const completedQuery = query(completedRef,
            where('roundId', '==', createdRoundId),
            where('playerName', '==', playerName)
        );
        const completedDocs = await getDocs(completedQuery);

        if (!completedDocs.empty) {
            alert(`${playerName} has already completed this round.`);
            return;
        }

        // Create score document for this player/team in the round
        const scoreId = `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scoreData = {
            id: scoreId,
            tournamentId: currentRoundData.tournamentId || null,
            roundId: createdRoundId,
            playerId: playerId,
            playerName: playerName,
            entryType: entryType,
            teamName: entryType === 'team' ? teamName : null,
            handicap: handicap,
            tees: currentRoundData.settings.tees,
            scores: {},
            putts: {},
            status: 'in-progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await setDoc(doc(window.db, 'scores', scoreId), scoreData);

        // Add player to round's invitedPlayers
        const roundRef = doc(window.db, 'rounds', createdRoundId);
        await updateDoc(roundRef, {
            invitedPlayers: arrayUnion(playerName)
        });

        // Store in session for "My Active Rounds"
        const joinedRounds = JSON.parse(localStorage.getItem('joinedRounds') || '[]');
        joinedRounds.push({
            roundId: createdRoundId,
            scoreId: scoreId,
            playerName: playerName
        });
        localStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));


        // Navigate to scoring page
        window.location.href = `live-scores.html?round=${createdRoundId}&score=${scoreId}`;

    } catch (error) {
        console.error('Error joining round:', error);
        alert('Failed to join round. Please try again.');
    }
}

// Initialize mobile menu
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

// Make functions globally available
window.showRoundsHub = showRoundsHub;
window.showCreateRound = showCreateRound;
window.showJoinRound = showJoinRound;
window.toggleOptionalSettings = toggleOptionalSettings;
window.addHolePrize = addHolePrize;
window.removeHolePrize = removeHolePrize;
window.createRound = createRound;
window.copyJoinCode = copyJoinCode;
window.copyShareLink = copyShareLink;
window.joinCreatedRound = joinCreatedRound;
window.lookupRound = lookupRound;
window.toggleJoinEntryType = toggleJoinEntryType;
window.toggleNewPlayerFields = toggleNewPlayerFields;
window.joinRound = joinRound;
window.continueRound = continueRound;
window.removeRound = removeRound;
window.shareRound = shareRound;
window.switchRoundsTab = switchRoundsTab;
window.viewScorecard = viewScorecard;
window.removeCompletedRound = removeCompletedRound;
window.permanentlyDeleteRound = permanentlyDeleteRound;
window.deleteAllArchivedRounds = deleteAllArchivedRounds;
window.openRoundModal = openRoundModal;
window.closeRoundModal = closeRoundModal;
window.switchRoundModalTab = switchRoundModalTab;
window.viewLeaderboard = viewLeaderboard;
window.initializeRoundsPage = initializeRoundsPage;

// Course data is loaded from course-data.js (shared with live-scores.js)
// getCourseData(courseName) returns the course object or null

// View scorecard for a completed round
async function viewScorecard(roundId) {
    let round = null;

    // Fetch from Firebase (check completedRounds first, then archivedRounds)
    if (window.db && window.firestoreHelpers) {
        try {
            const { doc, getDoc } = window.firestoreHelpers;
            let docSnap = await getDoc(doc(window.db, 'completedRounds', roundId));
            if (!docSnap.exists()) {
                docSnap = await getDoc(doc(window.db, 'archivedRounds', roundId));
            }
            if (docSnap.exists()) {
                round = { id: docSnap.id, ...docSnap.data() };
            }
        } catch (error) {
            console.error('Error fetching round from Firebase:', error);
        }
    }

    if (!round) {
        alert('Round not found');
        return;
    }

    // Populate modal header
    const courseName = round.course || 'Unknown Course';
    const tees = round.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseInfoParts = [courseName, teeLabel].filter(Boolean);
    document.getElementById('round-modal-course').textContent = courseInfoParts.join(' - ');

    const handicapDisplay = round.handicap !== undefined ? ` (${round.handicap})` : '';
    document.getElementById('round-modal-player').textContent = (round.playerName || '') + handicapDisplay;

    const dateStr = round.date ? formatLongDate(round.date) : '';
    document.getElementById('round-modal-date').textContent = dateStr;

    // Generate scorecard table
    generateScorecardTable(round);

    // Reset to scorecard tab and show modal
    switchRoundModalTab('scorecard');
    document.getElementById('round-modal').style.display = 'flex';
}

// Open the combined round modal (defaults to scorecard tab)
async function openRoundModal(scoreId) {
    // Load scorecard data
    await viewScorecard(scoreId);
    // Pre-load leaderboard data in background
    viewLeaderboard(scoreId);
}

// Close round modal
function closeRoundModal() {
    document.getElementById('round-modal').style.display = 'none';
}

// Switch between scorecard and leaderboard tabs
function switchRoundModalTab(tab) {
    const tabs = document.querySelectorAll('.round-modal-tab');
    tabs.forEach(t => t.classList.remove('active'));

    const scorecardPanel = document.getElementById('round-modal-scorecard');
    const leaderboardPanel = document.getElementById('round-modal-leaderboard');

    if (tab === 'scorecard') {
        tabs[0].classList.add('active');
        scorecardPanel.style.display = '';
        leaderboardPanel.style.display = 'none';
    } else {
        tabs[1].classList.add('active');
        scorecardPanel.style.display = 'none';
        leaderboardPanel.style.display = '';
    }
}

// View leaderboard for a completed round (shows all players in that round)
async function viewLeaderboard(roundId) {
    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    try {
        const { doc, getDoc, collection, query, where, getDocs } = window.firestoreHelpers;

        // First, get the clicked round to find its parent roundId and course info
        let clickedRound = null;
        let docSnap = await getDoc(doc(window.db, 'completedRounds', roundId));
        if (!docSnap.exists()) {
            docSnap = await getDoc(doc(window.db, 'archivedRounds', roundId));
        }
        if (docSnap.exists()) {
            clickedRound = { id: docSnap.id, ...docSnap.data() };
        }

        if (!clickedRound || !clickedRound.roundId) {
            alert('Round data not found');
            return;
        }

        const parentRoundId = clickedRound.roundId;
        const courseName = clickedRound.course || 'Unknown Course';
        const courseInfo = getCourseData(courseName);

        // Fetch all completed rounds with the same parent roundId
        const completedQuery = query(
            collection(window.db, 'completedRounds'),
            where('roundId', '==', parentRoundId)
        );
        const completedSnap = await getDocs(completedQuery);

        const allPlayers = [];
        completedSnap.forEach(d => {
            allPlayers.push({ id: d.id, ...d.data(), _isCompleted: true });
        });

        // Also check activeRounds for players still playing
        const activeQuery = query(
            collection(window.db, 'activeRounds'),
            where('roundId', '==', parentRoundId)
        );
        const activeSnap = await getDocs(activeQuery);
        activeSnap.forEach(d => {
            allPlayers.push({ id: d.id, ...d.data(), _isCompleted: false });
        });

        if (allPlayers.length === 0) {
            alert('No player data found for this round');
            return;
        }

        // Build leaderboard data
        const leaderboardData = allPlayers.map(round => {
            let holesPlayed = 0;
            let totalScore = 0;
            let totalPar = 0;
            let stablefordPoints = 0;
            const handicap = round.playerHandicap || round.handicap || 0;

            // Calculate from holes data if available
            if (round.holes) {
                for (let i = 1; i <= 18; i++) {
                    if (round.holes[i] && round.holes[i].score !== null && round.holes[i].score !== undefined) {
                        holesPlayed = i;
                        if (round.holes[i].score !== 'P') {
                            totalScore += round.holes[i].score;
                            if (courseInfo) {
                                totalPar += courseInfo.holes[i].par;
                                stablefordPoints += calcStablefordPoints(round.holes[i].score, courseInfo.holes[i].par, courseInfo.holes[i].si, handicap);
                            }
                        }
                    }
                }
            } else if (round.scores) {
                // Fallback to flat scores/putts format
                for (let i = 1; i <= 18; i++) {
                    if (round.scores[i] !== undefined && round.scores[i] !== null) {
                        holesPlayed = i;
                        if (round.scores[i] !== 'P') {
                            totalScore += round.scores[i];
                            if (courseInfo) {
                                totalPar += courseInfo.holes[i].par;
                                stablefordPoints += calcStablefordPoints(round.scores[i], courseInfo.holes[i].par, courseInfo.holes[i].si, handicap);
                            }
                        }
                    }
                }
            }

            // Find the highest hole number where a 3+ putt occurred
            let lastThreePuttHole = 0;
            if (round.holes) {
                for (let i = 1; i <= 18; i++) {
                    if (round.holes[i] && round.holes[i].putts >= 3) {
                        lastThreePuttHole = i;
                    }
                }
            } else if (round.putts) {
                for (let i = 1; i <= 18; i++) {
                    if (round.putts[i] >= 3) {
                        lastThreePuttHole = i;
                    }
                }
            }

            return {
                name: round.playerName || 'Unknown',
                handicap: handicap,
                holesPlayed: holesPlayed,
                currentHole: round.currentHole || holesPlayed,
                totalScore: totalScore,
                totalPar: totalPar,
                scoreToPar: totalScore - totalPar,
                stablefordPoints: stablefordPoints,
                isFinished: round._isCompleted || round.status === 'finished',
                hasSnake: lastThreePuttHole > 0,
                lastThreePuttHole: lastThreePuttHole
            };
        });

        // Determine who has the snake — the player who 3-putted on the
        // highest (latest) hole number gets the snake. If multiple players
        // 3-putted on the same highest hole, they all share it.
        let snakePlayerName = null;
        let highestSnakeHole = 0;
        leaderboardData.forEach(player => {
            if (player.lastThreePuttHole > highestSnakeHole) {
                highestSnakeHole = player.lastThreePuttHole;
                snakePlayerName = player.name;
            }
        });
        // Check for ties on the highest snake hole — all players who
        // 3-putted on that hole share the snake
        const snakePlayerNames = new Set();
        if (highestSnakeHole > 0) {
            leaderboardData.forEach(player => {
                if (player.lastThreePuttHole === highestSnakeHole) {
                    snakePlayerNames.add(player.name);
                }
            });
        }

        // Sort by stableford points (highest first)
        leaderboardData.sort((a, b) => {
            if (a.stablefordPoints !== b.stablefordPoints) return b.stablefordPoints - a.stablefordPoints;
            return b.holesPlayed - a.holesPlayed;
        });

        // Render leaderboard rows
        const body = document.getElementById('leaderboard-modal-body');
        body.innerHTML = leaderboardData.map((player, index) => {
            const pos = index + 1;
            let scoreClass = 'even-par';
            let scoreDisplay = '-';

            if (player.holesPlayed > 0) {
                if (courseInfo) {
                    let parDisplay = 'E';
                    if (player.scoreToPar < 0) {
                        scoreClass = 'under-par';
                        parDisplay = player.scoreToPar.toString();
                    } else if (player.scoreToPar > 0) {
                        scoreClass = 'over-par';
                        parDisplay = '+' + player.scoreToPar;
                    }
                    scoreDisplay = `${parDisplay} (${player.stablefordPoints})`;
                } else {
                    scoreDisplay = `${player.totalScore}`;
                }
            }

            const holeDisplay = player.isFinished ? 'F' : `H${player.currentHole}`;
            const isSnakeHolder = snakePlayerNames.has(player.name);
            const snakeIcon = isSnakeHolder ? '🐍' : '';

            let playerClass = 'header-lb-player';
            if (pos === 1 && player.holesPlayed > 0) playerClass += ' leader';
            if (player.isFinished) playerClass += ' finished';
            if (!player.isFinished) playerClass += ' live';

            return `
                <div class="${playerClass}">
                    <span class="header-lb-pos">${pos}</span>
                    <span class="header-lb-snake">${snakeIcon}</span>
                    <span class="header-lb-name">${player.name}</span>
                    <span class="header-lb-hole">${holeDisplay}</span>
                    <span class="header-lb-score ${scoreClass}">${scoreDisplay}</span>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Load and display archived rounds
async function loadArchivedRounds() {
    const container = document.getElementById('archived-rounds-list');
    if (!container) return;

    const currentPlayerName = localStorage.getItem('currentPlayerName');
    let archivedRounds = [];

    // Fetch archived rounds from Firebase
    if (window.db && window.firestoreHelpers && currentPlayerName) {
        try {
            const { collection, query, where, getDocs } = window.firestoreHelpers;
            const q = query(
                collection(window.db, 'archivedRounds'),
                where('playerName', '==', currentPlayerName)
            );
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                archivedRounds.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error('Error loading archived rounds from Firebase:', error);
        }
    }

    if (archivedRounds.length === 0) {
        container.innerHTML = '<div class="no-rounds-message">No archived rounds</div>';
        return;
    }

    // Sort by archived date, most recent first
    archivedRounds.sort((a, b) => new Date(b.archivedAt || b.updatedAt) - new Date(a.archivedAt || a.updatedAt));

    let html = '';

    archivedRounds.forEach((round, index) => {
        const dateStr = round.date ? new Date(round.date).toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : (round.archivedAt ? new Date(round.archivedAt).toLocaleDateString('en-AU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'No date');

        const courseName = round.course || 'Unknown Course';
        const totalScore = round.totalScore || '-';
        const stablefordPoints = round.stablefordPoints || '-';

        const roundName = round.name || 'Archived Round';

        html += `
            <div class="my-round-card archived">
                <button class="remove-btn corner-remove-btn" onclick="permanentlyDeleteRound('${round.id}')" title="Delete permanently">✕</button>
                <div class="my-round-info">
                    <h4>${roundName}</h4>
                    <p class="my-round-course">${courseName}</p>
                    <p>${dateStr}</p>
                    <p class="round-score-summary">Score: ${totalScore} | Stableford: ${stablefordPoints}</p>
                </div>
            </div>
        `;
    });

    // Add Delete All button
    html += `
        <div class="archived-actions">
            <button class="delete-all-btn" onclick="deleteAllArchivedRounds()">Delete All Archived Rounds</button>
        </div>
    `;

    container.innerHTML = html;
}

// Permanently delete a single archived round
// Check if any other scores reference a round across all collections
async function hasOtherScoresForRound(roundId) {
    if (!window.db || !window.firestoreHelpers) return false;

    const { collection, query, where, getDocs } = window.firestoreHelpers;

    // Check scores (active), completedRounds, and archivedRounds
    const collections = ['scores', 'completedRounds', 'archivedRounds'];
    for (const col of collections) {
        const q = query(
            collection(window.db, col),
            where('roundId', '==', roundId)
        );
        const snapshot = await getDocs(q);
        if (snapshot.size > 0) return true;
    }

    return false;
}

async function permanentlyDeleteRound(roundId) {
    if (!confirm('Permanently delete this round? This cannot be undone.')) return;

    // Delete from Firebase
    if (window.db && window.firestoreHelpers) {
        try {
            const { doc, getDoc, deleteDoc } = window.firestoreHelpers;

            // Get the archived round to find the parent round ID
            const archivedSnap = await getDoc(doc(window.db, 'archivedRounds', roundId));
            const parentRoundId = archivedSnap.exists() ? archivedSnap.data().roundId : null;

            // Delete from archivedRounds
            await deleteDoc(doc(window.db, 'archivedRounds', roundId));

            // Also delete from scores collection (safety cleanup)
            try {
                await deleteDoc(doc(window.db, 'scores', roundId));
            } catch (e) {
                // May not exist, that's fine
            }

            // Delete from rounds collection only if no other scores reference it
            if (parentRoundId) {
                try {
                    const hasOtherScores = await hasOtherScoresForRound(parentRoundId);
                    if (!hasOtherScores) {
                        await deleteDoc(doc(window.db, 'rounds', parentRoundId));
                    } else {
                    }
                } catch (e) {
                }
            }
        } catch (e) {
            console.error('Error deleting from Firebase:', e);
        }
    }

    loadArchivedRounds();
}

// Delete all archived rounds permanently
async function deleteAllArchivedRounds() {
    if (!confirm('Permanently delete all archived rounds? This cannot be undone.')) return;

    const currentPlayerName = localStorage.getItem('currentPlayerName');

    // Fetch and delete all archived rounds from Firebase
    if (window.db && window.firestoreHelpers && currentPlayerName) {
        try {
            const { collection, query, where, getDocs, doc, deleteDoc } = window.firestoreHelpers;
            const q = query(
                collection(window.db, 'archivedRounds'),
                where('playerName', '==', currentPlayerName)
            );
            const snapshot = await getDocs(q);
            for (const docSnap of snapshot.docs) {
                const parentRoundId = docSnap.data().roundId;

                await deleteDoc(doc(window.db, 'archivedRounds', docSnap.id));

                // Also delete from scores collection (safety cleanup)
                try {
                    await deleteDoc(doc(window.db, 'scores', docSnap.id));
                } catch (e) {
                    // May not exist, that's fine
                }

                // Delete from rounds collection only if no other scores reference it
                if (parentRoundId) {
                    try {
                        const hasOtherScores = await hasOtherScoresForRound(parentRoundId);
                        if (!hasOtherScores) {
                            await deleteDoc(doc(window.db, 'rounds', parentRoundId));
                        } else {
                        }
                    } catch (e) {
                    }
                }
            }
        } catch (e) {
            console.error('Error deleting archived rounds from Firebase:', e);
        }
    }

    loadArchivedRounds();
}

// Remove a completed round
async function removeCompletedRound(roundId) {
    if (!confirm('Are you sure you want to archive this round?')) {
        return;
    }

    // Move from completedRounds to archivedRounds in Firebase
    if (window.db && window.firestoreHelpers) {
        try {
            const { doc, getDoc, setDoc, deleteDoc } = window.firestoreHelpers;
            // Read the completed round
            const docSnap = await getDoc(doc(window.db, 'completedRounds', roundId));
            if (docSnap.exists()) {
                const roundData = docSnap.data();
                roundData.status = 'archived';
                roundData.archivedAt = new Date().toISOString();
                // Write to archivedRounds
                await setDoc(doc(window.db, 'archivedRounds', roundId), roundData);
                // Delete from completedRounds
                await deleteDoc(doc(window.db, 'completedRounds', roundId));
            }
        } catch (e) {
            console.error('Error archiving round in Firebase:', e);
        }
    }

    // Refresh the list
    loadMyActiveRounds();
}

// Generate scorecard table HTML
function generateScorecardTable(round) {
    document.getElementById('modal-scorecard-table').innerHTML =
        generateScorecardHTML(round.scores || {}, round.putts || {}, getCourseData(round.course), round.handicap || 0);
}
