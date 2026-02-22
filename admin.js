// Admin (God Mode) JavaScript
// Shows all rounds for all players with ability to impersonate and edit scores.

// ========================================
// STATE
// ========================================

// Cached round data for filtering
let allActiveRounds = [];
let allCompletedRounds = [];
let allArchivedRounds = [];

// Cached stats data for stat card drill-down
let statsData = {
    uniquePlayers: new Set(),
    uniqueCourses: new Set(),
    bestGrossRound: null,
    worstGrossRound: null,
    bestStablefordRound: null,
    playerStats: {},   // { playerName: { rounds, totalScore, bestGross, stableford, courses } }
    courseStats: {}     // { courseName: { rounds, players, bestGross, avgScore } }
};

// Currently active stat card
let activeStatCard = null;

// ========================================
// AUTH VERIFICATION
// ========================================

async function verifyAdminAccess() {
    const authCheck = document.getElementById('admin-auth-check');
    const adminContent = document.getElementById('admin-content');

    const isValid = await checkAdminAccess();
    if (!isValid) {
        authCheck.innerHTML = '<p>⛔ Access denied. Redirecting...</p>';
        setTimeout(() => {
            localStorage.removeItem('adminPassword');
            window.location.href = 'rounds.html';
        }, 1500);
        return false;
    }

    authCheck.style.display = 'none';
    adminContent.style.display = 'block';
    return true;
}

// ========================================
// INITIALIZATION
// ========================================

async function initializeAdminPage() {
    const hasAccess = await verifyAdminAccess();
    if (!hasAccess) return;

    // Load dashboard stats and all rounds
    await Promise.all([
        loadDashboardStats(),
        loadAllActiveRounds(),
        loadAllCompletedRounds(),
        loadAllArchivedRounds()
    ]);

    // Populate filter dropdowns
    populateFilterDropdowns();

    // Start live activity listener
    startLiveActivityListener();

    // Initialize mobile menu
    initializeMobileMenu();

    // Set initial rounds list height and update on resize
    requestAnimationFrame(updateRoundsListHeight);
    window.addEventListener('resize', updateRoundsListHeight);
}

// ========================================
// DASHBOARD STATS
// ========================================

async function loadDashboardStats() {
    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { collection, getDocs } = window.firestoreHelpers;

        // Fetch all collections in parallel
        const [activeSnap, completedSnap, archivedSnap, scoresSnap, roundsSnap] = await Promise.all([
            getDocs(collection(window.db, 'activeRounds')),
            getDocs(collection(window.db, 'completedRounds')),
            getDocs(collection(window.db, 'archivedRounds')),
            getDocs(collection(window.db, 'scores')),
            getDocs(collection(window.db, 'rounds'))
        ]);

        // Build set of completed IDs to exclude stale scores
        const completedIdsForStats = new Set();
        completedSnap.forEach(d => completedIdsForStats.add(d.id));

        // Count only truly active rounds (scores not in completedRounds)
        let activeCount = 0;
        scoresSnap.forEach(d => { if (!completedIdsForStats.has(d.id)) activeCount++; });
        document.getElementById('stat-active-rounds').textContent = activeCount;
        document.getElementById('stat-completed-rounds').textContent = completedSnap.size;
        document.getElementById('stat-archived-rounds').textContent = archivedSnap.size;

        // Reset stats
        statsData.uniquePlayers = new Set();
        statsData.uniqueCourses = new Set();
        statsData.playerStats = {};
        statsData.courseStats = {};
        statsData.bestGrossRound = null;
        statsData.worstGrossRound = null;
        statsData.bestStablefordRound = null;

        let bestGross = Infinity;
        let worstGross = 0;
        let bestStableford = 0;
        let totalScoreSum = 0;
        let totalScoreCount = 0;

        const processRound = (data, source) => {
            const playerName = data.playerName || 'Unknown';
            const courseName = data.course || 'Unknown Course';
            if (playerName !== 'Unknown') statsData.uniquePlayers.add(playerName);
            if (courseName !== 'Unknown Course') statsData.uniqueCourses.add(courseName);

            const score = data.totalScore;
            const stableford = data.stablefordPoints;

            // Per-player stats
            if (!statsData.playerStats[playerName]) {
                statsData.playerStats[playerName] = {
                    rounds: 0, totalScore: 0, scoreCount: 0,
                    bestGross: Infinity, bestStableford: 0, courses: new Set()
                };
            }
            const ps = statsData.playerStats[playerName];
            ps.rounds++;
            if (courseName) ps.courses.add(courseName);

            // Per-course stats
            if (!statsData.courseStats[courseName]) {
                statsData.courseStats[courseName] = {
                    rounds: 0, players: new Set(), bestGross: Infinity, totalScore: 0, scoreCount: 0
                };
            }
            const cs = statsData.courseStats[courseName];
            cs.rounds++;
            if (playerName) cs.players.add(playerName);

            if (typeof score === 'number' && score > 0) {
                if (score < bestGross) { bestGross = score; statsData.bestGrossRound = data; }
                if (score > worstGross) { worstGross = score; statsData.worstGrossRound = data; }
                totalScoreSum += score;
                totalScoreCount++;
                if (score < ps.bestGross) ps.bestGross = score;
                ps.totalScore += score;
                ps.scoreCount++;
                if (score < cs.bestGross) cs.bestGross = score;
                cs.totalScore += score;
                cs.scoreCount++;
            }
            if (typeof stableford === 'number') {
                if (stableford > bestStableford) { bestStableford = stableford; statsData.bestStablefordRound = data; }
                if (stableford > ps.bestStableford) ps.bestStableford = stableford;
            }
        };

        completedSnap.forEach(doc => processRound(doc.data(), 'completed'));
        archivedSnap.forEach(doc => processRound(doc.data(), 'archived'));

        // Also count players from active scores
        scoresSnap.forEach(doc => {
            const data = doc.data();
            if (data.playerName) statsData.uniquePlayers.add(data.playerName);
        });

        // Also count courses and build stats from active round settings
        roundsSnap.forEach(doc => {
            const data = doc.data();
            const courseName = data.settings?.course;
            if (courseName) {
                statsData.uniqueCourses.add(courseName);
                if (!statsData.courseStats[courseName]) {
                    statsData.courseStats[courseName] = {
                        rounds: 0, players: new Set(), bestGross: Infinity, totalScore: 0, scoreCount: 0
                    };
                }
            }
        });

        // Also build player stats entries for active-only players
        scoresSnap.forEach(doc => {
            const data = doc.data();
            const playerName = data.playerName;
            if (playerName && !statsData.playerStats[playerName]) {
                statsData.playerStats[playerName] = {
                    rounds: 0, totalScore: 0, scoreCount: 0,
                    bestGross: Infinity, bestStableford: 0, courses: new Set()
                };
            }
        });

        document.getElementById('stat-players').textContent = statsData.uniquePlayers.size || '-';
        document.getElementById('stat-courses').textContent = statsData.uniqueCourses.size || '-';
        document.getElementById('stat-best-gross').textContent = bestGross < Infinity ? bestGross : '-';
        document.getElementById('stat-worst-gross').textContent = worstGross > 0 ? worstGross : '-';
        document.getElementById('stat-best-stableford').textContent = bestStableford > 0 ? bestStableford : '-';
        document.getElementById('stat-avg-score').textContent = totalScoreCount > 0
            ? Math.round(totalScoreSum / totalScoreCount)
            : '-';

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// ========================================
// ROUND LOADING (ALL PLAYERS)
// ========================================

async function loadAllActiveRounds() {
    const container = document.getElementById('active-rounds-list');
    container.innerHTML = '';

    if (!window.db || !window.firestoreHelpers) {
        container.innerHTML = '<p class="empty-rounds-message">Database not available</p>';
        return;
    }

    try {
        const { collection, getDocs, doc, getDoc } = window.firestoreHelpers;

        // Get all active scores
        const scoresSnap = await getDocs(collection(window.db, 'scores'));
        const scores = [];
        scoresSnap.forEach(d => scores.push({ id: d.id, ...d.data() }));

        // Get completed round IDs to filter out stale scores
        const completedSnap = await getDocs(collection(window.db, 'completedRounds'));
        const completedIds = new Set();
        completedSnap.forEach(d => completedIds.add(d.id));

        // Remove any scores that have already been completed
        const activeScores = scores.filter(s => !completedIds.has(s.id));
        scores.length = 0;
        scores.push(...activeScores);

        // Sort by most recently updated first
        scores.sort((a, b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            return bTime - aTime;
        });

        if (scores.length === 0) {
            container.innerHTML = '<p class="empty-rounds-message">No active rounds</p>';
            return;
        }

        // Cache round data to avoid duplicate fetches
        const roundCache = {};
        allActiveRounds = [];

        for (const score of scores) {
            if (!score.roundId) continue;

            // Fetch round data (cached)
            if (!roundCache[score.roundId]) {
                const roundSnap = await getDoc(doc(window.db, 'rounds', score.roundId));
                if (roundSnap.exists()) {
                    roundCache[score.roundId] = roundSnap.data();
                }
            }

            const roundData = roundCache[score.roundId];
            if (!roundData) continue;

            // Cache for filtering
            allActiveRounds.push({
                roundId: score.roundId,
                scoreId: score.id,
                playerName: score.playerName || 'Unknown',
                course: roundData.settings?.course || 'Unknown Course',
                roundData: roundData,
                score: score
            });

            const card = createAdminRoundCard(score.roundId, roundData, score.id, score.playerName, 'active');
            container.appendChild(card);
        }

    } catch (error) {
        console.error('Error loading active rounds:', error);
        container.innerHTML = '<p class="empty-rounds-message">Error loading rounds</p>';
    }
}

async function loadAllCompletedRounds() {
    const container = document.getElementById('completed-rounds-list');
    container.innerHTML = '';

    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { collection, getDocs } = window.firestoreHelpers;
        const snap = await getDocs(collection(window.db, 'completedRounds'));
        allCompletedRounds = [];
        snap.forEach(d => allCompletedRounds.push({ id: d.id, ...d.data() }));

        // Sort by date, most recent first
        allCompletedRounds.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        if (allCompletedRounds.length === 0) {
            container.innerHTML = '<p class="empty-rounds-message">No completed rounds</p>';
            return;
        }

        for (const round of allCompletedRounds) {
            const card = createAdminCompletedCard(round);
            container.appendChild(card);
        }

    } catch (error) {
        console.error('Error loading completed rounds:', error);
    }
}

