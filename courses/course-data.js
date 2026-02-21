// Course Data - Shared across rounds.js and live-scores.js
// Contains hole-by-hole details for supported courses.
// When a course is not found here, stableford/par/SI features are gracefully hidden.

const allCourseData = [
    {
        name: 'Bonville Golf Resort',
        par: {
            tallwood: 71,
            bloodwood: 71
        },
        holeImagePath: 'courses/bonville-golf-resort/hole-{hole}.jpg',
        holePageUrl: 'https://www.bonvillegolf.com.au/hole/hole-{hole}/',
        holeFlyovers: {
            1: {type: 'youtube', id: 'Z4OtMIxXbts'},
            2: {type: 'youtube', id: 'sffkGMJvAI0'},
            3: {type: 'youtube', id: 'Rs0itcMovSc'},
            4: {type: 'youtube', id: 'Pt3gE3Yp4E0'},
            5: {type: 'youtube', id: 'hURLN9CijB0'},
            6: {type: 'youtube', id: 'JfyZgLvPWTM'},
            7: {type: 'youtube', id: 'sEL4EUaFmEQ'},
            8: {type: 'youtube', id: 'BX7nta7u27o'},
            9: {type: 'youtube', id: 'ukTcPM-HHig'},
            10: {type: 'youtube', id: 'F5SCMN0X3U4'},
            11: {type: 'youtube', id: 'e4wFkVsWaug'},
            12: {type: 'youtube', id: 'p9UBiaCt_es'},
            13: {type: 'youtube', id: 'eGR7M642U3g'},
            14: {type: 'youtube', id: 'vmj7mOaVpfU'},
            15: {type: 'youtube', id: 'RY-BLD0ooBI'},
            16: {type: 'youtube', id: 'BRrfggDEmWs'},
            17: {type: 'youtube', id: 'wsXWvGKwY28'},
            18: {type: 'youtube', id: 'YKwE-HvdXqg'}
        },
        tees: [
            {key: 'tallwood', label: 'Tallwood', totalDistance: 6146},
            {key: 'bloodwood', label: 'Bloodwood', totalDistance: 5664}
        ],
        holes: {
            1: {par: 4, tallwood: {dist: 380, si: 2}, bloodwood: {dist: 353, si: 2}},
            2: {par: 4, tallwood: {dist: 346, si: 12}, bloodwood: {dist: 308, si: 12}},
            3: {par: 3, tallwood: {dist: 183, si: 8}, bloodwood: {dist: 170, si: 8}},
            4: {par: 5, tallwood: {dist: 485, si: 14}, bloodwood: {dist: 465, si: 14}},
            5: {par: 3, tallwood: {dist: 147, si: 16}, bloodwood: {dist: 139, si: 16}},
            6: {par: 4, tallwood: {dist: 335, si: 6}, bloodwood: {dist: 328, si: 6}},
            7: {par: 5, tallwood: {dist: 487, si: 18}, bloodwood: {dist: 453, si: 18}},
            8: {par: 3, tallwood: {dist: 182, si: 4}, bloodwood: {dist: 158, si: 4}},
            9: {par: 4, tallwood: {dist: 324, si: 10}, bloodwood: {dist: 304, si: 10}},
            10: {par: 5, tallwood: {dist: 456, si: 13}, bloodwood: {dist: 419, si: 13}},
            11: {par: 3, tallwood: {dist: 190, si: 9}, bloodwood: {dist: 150, si: 9}},
            12: {par: 4, tallwood: {dist: 425, si: 1}, bloodwood: {dist: 372, si: 1}},
            13: {par: 4, tallwood: {dist: 370, si: 3}, bloodwood: {dist: 346, si: 3}},
            14: {par: 5, tallwood: {dist: 505, si: 15}, bloodwood: {dist: 466, si: 15}},
            15: {par: 4, tallwood: {dist: 357, si: 7}, bloodwood: {dist: 326, si: 7}},
            16: {par: 4, tallwood: {dist: 372, si: 5}, bloodwood: {dist: 340, si: 5}},
            17: {par: 3, tallwood: {dist: 142, si: 11}, bloodwood: {dist: 131, si: 11}},
            18: {par: 4, tallwood: {dist: 460, si: 17}, bloodwood: {dist: 436, si: 17}}
        }
    },
    {
        name: 'Moore Park Golf Course',
        holeImagePath: 'courses/moore-park-golf-course/hole-{hole}.jpg',
        holePageUrl: 'https://www.mooreparkgolf.com.au/the-course',
        holeFlyovers: {
            1: {type: 'youtube', id: 'PYoLbATVW_8'},
            2: {type: 'youtube', id: 'cweXeEmc9SY'},
            3: {type: 'youtube', id: 'TCcFyIW-Jbo'},
            4: {type: 'youtube', id: 'xy_CXkSfpxU'},
            5: {type: 'youtube', id: 'sPuOtd1EZ4M'},
            6: {type: 'youtube', id: 'wkbnCgdI6S8'},
            7: {type: 'youtube', id: 'raAXDJXQqIY'},
            8: {type: 'youtube', id: 'VqDC5Wp5E7U'},
            9: {type: 'youtube', id: 'T6ypqC2brHE'},
            10: {type: 'youtube', id: 'lRRaLOf2Y5I'},
            11: {type: 'youtube', id: 'NcVZ8chi48M'},
            12: {type: 'youtube', id: 'AFF-3g9jBBE'},
            13: {type: 'youtube', id: 'cEw39AitQhQ'},
            14: {type: 'youtube', id: 'rhawido04Mo'},
            15: {type: 'youtube', id: 'MDMCBYqgEUA'},
            16: {type: 'youtube', id: 'kEHmcBGcYmg'},
            17: {type: 'youtube', id: 'w7cnOuMubMg'},
            18: {type: 'youtube', id: 'G6EkqLikypM'}
        },
        par: {
            blue: 70,
            white: 70,
            red: 70
        },
        tees: [
            {key: 'blue', label: 'Blue', totalDistance: 5791},
            {key: 'white', label: 'White', totalDistance: 5559},
            {key: 'red', label: 'Red', totalDistance: 4998}
        ],
        holes: {
            1: {par: 4, blue: {dist: 398, si: 2}, white: {dist: 378, si: 1}, red: {dist: 330, si: 3}},
            2: {par: 3, blue: {dist: 137, si: 17}, white: {dist: 131, si: 18}, red: {dist: 125, si: 18}},
            3: {par: 4, blue: {dist: 382, si: 4}, white: {dist: 333, si: 9}, red: {dist: 305, si: 11}},
            4: {par: 5, blue: {dist: 550, si: 6}, white: {dist: 535, si: 5}, red: {dist: 451, si: 5}},
            5: {par: 3, blue: {dist: 158, si: 18}, white: {dist: 155, si: 15}, red: {dist: 140, si: 17}},
            6: {par: 5, blue: {dist: 480, si: 14}, white: {dist: 463, si: 13}, red: {dist: 407, si: 16}},
            7: {par: 3, blue: {dist: 190, si: 15}, white: {dist: 171, si: 17}, red: {dist: 140, si: 9}},
            8: {par: 4, blue: {dist: 363, si: 5}, white: {dist: 358, si: 4}, red: {dist: 323, si: 2}},
            9: {par: 4, blue: {dist: 286, si: 11}, white: {dist: 280, si: 11}, red: {dist: 257, si: 10}},
            10: {par: 3, blue: {dist: 156, si: 7}, white: {dist: 144, si: 6}, red: {dist: 123, si: 8}},
            11: {par: 5, blue: {dist: 481, si: 10}, white: {dist: 476, si: 7}, red: {dist: 442, si: 7}},
            12: {par: 4, blue: {dist: 310, si: 12}, white: {dist: 301, si: 12}, red: {dist: 295, si: 14}},
            13: {par: 3, blue: {dist: 198, si: 3}, white: {dist: 192, si: 3}, red: {dist: 172, si: 4}},
            14: {par: 4, blue: {dist: 360, si: 8}, white: {dist: 341, si: 8}, red: {dist: 315, si: 6}},
            15: {par: 3, blue: {dist: 162, si: 16}, white: {dist: 152, si: 16}, red: {dist: 140, si: 12}},
            16: {par: 5, blue: {dist: 442, si: 9}, white: {dist: 435, si: 10}, red: {dist: 400, si: 13}},
            17: {par: 4, blue: {dist: 331, si: 13}, white: {dist: 319, si: 14}, red: {dist: 293, si: 15}},
            18: {par: 4, blue: {dist: 407, si: 1}, white: {dist: 395, si: 1}, red: {dist: 340, si: 1}}
        }
    },
    {
        name: 'Mount Derrimut Golf Club',
        holeImagePath: 'courses/mount-derrimut-golf-club/hole-{hole}.jpg',
        holePageUrl: 'https://mtderrimut.com.au/cms/course/hole-{hole}/',
        holeFlyovers: {
            1: {type: 'vimeo', id: '1160081396'},
            2: {type: 'vimeo', id: '1160081436'},
            3: {type: 'vimeo', id: '1160081458'},
            4: {type: 'vimeo', id: '1160081485'},
            5: {type: 'vimeo', id: '1160081519'},
            6: {type: 'vimeo', id: '1160081562'},
            8: {type: 'vimeo', id: '1160081583'},
            9: {type: 'vimeo', id: '1160081620'}
        },
        par: {
            blue: 72,
            white: 72,
            red: 72
        },
        tees: [
            {key: 'blue', label: 'Blue', totalDistance: 6783},
            {key: 'white', label: 'White', totalDistance: 6275},
            {key: 'red', label: 'Red', totalDistance: 5777}
        ],
        holes: {
            1: {par: 4, blue: {dist: 407, si: 7}, white: {dist: 385, si: 7}, red: {dist: 359, si: 7}},
            2: {par: 5, blue: {dist: 519, si: 9}, white: {dist: 487, si: 9}, red: {dist: 460, si: 9}},
            3: {par: 4, blue: {dist: 375, si: 15}, white: {dist: 353, si: 15}, red: {dist: 334, si: 15}},
            4: {par: 5, blue: {dist: 540, si: 1}, white: {dist: 517, si: 1}, red: {dist: 480, si: 1}},
            5: {par: 4, blue: {dist: 392, si: 5}, white: {dist: 370, si: 5}, red: {dist: 342, si: 5}},
            6: {par: 3, blue: {dist: 155, si: 3}, white: {dist: 137, si: 3}, red: {dist: 115, si: 3}},
            7: {par: 4, blue: {dist: 424, si: 17}, white: {dist: 370, si: 17}, red: {dist: 341, si: 17}},
            8: {par: 4, blue: {dist: 385, si: 13}, white: {dist: 363, si: 13}, red: {dist: 334, si: 13}},
            9: {par: 3, blue: {dist: 151, si: 11}, white: {dist: 139, si: 11}, red: {dist: 128, si: 11}},
            10: {par: 4, blue: {dist: 413, si: 2}, white: {dist: 392, si: 2}, red: {dist: 372, si: 2}},
            11: {par: 4, blue: {dist: 326, si: 18}, white: {dist: 282, si: 18}, red: {dist: 259, si: 18}},
            12: {par: 3, blue: {dist: 189, si: 12}, white: {dist: 164, si: 12}, red: {dist: 139, si: 12}},
            13: {par: 5, blue: {dist: 566, si: 16}, white: {dist: 526, si: 16}, red: {dist: 484, si: 16}},
            14: {par: 4, blue: {dist: 413, si: 4}, white: {dist: 392, si: 4}, red: {dist: 367, si: 4}},
            15: {par: 3, blue: {dist: 173, si: 8}, white: {dist: 143, si: 8}, red: {dist: 115, si: 8}},
            16: {par: 5, blue: {dist: 536, si: 14}, white: {dist: 495, si: 14}, red: {dist: 452, si: 14}},
            17: {par: 4, blue: {dist: 444, si: 10}, white: {dist: 416, si: 10}, red: {dist: 370, si: 10}},
            18: {par: 4, blue: {dist: 375, si: 6}, white: {dist: 344, si: 6}, red: {dist: 326, si: 6}}
        }
    },
    {
        name: 'Shelly Beach Golf Club',
        holeImagePath: 'courses/shelly-beach-golf-club/hole-{hole}.jpg',
        holePageUrl: 'https://www.shellybeachgolfclub.com.au/golf/course-guide',
        holeFlyovers: {
            2: {type: 'youtube', id: '3dP0-pXt11E'},
            3: {type: 'youtube', id: 'NldJ_pZ7pKo'},
            6: {type: 'youtube', id: 'V-4bnPOssgY'}
        },
        par: {
            mens: 71,
            ladies: 71
        },
        tees: [
            {key: 'mens', label: 'Mens', totalDistance: 6009},
            {key: 'ladies', label: 'Ladies', totalDistance: 5391}
        ],
        holes: {
            1: {par: 5, mens: {dist: 504, si: 12}, ladies: {dist: 429, si: 1}},
            2: {par: 4, mens: {dist: 395, si: 1}, ladies: {dist: 386, si: 11}},
            3: {par: 4, mens: {dist: 380, si: 6}, ladies: {dist: 335, si: 17}},
            4: {par: 3, mens: {dist: 133, si: 15}, ladies: {dist: 127, si: 13}},
            5: {par: 4, mens: {dist: 361, si: 9}, ladies: {dist: 330, si: 7}},
            6: {par: 4, mens: {dist: 333, si: 11}, ladies: {dist: 301, si: 5}},
            7: {par: 4, mens: {dist: 363, si: 4}, ladies: {dist: 320, si: 3}},
            8: {par: 4, mens: {dist: 360, si: 7}, ladies: {dist: 309, si: 9}},
            9: {par: 3, mens: {dist: 160, si: 14}, ladies: {dist: 136, si: 15}},
            10: {par: 3, mens: {dist: 120, si: 17}, ladies: {dist: 110, si: 18}},
            11: {par: 4, mens: {dist: 393, si: 3}, ladies: {dist: 379, si: 14}},
            12: {par: 4, mens: {dist: 402, si: 2}, ladies: {dist: 300, si: 4}},
            13: {par: 3, mens: {dist: 150, si: 8}, ladies: {dist: 145, si: 10}},
            14: {par: 4, mens: {dist: 396, si: 5}, ladies: {dist: 370, si: 16}},
            15: {par: 5, mens: {dist: 401, si: 18}, ladies: {dist: 390, si: 12}},
            16: {par: 4, mens: {dist: 315, si: 13}, ladies: {dist: 295, si: 2}},
            17: {par: 4, mens: {dist: 309, si: 16}, ladies: {dist: 305, si: 8}},
            18: {par: 5, mens: {dist: 534, si: 10}, ladies: {dist: 424, si: 6}}
        }
    }
]

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
        {key: 'back', label: 'Back'},
        {key: 'middle', label: 'Middle'},
        {key: 'front', label: 'Front'}
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
 * Format a date string as "Wednesday, 18th February, 2026"
 */
function formatLongDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const weekday = d.toLocaleDateString('en-AU', {weekday: 'long'});
    const month = d.toLocaleDateString('en-AU', {month: 'long'});
    const year = d.getFullYear();
    const day = d.getDate();
    const suffix = (day === 1 || day === 21 || day === 31) ? 'st'
        : (day === 2 || day === 22) ? 'nd'
            : (day === 3 || day === 23) ? 'rd' : 'th';
    return `${weekday}, ${day}${suffix} ${month}, ${year}`;
}

/**
 * Get the hole flyover video data for a given course and hole number.
 * Returns { type: 'youtube'|'vimeo', id: '...' } or null if no flyover exists.
 */
function getHoleFlyover(courseName, holeNumber) {
    const course = getCourseData(courseName);
    if (!course || !course.holeFlyovers) return null;
    return course.holeFlyovers[holeNumber] || null;
}

/**
 * Get the hole page URL for a given course and hole number.
 * Returns the URL string or null if not available.
 */
function getHolePageUrl(courseName, holeNumber) {
    const course = getCourseData(courseName);
    if (!course || !course.holePageUrl) return null;
    return course.holePageUrl.replace('{hole}', holeNumber);
}

/**
 * Get the stroke index (SI) for a hole, resolved by tee.
 * holeData is courseData.holes[i], tees is the tee key string (e.g. 'blue').
 * Returns the SI number or undefined if not available.
 */
