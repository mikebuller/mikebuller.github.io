// Rounds Management JavaScript

// Player data (same as live-scores.js)
const allPlayers = [
    { id: 1, name: "Mike Buller", handicap: 9.0 },
    { id: 2, name: "Adrian Platas", handicap: 3.2 },
    { id: 3, name: "Darren Shadlow", handicap: 6.0 },
    { id: 4, name: "Nathan Pizzuto", handicap: 35.0 },
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
    console.log('Initializing rounds page...');
    
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
    const totalScore = completedRound.totalScore || '-';
    const stablefordPoints = completedRound.stablefordPoints || '-';
    const joinCode = completedRound.joinCode || '';
    const hasCourseInfo = !!getCourseData(courseName);
    const scoreSummary = hasCourseInfo 
        ? `Score: ${totalScore} | Stableford: ${stablefordPoints}` 
        : `Score: ${totalScore}`;
    
    card.innerHTML = `
        <button class="share-btn-corner" onclick="shareRound('${joinCode}')" title="Share round">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </button>
        <div class="my-round-info">
            <h4>${completedRound.name || 'Completed Round'}</h4>
            <p class="my-round-course">${courseName}</p>
            <p>${dateStr}</p>
            <p class="round-score-summary">${scoreSummary}</p>
        </div>
        <div class="my-round-actions">
            <button class="continue-btn" onclick="viewScorecard('${completedRound.id}')">View Scorecard</button>
            <button class="remove-btn" onclick="removeCompletedRound('${completedRound.id}')" title="Remove round">✕</button>
        </div>
    `;
    
    return card;
}

// Create a card for "My Active Rounds"
function createMyRoundCard(roundId, roundData, scoreId) {
    const card = document.createElement('div');
    card.className = 'my-round-card';
    
    const dateStr = roundData.date ? new Date(roundData.date).toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    }) : 'No date';
    
    const courseName = roundData.settings?.course || 'Unknown Course';
    const joinCode = roundData.joinCode || '';
    
    card.innerHTML = `
        <button class="share-btn-corner" onclick="shareRound('${joinCode}')" title="Share round">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </button>
        <div class="my-round-info">
            <h4>${roundData.name || 'Unnamed Round'}</h4>
            <p class="my-round-course">${courseName}</p>
            <p>${dateStr} • ${roundData.settings?.holes || 18} holes • ${roundData.settings?.tees || 'tallwood'}</p>
        </div>
        <div class="my-round-actions">
            <button class="continue-btn" onclick="continueRound('${roundId}', '${scoreId}')">Continue →</button>
            <button class="remove-btn" onclick="removeRound('${roundId}', '${scoreId}')" title="Remove round">✕</button>
        </div>
    `;
    
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
                console.log('Deleted from activeRounds:', activeRoundId);
            } catch (e) {
                console.log('Could not delete active round (may not exist):', e);
            }
            
            // Move score to archivedRounds
            const scoreSnap = await getDoc(doc(window.db, 'scores', scoreId));
            if (scoreSnap.exists()) {
                const scoreData = scoreSnap.data();
                scoreData.status = 'archived';
                scoreData.archivedAt = new Date().toISOString();
                await setDoc(doc(window.db, 'archivedRounds', scoreId), scoreData);
                await deleteDoc(doc(window.db, 'scores', scoreId));
                console.log('Score moved to archivedRounds:', scoreId);
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
function showRoundsHub() {
    document.getElementById('rounds-hub').style.display = 'block';
    document.getElementById('create-round-form').style.display = 'none';
    document.getElementById('round-created-success').style.display = 'none';
    document.getElementById('join-round-form').style.display = 'none';
    document.getElementById('join-round-details').style.display = 'none';
    
    // Reload active rounds
    loadMyActiveRounds();
}

function showCreateRound() {
    document.getElementById('rounds-hub').style.display = 'none';
    document.getElementById('create-round-form').style.display = 'block';
    document.getElementById('round-created-success').style.display = 'none';
    document.getElementById('join-round-form').style.display = 'none';
    document.getElementById('join-round-details').style.display = 'none';
}

function showJoinRound() {
    document.getElementById('rounds-hub').style.display = 'none';
    document.getElementById('create-round-form').style.display = 'none';
    document.getElementById('round-created-success').style.display = 'none';
    document.getElementById('join-round-form').style.display = 'block';
    document.getElementById('join-round-details').style.display = 'none';
}

function showJoinDetails() {
    document.getElementById('rounds-hub').style.display = 'none';
    document.getElementById('create-round-form').style.display = 'none';
    document.getElementById('round-created-success').style.display = 'none';
    document.getElementById('join-round-form').style.display = 'none';
    document.getElementById('join-round-details').style.display = 'block';
}

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
        document.getElementById('created-round-name').textContent = name;
        
        const shareLink = `${window.location.origin}${window.location.pathname}?join=${joinCode}`;
        document.getElementById('created-share-link').value = shareLink;
        
        document.getElementById('create-round-form').style.display = 'none';
        document.getElementById('round-created-success').style.display = 'block';
        
        console.log('Round created:', roundData);
        
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
        document.getElementById('join-round-info').textContent = 
            `${dateStr} • ${currentRoundData.settings.holes} holes • ${formatTeeName(currentRoundData.settings.tees)}`;
        
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
        document.getElementById('join-round-info').textContent = 
            `${dateStr} • ${currentRoundData.settings.holes} holes • ${formatTeeName(currentRoundData.settings.tees)}`;
        
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
        
        console.log('Joined round:', scoreData);
        
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
window.closeScorecardModal = closeScorecardModal;
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
    
    // Set modal title to course name
    document.getElementById('scorecard-modal-title').textContent = round.course || 'Scorecard';
    
    // Set modal subtitle to date
    const dateStr = round.date ? new Date(round.date).toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';
    document.getElementById('scorecard-modal-subtitle').textContent = dateStr;
    
    // Generate scorecard table
    generateScorecardTable(round);
    
    // Show modal
    document.getElementById('scorecard-modal').style.display = 'flex';
}

