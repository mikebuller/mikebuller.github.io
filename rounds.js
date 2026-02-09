// Rounds Management JavaScript

// Player data (same as live-scores.js)
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
function initializeRoundsPage() {
    console.log('Initializing rounds page...');
    
    // Set default date to today
    const dateInput = document.getElementById('round-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Populate player dropdown
    populatePlayerDropdown();
    
    // Check for join code in URL
    checkUrlForJoinCode();
    
    // Load user's active rounds
    loadMyActiveRounds();
    
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

// Load user's active rounds from session storage
async function loadMyActiveRounds() {
    // Get joined rounds from session storage
    const joinedRounds = JSON.parse(sessionStorage.getItem('joinedRounds') || '[]');
    // Get completed rounds from local storage
    const completedRounds = JSON.parse(localStorage.getItem('completedRounds') || '[]');
    
    if (joinedRounds.length === 0 && completedRounds.length === 0) {
        document.getElementById('my-rounds-section').style.display = 'none';
        return;
    }
    
    document.getElementById('my-rounds-section').style.display = 'block';
    const activeListContainer = document.getElementById('active-rounds-list');
    const completedListContainer = document.getElementById('completed-rounds-list');
    
    activeListContainer.innerHTML = '';
    completedListContainer.innerHTML = '';
    
    // Fetch each active round's current data
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
    
    // Show empty state for active if none
    if (joinedRounds.length === 0) {
        activeListContainer.innerHTML = '<p class="empty-rounds-message">No active rounds</p>';
    }
    
    // Load completed rounds
    for (const completedRound of completedRounds) {
        const roundCard = createCompletedRoundCard(completedRound);
        completedListContainer.appendChild(roundCard);
    }
    
    // Show empty state for completed if none
    if (completedRounds.length === 0) {
        completedListContainer.innerHTML = '<p class="empty-rounds-message">No completed rounds</p>';
    }
}

// Switch between Active and Completed tabs
function switchRoundsTab(tab) {
    const activeTab = document.getElementById('tab-active');
    const completedTab = document.getElementById('tab-completed');
    const activeList = document.getElementById('active-rounds-list');
    const completedList = document.getElementById('completed-rounds-list');
    
    if (tab === 'active') {
        activeTab.classList.add('active');
        completedTab.classList.remove('active');
        activeList.style.display = 'flex';
        completedList.style.display = 'none';
    } else {
        activeTab.classList.remove('active');
        completedTab.classList.add('active');
        activeList.style.display = 'none';
        completedList.style.display = 'flex';
    }
}

// Create a card for completed rounds
function createCompletedRoundCard(completedRound) {
    const card = document.createElement('div');
    card.className = 'my-round-card completed';
    
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
    
    card.innerHTML = `
        <button class="share-btn-corner" onclick="shareRound('${joinCode}')" title="Share round">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
        </button>
        <div class="my-round-info">
            <h4>${completedRound.name || 'Completed Round'}</h4>
            <p class="my-round-course">${courseName}</p>
            <p>${dateStr}</p>
            <p class="round-score-summary">Score: ${totalScore} | Stableford: ${stablefordPoints}</p>
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
    if (!confirm('Are you sure you want to remove this round from your list?')) {
        return;
    }
    
    // Remove from session storage
    let joinedRounds = JSON.parse(sessionStorage.getItem('joinedRounds') || '[]');
    joinedRounds = joinedRounds.filter(r => r.roundId !== roundId || r.scoreId !== scoreId);
    sessionStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));
    
    // Optionally delete the score from Firebase
    if (window.db && window.firestoreHelpers && scoreId) {
        try {
            const { doc, deleteDoc } = window.firestoreHelpers;
            await deleteDoc(doc(window.db, 'scores', scoreId));
            console.log('Score deleted from Firebase');
        } catch (error) {
            console.error('Error deleting score:', error);
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
    const tees = document.querySelector('input[name="create-tees"]:checked')?.value || 'tallwood';
    
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
                scoringFormat: 'stableford'
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
            `${dateStr} • ${currentRoundData.settings.holes} holes • ${currentRoundData.settings.tees}`;
        
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
            `${dateStr} • ${currentRoundData.settings.holes} holes • ${currentRoundData.settings.tees}`;
        
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
    
    if (!window.db || !window.firestoreHelpers) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }
    
    try {
        const { doc, setDoc, updateDoc, arrayUnion } = window.firestoreHelpers;
        
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
        const joinedRounds = JSON.parse(sessionStorage.getItem('joinedRounds') || '[]');
        joinedRounds.push({
            roundId: createdRoundId,
            scoreId: scoreId,
            playerName: playerName
        });
        sessionStorage.setItem('joinedRounds', JSON.stringify(joinedRounds));
        
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
window.closeScorecardModal = closeScorecardModal;
window.initializeRoundsPage = initializeRoundsPage;

// Course data for scorecard generation
const courseData = {
    par: 71,
    holes: {
        1: { par: 4, si: 2 },
        2: { par: 4, si: 12 },
        3: { par: 3, si: 8 },
        4: { par: 5, si: 14 },
        5: { par: 3, si: 16 },
        6: { par: 4, si: 6 },
        7: { par: 5, si: 18 },
        8: { par: 3, si: 4 },
        9: { par: 4, si: 10 },
        10: { par: 5, si: 13 },
        11: { par: 3, si: 9 },
        12: { par: 4, si: 1 },
        13: { par: 4, si: 3 },
        14: { par: 5, si: 15 },
        15: { par: 4, si: 7 },
        16: { par: 4, si: 5 },
        17: { par: 3, si: 11 },
        18: { par: 4, si: 17 }
    }
};

// View scorecard for a completed round
function viewScorecard(roundId) {
    const completedRounds = JSON.parse(localStorage.getItem('completedRounds') || '[]');
    const round = completedRounds.find(r => r.id === roundId);
    
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

// Remove a completed round
function removeCompletedRound(roundId) {
    if (!confirm('Are you sure you want to remove this completed round?')) {
        return;
    }
    
    let completedRounds = JSON.parse(localStorage.getItem('completedRounds') || '[]');
    completedRounds = completedRounds.filter(r => r.id !== roundId);
    localStorage.setItem('completedRounds', JSON.stringify(completedRounds));
    
    // Refresh the list
    loadMyActiveRounds();
}

// Generate scorecard table HTML
function generateScorecardTable(round) {
    const container = document.getElementById('modal-scorecard-table');
    const handicap = round.handicap || 0;
    const scores = round.scores || {};
    const putts = round.putts || {};
    
    // Calculate stableford points helper
    const getStablefordPoints = (score, par, si) => {
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
        if (scores[i]) {
            front9Score += scores[i];
            front9Stableford += getStablefordPoints(scores[i], courseData.holes[i].par, courseData.holes[i].si);
        }
        if (putts[i]) front9Putts += putts[i];
    }
    for (let i = 10; i <= 18; i++) {
        back9Par += courseData.holes[i].par;
        if (scores[i]) {
            back9Score += scores[i];
            back9Stableford += getStablefordPoints(scores[i], courseData.holes[i].par, courseData.holes[i].si);
        }
        if (putts[i]) back9Putts += putts[i];
    }
    
    const totalScore = front9Score + back9Score;
    const totalPar = front9Par + back9Par;
    const totalStableford = front9Stableford + back9Stableford;
    const totalPutts = front9Putts + back9Putts;
    
    // Helper to get score class
    const getScoreClass = (hole, score) => {
        if (!score) return '';
        const par = courseData.holes[hole].par;
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
    const hasIndex = courseData.holes[1] && courseData.holes[1].si !== undefined;
    
    // ========================================
    // VERTICAL TABLE (Mobile) - holes as rows
    // ========================================
    let verticalRows = '';
    
    // Front 9
    for (let i = 1; i <= 9; i++) {
        const score = scores[i];
        const putt = putts[i];
        const par = courseData.holes[i].par;
        const si = courseData.holes[i].si;
        const pts = score ? getStablefordPoints(score, par, si) : null;
        
        verticalRows += `
            <tr>
                <td class="row-label">${i}</td>
                ${hasIndex ? `<td>${si}</td>` : ''}
                <td>${par}</td>
                <td class="${getScoreClass(i, score)}">${score || '-'}</td>
                <td class="${pts !== null ? getStablefordClass(pts) : ''}">${pts !== null ? pts : '-'}</td>
                <td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>
            </tr>
        `;
    }
    
    // Front 9 subtotal
    verticalRows += `
        <tr class="subtotal-row">
            <td class="row-label">OUT</td>
            ${hasIndex ? `<td class="subtotal-col"></td>` : ''}
            <td class="subtotal-col">${front9Par}</td>
            <td class="subtotal-col">${front9Score || '-'}</td>
            <td class="subtotal-col">${front9Stableford || '-'}</td>
            <td class="subtotal-col">${front9Putts || '-'}</td>
        </tr>
    `;
    
    // Back 9
    for (let i = 10; i <= 18; i++) {
        const score = scores[i];
        const putt = putts[i];
        const par = courseData.holes[i].par;
        const si = courseData.holes[i].si;
        const pts = score ? getStablefordPoints(score, par, si) : null;
        
        verticalRows += `
            <tr>
                <td class="row-label">${i}</td>
                ${hasIndex ? `<td>${si}</td>` : ''}
                <td>${par}</td>
                <td class="${getScoreClass(i, score)}">${score || '-'}</td>
                <td class="${pts !== null ? getStablefordClass(pts) : ''}">${pts !== null ? pts : '-'}</td>
                <td class="${putt >= 3 ? 'over-par' : ''}">${putt || '-'}</td>
            </tr>
        `;
    }
    
    // Back 9 subtotal
    verticalRows += `
        <tr class="subtotal-row">
            <td class="row-label">IN</td>
            ${hasIndex ? `<td class="subtotal-col"></td>` : ''}
            <td class="subtotal-col">${back9Par}</td>
            <td class="subtotal-col">${back9Score || '-'}</td>
            <td class="subtotal-col">${back9Stableford || '-'}</td>
            <td class="subtotal-col">${back9Putts || '-'}</td>
        </tr>
    `;
    
    // Total row
    verticalRows += `
        <tr class="total-row">
            <td class="row-label">TOT</td>
            ${hasIndex ? `<td class="total-col"></td>` : ''}
            <td class="total-col">${totalPar}</td>
            <td class="total-col">${totalScore || '-'}</td>
            <td class="total-col">${totalStableford || '-'}</td>
            <td class="total-col">${totalPutts || '-'}</td>
        </tr>
    `;
    
    const verticalTable = `
        <table class="modal-scorecard modal-scorecard-vertical">
            <thead>
                <tr>
                    <th class="row-label">Hole</th>
                    ${hasIndex ? `<th>Index</th>` : ''}
                    <th>Par</th>
                    <th>Score</th>
                    <th>Pts</th>
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
            indexRow += `<td>${courseData.holes[i].si}</td>`;
        }
        indexRow += '<td class="subtotal-col"></td>';
        for (let i = 10; i <= 18; i++) {
            indexRow += `<td>${courseData.holes[i].si}</td>`;
        }
        indexRow += '<td class="subtotal-col"></td>';
        indexRow += '<td class="total-col"></td>';
    }
    
    // Build par row
    let parRow = '<td class="row-label">Par</td>';
    for (let i = 1; i <= 9; i++) {
        parRow += `<td>${courseData.holes[i].par}</td>`;
    }
    parRow += `<td class="subtotal-col">${front9Par}</td>`;
    for (let i = 10; i <= 18; i++) {
        parRow += `<td>${courseData.holes[i].par}</td>`;
    }
    parRow += `<td class="subtotal-col">${back9Par}</td>`;
    parRow += `<td class="total-col">${totalPar}</td>`;
    
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
    
    // Build stableford row
    let stablefordRow = '<td class="row-label">Pts</td>';
    for (let i = 1; i <= 9; i++) {
        const score = scores[i];
        if (score) {
            const pts = getStablefordPoints(score, courseData.holes[i].par, courseData.holes[i].si);
            stablefordRow += `<td class="${getStablefordClass(pts)}">${pts}</td>`;
        } else {
            stablefordRow += '<td>-</td>';
        }
    }
    stablefordRow += `<td class="subtotal-col">${front9Stableford || '-'}</td>`;
    for (let i = 10; i <= 18; i++) {
        const score = scores[i];
        if (score) {
            const pts = getStablefordPoints(score, courseData.holes[i].par, courseData.holes[i].si);
            stablefordRow += `<td class="${getStablefordClass(pts)}">${pts}</td>`;
        } else {
            stablefordRow += '<td>-</td>';
        }
    }
    stablefordRow += `<td class="subtotal-col">${back9Stableford || '-'}</td>`;
    stablefordRow += `<td class="total-col">${totalStableford || '-'}</td>`;
    
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
                    <tr class="par-row">${parRow}</tr>
                    <tr class="score-row">${scoreRow}</tr>
                    <tr class="pts-row">${stablefordRow}</tr>
                    <tr>${puttsRow}</tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Output both tables - CSS will show/hide based on screen size
    container.innerHTML = verticalTable + horizontalTable;
}
