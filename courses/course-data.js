// Course Data - Shared across rounds.js and live-scores.js
// Contains hole-by-hole details for supported courses.
// When a course is not found here, stableford/par/SI features are gracefully hidden.

const allCourseData = [
    {
        name: 'Bonville Golf Resort',
        par: {
            tallowwood: 71,
            bloodwood: 71,
            ironbark: 71,
            flooded_gums: 71
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
            {key: 'tallowwood', label: 'Tallowwood', totalDistance: 6000},
            {key: 'bloodwood', label: 'Bloodwood', totalDistance: 5664},
            {key: 'ironbark', label: 'Ironbark', totalDistance: 5205},
            {key: 'flooded_gums', label: 'Flooded Gums', totalDistance: 4808}
        ],
        descriptions: {
            1:  "If played conservatively with a club that can't reach the left hand bunker the first fairway is quite generous, the water down the right is sure to add to the first tee nerves though. Take one extra club when approaching the green to avoid the cavernous bunkers.",
            2:  "A short dogleg right requiring good positioning rather than distance off the tee. Longer hitters may try to carry the bunker, leaving them a shorter uphill second shot to a back to front sloping green.",
            3:  "A tantalising par three with most of the trouble on the left side. Balls landing to the right side of the green may bounce down onto the putting surface.",
            4:  "A unique par 5 that is split by a large gorge, the ideal tee shot will find the flat section in the middle of the fairway short of the drop off. From here longer hitters may be able to reach the green in two.",
            5:  "A straight forward par 3, which penalises heavily for missing on the left side. Most important to try and hit your ball onto the same tier as the flag.",
            6:  "A well struck drive will make its way over the rise in the fairway and down onto the flat, leaving a mid to short iron to a narrow green. If you want an uphill putt, you're going to have to narrowly avoid the bunkers to the right of the green.",
            7:  "Not a long par 5 but still no push over. A good drive will avoid the fairway bunkers on the right-hand side leaving you with a perfect risk reward decision. Lay-up or take on the creek 70m short of the green.",
            8:  "A tough par three to return you to the Clubhouse. With out of bounds long left and long and deep bunkers front and right a solid strike is important. Making sure you hit a club that will carry the front right bunker is sure to save shots here.",
            9:  "With three large bunkers dissecting the fairway, placement is key here. For longer hitters who don't mind risking the OOB left, carrying the bunkers will be rewarded with a short pitch to the green.",
            10: "With danger lurking on every shot this spectacular par 5 deserves respect. With two forced water carries, laying up to comfortable distances and island hopping your way to the green is the percentage play. For the longer hitter a 220m tee shot will leave a similar distance to reach the green in two.",
            11: "A straightforward par three! A bail out left will usually roll onto the green, if it doesn't though your short game will be tested.",
            12: "Bonville's toughest test will encourage most to take some sort of gamble. An aggressive player will attempt to carry the hazard and trees on the right leaving a much easier approach shot. Those who opt for safety off the tee will be faced with a long second shot to a green guarded by water.",
            13: "The fairway bunker on the right side is reachable for most golfers, whereas the bunker on the left side will only be reached by the longer hitter. With only the top of the flag visible from the fairway make sure to take plenty of club to reach the green.",
            14: "The longest par five on the course. No hidden traps, just avoid the water on the left and the trees on the right. When approaching the long and narrow green, be aware that any shot that goes long and left will usually come to rest in a watery grave.",
            15: "A great dogleg par four which is a highlight of the course. A tee shot to the right of the fairway bunker, often with a club less than driver, to finish short of the creek, is the play from the tee. A solid strike and good club selection will be vital to hit this green in regulation, guarded by a large pond in front and a creek over the back.",
            16: "Don't hit it left! For those who tend to draw or hook the ball, leave your driver in the bag. Keep it in play off the tee, and then take one extra club when approaching the green, which slopes to the left.",
            17: "Don't be hypnotised by the reflections off the water. Take dead aim and make a confident swing! An exciting par three, which keeps all players in suspense until the ball finds land.",
            18: "For long hitters seeking a grandstand finish it won't get much better than at Bonville. A solid drive past the fairway bunker and over the hill will be sure to leave your second shot within reach of the green and a potential eagle putt with the Clubhouse and its occupants looking on. Alternatively, it can be played as a relatively short three shot par 5 with generous green."
        },
        holes: {
            1:  {tallowwood: {par: 4, dist: 376, si: 2}, bloodwood: {par: 4, dist: 353, si: 2}, ironbark: {par: 4, dist: 320, si: 2}, flooded_gums: {par: 4, dist: 275, si: 2}},
            2:  {tallowwood: {par: 4, dist: 332, si: 12}, bloodwood: {par: 4, dist: 308, si: 12}, ironbark: {par: 4, dist: 252, si: 12}, flooded_gums: {par: 4, dist: 244, si: 12}},
            3:  {tallowwood: {par: 3, dist: 182, si: 8}, bloodwood: {par: 3, dist: 170, si: 8}, ironbark: {par: 3, dist: 122, si: 8}, flooded_gums: {par: 3, dist: 114, si: 8}},
            4:  {tallowwood: {par: 5, dist: 481, si: 14}, bloodwood: {par: 5, dist: 465, si: 14}, ironbark: {par: 5, dist: 428, si: 14}, flooded_gums: {par: 5, dist: 366, si: 14}},
            5:  {tallowwood: {par: 3, dist: 147, si: 16}, bloodwood: {par: 3, dist: 139, si: 16}, ironbark: {par: 3, dist: 130, si: 16}, flooded_gums: {par: 3, dist: 125, si: 16}},
            6:  {tallowwood: {par: 4, dist: 335, si: 6}, bloodwood: {par: 4, dist: 328, si: 6}, ironbark: {par: 4, dist: 261, si: 6}, flooded_gums: {par: 4, dist: 251, si: 6}},
            7:  {tallowwood: {par: 5, dist: 465, si: 18}, bloodwood: {par: 5, dist: 453, si: 18}, ironbark: {par: 5, dist: 434, si: 18}, flooded_gums: {par: 5, dist: 424, si: 18}},
            8:  {tallowwood: {par: 3, dist: 177, si: 4}, bloodwood: {par: 3, dist: 158, si: 4}, ironbark: {par: 3, dist: 150, si: 4}, flooded_gums: {par: 3, dist: 126, si: 4}},
            9:  {tallowwood: {par: 4, dist: 320, si: 10}, bloodwood: {par: 4, dist: 304, si: 10}, ironbark: {par: 4, dist: 282, si: 10}, flooded_gums: {par: 4, dist: 274, si: 10}},
            10: {tallowwood: {par: 5, dist: 445, si: 13}, bloodwood: {par: 5, dist: 419, si: 13}, ironbark: {par: 5, dist: 398, si: 13}, flooded_gums: {par: 5, dist: 384, si: 13}},
            11: {tallowwood: {par: 3, dist: 164, si: 9}, bloodwood: {par: 3, dist: 150, si: 9}, ironbark: {par: 3, dist: 133, si: 9}, flooded_gums: {par: 3, dist: 109, si: 9}},
            12: {tallowwood: {par: 4, dist: 386, si: 1}, bloodwood: {par: 4, dist: 372, si: 1}, ironbark: {par: 4, dist: 350, si: 1}, flooded_gums: {par: 4, dist: 301, si: 1}},
            13: {tallowwood: {par: 4, dist: 367, si: 3}, bloodwood: {par: 4, dist: 346, si: 3}, ironbark: {par: 4, dist: 320, si: 3}, flooded_gums: {par: 4, dist: 311, si: 3}},
            14: {tallowwood: {par: 5, dist: 505, si: 15}, bloodwood: {par: 5, dist: 466, si: 15}, ironbark: {par: 5, dist: 442, si: 15}, flooded_gums: {par: 5, dist: 434, si: 15}},
            15: {tallowwood: {par: 4, dist: 356, si: 7}, bloodwood: {par: 4, dist: 326, si: 7}, ironbark: {par: 4, dist: 313, si: 7}, flooded_gums: {par: 4, dist: 271, si: 7}},
            16: {tallowwood: {par: 4, dist: 364, si: 5}, bloodwood: {par: 4, dist: 340, si: 5}, ironbark: {par: 4, dist: 337, si: 5}, flooded_gums: {par: 4, dist: 290, si: 5}},
            17: {tallowwood: {par: 3, dist: 138, si: 11}, bloodwood: {par: 3, dist: 131, si: 11}, ironbark: {par: 3, dist: 113, si: 11}, flooded_gums: {par: 3, dist: 100, si: 11}},
            18: {tallowwood: {par: 4, dist: 460, si: 17}, bloodwood: {par: 4, dist: 436, si: 17}, ironbark: {par: 4, dist: 420, si: 17}, flooded_gums: {par: 4, dist: 409, si: 17}}
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
        descriptions: {
            1:  "An inviting opening hole. A drive down the centre or right hand side will give you a clear shot to the large green guarded by a bunker short right. The green is fairly flat with a little rise on the back left corner.",
            2:  "A trickier hole than what may appear. Large green that is exposed to the wind so club selection here is important. There is a grassy hollow in the front of the green, which can make the green appear to be closer.",
            3:  "A tough dog leg to the left, the third hole requires an accurate tee shot to the middle or right side. There is a large fairway bunker protecting the right side off the tee so it is advisable to play short of this. This will leave you with a mid-iron into a relatively flat and unprotected green.",
            4:  "The longest hole on the golf course and rated one of the most difficult. The tee shot for long hitters may carry the fairway pot bunker, the shorter player must avoid this at all cost. Try to keep your drive and second shot down the left half, as this hole slightly dog-legs to the right. The third shot into the green is a tricky one as the green slopes heavily from back to front.",
            5:  "The 5th hole is an elevated and tricky tee shot, exposed to the wind, so club selection is key. Try not to miss the green to the left as is almost a certain bogey. The green is protected by two bunkers, with the green sloping back to front.",
            6:  "The 6th hole is a short and relatively open par 5. A solid drive down the centre or right side will set you up nicely. Avoid play down the left hand side and balls landing left of fairway will bounce hard left, leaving you with few options. For longer hitters, two good shots into this relatively unprotected green is possible.",
            7:  "A difficult and long par 3 guarded by left hand bunkers and a slope that runs away on the right. The green is fairly narrow and flat and any shot on the green here is a good result.",
            8:  "Try to stick to the middle of the fairway for your tee shot, avoiding the bunker down the left hand side. The second shot is uphill to a fairly blind pin so an extra club may be needed. The green is protected by a bunker on the right and a grass bunker left.",
            9:  "The 9th hole gives you options from the tee - long hitters may be able to reach the green on 1, or you may layup into position with a long iron or hybrid, falling short of the fairway bunker down the right. The approach to the green can be tricky as the green is protected by a large pot bunker on the left with the green sloping heavily from back to front, left to right.",
            10: "The beautiful city backdrop frames this medium length par 3. The two-tiered and narrow green provides a tough challenge whilst also being guarded by three on both sides. A mid iron played towards the centre of the green is the percentage play, as left and right are definitely bogey territory.",
            11: "From an elevated tee, a drive finishing down the right side of the fairway will give you a chance at a clear second shot up the fairway. Avoiding the perfectly placed fairway bunkers on the right hand side of the fairway is a must, leaving you a short iron in for your third.",
            12: "A short and interesting par 4, played from an elevated tee to a very narrow fairway that runs out of room for longer shots. Off the tee, the fairway is protected by a large bunker on the right hand side, with large trees protecting the left. The green has a massive tier protected by a bunker on the right.",
            13: "Long par 3 with a bunker guarding the right side of the green. This hole requires a confident tee shot into a partially blind pin position. The green is quite wide so play towards the middle will yield the best score.",
            14: "A nice par 4, winding slightly to left. Play is favoured towards the right hand side with your tee shot as a large tree may block any stray shots to the left. The green is protected by a large bunker on the left hand side with a large green heavily sloped front to back.",
            15: "An interesting par 3 heading north, with a large double green shared with the 17th hole. Aim for the flag but be mindful of wind direction off the tee.",
            16: "A short uphill par 5, reachable in two for the longer hitters. The perfect drive is down the left side opening up for the second shot to a narrow fairway protected by out-of-bounds left, trees and wastelands right. The green is inconveniently shaped to the right and protected by several large bunkers front and back.",
            17: "A drive right of the pine tree in the distance should leave you a short approach shot to the green. The green is protected by a bunker right and long left and will only come into play with a wild second shot. The green slopes slightly back to front and becomes quite narrow with back flag pin positions.",
            18: "Arguably the hardest hole on the course and one of Sydney's greatest finishing holes. A drive left of centre will leave you with the best chance of getting home in two, as the tall trees down the right will block out any chance of hitting this green in regulation. The green itself is possibly the toughest on the course, as the middle section hosts a buried elephant size mound, creating challenging pins and a tough putting test."
        },
        tips: {
            1:  "With your second shot, it is slightly uphill so maybe take one extra club and play for the centre of the green.",
            2:  "Balls landing on the front of the green are at risk of rolling off into the grassy hollow, so don't leave it short.",
            3:  "Leave the driver in the bag off the tee and be a hero with your second. Birdie is still possible with a nice second.",
            4:  "Similar to the first hole, your shot into the green is uphill so take the challenge and be aggressive... birdie is on here!",
            5:  "The 5th is the most picturesque hole on the course, so make sure you enjoy the views across the city before delivering a smooth swing off the tee to set you up for a 2!",
            6:  "The key to the 6th hole is a great tee shot, as this will give you options to either take on the green for your second, or set you up for a short pitch for your third.",
            7:  "Check the wind and pin location on this hole as a back flag will require one or two extra clubs. Definitely play conservatively here, a green in regulation is the percentage play.",
            8:  "A par is always a good score here so play for the middle of the green to avoid trouble left and right.",
            9:  "With your approach shot into the green, play a few metres left of the flag as the ball will kick to the right. This hole is definitely a birdie chance!",
            10: "The front third of the green is a no-no as the ball will run off the front. Definitely club yourself to shoot to the middle or back half of the green.",
            11: "Be cautious with your approach shot to the green, as anything long beyond the green makes for a tough one coming back.",
            12: "Leave the driver in the bag and opt for a long iron or hybrid from the tee. This will put into a scoring position as a short iron into the green will set you up for a par or birdie!",
            13: "The tee shot plays slightly uphill so make sure you grab the right club out of the bag and hit this tee shot with confidence.",
            14: "The 14th is definitely a birdie chance, with a confident drive down the centre of the fairway. Be aggressive with your second shot and try to leave the ball below the hole to give you the best chance to make the putt.",
            15: "Aim and shoot - the key to success of this hole is club selection.",
            16: "Smash it off the tee and set yourself up with a chance to take it on in two shots or position yourself for an easy chip up the green from the left side.",
            17: "The tee shot gives you options. If your game is on then driver is the play, otherwise a conservative placement from the tee with an iron or hybrid may also give you a great chance for a birdie.",
            18: "Tee shot = left side, left side, left side!"
        },
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
 * @param {string} [tees] - tee key (e.g. 'blue', 'tallowwood') for resolving SI
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