async function loadAllArchivedRounds() {
    const container = document.getElementById('archived-rounds-list');
    container.innerHTML = '';

    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { collection, getDocs } = window.firestoreHelpers;
        const snap = await getDocs(collection(window.db, 'archivedRounds'));
        allArchivedRounds = [];
        snap.forEach(d => allArchivedRounds.push({ id: d.id, ...d.data() }));

        // Sort by date, most recent first
        allArchivedRounds.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        if (allArchivedRounds.length === 0) {
            container.innerHTML = '<p class="empty-rounds-message">No archived rounds</p>';
            return;
        }

        for (const round of allArchivedRounds) {
            const card = createAdminCompletedCard(round, 'archived');
            container.appendChild(card);
        }

    } catch (error) {
        console.error('Error loading archived rounds:', error);
    }
}

// ========================================
// CARD CREATION
// ========================================

function createAdminRoundCard(roundId, roundData, scoreId, playerName, type) {
    const card = document.createElement('div');
    card.className = 'my-round-card';

    const dateStr = roundData.date ? new Date(roundData.date).toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }) : 'No date';

    const courseName = roundData.settings?.course || 'Unknown Course';
    const tees = roundData.settings?.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseLine = [courseName, teeLabel].filter(Boolean).join(' • ');

    // Data attributes for filtering
    card.dataset.player = (playerName || 'Unknown').toLowerCase();
    card.dataset.course = courseName.toLowerCase();

    card.innerHTML = `
        <button class="remove-btn corner-remove-btn" onclick="event.stopPropagation(); adminArchiveActiveRound('${roundId}', '${scoreId}')" title="Archive round">✕</button>
        <div class="my-round-info">
            <div class="admin-player-name-row">
                <div class="admin-player-badge player-name-display">${playerName || 'Unknown'}</div>
                <button class="player-edit-btn" onclick="event.stopPropagation(); startEditPlayerName(this)" title="Edit player name">✏️</button>
            </div>
            <h4>${roundData.name || 'Unnamed Round'}</h4>
            <p class="my-round-course">${courseLine}</p>
            <p class="my-round-date">${dateStr}</p>
        </div>
    `;

    // Store data for name update
    card.dataset.scoreId = scoreId;
    card.dataset.roundId = roundId;
    card.dataset.cardType = 'active';

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        window.location.href = `live-scores.html?round=${roundId}&score=${scoreId}&admin=1`;
    });

    return card;
}

function createAdminCompletedCard(completedRound, type = 'completed') {
    const card = document.createElement('div');
    card.className = `my-round-card ${type}`;
    card.dataset.scoreId = completedRound.id;

    // Data attributes for filtering
    card.dataset.player = (completedRound.playerName || 'Unknown').toLowerCase();
    card.dataset.course = (completedRound.course || 'Unknown Course').toLowerCase();
    card.dataset.totalScore = completedRound.totalScore || '';
    card.dataset.stablefordPoints = completedRound.stablefordPoints || '';

    const dateStr = completedRound.date ? new Date(completedRound.date).toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }) : 'No date';

    const courseName = completedRound.course || 'Unknown Course';
    const tees = completedRound.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseLine = [courseName, teeLabel].filter(Boolean).join(' • ');
    const totalScore = completedRound.totalScore || '-';
    const stablefordPoints = completedRound.stablefordPoints || '-';
    const hasCourseInfo = !!getCourseData(courseName);
    const scoreSummary = hasCourseInfo
        ? `Score: ${totalScore} | Stableford: ${stablefordPoints}`
        : `Score: ${totalScore}`;

    // Different buttons for completed vs archived
    const isArchived = type === 'archived';
    const removeBtn = isArchived
        ? `<button class="remove-btn corner-remove-btn" onclick="event.stopPropagation(); adminDeleteArchivedRound('${completedRound.id}')" title="Delete permanently">✕</button>`
        : `<button class="remove-btn corner-remove-btn" onclick="event.stopPropagation(); adminArchiveCompletedRound('${completedRound.id}')" title="Archive round">✕</button>`;
    const restoreBtn = isArchived
        ? `<button class="restore-btn corner-restore-btn" onclick="event.stopPropagation(); adminRestoreArchivedRound('${completedRound.id}')" title="Restore round">↩</button>`
        : '';

    card.innerHTML = `
        ${removeBtn}
        ${restoreBtn}
        <div class="my-round-info">
            <div class="admin-player-name-row">
                <div class="admin-player-badge player-name-display">${completedRound.playerName || 'Unknown'}</div>
                <button class="player-edit-btn" onclick="event.stopPropagation(); startEditPlayerName(this)" title="Edit player name">✏️</button>
            </div>
            <h4>${(completedRound.name || 'Completed Round').replace(/^.+ - /, '')}</h4>
            <p class="my-round-course">${courseLine}</p>
            <p class="my-round-date">${dateStr}</p>
            <p class="round-score-summary">${scoreSummary}</p>
        </div>
    `;

    card.dataset.cardType = type;

    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        openAdminRoundModal(completedRound);
    });

    return card;
}

