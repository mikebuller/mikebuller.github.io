// Course Data - Shared across rounds.js and live-scores.js
// Contains hole-by-hole details for supported courses.
// When a course is not found here, stableford/par/SI features are gracefully hidden.

const allCourseData = [
    {
        name: 'Bonville Golf Resort',
        par: 71,
        holeImagePath: 'courses/bonville-golf-resort/hole-{hole}.jpg',
        tees: [
            { key: 'tallwood', label: 'Tallwood', totalDistance: 6146 },
            { key: 'bloodwood', label: 'Bloodwood', totalDistance: 5664 }
        ],
        holes: {
            1:  { par: 4, si: 2,  tallwood: 380, bloodwood: 353 },
            2:  { par: 4, si: 12, tallwood: 346, bloodwood: 308 },
            3:  { par: 3, si: 8,  tallwood: 183, bloodwood: 170 },
            4:  { par: 5, si: 14, tallwood: 485, bloodwood: 465 },
            5:  { par: 3, si: 16, tallwood: 147, bloodwood: 139 },
            6:  { par: 4, si: 6,  tallwood: 335, bloodwood: 328 },
            7:  { par: 5, si: 18, tallwood: 487, bloodwood: 453 },
            8:  { par: 3, si: 4,  tallwood: 182, bloodwood: 158 },
            9:  { par: 4, si: 10, tallwood: 324, bloodwood: 304 },
            10: { par: 5, si: 13, tallwood: 456, bloodwood: 419 },
            11: { par: 3, si: 9,  tallwood: 190, bloodwood: 150 },
            12: { par: 4, si: 1,  tallwood: 425, bloodwood: 372 },
            13: { par: 4, si: 3,  tallwood: 370, bloodwood: 346 },
            14: { par: 5, si: 15, tallwood: 505, bloodwood: 466 },
            15: { par: 4, si: 7,  tallwood: 357, bloodwood: 326 },
            16: { par: 4, si: 5,  tallwood: 372, bloodwood: 340 },
            17: { par: 3, si: 11, tallwood: 142, bloodwood: 131 },
            18: { par: 4, si: 17, tallwood: 460, bloodwood: 436 }
        }
    },
    {
        name: 'Moore Park Golf Course',
        holeImagePath: 'courses/moore-park-golf-course/hole-{hole}.jpg',
        par: 70,
        tees: [
            { key: 'blue', label: 'Blue', totalDistance: 5791 },
            { key: 'white', label: 'White', totalDistance: 5559 },
            { key: 'gold', label: 'Gold', totalDistance: 5208 }
        ],
        holes: {
            1:  { par: 4, si: 3,  blue: 398, white: 378, gold: 364 },
            2:  { par: 3, si: 18, blue: 137, white: 131, gold: 125 },
            3:  { par: 4, si: 10, blue: 382, white: 333, gold: 349 },
            4:  { par: 5, si: 2,  blue: 550, white: 535, gold: 503 },
            5:  { par: 3, si: 12, blue: 158, white: 155, gold: 144 },
            6:  { par: 5, si: 16, blue: 480, white: 463, gold: 439 },
            7:  { par: 3, si: 6,  blue: 190, white: 171, gold: 174 },
            8:  { par: 4, si: 7,  blue: 363, white: 358, gold: 332 },
            9:  { par: 4, si: 14, blue: 286, white: 280, gold: 262 },
            10: { par: 3, si: 4,  blue: 156, white: 144, gold: 143 },
            11: { par: 5, si: 13, blue: 481, white: 476, gold: 440 },
            12: { par: 4, si: 9,  blue: 310, white: 301, gold: 283 },
            13: { par: 3, si: 5,  blue: 198, white: 192, gold: 187 },
            14: { par: 4, si: 8,  blue: 360, white: 341, gold: 336 },
            15: { par: 3, si: 11, blue: 162, white: 152, gold: 148 },
            16: { par: 5, si: 17, blue: 442, white: 435, gold: 404 },
            17: { par: 4, si: 15, blue: 331, white: 319, gold: 303 },
            18: { par: 4, si: 1,  blue: 407, white: 395, gold: 272 }
        }
    }
];

/**
 * Look up course data by name (case-insensitive, partial match).
 * Returns the course object or null if not found.
 */