// Close scorecard modal
function closeScorecardModal() {
    document.getElementById('scorecard-modal').style.display = 'none';
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
        
        const courseName = round.course || 'Bonville Golf Resort';
        const totalScore = round.totalScore || '-';
        const stablefordPoints = round.stablefordPoints || '-';
        
        const roundName = round.name || 'Archived Round';
        
        html += `
            <div class="my-round-card archived">
                <button class="remove-btn archived-remove-btn" onclick="permanentlyDeleteRound('${round.id}')" title="Delete permanently">✕</button>
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
            console.log('Deleted archived round from Firebase:', roundId);
            
            // Also delete from scores collection (safety cleanup)
            try {
                await deleteDoc(doc(window.db, 'scores', roundId));
                console.log('Deleted score from Firebase:', roundId);
            } catch (e) {
                // May not exist, that's fine
            }
            
            // Delete from rounds collection only if no other scores reference it
            if (parentRoundId) {
                try {
                    const hasOtherScores = await hasOtherScoresForRound(parentRoundId);
                    console.log('Has other scores for round', parentRoundId, ':', hasOtherScores);
                    if (!hasOtherScores) {
                        await deleteDoc(doc(window.db, 'rounds', parentRoundId));
                        console.log('Deleted round from Firebase (no remaining scores):', parentRoundId);
                    } else {
                        console.log('Round still has other scores, keeping:', parentRoundId);
                    }
                } catch (e) {
                    console.log('Could not delete parent round (may not exist or already deleted):', e);
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
                console.log('Deleted archived round from Firebase:', docSnap.id);
                
                // Also delete from scores collection (safety cleanup)
                try {
                    await deleteDoc(doc(window.db, 'scores', docSnap.id));
                    console.log('Deleted score from Firebase:', docSnap.id);
                } catch (e) {
                    // May not exist, that's fine
                }
                
                // Delete from rounds collection only if no other scores reference it
                if (parentRoundId) {
                    try {
                        const hasOtherScores = await hasOtherScoresForRound(parentRoundId);
                        if (!hasOtherScores) {
                            await deleteDoc(doc(window.db, 'rounds', parentRoundId));
                            console.log('Deleted round from Firebase (no remaining scores):', parentRoundId);
                        } else {
                            console.log('Round still has other scores, keeping:', parentRoundId);
                        }
                    } catch (e) {
                        console.log('Could not delete parent round:', e);
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
                console.log('Round moved to archivedRounds:', roundId);
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
    const container = document.getElementById('modal-scorecard-table');
    const handicap = round.handicap || 0;
    const scores = round.scores || {};
    const putts = round.putts || {};
    const courseData = getCourseData(round.course);
    const hasCourse = !!courseData;
    
    // Helper to get hole data safely
    const hd = (i) => hasCourse ? courseData.holes[i] : null;
    
    // Calculate stableford points helper
    const getStablefordPoints = (score, par, si) => {
        if (!score || par === undefined || si === undefined) return 0;
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
        if (hd(i)) front9Par += hd(i).par;
        if (scores[i]) {
            front9Score += scores[i];
            if (hd(i)) front9Stableford += getStablefordPoints(scores[i], hd(i).par, hd(i).si);
        }
        if (putts[i]) front9Putts += putts[i];
    }
    for (let i = 10; i <= 18; i++) {
        if (hd(i)) back9Par += hd(i).par;
        if (scores[i]) {
            back9Score += scores[i];
            if (hd(i)) back9Stableford += getStablefordPoints(scores[i], hd(i).par, hd(i).si);
        }
        if (putts[i]) back9Putts += putts[i];
    }
    
    const totalScore = front9Score + back9Score;
    const totalPar = front9Par + back9Par;
    const totalStableford = front9Stableford + back9Stableford;
    const totalPutts = front9Putts + back9Putts;
    
    // Helper to get score class
    const getScoreClass = (hole, score) => {
        if (!score || !hd(hole)) return '';
        const par = hd(hole).par;
        if (score < par) return 'under-par';
        if (score > par) return 'over-par';
        return '';
    };
    
    // Helper to get stableford class
    const getStablefordClass = (pts) => {
        if (pts >= 3) return 'under-par';
        if (pts === 0) return 'over-par';
        return '';
    };
    
    // Check if stroke index data is available
    const hasIndex = hasCourse && hd(1) && hd(1).si !== undefined;
    
    // ========================================
    // VERTICAL TABLE (Mobile) - holes as rows
    // ========================================
    let verticalRows = '';
    
    // Front 9
    for (let i = 1; i <= 9; i++) {
        const score = scores[i];
        const putt = putts[i];
        const par = hd(i)?.par;
        const si = hd(i)?.si;
        const pts = (score && par !== undefined) ? getStablefordPoints(score, par, si) : null;
        
        verticalRows += `
            <tr>
                <td class="row-label">${i}</td>
                ${hasIndex ? `<td>${si}</td>` : ''}
                ${hasCourse ? `<td>${par}</td>` : ''}
                <td class="${getScoreClass(i, score)}">${score || '-'}</td>
                ${hasCourse ? `<td class="${pts !== null ? getStablefordClass(pts) : ''}">${pts !== null ? pts : '-'}</td>` : ''}
                <td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>
            </tr>
        `;
    }
    
    // Front 9 subtotal
    verticalRows += `
        <tr class="subtotal-row">
            <td class="row-label">OUT</td>
            ${hasIndex ? `<td class="subtotal-col"></td>` : ''}
            ${hasCourse ? `<td class="subtotal-col">${front9Par}</td>` : ''}
            <td class="subtotal-col">${front9Score || '-'}</td>
            ${hasCourse ? `<td class="subtotal-col">${front9Stableford || '-'}</td>` : ''}
            <td class="subtotal-col">${front9Putts || '-'}</td>
        </tr>
    `;
    
    // Back 9
    for (let i = 10; i <= 18; i++) {
        const score = scores[i];
        const putt = putts[i];
        const par = hd(i)?.par;
        const si = hd(i)?.si;
        const pts = (score && par !== undefined) ? getStablefordPoints(score, par, si) : null;
        
        verticalRows += `
            <tr>
                <td class="row-label">${i}</td>
                ${hasIndex ? `<td>${si}</td>` : ''}
                ${hasCourse ? `<td>${par}</td>` : ''}
                <td class="${getScoreClass(i, score)}">${score || '-'}</td>
                ${hasCourse ? `<td class="${pts !== null ? getStablefordClass(pts) : ''}">${pts !== null ? pts : '-'}</td>` : ''}
                <td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>
            </tr>
        `;
    }
    
    // Back 9 subtotal
    verticalRows += `
        <tr class="subtotal-row">
            <td class="row-label">IN</td>
            ${hasIndex ? `<td class="subtotal-col"></td>` : ''}
            ${hasCourse ? `<td class="subtotal-col">${back9Par}</td>` : ''}
            <td class="subtotal-col">${back9Score || '-'}</td>
            ${hasCourse ? `<td class="subtotal-col">${back9Stableford || '-'}</td>` : ''}
            <td class="subtotal-col">${back9Putts || '-'}</td>
        </tr>
    `;
    
    // Total row
    verticalRows += `
        <tr class="total-row">
            <td class="row-label">TOT</td>
            ${hasIndex ? `<td class="total-col"></td>` : ''}
            ${hasCourse ? `<td class="total-col">${totalPar}</td>` : ''}
            <td class="total-col">${totalScore || '-'}</td>
            ${hasCourse ? `<td class="total-col">${totalStableford || '-'}</td>` : ''}
            <td class="total-col">${totalPutts || '-'}</td>
        </tr>
    `;
    
    const verticalTable = `
        <table class="modal-scorecard modal-scorecard-vertical">
            <thead>
                <tr>
                    <th class="row-label">Hole</th>
                    ${hasIndex ? `<th>Index</th>` : ''}
                    ${hasCourse ? `<th>Par</th>` : ''}
                    <th>Score</th>
                    ${hasCourse ? `<th>Pts</th>` : ''}
                    <th>Putts</th>
                </tr>
            </thead>
            <tbody>
                ${verticalRows}
            </tbody>
        </table>
    `;
    
    // ========================================
    // HORIZONTAL TABLE (Desktop) - holes as columns
    // ========================================
    
    // Build hole numbers row
    let holeRow = '<th class="row-label">Hole</th>';
    for (let i = 1; i <= 9; i++) {
        holeRow += `<th>${i}</th>`;
    }
    holeRow += '<th class="subtotal-col">OUT</th>';
    for (let i = 10; i <= 18; i++) {
        holeRow += `<th>${i}</th>`;
    }
    holeRow += '<th class="subtotal-col">IN</th>';
    holeRow += '<th class="total-col">TOT</th>';
    
    // Build index row (if available)
    let indexRow = '';
    if (hasIndex) {
        indexRow = '<td class="row-label">Index</td>';
        for (let i = 1; i <= 9; i++) {
            indexRow += `<td>${hd(i)?.si ?? '-'}</td>`;
        }
        indexRow += '<td class="subtotal-col"></td>';
        for (let i = 10; i <= 18; i++) {
            indexRow += `<td>${hd(i)?.si ?? '-'}</td>`;
        }
        indexRow += '<td class="subtotal-col"></td>';
        indexRow += '<td class="total-col"></td>';
    }
    
    // Build par row (only if course data available)
    let parRow = '';
    if (hasCourse) {
        parRow = '<td class="row-label">Par</td>';
        for (let i = 1; i <= 9; i++) {
            parRow += `<td>${hd(i)?.par ?? '-'}</td>`;
        }
        parRow += `<td class="subtotal-col">${front9Par}</td>`;
        for (let i = 10; i <= 18; i++) {
            parRow += `<td>${hd(i)?.par ?? '-'}</td>`;
        }
        parRow += `<td class="subtotal-col">${back9Par}</td>`;
        parRow += `<td class="total-col">${totalPar}</td>`;
    }
    
    // Build score row
    let scoreRow = '<td class="row-label">Score</td>';
    for (let i = 1; i <= 9; i++) {
        const score = scores[i];
        scoreRow += `<td class="${getScoreClass(i, score)}">${score || '-'}</td>`;
    }
    scoreRow += `<td class="subtotal-col">${front9Score || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const score = scores[i];
        scoreRow += `<td class="${getScoreClass(i, score)}">${score || '-'}</td>`;
    }
    scoreRow += `<td class="subtotal-col">${back9Score || '-'}</td>`;
    scoreRow += `<td class="total-col">${totalScore || '-'}</td>`;
    
    // Build stableford row (only if course data available)
    let stablefordRow = '';
    if (hasCourse) {
        stablefordRow = '<td class="row-label">Pts</td>';
        for (let i = 1; i <= 9; i++) {
            const score = scores[i];
            if (score && hd(i)) {
                const pts = getStablefordPoints(score, hd(i).par, hd(i).si);
                stablefordRow += `<td class="${getStablefordClass(pts)}">${pts}</td>`;
            } else {
                stablefordRow += '<td>-</td>';
            }
        }
        stablefordRow += `<td class="subtotal-col">${front9Stableford || '-'}</td>`;
        for (let i = 10; i <= 18; i++) {
            const score = scores[i];
            if (score && hd(i)) {
                const pts = getStablefordPoints(score, hd(i).par, hd(i).si);
                stablefordRow += `<td class="${getStablefordClass(pts)}">${pts}</td>`;
            } else {
                stablefordRow += '<td>-</td>';
            }
        }
        stablefordRow += `<td class="subtotal-col">${back9Stableford || '-'}</td>`;
        stablefordRow += `<td class="total-col">${totalStableford || '-'}</td>`;
    }
    
    // Build putts row
    let puttsRow = '<td class="row-label">Putts</td>';
    for (let i = 1; i <= 9; i++) {
        const putt = putts[i];
        puttsRow += `<td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>`;
    }
    puttsRow += `<td class="subtotal-col">${front9Putts || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const putt = putts[i];
        puttsRow += `<td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>`;
    }
    puttsRow += `<td class="subtotal-col">${back9Putts || '-'}</td>`;
    puttsRow += `<td class="total-col">${totalPutts || '-'}</td>`;
    
    const horizontalTable = `
        <div class="modal-scorecard-horizontal-wrapper">
            <table class="modal-scorecard modal-scorecard-horizontal">
                <thead>
                    <tr>${holeRow}</tr>
                </thead>
                <tbody>
                    ${hasIndex ? `<tr class="index-row">${indexRow}</tr>` : ''}
                    ${hasCourse ? `<tr class="par-row">${parRow}</tr>` : ''}
                    <tr class="score-row">${scoreRow}</tr>
                    ${hasCourse ? `<tr class="pts-row">${stablefordRow}</tr>` : ''}
                    <tr>${puttsRow}</tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Output both tables - CSS will show/hide based on screen size
    container.innerHTML = verticalTable + horizontalTable;
}