// ========================================
// ADMIN ROUND MODAL (view scorecard + edit via live-scores)
// ========================================

async function openAdminRoundModal(completedRound) {
    // Populate modal header
    const courseName = completedRound.course || 'Unknown Course';
    const tees = completedRound.tees || '';
    const teeLabel = tees ? tees.charAt(0).toUpperCase() + tees.slice(1) + ' tees' : '';
    const courseInfoParts = [courseName, teeLabel].filter(Boolean);
    document.getElementById('round-modal-course').textContent = courseInfoParts.join(' - ');

    const handicapDisplay = completedRound.handicap !== undefined ? ` (${completedRound.handicap})` : '';
    document.getElementById('round-modal-player').textContent = (completedRound.playerName || '') + handicapDisplay;

    const dateStr = completedRound.date ? formatLongDate(completedRound.date) : '';
    document.getElementById('round-modal-date').textContent = dateStr;

    // Generate scorecard table (reuse shared function from course-data.js)
    generateScorecardTable(completedRound);

    // Reset to scorecard tab and show modal
    switchRoundModalTab('scorecard');
    document.getElementById('round-modal').style.display = 'flex';

    // Pre-load leaderboard
    if (completedRound.roundId) {
        viewAdminLeaderboard(completedRound);
    }
}

async function viewAdminLeaderboard(clickedRound) {
    if (!window.db || !window.firestoreHelpers || !clickedRound.roundId) return;

    try {
        const { collection, query, where, getDocs } = window.firestoreHelpers;

        const parentRoundId = clickedRound.roundId;
        const courseName = clickedRound.course || 'Unknown Course';
        const courseInfo = getCourseData(courseName);

        // Fetch all completed + active rounds with same parent roundId
        const completedQuery = query(collection(window.db, 'completedRounds'), where('roundId', '==', parentRoundId));
        const activeQuery = query(collection(window.db, 'activeRounds'), where('roundId', '==', parentRoundId));
        const [completedSnap, activeSnap] = await Promise.all([getDocs(completedQuery), getDocs(activeQuery)]);

        const allPlayers = [];
        completedSnap.forEach(d => allPlayers.push({ id: d.id, ...d.data(), _isCompleted: true }));
        activeSnap.forEach(d => allPlayers.push({ id: d.id, ...d.data(), _isCompleted: false }));

        if (allPlayers.length === 0) return;

        // Build leaderboard data
        const leaderboardData = allPlayers.map(round => {
            let holesPlayed = 0, totalScore = 0, totalPar = 0, stablefordPoints = 0;
            const handicap = round.playerHandicap || round.handicap || 0;

            if (round.holes) {
                for (let i = 1; i <= 18; i++) {
                    if (round.holes[i] && round.holes[i].score !== null && round.holes[i].score !== undefined) {
                        holesPlayed = i;
                        if (round.holes[i].score !== 'P') {
                            totalScore += round.holes[i].score;
                            if (courseInfo) {
                                totalPar += getHolePar(courseInfo.holes[i], round.tees) || 0;
                                stablefordPoints += calcStablefordPoints(round.holes[i].score, getHolePar(courseInfo.holes[i], round.tees), getHoleSI(courseInfo.holes[i], round.tees), handicap);
                            }
                        }
                    }
                }
            } else if (round.scores) {
                for (let i = 1; i <= 18; i++) {
                    if (round.scores[i] !== undefined && round.scores[i] !== null) {
                        holesPlayed = i;
                        if (round.scores[i] !== 'P') {
                            totalScore += round.scores[i];
                            if (courseInfo) {
                                totalPar += getHolePar(courseInfo.holes[i], round.tees) || 0;
                                stablefordPoints += calcStablefordPoints(round.scores[i], getHolePar(courseInfo.holes[i], round.tees), getHoleSI(courseInfo.holes[i], round.tees), handicap);
                            }
                        }
                    }
                }
            }

            return {
                name: round.playerName || 'Unknown',
                holesPlayed, totalScore, totalPar,
                scoreToPar: totalScore - totalPar,
                stablefordPoints,
                isFinished: round._isCompleted || round.status === 'finished',
                currentHole: round.currentHole || holesPlayed
            };
        });

        // Sort by stableford (highest first)
        leaderboardData.sort((a, b) => b.stablefordPoints - a.stablefordPoints || b.holesPlayed - a.holesPlayed);

        const body = document.getElementById('leaderboard-modal-body');
        body.innerHTML = leaderboardData.map((player, index) => {
            const pos = index + 1;
            let scoreClass = 'even-par';
            let scoreDisplay = '-';

            if (player.holesPlayed > 0) {
                if (courseInfo) {
                    let parDisplay = 'E';
                    if (player.scoreToPar < 0) { scoreClass = 'under-par'; parDisplay = player.scoreToPar.toString(); }
                    else if (player.scoreToPar > 0) { scoreClass = 'over-par'; parDisplay = '+' + player.scoreToPar; }
                    scoreDisplay = `${parDisplay} (${player.stablefordPoints})`;
                } else {
                    scoreDisplay = `${player.totalScore}`;
                }
            }

            const holeDisplay = player.isFinished ? 'F' : `H${player.currentHole}`;
            let playerClass = 'header-lb-player';
            if (pos === 1 && player.holesPlayed > 0) playerClass += ' leader';
            if (player.isFinished) playerClass += ' finished';

            return `
                <div class="${playerClass}">
                    <span class="header-lb-pos">${pos}</span>
                    <span class="header-lb-snake"></span>
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

// ========================================
// TAB SWITCHING
// ========================================

function switchAdminTab(tab) {
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

    Object.values(tabs).forEach(t => t && t.classList.remove('active'));
    Object.values(lists).forEach(l => { if (l) l.style.display = 'none'; });

    // Clear any lingering highlight-completed classes from all lists
    Object.values(lists).forEach(l => {
        if (l) l.querySelectorAll('.highlight-completed').forEach(c => c.classList.remove('highlight-completed'));
    });

    if (tabs[tab]) tabs[tab].classList.add('active');
    if (lists[tab]) lists[tab].style.display = 'flex';

    // Show/hide the "Delete All Archived" button
    const deleteAllContainer = document.getElementById('delete-all-archived-container');
    if (deleteAllContainer) {
        deleteAllContainer.style.display = (tab === 'archived' && allArchivedRounds.length > 0) ? '' : 'none';
    }

    requestAnimationFrame(updateRoundsListHeight);
}

// ========================================
// FILTERS
// ========================================

function getAllRoundEntries() {
    // Build a unified list of { player, course } from all round sources
    const entries = [];
    allActiveRounds.forEach(r => {
        entries.push({ player: (r.playerName || 'Unknown').toLowerCase(), course: (r.course || 'Unknown Course').toLowerCase(), playerDisplay: r.playerName || 'Unknown', courseDisplay: r.course || 'Unknown Course' });
    });
    allCompletedRounds.forEach(r => {
        entries.push({ player: (r.playerName || 'Unknown').toLowerCase(), course: (r.course || 'Unknown Course').toLowerCase(), playerDisplay: r.playerName || 'Unknown', courseDisplay: r.course || 'Unknown Course' });
    });
    allArchivedRounds.forEach(r => {
        entries.push({ player: (r.playerName || 'Unknown').toLowerCase(), course: (r.course || 'Unknown Course').toLowerCase(), playerDisplay: r.playerName || 'Unknown', courseDisplay: r.course || 'Unknown Course' });
    });
    return entries;
}

function populateFilterDropdowns() {
    updateFilterOptions();
}

function updateFilterOptions() {
    const playerSelect = document.getElementById('filter-player');
    const courseSelect = document.getElementById('filter-course');
    const currentPlayer = playerSelect.value;
    const currentCourse = courseSelect.value;

    const entries = getAllRoundEntries();

    // Determine available players based on current course filter
    const availablePlayers = new Map(); // lowercase -> display
    entries.forEach(e => {
        if (!currentCourse || e.course === currentCourse) {
            if (!availablePlayers.has(e.player)) availablePlayers.set(e.player, e.playerDisplay);
        }
    });

    // Determine available courses based on current player filter
    const availableCourses = new Map(); // lowercase -> display
    entries.forEach(e => {
        if (!currentPlayer || e.player === currentPlayer) {
            if (!availableCourses.has(e.course)) availableCourses.set(e.course, e.courseDisplay);
        }
    });

    // Sort alphabetically by display name
    const sortedPlayers = [...availablePlayers.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    const sortedCourses = [...availableCourses.entries()].sort((a, b) => a[1].localeCompare(b[1]));

    // Rebuild player dropdown
    playerSelect.innerHTML = '<option value="">All Players</option>';
    sortedPlayers.forEach(([val, display]) => {
        playerSelect.innerHTML += `<option value="${val}">${display}</option>`;
    });
    playerSelect.value = availablePlayers.has(currentPlayer) ? currentPlayer : '';

    // Rebuild course dropdown
    courseSelect.innerHTML = '<option value="">All Courses</option>';
    sortedCourses.forEach(([val, display]) => {
        courseSelect.innerHTML += `<option value="${val}">${display}</option>`;
    });
    courseSelect.value = availableCourses.has(currentCourse) ? currentCourse : '';
}

function applyAdminFilters() {
    // Update the other dropdown options based on current selection
    updateFilterOptions();

    const playerFilter = document.getElementById('filter-player').value;
    const courseFilter = document.getElementById('filter-course').value;

    // Filter all three tab lists
    ['active-rounds-list', 'completed-rounds-list', 'archived-rounds-list'].forEach(listId => {
        const container = document.getElementById(listId);
        if (!container) return;
        const cards = container.querySelectorAll('.my-round-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const matchesPlayer = !playerFilter || card.dataset.player === playerFilter;
            const matchesCourse = !courseFilter || card.dataset.course === courseFilter;
            const visible = matchesPlayer && matchesCourse;
            card.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });

        // Show/hide empty message
        let emptyMsg = container.querySelector('.empty-rounds-message');
        if (visibleCount === 0 && cards.length > 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('p');
                emptyMsg.className = 'empty-rounds-message';
                container.appendChild(emptyMsg);
            }
            emptyMsg.textContent = 'No rounds match filters';
            emptyMsg.style.display = '';
        } else if (emptyMsg && cards.length > 0) {
            emptyMsg.style.display = 'none';
        }
    });
}

function clearAdminFilters() {
    document.getElementById('filter-player').value = '';
    document.getElementById('filter-course').value = '';
    updateFilterOptions();
    applyAdminFilters();
}

// ========================================
// STAT CARD CLICKS
// ========================================

function onStatCardClick(statId) {
    const allCards = document.querySelectorAll('.admin-stat-card');
    const clickedCard = document.querySelector(`.admin-stat-card[data-stat="${statId}"]`);

    // Toggle: if clicking same card, deselect it
    if (activeStatCard === statId) {
        clickedCard.classList.remove('active');
        activeStatCard = null;
        showDefaultSection();
        return;
    }

    // Deselect previous
    allCards.forEach(c => c.classList.remove('active'));

    // Select clicked
    clickedCard.classList.add('active');
    activeStatCard = statId;

    // Handle the stat card action
    handleStatCardAction(statId);
}

function handleStatCardAction(statId) {
    const roundsSection = document.getElementById('admin-rounds-section');
    const playersSection = document.getElementById('admin-players-section');
    const coursesSection = document.getElementById('admin-courses-section');

    // Hide all detail sections first
    roundsSection.style.display = 'none';
    playersSection.style.display = 'none';
    coursesSection.style.display = 'none';

    switch (statId) {
        case 'active-rounds':
            roundsSection.style.display = '';
            clearAdminFilters();
            switchAdminTab('active');
            break;

        case 'completed-rounds':
            roundsSection.style.display = '';
            clearAdminFilters();
            switchAdminTab('completed');
            break;

        case 'archived-rounds':
            roundsSection.style.display = '';
            clearAdminFilters();
            switchAdminTab('archived');
            break;

        case 'players':
            playersSection.style.display = '';
            renderPlayersSection();
            requestAnimationFrame(updateRoundsListHeight);
            break;

        case 'courses':
            coursesSection.style.display = '';
            renderCoursesSection();
            requestAnimationFrame(updateRoundsListHeight);
            break;

        case 'best-gross':
            roundsSection.style.display = '';
            highlightRoundByStat('best-gross');
            break;

        case 'worst-gross':
            roundsSection.style.display = '';
            highlightRoundByStat('worst-gross');
            break;

        case 'best-stableford':
            roundsSection.style.display = '';
            highlightRoundByStat('best-stableford');
            break;

        case 'avg-score':
            roundsSection.style.display = '';
            clearAdminFilters();
            switchAdminTab('completed');
            break;
    }
}

function showDefaultSection() {
    document.getElementById('admin-rounds-section').style.display = '';
    document.getElementById('admin-players-section').style.display = 'none';
    document.getElementById('admin-courses-section').style.display = 'none';
    clearAdminFilters();
}

function highlightRoundByStat(statType) {
    let targetRound = null;

    if (statType === 'best-gross') targetRound = statsData.bestGrossRound;
    else if (statType === 'worst-gross') targetRound = statsData.worstGrossRound;
    else if (statType === 'best-stableford') targetRound = statsData.bestStablefordRound;

    if (!targetRound) {
        clearAdminFilters();
        switchAdminTab('completed');
        return;
    }

    // Find which tab the round is in
    const playerName = (targetRound.playerName || '').toLowerCase();
    const isCompleted = allCompletedRounds.some(r =>
        r.playerName?.toLowerCase() === playerName && r.totalScore === targetRound.totalScore
    );
    const isArchived = allArchivedRounds.some(r =>
        r.playerName?.toLowerCase() === playerName && r.totalScore === targetRound.totalScore
    );

    const tab = isCompleted ? 'completed' : (isArchived ? 'archived' : 'completed');
    clearAdminFilters();
    switchAdminTab(tab);

    // Filter to show just that player
    document.getElementById('filter-player').value = playerName;
    applyAdminFilters();

    // Scroll to and highlight the matching card
    const listId = tab + '-rounds-list';
    const container = document.getElementById(listId);
    if (container) {
        const cards = container.querySelectorAll('.my-round-card');
        cards.forEach(card => {
            card.classList.remove('highlight-completed');
            const matchesScore = statType === 'best-stableford'
                ? card.dataset.stablefordPoints == targetRound.stablefordPoints
                : card.dataset.totalScore == targetRound.totalScore;
            if (card.dataset.player === playerName && matchesScore) {
                card.classList.add('highlight-completed');
                setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        });
    }
}

// ========================================
// PLAYERS SECTION
// ========================================

function renderPlayersSection() {
    const container = document.getElementById('admin-players-list');
    const playerNames = [...statsData.uniquePlayers].sort((a, b) => a.localeCompare(b));

    if (playerNames.length === 0) {
        container.innerHTML = '<p class="empty-rounds-message">No players found</p>';
        return;
    }

    container.innerHTML = playerNames.map(name => {
        const ps = statsData.playerStats[name];
        if (!ps) return '';

        const avgScore = ps.scoreCount > 0 ? Math.round(ps.totalScore / ps.scoreCount) : '-';
        const bestGross = ps.bestGross < Infinity ? ps.bestGross : '-';
        const bestStableford = ps.bestStableford > 0 ? ps.bestStableford : '-';

        return `
            <div class="admin-detail-card" onclick="onPlayerCardClick('${name.replace(/'/g, "\\'")}')">
                <div class="admin-detail-card-header">
                    <div class="admin-player-name-row">
                        <span class="admin-detail-card-name player-name-display">${name}</span>
                        <button class="player-edit-btn" onclick="event.stopPropagation(); startEditGlobalPlayerName(this, '${name.replace(/'/g, "\\'")}')" title="Rename player everywhere">✏️</button>
                    </div>
                    <span class="admin-detail-card-badge">${ps.rounds} round${ps.rounds !== 1 ? 's' : ''} completed</span>
                </div>
                <div class="admin-detail-card-stats">
                    <span>Best Gross: <strong>${bestGross}</strong></span>
                    <span>Best Stableford: <strong>${bestStableford}</strong></span>
                    <span>Avg Score: <strong>${avgScore}</strong></span>
                    <span>Courses: <strong>${ps.courses.size}</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

function onPlayerCardClick(playerName) {
    // Switch to rounds section filtered by this player
    activeStatCard = null;
    document.querySelectorAll('.admin-stat-card').forEach(c => c.classList.remove('active'));

    document.getElementById('admin-players-section').style.display = 'none';
    document.getElementById('admin-rounds-section').style.display = '';

    document.getElementById('filter-player').value = playerName.toLowerCase();
    document.getElementById('filter-course').value = '';
    applyAdminFilters();
    switchAdminTab('completed');
}

// ========================================
// COURSES SECTION
// ========================================

function renderCoursesSection() {
    const container = document.getElementById('admin-courses-list');
    const courseNames = [...statsData.uniqueCourses].sort((a, b) => a.localeCompare(b));

    if (courseNames.length === 0) {
        container.innerHTML = '<p class="empty-rounds-message">No courses found</p>';
        return;
    }

    container.innerHTML = courseNames.map(name => {
        const cs = statsData.courseStats[name];
        if (!cs) return '';

        const avgScore = cs.scoreCount > 0 ? Math.round(cs.totalScore / cs.scoreCount) : '-';
        const bestGross = cs.bestGross < Infinity ? cs.bestGross : '-';

        return `
            <div class="admin-detail-card" onclick="onCourseCardClick('${name.replace(/'/g, "\\'")}')">
                <div class="admin-detail-card-header">
                    <span class="admin-detail-card-name">${name}</span>
                    <span class="admin-detail-card-badge">${cs.rounds} round${cs.rounds !== 1 ? 's' : ''} completed</span>
                </div>
                <div class="admin-detail-card-stats">
                    <span>Players: <strong>${cs.players.size}</strong></span>
                    <span>Best Gross: <strong>${bestGross}</strong></span>
                    <span>Avg Score: <strong>${avgScore}</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

function onCourseCardClick(courseName) {
    // Switch to rounds section filtered by this course
    activeStatCard = null;
    document.querySelectorAll('.admin-stat-card').forEach(c => c.classList.remove('active'));

    document.getElementById('admin-courses-section').style.display = 'none';
    document.getElementById('admin-rounds-section').style.display = '';

    document.getElementById('filter-course').value = courseName.toLowerCase();
    document.getElementById('filter-player').value = '';
    applyAdminFilters();
    switchAdminTab('completed');
}

// ========================================
// ROUND MODAL HELPERS (reused from rounds.js patterns)
// ========================================

function closeRoundModal() {
    document.getElementById('round-modal').style.display = 'none';
}

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

// ========================================
// MOBILE MENU
// ========================================

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

// ========================================
// COLLAPSIBLE SECTIONS
// ========================================

function toggleAdminSection(sectionId) {
    const contentId = sectionId + '-content';
    const chevronId = sectionId + '-chevron';
    const content = document.getElementById(contentId);
    const chevron = document.getElementById(chevronId);
    if (!content || !chevron) return;

    const isExpanded = content.style.display !== 'none';
    content.style.display = isExpanded ? 'none' : '';
    chevron.textContent = isExpanded ? '▼' : '▲';

    // Recalculate rounds list height after collapse/expand
    requestAnimationFrame(updateRoundsListHeight);
}

function updateRoundsListHeight() {
    const navbar = document.querySelector('.navbar');
    const activity = document.querySelector('.admin-activity');
    const dashboard = document.querySelector('.admin-dashboard');
    const divider = document.querySelector('.rounds-divider');
    const filters = document.querySelector('.admin-filters');
    const tabs = document.querySelector('.my-rounds-tabs');
    const footer = document.querySelector('.footer');
    const roundsSection = document.querySelector('.my-rounds-section');

    if (!roundsSection) return;

    // Calculate used height by all non-list elements
    const viewportHeight = window.innerHeight;
    const usedHeight = [navbar, activity, dashboard, divider, filters, tabs, footer]
        .reduce((sum, el) => {
            if (!el) return sum;
            return sum + el.offsetHeight;
        }, 0);

    // Account for padding on section and page (approximate)
    const sectionStyle = window.getComputedStyle(roundsSection);
    const sectionPadding = parseFloat(sectionStyle.paddingTop) + parseFloat(sectionStyle.paddingBottom);
    const pageSection = document.querySelector('.live-scores-section');
    const pagePadding = pageSection ? parseFloat(window.getComputedStyle(pageSection).paddingTop) + parseFloat(window.getComputedStyle(pageSection).paddingBottom) : 0;

    const availableHeight = viewportHeight - usedHeight - sectionPadding - pagePadding - 20; // 20px breathing room
    const minHeight = 150;
    const listHeight = Math.max(minHeight, availableHeight);

    // Apply to whichever list is visible
    ['active-rounds-list', 'completed-rounds-list', 'archived-rounds-list'].forEach(id => {
        const list = document.getElementById(id);
        if (list) {
            list.style.maxHeight = listHeight + 'px';
        }
    });

    // Also apply to players and courses detail lists when their sections are visible
    const playersSection = document.getElementById('admin-players-section');
    const coursesSection = document.getElementById('admin-courses-section');

    [playersSection, coursesSection].forEach(section => {
        if (!section || section.style.display === 'none') return;

        // Recalculate for detail sections — they have a heading but no tabs/filters
        const heading = section.querySelector('h3');
        const headingHeight = heading ? heading.offsetHeight + 16 : 0; // 16px margin
        const sectionPad = parseFloat(window.getComputedStyle(section).paddingTop) + parseFloat(window.getComputedStyle(section).paddingBottom);

        const detailUsedHeight = [navbar, activity, dashboard, footer]
            .reduce((sum, el) => el ? sum + el.offsetHeight : sum, 0);

        const detailAvailable = viewportHeight - detailUsedHeight - sectionPad - pagePadding - headingHeight - 15;
        const detailHeight = Math.max(minHeight, detailAvailable);

        const list = section.querySelector('.admin-detail-list');
        if (list) {
            list.style.maxHeight = detailHeight + 'px';
            list.style.overflowY = 'auto';
        }
    });
}

// ========================================
// LIVE ACTIVITY FEED
// ========================================

let activityUnsubscribe = null;
let activityRefreshInterval = null;
let previousActiveRoundsSnapshot = null; // Track previous state for diffing
const MAX_ACTIVITY_ITEMS = 20;
const ACTIVITY_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

function startLiveActivityListener() {
    if (!window.db || !window.firestoreHelpers) return;

    const { collection, onSnapshot } = window.firestoreHelpers;

    activityUnsubscribe = onSnapshot(
        collection(window.db, 'activeRounds'),
        (snapshot) => {
            if (!previousActiveRoundsSnapshot) {
                // First snapshot — just store it, don't show "changes"
                previousActiveRoundsSnapshot = new Map();
                snapshot.forEach(doc => {
                    previousActiveRoundsSnapshot.set(doc.id, doc.data());
                });
                renderActivityFeed([]);
                return;
            }

            const changes = [];
            const now = new Date();

            snapshot.docChanges().forEach(change => {
                const data = change.doc.data();
                const playerName = data.playerName || 'Unknown';
                const course = data.course || 'Unknown Course';
                const currentHole = data.currentHole || '?';
                const updatedAt = data.updatedAt ? new Date(data.updatedAt) : now;
                const timeAgo = formatTimeAgo(updatedAt);

                if (change.type === 'modified') {
                    const prev = previousActiveRoundsSnapshot.get(change.doc.id);
                    let description = '';

                    if (prev && data.holes && prev.holes) {
                        // Find which hole changed
                        for (let i = 1; i <= 18; i++) {
                            const prevHole = prev.holes?.[i];
                            const newHole = data.holes?.[i];
                            if (!prevHole && newHole && newHole.score !== null && newHole.score !== undefined) {
                                // New score entered
                                const scoreText = newHole.score === 'P' ? 'Pickup' : newHole.score;
                                description = `Scored <strong>${scoreText}</strong> on Hole ${i}`;
                                break;
                            } else if (prevHole && newHole && prevHole.score !== newHole.score) {
                                // Score changed
                                const scoreText = newHole.score === 'P' ? 'Pickup' : newHole.score;
                                description = `Changed Hole ${i} to <strong>${scoreText}</strong>`;
                                break;
                            }
                        }
                    }

                    if (!description) {
                        description = `Updated on Hole ${currentHole}`;
                    }

                    changes.push({
                        type: 'score',
                        playerName,
                        course,
                        description,
                        timeAgo,
                        timestamp: updatedAt.getTime()
                    });
                } else if (change.type === 'added') {
                    // Find the first score in the new document
                    let scoreDesc = '';
                    if (data.holes) {
                        for (let i = 1; i <= 18; i++) {
                            const hole = data.holes?.[i];
                            if (hole && hole.score !== null && hole.score !== undefined) {
                                const scoreText = hole.score === 'P' ? 'Pickup' : hole.score;
                                scoreDesc = ` — Scored <strong>${scoreText}</strong> on Hole ${i}`;
                                break;
                            }
                        }
                    }
                    changes.push({
                        type: 'joined',
                        playerName,
                        course,
                        description: `Joined round${scoreDesc}`,
                        timeAgo,
                        timestamp: updatedAt.getTime()
                    });
                } else if (change.type === 'removed') {
                    const prevData = previousActiveRoundsSnapshot.get(change.doc.id);
                    const name = prevData?.playerName || playerName;
                    changes.push({
                        type: 'finished',
                        playerName: name,
                        course: prevData?.course || course,
                        description: `Finished round`,
                        timeAgo,
                        timestamp: updatedAt.getTime()
                    });
                }
            });

            // Update previous snapshot
            previousActiveRoundsSnapshot = new Map();
            snapshot.forEach(doc => {
                previousActiveRoundsSnapshot.set(doc.id, doc.data());
            });

            if (changes.length > 0) {
                renderActivityFeed(changes);
            }
        },
        (error) => {
            console.error('Error listening to active rounds:', error);
        }
    );

    // Refresh time labels and prune expired items every 30 seconds
    if (activityRefreshInterval) clearInterval(activityRefreshInterval);
    activityRefreshInterval = setInterval(refreshActivityFeed, 30 * 1000);
}

let activityItems = [];

function renderActivityFeed(newChanges) {
    const container = document.getElementById('admin-activity-list');
    if (!container) return;

    const now = Date.now();

    // Prepend new changes (most recent first), prune expired items, and cap at max
    activityItems = [...newChanges.sort((a, b) => b.timestamp - a.timestamp), ...activityItems]
        .filter(item => (now - item.timestamp) < ACTIVITY_EXPIRY_MS)
        .slice(0, MAX_ACTIVITY_ITEMS);

    if (activityItems.length === 0) {
        container.innerHTML = '<p class="empty-rounds-message">Waiting for live score updates...</p>';
        return;
    }

    container.innerHTML = activityItems.map(item => {
        const icon = item.type === 'score' ? '⛳' : item.type === 'joined' ? '👋' : '🏁';
        const timeAgo = formatTimeAgo(new Date(item.timestamp));
        return `
            <div class="admin-activity-item ${item.type}">
                <span class="activity-icon">${icon}</span>
                <div class="activity-details">
                    <span class="activity-player">${item.playerName}</span>
                    <span class="activity-desc">${item.description}</span>
                    <span class="activity-meta">${item.course} · ${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

function refreshActivityFeed() {
    // Re-render with no new changes — prunes expired items and updates time labels
    renderActivityFeed([]);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function stopLiveActivityListener() {
    if (activityUnsubscribe) {
        activityUnsubscribe();
        activityUnsubscribe = null;
    }
    if (activityRefreshInterval) {
        clearInterval(activityRefreshInterval);
        activityRefreshInterval = null;
    }
}

// Clean up listener when admin navigates away
window.addEventListener('beforeunload', stopLiveActivityListener);

// Also stop when navigating via in-page links (SPA-style)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-links a:not([href*="admin"])').forEach(link => {
        link.addEventListener('click', stopLiveActivityListener);
    });
});

// ========================================
// ADMIN ROUND ACTIONS (archive, delete, restore)
// ========================================

// Archive an active round (move from scores → archivedRounds)
async function adminArchiveActiveRound(roundId, scoreId) {
    if (!confirm('Archive this active round?')) return;
    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { doc, getDoc, setDoc, deleteDoc } = window.firestoreHelpers;

        // Delete from activeRounds
        const activeRoundId = `${roundId}_${scoreId}`;
        try { await deleteDoc(doc(window.db, 'activeRounds', activeRoundId)); } catch (e) {}

        // Move score to archivedRounds
        const scoreSnap = await getDoc(doc(window.db, 'scores', scoreId));
        const roundSnap = await getDoc(doc(window.db, 'rounds', roundId));
        if (scoreSnap.exists()) {
            const scoreData = scoreSnap.data();
            scoreData.status = 'archived';
            scoreData.archivedAt = new Date().toISOString();
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

        // Refresh all data
        await Promise.all([loadAllActiveRounds(), loadAllArchivedRounds(), loadDashboardStats()]);
        populateFilterDropdowns();
    } catch (error) {
        console.error('Error archiving active round:', error);
        alert('Failed to archive round.');
    }
}

// Archive a completed round (move from completedRounds → archivedRounds)
async function adminArchiveCompletedRound(roundId) {
    if (!confirm('Archive this completed round?')) return;
    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { doc, getDoc, setDoc, deleteDoc } = window.firestoreHelpers;
        const docSnap = await getDoc(doc(window.db, 'completedRounds', roundId));
        if (docSnap.exists()) {
            const roundData = docSnap.data();
            roundData.status = 'archived';
            roundData.archivedAt = new Date().toISOString();
            await setDoc(doc(window.db, 'archivedRounds', roundId), roundData);
            await deleteDoc(doc(window.db, 'completedRounds', roundId));
        }

        // Refresh all data
        await Promise.all([loadAllCompletedRounds(), loadAllArchivedRounds(), loadDashboardStats()]);
        populateFilterDropdowns();
    } catch (error) {
        console.error('Error archiving completed round:', error);
        alert('Failed to archive round.');
    }
}

// Permanently delete an archived round
async function adminDeleteAllArchivedRounds() {
    if (allArchivedRounds.length === 0) return;

    const confirmed = confirm(`Are you sure you want to permanently delete ALL ${allArchivedRounds.length} archived round(s)? This cannot be undone.`);
    if (!confirmed) return;

    try {
        const { doc, deleteDoc } = window.firestoreHelpers;
        const ids = allArchivedRounds.map(r => r.id);

        await Promise.all(ids.map(id => deleteDoc(doc(window.db, 'archivedRounds', id))));

        allArchivedRounds = [];
        const container = document.getElementById('archived-rounds-list');
        container.innerHTML = '<p class="empty-rounds-message">No archived rounds</p>';

        // Hide the delete-all button
        const deleteAllContainer = document.getElementById('delete-all-archived-container');
        if (deleteAllContainer) deleteAllContainer.style.display = 'none';

        // Refresh dashboard stats
        await loadDashboardStats();
    } catch (error) {
        console.error('Error deleting all archived rounds:', error);
        alert('Failed to delete all archived rounds. Please try again.');
    }
}

async function adminDeleteArchivedRound(roundId) {
    if (!confirm('Permanently delete this round? This cannot be undone.')) return;
    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { doc, deleteDoc } = window.firestoreHelpers;
        await deleteDoc(doc(window.db, 'archivedRounds', roundId));

        // Also clean up scores collection (safety)
        try { await deleteDoc(doc(window.db, 'scores', roundId)); } catch (e) {}

        // Refresh all data
        await Promise.all([loadAllArchivedRounds(), loadDashboardStats()]);
        populateFilterDropdowns();
    } catch (error) {
        console.error('Error deleting archived round:', error);
        alert('Failed to delete round.');
    }
}

// Restore an archived round back to completed (or active if it had an active score)
async function adminRestoreArchivedRound(roundId) {
    if (!window.db || !window.firestoreHelpers) return;

    try {
        const { doc, getDoc, setDoc, deleteDoc } = window.firestoreHelpers;
        const docSnap = await getDoc(doc(window.db, 'archivedRounds', roundId));
        if (!docSnap.exists()) {
            alert('Round not found.');
            return;
        }

        const roundData = docSnap.data();

        // Determine restore destination based on whether it was completed
        const wasCompleted = roundData.totalScore !== undefined && roundData.totalScore !== null;

        if (wasCompleted) {
            // Restore to completedRounds
            roundData.status = 'completed';
            delete roundData.archivedAt;
            await setDoc(doc(window.db, 'completedRounds', roundId), roundData);
            await deleteDoc(doc(window.db, 'archivedRounds', roundId));
        } else {
            // Restore to scores (active)
            roundData.status = 'in-progress';
            delete roundData.archivedAt;
            await setDoc(doc(window.db, 'scores', roundId), roundData);
            await deleteDoc(doc(window.db, 'archivedRounds', roundId));

            // Also recreate activeRounds entry if we have a parent roundId
            if (roundData.roundId) {
                const activeRoundId = `${roundData.roundId}_${roundId}`;
                await setDoc(doc(window.db, 'activeRounds', activeRoundId), {
                    roundId: roundData.roundId,
                    scoreId: roundId,
                    playerName: roundData.playerName,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        // Refresh all data
        await Promise.all([
            loadAllActiveRounds(),
            loadAllCompletedRounds(),
            loadAllArchivedRounds(),
            loadDashboardStats()
        ]);
        populateFilterDropdowns();
        alert(`Round restored to ${wasCompleted ? 'Completed' : 'Active'}.`);
    } catch (error) {
        console.error('Error restoring archived round:', error);
        alert('Failed to restore round.');
    }
}

// ========================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ========================================

window.initializeAdminPage = initializeAdminPage;
window.switchAdminTab = switchAdminTab;
window.closeRoundModal = closeRoundModal;
window.switchRoundModalTab = switchRoundModalTab;
// ========================================
// INLINE PLAYER NAME EDITING
// ========================================

function startEditPlayerName(editBtn) {
    const row = editBtn.closest('.admin-player-name-row');
    const display = row.querySelector('.player-name-display');
    const currentName = display.textContent.trim();

    // Replace the display with an input
    row.innerHTML = `
        <input type="text" class="player-name-input" value="${currentName}" 
            onclick="event.stopPropagation()" 
            onkeydown="if(event.key==='Enter'){event.stopPropagation();savePlayerName(this)}else if(event.key==='Escape'){event.stopPropagation();cancelEditPlayerName(this,'${currentName.replace(/'/g, "\\'")}')}">
        <button class="player-name-save-btn" onclick="event.stopPropagation(); savePlayerName(this.previousElementSibling)" title="Save">✓</button>
        <button class="player-name-cancel-btn" onclick="event.stopPropagation(); cancelEditPlayerName(this.previousElementSibling.previousElementSibling, '${currentName.replace(/'/g, "\\'")}')" title="Cancel">✗</button>
    `;

    const input = row.querySelector('.player-name-input');
    input.focus();
    input.select();
}

function cancelEditPlayerName(input, originalName) {
    const row = input.closest('.admin-player-name-row');
    row.innerHTML = `
        <div class="admin-player-badge player-name-display">${originalName}</div>
        <button class="player-edit-btn" onclick="event.stopPropagation(); startEditPlayerName(this)" title="Edit player name">✏️</button>
    `;
}

async function savePlayerName(input) {
    const newName = input.value.trim();
    if (!newName) return;

    const card = input.closest('.my-round-card');
    const row = input.closest('.admin-player-name-row');
    const cardType = card.dataset.cardType;
    const scoreId = card.dataset.scoreId;
    const roundId = card.dataset.roundId;

    if (!window.db || !window.firestoreHelpers) return;
    const { doc, updateDoc, getDoc, collection, query, where, getDocs } = window.firestoreHelpers;

    try {
        // Show saving state
        row.innerHTML = `<div class="admin-player-badge player-name-display">${newName}</div><span class="player-name-saving">Saving...</span>`;

        const updates = [];

        if (cardType === 'active') {
            // Update scores collection
            updates.push(updateDoc(doc(window.db, 'scores', scoreId), { playerName: newName }));
            // Update activeRounds (uses composite key: roundId_scoreId)
            const activeRoundId = `${roundId}_${scoreId}`;
            const activeSnap = await getDoc(doc(window.db, 'activeRounds', activeRoundId));
            if (activeSnap.exists()) {
                updates.push(updateDoc(doc(window.db, 'activeRounds', activeRoundId), { playerName: newName }));
            }
        } else if (cardType === 'completed') {
            updates.push(updateDoc(doc(window.db, 'completedRounds', scoreId), { playerName: newName }));
        } else if (cardType === 'archived') {
            updates.push(updateDoc(doc(window.db, 'archivedRounds', scoreId), { playerName: newName }));
        }

        await Promise.all(updates);

        // Update the card's filter data attribute
        card.dataset.player = newName.toLowerCase();

        // Restore the display with the new name
        row.innerHTML = `
            <div class="admin-player-badge player-name-display">${newName}</div>
            <button class="player-edit-btn" onclick="event.stopPropagation(); startEditPlayerName(this)" title="Edit player name">✏️</button>
        `;

        console.log(`Player name updated to "${newName}" in ${cardType}`);
    } catch (error) {
        console.error('Error updating player name:', error);
        row.innerHTML = `
            <div class="admin-player-badge player-name-display">${newName}</div>
            <button class="player-edit-btn" onclick="event.stopPropagation(); startEditPlayerName(this)" title="Edit player name">✏️</button>
        `;
        alert('Error updating player name. Please try again.');
    }
}

// Global player rename (from players section — renames across ALL collections)
function startEditGlobalPlayerName(btn, oldName) {
    const card = btn.closest('.admin-detail-card');
    const row = btn.closest('.admin-player-name-row');

    row.innerHTML = `
        <input type="text" class="player-name-input" value="${oldName}" data-old-name="${oldName}" />
        <button class="player-name-save-btn" onclick="event.stopPropagation(); saveGlobalPlayerName(this)">✓</button>
        <button class="player-name-cancel-btn" onclick="event.stopPropagation(); cancelEditGlobalPlayerName(this, '${oldName.replace(/'/g, "\\'")}')">✗</button>
    `;

    const input = row.querySelector('.player-name-input');
    input.focus();
    input.select();
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveGlobalPlayerName(row.querySelector('.player-name-save-btn')); }
        if (e.key === 'Escape') { e.preventDefault(); cancelEditGlobalPlayerName(row.querySelector('.player-name-cancel-btn'), oldName); }
    });
}

async function saveGlobalPlayerName(btn) {
    const row = btn.closest('.admin-player-name-row');
    const input = row.querySelector('.player-name-input');
    const oldName = input.dataset.oldName;
    const newName = input.value.trim();

    if (!newName || newName === oldName) {
        cancelEditGlobalPlayerName(btn, oldName);
        return;
    }

    row.innerHTML = `<span class="admin-detail-card-name player-name-display">Saving...</span>`;

    try {
        const { collection, getDocs, doc, updateDoc, query, where } = window.firestoreHelpers;
        let updatedCount = 0;

        // Update in all collections: scores, activeRounds, completedRounds, archivedRounds
        const collections = ['scores', 'activeRounds', 'completedRounds', 'archivedRounds'];
        for (const col of collections) {
            const snap = await getDocs(collection(window.db, col));
            for (const d of snap.docs) {
                const data = d.data();
                if (data.playerName === oldName) {
                    await updateDoc(doc(window.db, col, d.id), { playerName: newName });
                    updatedCount++;
                }
            }
        }

        console.log(`Renamed "${oldName}" to "${newName}" across ${updatedCount} documents`);

        // Refresh the entire admin page to reflect changes everywhere
        await loadDashboardStats();
        await loadAllActiveRounds();
        await loadAllCompletedRounds();
        await loadAllArchivedRounds();
        renderPlayersSection();

    } catch (error) {
        console.error('Error renaming player globally:', error);
        alert('Error renaming player. Please try again.');
        renderPlayersSection();
    }
}

function cancelEditGlobalPlayerName(btn, oldName) {
    const row = btn.closest('.admin-player-name-row');
    row.innerHTML = `
        <span class="admin-detail-card-name player-name-display">${oldName}</span>
        <button class="player-edit-btn" onclick="event.stopPropagation(); startEditGlobalPlayerName(this, '${oldName.replace(/'/g, "\\'")}')" title="Rename player everywhere">✏️</button>
    `;
}

window.startEditPlayerName = startEditPlayerName;
window.savePlayerName = savePlayerName;
window.cancelEditPlayerName = cancelEditPlayerName;
window.startEditGlobalPlayerName = startEditGlobalPlayerName;
window.saveGlobalPlayerName = saveGlobalPlayerName;
window.cancelEditGlobalPlayerName = cancelEditGlobalPlayerName;
window.onStatCardClick = onStatCardClick;
window.applyAdminFilters = applyAdminFilters;
window.clearAdminFilters = clearAdminFilters;
window.onPlayerCardClick = onPlayerCardClick;
window.onCourseCardClick = onCourseCardClick;
window.toggleAdminSection = toggleAdminSection;
window.adminArchiveActiveRound = adminArchiveActiveRound;
window.adminArchiveCompletedRound = adminArchiveCompletedRound;
window.adminDeleteAllArchivedRounds = adminDeleteAllArchivedRounds;
window.adminDeleteArchivedRound = adminDeleteArchivedRound;
window.adminRestoreArchivedRound = adminRestoreArchivedRound;