function getCourseData(courseName) {
    if (!courseName) return null;
    const lower = courseName.toLowerCase();
    return allCourseData.find(c => lower.includes(c.name.toLowerCase())) || null;
}

/**
 * Get the tee options for a course.
 * Returns the course's tees array, or a generic fallback.
 */
function getCourseTees(courseName) {
    const course = getCourseData(courseName);
    if (course && course.tees) return course.tees;
    // Generic fallback for unknown courses
    return [
        { key: 'back', label: 'Back' },
        { key: 'middle', label: 'Middle' },
        { key: 'front', label: 'Front' }
    ];
}

/**
 * Get the hole image path for a given course and hole number.
 * Returns the image URL or null if the course has no hole images.
 */
function getHoleImagePath(courseName, holeNumber) {
    const course = getCourseData(courseName);
    if (!course || !course.holeImagePath) return null;
    return course.holeImagePath.replace('{hole}', holeNumber);
}

/**
 * Get CSS class for a score relative to par.
 */
function getScoreClass(score, par) {
    if (!score || par === undefined) return '';
    return score < par ? 'under-par' : (score > par ? 'over-par' : '');
}

/**
 * Get CSS class for stableford points.
 */
function getStablefordClass(pts) {
    if (pts >= 3) return 'under-par';
    if (pts === 0) return 'over-par';
    return '';
}

/**
 * Generate scorecard HTML (vertical + horizontal layouts).
 * @param {Object} scores - { 1: 4, 2: 5, ... } hole scores
 * @param {Object} putts  - { 1: 2, 2: 1, ... } hole putts
 * @param {Object|null} courseData - course object from getCourseData(), or null
 * @param {number} handicap
 * @returns {string} HTML string with both table layouts
 */
function generateScorecardHTML(scores, putts, courseData, handicap) {
    const hasCourse = !!courseData;
    const hd = (i) => hasCourse ? courseData.holes[i] : null;
    const t = calcRoundTotals(scores, putts, courseData, handicap);

    // Per-hole helpers
    const holeScore = (i) => scores[i] || '-';
    const holePutts = (i) => putts[i] || '-';
    const holePar = (i) => hd(i)?.par ?? '-';
    const holePts = (i) => {
        if (!scores[i] || !hd(i)) return '-';
        return calcStablefordPoints(scores[i], hd(i).par, hd(i).si, handicap);
    };
    const holeScoreClass = (i) => scores[i] && hd(i) ? getScoreClass(scores[i], hd(i).par) : '';
    const holePtsClass = (i) => { const p = holePts(i); return typeof p === 'number' ? getStablefordClass(p) : ''; };
    const holePuttClass = (i) => (putts[i] >= 3 ? 'over-par' : '');

    let html = '';

    // ===== VERTICAL LAYOUT (Mobile) =====
    html += '<table class="modal-scorecard modal-scorecard-vertical">';
    html += `<thead><tr style="border-bottom: 2px solid rgba(255,255,255,0.3);"><th>Hole</th>${hasCourse ? '<th>Par</th>' : ''}<th>Putts</th><th>Score</th>${hasCourse ? '<th>Points</th>' : ''}</tr></thead><tbody>`;

    const verticalRow = (i) => `<tr>
        <td>${i}</td>
        ${hasCourse ? `<td>${holePar(i)}</td>` : ''}
        <td class="${holePuttClass(i)}">${holePutts(i)}</td>
        <td class="${holeScoreClass(i)}">${holeScore(i)}</td>
        ${hasCourse ? `<td class="${holePtsClass(i)}">${holePts(i)}</td>` : ''}</tr>`;

    const subtotalRow = (label, half) => `<tr class="subtotal-row">
        <td>${label}</td>
        ${hasCourse ? `<td>${half.par}</td>` : ''}
        <td>${half.putts || '-'}</td>
        <td>${half.score || '-'}</td>
        ${hasCourse ? `<td>${half.stableford || '-'}</td>` : ''}</tr>`;

    for (let i = 1; i <= 9; i++) html += verticalRow(i);
    html += subtotalRow('OUT', t.front9);
    for (let i = 10; i <= 18; i++) html += verticalRow(i);
    html += subtotalRow('IN', t.back9);

    html += `<tr class="total-row"><td>TOT</td>
        ${hasCourse ? `<td>${t.totalPar}</td>` : ''}
        <td>${t.totalPutts || '-'}</td>
        <td>${t.totalScore || '-'}</td>
        ${hasCourse ? `<td>${t.totalStableford || '-'}</td>` : ''}</tr>`;
    html += '</tbody></table>';

    // ===== HORIZONTAL LAYOUT (Desktop) =====
    html += '<div class="modal-scorecard-horizontal-wrapper"><table class="modal-scorecard modal-scorecard-horizontal"><thead><tr><th class="row-label">Hole</th>';
    for (let i = 1; i <= 9; i++) html += `<th>${i}</th>`;
    html += '<th class="subtotal-col">OUT</th>';
    for (let i = 10; i <= 18; i++) html += `<th>${i}</th>`;
    html += '<th class="subtotal-col">IN</th><th class="total-col">TOT</th></tr></thead><tbody>';

    // Helper to build a horizontal data row
    const hRow = (label, cls, cellFn, f9, b9, tot) => {
        let r = `<tr class="${cls}"><td class="row-label">${label}</td>`;
        for (let i = 1; i <= 9; i++) r += cellFn(i);
        r += `<td class="subtotal-col">${f9}</td>`;
        for (let i = 10; i <= 18; i++) r += cellFn(i);
        r += `<td class="subtotal-col">${b9}</td><td class="total-col">${tot}</td></tr>`;
        return r;
    };

    // Stroke index row
    if (hasCourse && hd(1)?.si !== undefined) {
        html += hRow('SI', 'index-row', (i) => `<td>${hd(i)?.si ?? '-'}</td>`,
            '', '', '');
    }

    // Par row
    if (hasCourse) {
        html += hRow('Par', 'par-row', (i) => `<td>${holePar(i)}</td>`,
            t.front9.par, t.back9.par, t.totalPar);
    }

    // Putts row
    html += hRow('Putts', '', (i) => `<td class="${holePuttClass(i)}">${holePutts(i)}</td>`,
        t.front9.putts || '-', t.back9.putts || '-', t.totalPutts || '-');

    // Score row
    html += hRow('Score', 'score-row', (i) => `<td class="${holeScoreClass(i)}">${holeScore(i)}</td>`,
        t.front9.score || '-', t.back9.score || '-', t.totalScore || '-');

    // Points row
    if (hasCourse) {
        html += hRow('Points', 'pts-row', (i) => `<td class="${holePtsClass(i)}">${holePts(i)}</td>`,
            t.front9.stableford || '-', t.back9.stableford || '-', t.totalStableford || '-');
    }

    html += '</tbody></table></div>';
    return html;
}

