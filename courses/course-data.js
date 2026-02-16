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
