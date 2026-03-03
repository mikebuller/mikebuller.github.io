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
            1: {tallwood: {par: 4, dist: 380, si: 2}, bloodwood: {par: 4, dist: 353, si: 2}},
            2: {tallwood: {par: 4, dist: 346, si: 12}, bloodwood: {par: 4, dist: 308, si: 12}},
            3: {tallwood: {par: 3, dist: 183, si: 8}, bloodwood: {par: 3, dist: 170, si: 8}},
            4: {tallwood: {par: 5, dist: 485, si: 14}, bloodwood: {par: 5, dist: 465, si: 14}},
            5: {tallwood: {par: 3, dist: 147, si: 16}, bloodwood: {par: 3, dist: 139, si: 16}},
            6: {tallwood: {par: 4, dist: 335, si: 6}, bloodwood: {par: 4, dist: 328, si: 6}},
            7: {tallwood: {par: 5, dist: 487, si: 18}, bloodwood: {par: 5, dist: 453, si: 18}},
            8: {tallwood: {par: 3, dist: 182, si: 4}, bloodwood: {par: 3, dist: 158, si: 4}},
            9: {tallwood: {par: 4, dist: 324, si: 10}, bloodwood: {par: 4, dist: 304, si: 10}},
            10: {tallwood: {par: 5, dist: 456, si: 13}, bloodwood: {par: 5, dist: 419, si: 13}},
            11: {tallwood: {par: 3, dist: 190, si: 9}, bloodwood: {par: 3, dist: 150, si: 9}},
            12: {tallwood: {par: 4, dist: 425, si: 1}, bloodwood: {par: 4, dist: 372, si: 1}},
            13: {tallwood: {par: 4, dist: 370, si: 3}, bloodwood: {par: 4, dist: 346, si: 3}},
            14: {tallwood: {par: 5, dist: 505, si: 15}, bloodwood: {par: 5, dist: 466, si: 15}},
            15: {tallwood: {par: 4, dist: 357, si: 7}, bloodwood: {par: 4, dist: 326, si: 7}},
            16: {tallwood: {par: 4, dist: 372, si: 5}, bloodwood: {par: 4, dist: 340, si: 5}},
            17: {tallwood: {par: 3, dist: 142, si: 11}, bloodwood: {par: 3, dist: 131, si: 11}},
            18: {tallwood: {par: 4, dist: 460, si: 17}, bloodwood: {par: 4, dist: 436, si: 17}}
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
            1: {blue: {par: 4, dist: 398, si: 2}, white: {par: 4, dist: 378, si: 1}, red: {par: 4, dist: 330, si: 3}},
            2: {blue: {par: 3, dist: 137, si: 17}, white: {par: 3, dist: 131, si: 18}, red: {par: 3, dist: 125, si: 18}},
            3: {blue: {par: 4, dist: 382, si: 4}, white: {par: 4, dist: 333, si: 9}, red: {par: 4, dist: 305, si: 11}},
            4: {blue: {par: 5, dist: 550, si: 6}, white: {par: 5, dist: 535, si: 5}, red: {par: 5, dist: 451, si: 5}},
            5: {blue: {par: 3, dist: 158, si: 18}, white: {par: 3, dist: 155, si: 15}, red: {par: 3, dist: 140, si: 17}},
            6: {blue: {par: 5, dist: 480, si: 14}, white: {par: 5, dist: 463, si: 13}, red: {par: 5, dist: 407, si: 16}},
            7: {blue: {par: 3, dist: 190, si: 15}, white: {par: 3, dist: 171, si: 17}, red: {par: 3, dist: 140, si: 9}},
            8: {blue: {par: 4, dist: 363, si: 5}, white: {par: 4, dist: 358, si: 4}, red: {par: 4, dist: 323, si: 2}},
            9: {blue: {par: 4, dist: 286, si: 11}, white: {par: 4, dist: 280, si: 11}, red: {par: 4, dist: 257, si: 10}},
            10: {blue: {par: 3, dist: 156, si: 7}, white: {par: 3, dist: 144, si: 6}, red: {par: 3, dist: 123, si: 8}},
            11: {blue: {par: 5, dist: 481, si: 10}, white: {par: 5, dist: 476, si: 7}, red: {par: 5, dist: 442, si: 7}},
            12: {blue: {par: 4, dist: 310, si: 12}, white: {par: 4, dist: 301, si: 12}, red: {par: 4, dist: 295, si: 14}},
            13: {blue: {par: 3, dist: 198, si: 3}, white: {par: 3, dist: 192, si: 3}, red: {par: 3, dist: 172, si: 4}},
            14: {blue: {par: 4, dist: 360, si: 8}, white: {par: 4, dist: 341, si: 8}, red: {par: 4, dist: 315, si: 6}},
            15: {blue: {par: 3, dist: 162, si: 16}, white: {par: 3, dist: 152, si: 16}, red: {par: 3, dist: 140, si: 12}},
            16: {blue: {par: 5, dist: 442, si: 9}, white: {par: 5, dist: 435, si: 10}, red: {par: 5, dist: 400, si: 13}},
            17: {blue: {par: 4, dist: 331, si: 13}, white: {par: 4, dist: 319, si: 14}, red: {par: 4, dist: 293, si: 15}},
            18: {blue: {par: 4, dist: 407, si: 1}, white: {par: 4, dist: 395, si: 1}, red: {par: 4, dist: 340, si: 1}}
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
            1: {blue: {par: 4, dist: 407, si: 7}, white: {par: 4, dist: 385, si: 7}, red: {par: 4, dist: 359, si: 7}},
            2: {blue: {par: 5, dist: 519, si: 9}, white: {par: 5, dist: 487, si: 9}, red: {par: 5, dist: 460, si: 9}},
            3: {blue: {par: 4, dist: 375, si: 15}, white: {par: 4, dist: 353, si: 15}, red: {par: 4, dist: 334, si: 15}},
            4: {blue: {par: 5, dist: 540, si: 1}, white: {par: 5, dist: 517, si: 1}, red: {par: 5, dist: 480, si: 1}},
            5: {blue: {par: 4, dist: 392, si: 5}, white: {par: 4, dist: 370, si: 5}, red: {par: 4, dist: 342, si: 5}},
            6: {blue: {par: 3, dist: 155, si: 3}, white: {par: 3, dist: 137, si: 3}, red: {par: 3, dist: 115, si: 3}},
            7: {blue: {par: 4, dist: 424, si: 17}, white: {par: 4, dist: 370, si: 17}, red: {par: 4, dist: 341, si: 17}},
            8: {blue: {par: 4, dist: 385, si: 13}, white: {par: 4, dist: 363, si: 13}, red: {par: 4, dist: 334, si: 13}},
            9: {blue: {par: 3, dist: 151, si: 11}, white: {par: 3, dist: 139, si: 11}, red: {par: 3, dist: 128, si: 11}},
            10: {blue: {par: 4, dist: 413, si: 2}, white: {par: 4, dist: 392, si: 2}, red: {par: 4, dist: 372, si: 2}},
            11: {blue: {par: 4, dist: 326, si: 18}, white: {par: 4, dist: 282, si: 18}, red: {par: 4, dist: 259, si: 18}},
            12: {blue: {par: 3, dist: 189, si: 12}, white: {par: 3, dist: 164, si: 12}, red: {par: 3, dist: 139, si: 12}},
            13: {blue: {par: 5, dist: 566, si: 16}, white: {par: 5, dist: 526, si: 16}, red: {par: 5, dist: 484, si: 16}},
            14: {blue: {par: 4, dist: 413, si: 4}, white: {par: 4, dist: 392, si: 4}, red: {par: 4, dist: 367, si: 4}},
            15: {blue: {par: 3, dist: 173, si: 8}, white: {par: 3, dist: 143, si: 8}, red: {par: 3, dist: 115, si: 8}},
            16: {blue: {par: 5, dist: 536, si: 14}, white: {par: 5, dist: 495, si: 14}, red: {par: 5, dist: 452, si: 14}},
            17: {blue: {par: 4, dist: 444, si: 10}, white: {par: 4, dist: 416, si: 10}, red: {par: 4, dist: 370, si: 10}},
            18: {blue: {par: 4, dist: 375, si: 6}, white: {par: 4, dist: 344, si: 6}, red: {par: 4, dist: 326, si: 6}}
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
            1: {mens: {par: 5, dist: 504, si: 12}, ladies: {par: 5, dist: 429, si: 1}},
            2: {mens: {par: 4, dist: 395, si: 1}, ladies: {par: 4, dist: 386, si: 11}},
            3: {mens: {par: 4, dist: 380, si: 6}, ladies: {par: 4, dist: 335, si: 17}},
            4: {mens: {par: 3, dist: 133, si: 15}, ladies: {par: 3, dist: 127, si: 13}},
            5: {mens: {par: 4, dist: 361, si: 9}, ladies: {par: 4, dist: 330, si: 7}},
            6: {mens: {par: 4, dist: 333, si: 11}, ladies: {par: 4, dist: 301, si: 5}},
            7: {mens: {par: 4, dist: 363, si: 4}, ladies: {par: 4, dist: 320, si: 3}},
            8: {mens: {par: 4, dist: 360, si: 7}, ladies: {par: 4, dist: 309, si: 9}},
            9: {mens: {par: 3, dist: 160, si: 14}, ladies: {par: 3, dist: 136, si: 15}},
            10: {mens: {par: 3, dist: 120, si: 17}, ladies: {par: 3, dist: 110, si: 18}},
            11: {mens: {par: 4, dist: 393, si: 3}, ladies: {par: 4, dist: 379, si: 14}},
            12: {mens: {par: 4, dist: 402, si: 2}, ladies: {par: 4, dist: 300, si: 4}},
            13: {mens: {par: 3, dist: 150, si: 8}, ladies: {par: 3, dist: 145, si: 10}},
            14: {mens: {par: 4, dist: 396, si: 5}, ladies: {par: 4, dist: 370, si: 16}},
            15: {mens: {par: 5, dist: 401, si: 18}, ladies: {par: 5, dist: 390, si: 12}},
            16: {mens: {par: 4, dist: 315, si: 13}, ladies: {par: 4, dist: 295, si: 2}},
            17: {mens: {par: 4, dist: 309, si: 16}, ladies: {par: 4, dist: 305, si: 8}},
            18: {mens: {par: 5, dist: 534, si: 10}, ladies: {par: 5, dist: 424, si: 6}}
        }
    },
    {
        name: 'Strathfield Golf Club',
        holePageUrl: 'https://www.strathfieldgolf.com.au/cms/course/{hole}/',
        par: {blue: 70, white: 70, red: 71},
        tees: [
            {key: 'blue', label: 'Blue', totalDistance: 5922},
            {key: 'white', label: 'White', totalDistance: 5650},
            {key: 'red', label: 'Red', totalDistance: 5051}
        ],
        holes: {
            1:  {blue: {par: 4, dist: 427, si: 1},  white: {par: 4, dist: 394, si: 1},  red: {par: 5, dist: 385, si: 1}},
            2:  {blue: {par: 3, dist: 135, si: 14}, white: {par: 3, dist: 117, si: 14}, red: {par: 3, dist: 108, si: 14}},
            3:  {blue: {par: 5, dist: 508, si: 3},  white: {par: 5, dist: 497, si: 3},  red: {par: 5, dist: 444, si: 3}},
            4:  {blue: {par: 4, dist: 316, si: 11}, white: {par: 4, dist: 308, si: 11}, red: {par: 4, dist: 299, si: 11}},
            5:  {blue: {par: 3, dist: 175, si: 15}, white: {par: 3, dist: 165, si: 15}, red: {par: 3, dist: 138, si: 15}},
            6:  {blue: {par: 3, dist: 178, si: 17}, white: {par: 3, dist: 168, si: 17}, red: {par: 3, dist: 131, si: 17}},
            7:  {blue: {par: 4, dist: 349, si: 7},  white: {par: 4, dist: 335, si: 7},  red: {par: 4, dist: 291, si: 7}},
            8:  {blue: {par: 5, dist: 482, si: 5},  white: {par: 5, dist: 472, si: 5},  red: {par: 5, dist: 410, si: 5}},
            9:  {blue: {par: 4, dist: 332, si: 9},  white: {par: 4, dist: 325, si: 9},  red: {par: 4, dist: 300, si: 9}},
            10: {blue: {par: 3, dist: 199, si: 16}, white: {par: 3, dist: 185, si: 16}, red: {par: 3, dist: 154, si: 16}},
            11: {blue: {par: 5, dist: 497, si: 4},  white: {par: 5, dist: 479, si: 4},  red: {par: 5, dist: 435, si: 4}},
            12: {blue: {par: 4, dist: 377, si: 2},  white: {par: 4, dist: 362, si: 2},  red: {par: 4, dist: 320, si: 2}},
            13: {blue: {par: 3, dist: 183, si: 18}, white: {par: 3, dist: 162, si: 18}, red: {par: 3, dist: 146, si: 18}},
            14: {blue: {par: 4, dist: 333, si: 10}, white: {par: 4, dist: 314, si: 10}, red: {par: 4, dist: 293, si: 10}},
            15: {blue: {par: 5, dist: 533, si: 6},  white: {par: 5, dist: 513, si: 6},  red: {par: 5, dist: 428, si: 6}},
            16: {blue: {par: 3, dist: 146, si: 13}, white: {par: 3, dist: 135, si: 13}, red: {par: 3, dist: 119, si: 13}},
            17: {blue: {par: 4, dist: 384, si: 8},  white: {par: 4, dist: 369, si: 8},  red: {par: 4, dist: 338, si: 8}},
            18: {blue: {par: 4, dist: 368, si: 12}, white: {par: 4, dist: 350, si: 12}, red: {par: 4, dist: 312, si: 12}}
        }
    },
    {
        name: "St Michael's Golf Club",
        par: {blue: 72, white: 72, gold: 70, red: 74},
        holeImagePath: 'https://www.stmichaelsgolf.com.au/cms/wp-content/uploads/2015/10/course-map.jpg',
        holePageUrl: 'https://www.stmichaelsgolf.com.au/cms/course/{hole}/',
        holeFlyovers: {
            1: {type: 'youtube', id: '3jG2RHP3iF8'},
            2: {type: 'youtube', id: 'Zxjso_jgEFo'},
            3: {type: 'youtube', id: 'Ow89kbq05I8'},
            4: {type: 'youtube', id: 'BdSucOKV8v8'},
            5: {type: 'youtube', id: '2dTU5Q5D934'},
            6: {type: 'youtube', id: 'kP8ilYtHRIs'},
            7: {type: 'youtube', id: 'GNyEKRSyIkk'},
            8: {type: 'youtube', id: '9ziZpQii7XY'},
            9: {type: 'youtube', id: 'SiPOGcfnKaQ'},
            10: {type: 'youtube', id: '3u7rzT2oTlg'},
            11: {type: 'youtube', id: 'obOPqYHk-Wg'},
            12: {type: 'youtube', id: 'oKU-GPbSM8k'},
            13: {type: 'youtube', id: 'wWTLQf8sUDk'},
            14: {type: 'youtube', id: 'Gz8f06qAXiA'},
            15: {type: 'youtube', id: 'GG_NS9maEm8'},
            16: {type: 'youtube', id: 'V2iDcVJE_wY'},
            17: {type: 'youtube', id: '_vuVK1ahq3g'},
            18: {type: 'youtube', id: '1U6ws7Pti5c'}
        },
        tees: [
            {key: 'blue', label: 'Blue', totalDistance: 6345},
            {key: 'white', label: 'White', totalDistance: 5886},
            {key: 'gold', label: 'Gold', totalDistance: 5379},
            {key: 'red', label: 'Red', totalDistance: 5447}
        ],
        descriptions: {
            1:  "An impressive spacious tee-shot and approach to the green, this can lead one into a false sense of security. There is trouble bordering all around and the green is quite narrow. The opening hole at St Michaels is a good challenge.",
            2:  "The 2nd is in complete contrast to the opening hole. A dog leg to the right with sweeping fairway over the hill down to a well bunkered green. Native trees and scrub amphitheatre this beautiful hole.",
            3:  "The effect of hitting through a valley is what makes this par 3 aesthetically impressive. The elevated tee to a green sitting atop a steep hill, with views of the Eastern Suburbs peninsula. One can be distracted from a most challenging hole.",
            4:  "The 4th tee is well above the fairway, with a clear view of the ocean behind and the hole ahead. A water hazard hugs the right side of the fairway and native bush on the south side. With a challenging putting surface, this short hole is a good test.",
            5:  "The 5th is truly an outstanding par 3, with a chute like tee shot, over a sandy 140m carry, and challenging up and downs from both sides of a sloping green. A par on this hole is most rewarding.",
            6:  "With elevated teeing area and view of the Pacific Ocean and headland, this short par 5 offers a most enjoyable experience, and a good chance for birdie or that first par.",
            7:  "With back to back par 5's, this longer version goes in the opposite direction, and is highly influenced by the wind. With little to no trouble off the tee, the only true test is a narrow green atop a steep hill which is blind from the fairway. Whichever way the breeze blows, makes or breaks either the 6th or 7th.",
            8:  "A classic hole, long in length, requiring a good tee shot and accurate approach. With surrounding mounding, hidden hazards and out of bounds south of green, this hole can be an absolute brute into the wind.",
            9:  "A generous width of fairway and short in distance. This deep hole, generally assures you of your halfway drink going down easily. Avoid the green side bunkers and get ready for the challenging back nine.",
            10: "Another generous fairway, but lined both sides by trees, narrowing at approximately 230m from tee. A small sloping green, with bunkering set well away, this easy looking hole is rarely defeated.",
            11: "This double dog-leg sweeping from left to right off tee and right to left to green is a very impressive. Although generous in fairway, the blind tee-shot and surrounding native bush makes this hole very intimidating.",
            12: "The 12th Green is heavily bunkered with a strongly sloping putting surface, outstanding looking hole but very daunting. Relax and enjoy the challenge.",
            13: "This hole offers a narrow tee shot between a hazard on the left of fairway and tree lined on the south. There is an equally demanding narrow 2nd shot to a blind green, bunkered left and right. This hole is often influenced by wind but the view is to be enjoyed.",
            14: "A short hole with sandy rough and generous sweeping fairway. There are two small hills to negotiate before an awkward shaped green. A seemingly easy hole compared to the start of the back nine.",
            15: "The 15th tee is an elevated position to a large sloping green surrounded by bunkers. The native bush land surrounds the green to create an impressive back drop.",
            16: "The 16th hole is played from an elevated tee over the infamous Moran's gully. Rumor has it Ball Manufacturer's Christmas bonus is assured. Due to this hole. Fairway sweeps from right to left with sloping green, Par this hole and you're a happy golfer.",
            17: "This hole offers the ultimate challenge, a long straight tee shot over the hill and go for the green amongst a stadium of native tree's and scrub, or play short of hill with safe club to get over for 2nd and approach green for 3rd.",
            18: "The 18th offers a last opportunity to test yourself, an impressive intimidating tee shot through a narrow tree-lined fairway with carry of 140 metre's off tee. A narrow long approach to a big green, with bunkering set away from green short left and right."
        },
        tips: {
            1:  "Hit your safety club off the tee and play to front of green.",
            2:  "Aim at big Banksia tree left side fairway, and have faith.",
            3:  "Aim to left edge of green for safe option and don't be long.",
            4:  "Hit your safety club off the tee.",
            5:  "Play to front edge of green, and check wind conditions.",
            6:  "Time to warm up that driver.",
            7:  "Aim between right mound and flag for the approach into the green.",
            8:  "Aim left side on tee shot to capitalize on a flat running area.",
            9:  "A good birdie or par opportunity.",
            10: "Aim right centre fairway for sloping fairway.",
            11: "Aim over right edge of trees, 150-200m landing distance.",
            12: "Aim at right edge of green for safest play.",
            13: "Safety club off the tee, will assure safety of score.",
            14: "Play approach to right side of green, for a friendly bounce down.",
            15: "Play short for easiest up and down.",
            16: "Aim at right trees through gap, 170 metre carry. Or further right for shorter, safer play.",
            17: "Unless you're feeling great, play conservatively and protect score!",
            18: "Aim to land approach short for ball to run onto green."
        },
        holes: {
            1:  {blue: {par: 4, dist: 399, si: 1},  white: {par: 4, dist: 378, si: 2},  gold: {par: 4, dist: 351, si: 6},  red: {par: 5, dist: 378, si: 17}},
            2:  {blue: {par: 4, dist: 317, si: 4},  white: {par: 4, dist: 303, si: 4},  gold: {par: 4, dist: 290, si: 8},  red: {par: 4, dist: 291, si: 1}},
            3:  {blue: {par: 3, dist: 170, si: 10}, white: {par: 3, dist: 166, si: 12}, gold: {par: 3, dist: 130, si: 16}, red: {par: 3, dist: 133, si: 12}},
            4:  {blue: {par: 4, dist: 346, si: 8},  white: {par: 4, dist: 291, si: 16}, gold: {par: 4, dist: 274, si: 12}, red: {par: 4, dist: 272, si: 16}},
            5:  {blue: {par: 3, dist: 203, si: 6},  white: {par: 3, dist: 170, si: 10}, gold: {par: 3, dist: 129, si: 18}, red: {par: 3, dist: 150, si: 9}},
            6:  {blue: {par: 5, dist: 501, si: 16}, white: {par: 5, dist: 433, si: 18}, gold: {par: 5, dist: 425, si: 14}, red: {par: 5, dist: 425, si: 14}},
            7:  {blue: {par: 5, dist: 492, si: 14}, white: {par: 5, dist: 472, si: 8},  gold: {par: 5, dist: 441, si: 2},  red: {par: 5, dist: 446, si: 3}},
            8:  {blue: {par: 4, dist: 398, si: 12}, white: {par: 4, dist: 390, si: 6},  gold: {par: 4, dist: 378, si: 4},  red: {par: 5, dist: 398, si: 18}},
            9:  {blue: {par: 4, dist: 298, si: 18}, white: {par: 4, dist: 287, si: 14}, gold: {par: 4, dist: 263, si: 10}, red: {par: 4, dist: 275, si: 7}},
            10: {blue: {par: 4, dist: 375, si: 7},  white: {par: 4, dist: 368, si: 1},  gold: {par: 4, dist: 305, si: 13}, red: {par: 4, dist: 307, si: 8}},
            11: {blue: {par: 4, dist: 373, si: 3},  white: {par: 4, dist: 339, si: 5},  gold: {par: 4, dist: 325, si: 5},  red: {par: 4, dist: 328, si: 2}},
            12: {blue: {par: 3, dist: 176, si: 13}, white: {par: 3, dist: 155, si: 17}, gold: {par: 3, dist: 135, si: 15}, red: {par: 3, dist: 137, si: 11}},
            13: {blue: {par: 5, dist: 472, si: 15}, white: {par: 5, dist: 457, si: 11}, gold: {par: 4, dist: 385, si: 1},  red: {par: 5, dist: 385, si: 13}},
            14: {blue: {par: 4, dist: 340, si: 17}, white: {par: 4, dist: 333, si: 15}, gold: {par: 4, dist: 324, si: 7},  red: {par: 4, dist: 283, si: 10}},
            15: {blue: {par: 3, dist: 206, si: 11}, white: {par: 3, dist: 200, si: 13}, gold: {par: 3, dist: 171, si: 17}, red: {par: 3, dist: 179, si: 15}},
            16: {blue: {par: 4, dist: 379, si: 5},  white: {par: 4, dist: 352, si: 9},  gold: {par: 4, dist: 330, si: 11}, red: {par: 4, dist: 333, si: 4}},
            17: {blue: {par: 5, dist: 498, si: 2},  white: {par: 5, dist: 417, si: 7},  gold: {par: 4, dist: 402, si: 3},  red: {par: 5, dist: 403, si: 5}},
            18: {blue: {par: 4, dist: 402, si: 9},  white: {par: 4, dist: 375, si: 3},  gold: {par: 4, dist: 321, si: 9},  red: {par: 4, dist: 324, si: 6}}
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
 * Get the par for a hole, resolved by tee.
 * holeData is courseData.holes[i], tees is the tee key string (e.g. 'blue').
 * Returns the par number or undefined if not available.
 */
function getHolePar(holeData, tees) {
    if (!holeData) return undefined;
    const teeData = holeData[tees];
    if (teeData && typeof teeData === 'object' && teeData.par !== undefined) return teeData.par;
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
function generateScorecardHTML(scores, putts, courseData, handicap, tees, prizes) {
    const hasCourse = !!courseData;
    const hd = (i) => hasCourse ? courseData.holes[i] : null;
    const t = calcRoundTotals(scores, putts, courseData, handicap, tees);
    const prizeData = prizes || {};
    const wonPrizes = prizeData.wonPrizes || {}; // {hole: [{emoji, value}, ...]}

    // Per-hole helpers
    const isPickup = (i) => scores[i] === 'P';
    const holePrizeHtml = (i) => {
        const prizes = wonPrizes[i];
        if (!prizes || !prizes.length) return '';
        return ' ' + prizes.map(p =>
            `<span class="prize-emoji" onclick="event.stopPropagation(); showPrizeDistance(this, '${p.value}')">${p.emoji}</span>`
        ).join(' ');
    };
    const holeScore = (i) => (isPickup(i) ? 'P' : (scores[i] || '-')) + holePrizeHtml(i);
    const holePutts = (i) => putts[i] !== undefined ? putts[i] : '-';
    const holePar = (i) => getHolePar(hd(i), tees) ?? '-';
    const holeSI = (i) => getHoleSI(hd(i), tees);
    const holePts = (i) => {
        if (isPickup(i)) return '-';
        if (!scores[i] || !hd(i)) return '-';
        const par = getHolePar(hd(i), tees);
        if (par === undefined) return '-';
        return calcStablefordPoints(scores[i], par, holeSI(i), handicap);
    };
    const holeScoreClass = (i) => {
        if (isPickup(i)) return 'pickup';
        const par = getHolePar(hd(i), tees);
        return (scores[i] && par !== undefined) ? getScoreClass(scores[i], par) : '';
    };
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
        const par = getHolePar(hd, tees);
        if (par !== undefined) half.par += par;
        if (scores[i] !== undefined && scores[i] !== 'P') {
            half.score += scores[i];
            half.count++;
            if (par !== undefined) half.stableford += calcStablefordPoints(scores[i], par, getHoleSI(hd, tees), handicap);
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