/**
 * Calculate stableford points for a single hole.
 * Returns 0 if any required data is missing.
 */
function calcStablefordPoints(score, par, si, handicap) {
    if (!score || par === undefined || si === undefined) return 0;
    let strokes = 0;
    if (handicap >= si) strokes++;
    if (handicap >= 18 + si) strokes++;
    const adjustedPar = par + strokes;
    const diff = adjustedPar - score;
    return diff <= -2 ? 0 : diff + 2;
}

/**
 * Calculate front-9 and back-9 totals for a set of scores.
 * Returns { front9, back9, total } with score/par/stableford/putts breakdowns.
 */
function calcRoundTotals(scores, putts, courseData, handicap) {
    const result = {
        front9: { score: 0, par: 0, stableford: 0, putts: 0, count: 0 },
        back9:  { score: 0, par: 0, stableford: 0, putts: 0, count: 0 },
    };

    for (let i = 1; i <= 18; i++) {
        const half = i <= 9 ? result.front9 : result.back9;
        const hd = courseData ? courseData.holes[i] : null;
        if (hd) half.par += hd.par;
        if (scores[i] !== undefined) {
            half.score += scores[i];
            half.count++;
            if (hd) half.stableford += calcStablefordPoints(scores[i], hd.par, hd.si, handicap);
        }
        if (putts[i] !== undefined) half.putts += putts[i];
    }

    return {
        ...result,
        totalScore:      result.front9.score + result.back9.score,
        totalPar:        result.front9.par + result.back9.par,
        totalStableford: result.front9.stableford + result.back9.stableford,
        totalPutts:      result.front9.putts + result.back9.putts,
        holesPlayed:     result.front9.count + result.back9.count,
    };
}