function getHoleSI(holeData, tees) {
    if (!holeData) return undefined;
    const teeData = holeData[tees];
    if (teeData && typeof teeData === 'object' && teeData.si !== undefined) return teeData.si;
    return undefined;
}

/**
 * Get the distance for a hole, resolved by tee.
 * holeData is courseData.holes[i], tees is the tee key string (e.g. 'blue').
 * Returns the distance number or undefined if not available.
 */
function getHoleDistance(holeData, tees) {
    if (!holeData) return undefined;
    const teeData = holeData[tees];
    if (teeData && typeof teeData === 'object' && teeData.dist !== undefined) return teeData.dist;
    return undefined;
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
 * @param {string} [tees] - tee key (e.g. 'blue', 'tallwood') for resolving SI
 * @returns {string} HTML string with both table layouts
 */
function generateScorecardHTML(scores, putts, courseData, handicap, tees) {
    const hasCourse = !!courseData;
    const hd = (i) => hasCourse ? courseData.holes[i] : null;
    const t = calcRoundTotals(scores, putts, courseData, handicap, tees);

    // Per-hole helpers
    const isPickup = (i) => scores[i] === 'P';
    const holeScore = (i) => isPickup(i) ? 'P' : (scores[i] || '-');
    const holePutts = (i) => putts[i] !== undefined ? putts[i] : '-';
    const holePar = (i) => hd(i)?.par ?? '-';
    const holeSI = (i) => getHoleSI(hd(i), tees);
    const holePts = (i) => {
        if (isPickup(i)) return '-';
        if (!scores[i] || !hd(i)) return '-';
        return calcStablefordPoints(scores[i], hd(i).par, holeSI(i), handicap);
    };
    const holeScoreClass = (i) => isPickup(i) ? 'pickup' : (scores[i] && hd(i) ? getScoreClass(scores[i], hd(i).par) : '');
    const holePtsClass = (i) => {
        const p = holePts(i);
        return typeof p === 'number' ? getStablefordClass(p) : '';
    };
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
    if (hasCourse && holeSI(1) !== undefined) {
        html += hRow('SI', 'index-row', (i) => `<td>${holeSI(i) ?? '-'}</td>`,
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
    if (!score || score === 'P' || typeof score !== 'number' || par === undefined || si === undefined) return 0;
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
function calcRoundTotals(scores, putts, courseData, handicap, tees) {
    const result = {
        front9: {score: 0, par: 0, stableford: 0, putts: 0, count: 0},
        back9: {score: 0, par: 0, stableford: 0, putts: 0, count: 0},
    };

    for (let i = 1; i <= 18; i++) {
        const half = i <= 9 ? result.front9 : result.back9;
        const hd = courseData ? courseData.holes[i] : null;
        if (hd) half.par += hd.par;
        if (scores[i] !== undefined && scores[i] !== 'P') {
            half.score += scores[i];
            half.count++;
            if (hd) half.stableford += calcStablefordPoints(scores[i], hd.par, getHoleSI(hd, tees), handicap);
        }
        if (putts[i] !== undefined) half.putts += putts[i];
    }

    return {
        ...result,
        totalScore: result.front9.score + result.back9.score,
        totalPar: result.front9.par + result.back9.par,
        totalStableford: result.front9.stableford + result.back9.stableford,
        totalPutts: result.front9.putts + result.back9.putts,
        holesPlayed: result.front9.count + result.back9.count,
    };
}
