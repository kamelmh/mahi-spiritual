/**
 * Vedic Compatibility Calculator (Ashtakoot Matching)
 * Nakshatra-based compatibility for two people
 * 
 * Calculates 8 factors (Ashtakoot) for marriage compatibility
 * based on Vedic astrology principles.
 */

(function() {
    'use strict';

    // 27 Nakshatras with properties
    const NAKSHATRAS = [
        { name: 'Ashwini', lord: 'Ketu', deity: 'Ashwini Kumaras', yoni: 'Horse', gana: 'Deva', nadi: 'Adia', varna: 'Kshatriya', start: 0, end: 13.33 },
        { name: 'Bharani', lord: 'Venus', deity: 'Yama', yoni: 'Elephant', gana: 'Human', nadi: 'Adia', varna: 'Brahmin', start: 13.33, end: 26.67 },
        { name: 'Krittika', lord: 'Sun', deity: 'Agni', yoni: 'Sheep', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Brahmin', start: 26.67, end: 40 },
        { name: 'Rohini', lord: 'Moon', deity: 'Brahma', yoni: 'Serpent', gana: 'Human', nadi: 'Madhya', varna: 'Shudra', start: 40, end: 53.33 },
        { name: 'Mrigashira', lord: 'Mars', deity: 'Soma', yoni: 'Serpent', gana: 'Deva', nadi: 'Antya', varna: 'Vaishya', start: 53.33, end: 66.67 },
        { name: 'Ardra', lord: 'Rahu', deity: 'Rudra', yoni: 'Dog', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', start: 66.67, end: 80 },
        { name: 'Punarvasu', lord: 'Jupiter', deity: 'Aditi', yoni: 'Cat', gana: 'Deva', nadi: 'Adia', varna: 'Brahmin', start: 80, end: 93.33 },
        { name: 'Pushya', lord: 'Saturn', deity: 'Brihaspati', yoni: 'Sheep', gana: 'Deva', nadi: 'Adia', varna: 'Kshatriya', start: 93.33, end: 106.67 },
        { name: 'Ashlesha', lord: 'Mercury', deity: 'Naga', yoni: 'Cat', gana: 'Rakshasa', nadi: 'Adia', varna: 'Brahmin', start: 106.67, end: 120 },
        { name: 'Magha', lord: 'Ketu', deity: 'Pitrs', yoni: 'Rat', gana: 'Rakshasa', nadi: 'Adia', varna: 'Shudra', start: 120, end: 133.33 },
        { name: 'Purva Phalguni', lord: 'Venus', deity: 'Bhaga', yoni: 'Rat', gana: 'Manushya', nadi: 'Adia', varna: 'Brahmin', start: 133.33, end: 146.67 },
        { name: 'Uttara Phalguni', lord: 'Sun', deity: 'Aryaman', yoni: 'Cow', gana: 'Manushya', nadi: 'Adia', varna: 'Kshatriya', start: 146.67, end: 160 },
        { name: 'Hasta', lord: 'Moon', deity: 'Savitar', yoni: 'Buffalo', gana: 'Deva', nadi: 'Madhya', varna: 'Brahmin', start: 160, end: 173.33 },
        { name: 'Chitra', lord: 'Mars', deity: 'Vishvakarma', yoni: 'Tiger', gana: 'Rakshasa', nadi: 'Madhya', varna: 'Kshatriya', start: 173.33, end: 186.67 },
        { name: 'Swati', lord: 'Rahu', deity: 'Vayu', yoni: 'Buffalo', gana: 'Deva', nadi: 'Madhya', varna: 'Vaishya', start: 186.67, end: 200 },
        { name: 'Vishakha', lord: 'Jupiter', deity: 'Indra-Agni', yoni: 'Tiger', gana: 'Manushya', nadi: 'Madhya', varna: 'Brahmin', start: 200, end: 213.33 },
        { name: 'Anuradha', lord: 'Saturn', deity: 'Mitra', yoni: 'Hare', gana: 'Deva', nadi: 'Antya', varna: 'Kshatriya', start: 213.33, end: 226.67 },
        { name: 'Jyeshtha', lord: 'Mercury', deity: 'Indra', yoni: 'Hare', gana: 'Rakshasa', nadi: 'Antya', varna: 'Kshatriya', start: 226.67, end: 240 },
        { name: 'Mula', lord: 'Ketu', deity: 'Nirrti', yoni: 'Dog', gana: 'Rakshasa', nadi: 'Antya', varna: 'Vaishya', start: 240, end: 253.33 },
        { name: 'Purva Ashadha', lord: 'Venus', deity: 'Apas', yoni: 'Monkey', gana: 'Manushya', nadi: 'Antya', varna: 'Brahmin', start: 253.33, end: 266.67 },
        { name: 'Uttara Ashadha', lord: 'Sun', deity: 'Vishvadevas', yoni: 'Monkey', gana: 'Manushya', nadi: 'Antya', varna: 'Kshatriya', start: 266.67, end: 280 },
        { name: 'Shravana', lord: 'Moon', deity: 'Vishnu', yoni: 'Monkey', gana: 'Deva', nadi: 'Antya', varna: 'Brahmin', start: 280, end: 293.33 },
        { name: 'Dhanishtha', lord: 'Mars', deity: 'Vasus', yoni: 'Lion', gana: 'Rakshasa', nadi: 'Antya', varna: 'Kshatriya', start: 293.33, end: 306.67 },
        { name: 'Shatabhisha', lord: 'Rahu', deity: 'Varuna', yoni: 'Horse', gana: 'Rakshasa', nadi: 'Antya', varna: 'Kshatriya', start: 306.67, end: 320 },
        { name: 'Purva Bhadrapada', lord: 'Jupiter', deity: 'Aja Ekapada', yoni: 'Lion', gana: 'Manushya', nadi: 'Adia', varna: 'Kshatriya', start: 320, end: 333.33 },
        { name: 'Uttara Bhadrapada', lord: 'Saturn', deity: 'Ahir Budhnya', yoni: 'Cow', gana: 'Manushya', nadi: 'Adia', varna: 'Kshatriya', start: 333.33, end: 346.67 },
        { name: 'Revati', lord: 'Mercury', deity: 'Pushan', yoni: 'Elephant', gana: 'Deva', nadi: 'Adia', varna: 'Brahmin', start: 346.67, end: 360 }
    ];

    // Yoni compatibility scores (Male, Female)
    // Higher score = better compatibility
    const YONI_SCORES = {
        'Horse-Horse': 0, 'Horse-Elephant': 3, 'Horse-Sheep': 4, 'Horse-Serpent': 2,
        'Horse-Dog': 0, 'Horse-Cat': 0, 'Horse-Rat': 0, 'Horse-Cow': 1,
        'Horse-Buffalo': 0, 'Horse-Tiger': 2, 'Horse-Hare': 0, 'Horse-Monkey': 0,
        'Horse-Lion': 1,
        'Elephant-Horse': 2, 'Elephant-Elephant': 0, 'Elephant-Sheep': 0, 'Elephant-Serpent': 0,
        'Elephant-Dog': 0, 'Elephant-Cat': 0, 'Elephant-Rat': 1, 'Elephant-Cow': 4,
        'Elephant-Buffalo': 3, 'Elephant-Tiger': 0, 'Elephant-Hare': 0, 'Elephant-Monkey': 0,
        'Elephant-Lion': 0,
        'Sheep-Horse': 3, 'Sheep-Elephant': 0, 'Sheep-Sheep': 0, 'Sheep-Serpent': 0,
        'Sheep-Dog': 4, 'Sheep-Cat': 2, 'Sheep-Rat': 2, 'Sheep-Cow': 1,
        'Sheep-Buffalo': 0, 'Sheep-Tiger': 1, 'Sheep-Hare': 1, 'Sheep-Monkey': 3,
        'Sheep-Lion': 2,
        'Serpent-Horse': 4, 'Serpent-Elephant': 1, 'Serpent-Sheep': 2, 'Serpent-Serpent': 0,
        'Serpent-Dog': 1, 'Serpent-Cat': 3, 'Serpent-Rat': 4, 'Serpent-Cow': 0,
        'Serpent-Buffalo': 0, 'Serpent-Tiger': 0, 'Serpent-Hare': 2, 'Serpent-Monkey': 2,
        'Serpent-Lion': 1,
        'Dog-Horse': 0, 'Dog-Elephant': 0, 'Dog-Sheep': 4, 'Dog-Serpent': 1,
        'Dog-Dog': 0, 'Dog-Cat': 0, 'Dog-Rat': 1, 'Dog-Cow': 0,
        'Dog-Buffalo': 2, 'Dog-Tiger': 4, 'Dog-Hare': 1, 'Dog-Monkey': 0,
        'Dog-Lion': 3,
        'Cat-Horse': 2, 'Cat-Elephant': 0, 'Cat-Sheep': 2, 'Cat-Serpent': 2,
        'Cat-Dog': 0, 'Cat-Cat': 0, 'Cat-Rat': 0, 'Cat-Cow': 0,
        'Cat-Buffalo': 0, 'Cat-Tiger': 1, 'Cat-Hare': 0, 'Cat-Monkey': 2,
        'Cat-Lion': 4,
        'Rat-Horse': 1, 'Rat-Elephant': 1, 'Rat-Sheep': 2, 'Rat-Serpent': 2,
        'Rat-Dog': 1, 'Rat-Cat': 0, 'Rat-Rat': 0, 'Rat-Cow': 0,
        'Rat-Buffalo': 2, 'Rat-Tiger': 2, 'Rat-Hare': 2, 'Rat-Monkey': 4,
        'Rat-Lion': 0,
        'Cow-Horse': 0, 'Cow-Elephant': 4, 'Cow-Sheep': 0, 'Cow-Serpent': 0,
        'Cow-Dog': 1, 'Cow-Cat': 0, 'Cow-Rat': 0, 'Cow-Cow': 0,
        'Cow-Buffalo': 2, 'Cow-Tiger': 0, 'Cow-Hare': 0, 'Cow-Monkey': 3,
        'Cow-Lion': 0,
        'Buffalo-Horse': 0, 'Buffalo-Elephant': 3, 'Buffalo-Sheep': 1, 'Buffalo-Serpent': 0,
        'Buffalo-Dog': 2, 'Buffalo-Cat': 0, 'Buffalo-Rat': 2, 'Buffalo-Cow': 2,
        'Buffalo-Buffalo': 0, 'Buffalo-Tiger': 0, 'Buffalo-Hare': 1, 'Buffalo-Monkey': 2,
        'Buffalo-Lion': 0,
        'Tiger-Horse': 1, 'Tiger-Elephant': 0, 'Tiger-Sheep': 1, 'Tiger-Serpent': 0,
        'Tiger-Dog': 3, 'Tiger-Cat': 1, 'Tiger-Rat': 2, 'Tiger-Cow': 0,
        'Tiger-Buffalo': 0, 'Tiger-Tiger': 0, 'Tiger-Hare': 0, 'Tiger-Monkey': 0,
        'Tiger-Lion': 1,
        'Hare-Horse': 0, 'Hare-Elephant': 1, 'Hare-Sheep': 1, 'Hare-Serpent': 2,
        'Hare-Dog': 1, 'Hare-Cat': 2, 'Hare-Rat': 2, 'Hare-Cow': 1,
        'Hare-Buffalo': 1, 'Hare-Tiger': 0, 'Hare-Hare': 0, 'Hare-Monkey': 2,
        'Hare-Lion': 0,
        'Monkey-Horse': 1, 'Monkey-Elephant': 0, 'Monkey-Sheep': 2, 'Monkey-Serpent': 2,
        'Monkey-Dog': 0, 'Monkey-Cat': 2, 'Monkey-Rat': 4, 'Monkey-Cow': 3,
        'Monkey-Buffalo': 2, 'Monkey-Tiger': 0, 'Monkey-Hare': 2, 'Monkey-Monkey': 0,
        'Monkey-Lion': 0,
        'Lion-Horse': 1, 'Lion-Elephant': 0, 'Lion-Sheep': 2, 'Lion-Serpent': 1,
        'Lion-Dog': 3, 'Lion-Cat': 4, 'Lion-Rat': 0, 'Lion-Cow': 0,
        'Lion-Buffalo': 0, 'Lion-Tiger': 1, 'Lion-Hare': 0, 'Lion-Monkey': 0,
        'Lion-Lion': 0
    };

    // Gana compatibility scores
    const GANA_SCORES = {
        'Deva-Deva': 6, 'Deva-Human': 5, 'Deva-Rakshasa': 1,
        'Human-Deva': 6, 'Human-Human': 5, 'Human-Rakshasa': 2,
        'Rakshasa-Deva': 1, 'Rakshasa-Human': 2, 'Rakshasa-Rakshasa': 6
    };

    // Nadi compatibility scores
    const NADI_SCORES = {
        'Adia-Adia': 0, 'Adia-Madhya': 8, 'Adia-Antya': 8,
        'Madhya-Adia': 8, 'Madhya-Madhya': 0, 'Madhya-Antya': 8,
        'Antya-Adia': 8, 'Antya-Madhya': 8, 'Antya-Antya': 0
    };

    // Varna scores
    const VARNA_SCORES = {
        'Brahmin-Brahmin': 1, 'Brahmin-Kshatriya': 1, 'Brahmin-Vaishya': 1, 'Brahmin-Shudra': 0,
        'Kshatriya-Brahmin': 0, 'Kshatriya-Kshatriya': 1, 'Kshatriya-Vaishya': 1, 'Kshatriya-Shudra': 0,
        'Vaishya-Brahmin': 0, 'Vaishya-Kshatriya': 0, 'Vaishya-Vaishya': 1, 'Vaishya-Shudra': 1,
        'Shudra-Brahmin': 0, 'Shudra-Kshatriya': 0, 'Shudra-Vaishya': 0, 'Shudra-Shudra': 1
    };

    // Vashya scores (by nakshatra)
    const VASHYA_TABLE = [
        [2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 1, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [2, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [2, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 1, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2]
    ];

    // Tara scores (by distance)
    function calculateTaraScore(nakA, nakB) {
        const distance = Math.abs(nakA - nakB);
        const remainder = distance % 9;
        const scoreMap = {
            0: 3, 1: 0, 2: 2, 3: 3, 4: 1, 5: 2, 6: 1, 7: 3, 8: 2
        };
        return scoreMap[remainder] || 0;
    }

    // Graha Maitri scores (by planetary lords)
    const GRAHA_MAITRI_TABLE = {
        'Sun-Sun': 5, 'Sun-Moon': 5, 'Sun-Mars': 4, 'Sun-Mercury': 3, 'Sun-Jupiter': 5, 'Sun-Venus': 0, 'Sun-Saturn': 0, 'Sun-Rahu': 2, 'Sun-Ketu': 2,
        'Moon-Sun': 5, 'Moon-Moon': 5, 'Moon-Mars': 4, 'Moon-Mercury': 3, 'Moon-Jupiter': 5, 'Moon-Venus': 0, 'Moon-Saturn': 0, 'Moon-Rahu': 2, 'Moon-Ketu': 2,
        'Mars-Sun': 4, 'Mars-Moon': 4, 'Mars-Mars': 5, 'Mars-Mercury': 3, 'Mars-Jupiter': 4, 'Mars-Venus': 2, 'Mars-Saturn': 0, 'Mars-Rahu': 0, 'Mars-Ketu': 0,
        'Mercury-Sun': 3, 'Mercury-Moon': 3, 'Mercury-Mars': 3, 'Mercury-Mercury': 5, 'Mercury-Jupiter': 2, 'Mercury-Venus': 5, 'Mercury-Saturn': 3, 'Mercury-Rahu': 0, 'Mercury-Ketu': 0,
        'Jupiter-Sun': 5, 'Jupiter-Moon': 5, 'Jupiter-Mars': 4, 'Jupiter-Mercury': 2, 'Jupiter-Jupiter': 5, 'Jupiter-Venus': 0, 'Jupiter-Saturn': 2, 'Jupiter-Rahu': 0, 'Jupiter-Ketu': 0,
        'Venus-Sun': 0, 'Venus-Moon': 0, 'Venus-Mars': 2, 'Venus-Mercury': 5, 'Venus-Jupiter': 0, 'Venus-Venus': 5, 'Venus-Saturn': 3, 'Venus-Rahu': 0, 'Venus-Ketu': 0,
        'Saturn-Sun': 0, 'Saturn-Moon': 0, 'Saturn-Mars': 0, 'Saturn-Mercury': 3, 'Saturn-Jupiter': 2, 'Saturn-Venus': 3, 'Saturn-Saturn': 5, 'Saturn-Rahu': 2, 'Saturn-Ketu': 2,
        'Rahu-Sun': 2, 'Rahu-Moon': 2, 'Rahu-Mars': 0, 'Rahu-Mercury': 0, 'Rahu-Jupiter': 0, 'Rahu-Venus': 0, 'Rahu-Saturn': 2, 'Rahu-Rahu': 5, 'Rahu-Ketu': 5,
        'Ketu-Sun': 2, 'Ketu-Moon': 2, 'Ketu-Mars': 0, 'Ketu-Mercury': 0, 'Ketu-Jupiter': 0, 'Ketu-Venus': 0, 'Ketu-Saturn': 2, 'Ketu-Rahu': 5, 'Ketu-Ketu': 5
    };

    // Manglik Dosha nakshatras
    const MANGLIK_NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

    // Recommendations by score range
    const RECOMMENDATIONS = {
        excellent: {
            range: '25-36',
            text: 'Excellent match! This pairing shows strong compatibility across all major life aspects. The nakshatras indicate deep spiritual, emotional, and practical harmony. This union is blessed with natural understanding and support.',
            advice: 'Proceed with confidence. This is a highly auspicious match that will bring happiness and prosperity to both partners.'
        },
        good: {
            range: '18-24',
            text: 'Good match with minor areas of adjustment. While not perfect in all aspects, this pairing shows strong potential for a happy and lasting relationship. Communication and mutual respect can bridge any gaps.',
            advice: 'Focus on open communication and understanding. With effort, this can develop into a deeply fulfilling relationship.'
        },
        average: {
            range: '12-17',
            text: 'Average match requiring conscious effort from both partners. There are areas of compatibility but also potential challenges that need to be addressed. Success depends on willingness to work together.',
            advice: 'Consider consulting a Vedic astrologer for personalized remedies. Focus on building trust and understanding through patience.'
        },
        challenging: {
            range: '0-11',
            text: 'Challenging match with significant compatibility issues. This pairing may face obstacles in emotional, spiritual, and practical aspects. However, with proper remedies and dedication, challenges can be overcome.',
            advice: 'Seriously consider whether this match is right for both parties. If proceeding, seek guidance from a qualified Vedic astrologer for remedies and mantras.'
        }
    };

    /**
     * Get nakshatra by index (0-26)
     */
    function getNakshatra(index) {
        if (index < 0 || index >= NAKSHATRAS.length) return null;
        return NAKSHATRAS[index];
    }

    /**
     * Get nakshatra by name (case-insensitive)
     */
    function getNakshatraByName(name) {
        if (!name || typeof name !== 'string') return null;
        const normalizedName = name.trim().toLowerCase();
        return NAKSHATRAS.find(n => n.name.toLowerCase() === normalizedName);
    }

    /**
     * Get nakshatra index by name
     */
    function getNakshatraIndex(name) {
        if (!name || typeof name !== 'string') return -1;
        const normalizedName = name.trim().toLowerCase();
        return NAKSHATRAS.findIndex(n => n.name.toLowerCase() === normalizedName);
    }

    /**
     * Calculate Varna score (1 point max)
     */
    function calculateVarna(nakA, nakB) {
        const key = `${nakA.varna}-${nakB.varna}`;
        return VARNA_SCORES[key] || 0;
    }

    /**
     * Calculate Vashya score (2 points max)
     */
    function calculateVashya(indexA, indexB) {
        return VASHYA_TABLE[indexA][indexB] || 0;
    }

    /**
     * Calculate Tara score (3 points max)
     */
    function calculateTara(indexA, indexB) {
        return calculateTaraScore(indexA, indexB);
    }

    /**
     * Calculate Yoni score (4 points max)
     */
    function calculateYoni(nakA, nakB) {
        const key = `${nakA.yoni}-${nakB.yoni}`;
        return YONI_SCORES[key] || 0;
    }

    /**
     * Calculate Graha Maitri score (5 points max)
     */
    function calculateGrahaMaitri(nakA, nakB) {
        const key = `${nakA.lord}-${nakB.lord}`;
        return GRAHA_MAITRI_TABLE[key] || 0;
    }

    /**
     * Calculate Gana score (6 points max)
     */
    function calculateGana(nakA, nakB) {
        const key = `${nakA.gana}-${nakB.gana}`;
        return GANA_SCORES[key] || 0;
    }

    /**
     * Calculate Bhakoot score (7 points max)
     * Based on distance between nakshatras
     */
    function calculateBhakoot(indexA, indexB) {
        const distance = (indexA - indexB + 27) % 27;
        if (distance === 0 || distance === 1 || distance === 3 || distance === 4) return 7;
        if (distance === 2) return 6;
        if (distance === 6 || distance === 11) return 0;
        return 4;
    }

    /**
     * Calculate Nadi score (8 points max)
     */
    function calculateNadi(nakA, nakB) {
        const key = `${nakA.nadi}-${nakB.nadi}`;
        return NADI_SCORES[key] || 0;
    }

    /**
     * Check Manglik Dosha for a nakshatra
     */
    function hasManglikDosha(nakshatraName) {
        if (!nakshatraName) return false;
        const nak = getNakshatraByName(nakshatraName);
        if (!nak) return false;
        return MANGLIK_NAKSHATRAS.includes(nak.name);
    }

    /**
     * Get recommendation based on total score
     */
    function getRecommendation(score) {
        if (score >= 25) return RECOMMENDATIONS.excellent;
        if (score >= 18) return RECOMMENDATIONS.good;
        if (score >= 12) return RECOMMENDATIONS.average;
        return RECOMMENDATIONS.challenging;
    }

    /**
     * Calculate full Ashtakoot compatibility
     * @param {string} nameA - Name of person A's nakshatra
     * @param {string} nameB - Name of person B's nakshatra
     * @returns {Object} Full compatibility result
     */
    function calculate(nameA, nameB) {
        const nakA = getNakshatraByName(nameA);
        const nakB = getNakshatraByName(nameB);

        if (!nakA || !nakB) {
            return {
                error: true,
                message: `Invalid nakshatra(s): ${!nakA ? nameA : ''} ${!nakB ? nameB : ''}`,
                details: {
                    personA: nakA ? nakA.name : null,
                    personB: nakB ? nakB.name : null
                }
            };
        }

        const indexA = getNakshatraIndex(nameA);
        const indexB = getNakshatraIndex(nameB);

        const factors = {
            varna: calculateVarna(nakA, nakB),
            vashya: calculateVashya(indexA, indexB),
            tara: calculateTara(indexA, indexB),
            yoni: calculateYoni(nakA, nakB),
            grahaMaitri: calculateGrahaMaitri(nakA, nakB),
            gana: calculateGana(nakA, nakB),
            bhakoot: calculateBhakoot(indexA, indexB),
            nadi: calculateNadi(nakA, nakB)
        };

        const maxScores = {
            varna: 1,
            vashya: 2,
            tara: 3,
            yoni: 4,
            grahaMaitri: 5,
            gana: 6,
            bhakoot: 7,
            nadi: 8
        };

        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);
        const maxTotal = Object.values(maxScores).reduce((sum, val) => sum + val, 0);

        const manglikA = hasManglikDosha(nameA);
        const manglikB = hasManglikDosha(nameB);
        const manglikMatch = manglikA === manglikB;

        const recommendation = getRecommendation(totalScore);

        const result = {
            error: false,
            timestamp: new Date().toISOString(),
            personA: {
                name: nakA.name,
                index: indexA,
                lord: nakA.lord,
                deity: nakA.deity,
                yoni: nakA.yoni,
                gana: nakA.gana,
                nadi: nakA.nadi,
                varna: nakA.varna,
                manglik: manglikA
            },
            personB: {
                name: nakB.name,
                index: indexB,
                lord: nakB.lord,
                deity: nakB.device,
                yoni: nakB.yoni,
                gana: nakB.gana,
                nadi: nakB.nadi,
                varna: nakB.varna,
                manglik: manglikB
            },
            factors: {
                varna: {
                    score: factors.varna,
                    max: maxScores.varna,
                    name: 'Varna',
                    description: 'Spiritual compatibility'
                },
                vashya: {
                    score: factors.vashya,
                    max: maxScores.vashya,
                    name: 'Vashya',
                    description: 'Mutual attraction'
                },
                tara: {
                    score: factors.tara,
                    max: maxScores.tara,
                    name: 'Tara',
                    description: 'Emotional compatibility'
                },
                yoni: {
                    score: factors.yoni,
                    max: maxScores.yoni,
                    name: 'Yoni',
                    description: 'Physical compatibility'
                },
                grahaMaitri: {
                    score: factors.grahaMaitri,
                    max: maxScores.grahaMaitri,
                    name: 'Graha Maitri',
                    description: 'Mental compatibility'
                },
                gana: {
                    score: factors.gana,
                    max: maxScores.gana,
                    name: 'Gana',
                    description: 'Temperament matching'
                },
                bhakoot: {
                    score: factors.bhakoot,
                    max: maxScores.bhakoot,
                    name: 'Bhakoot',
                    description: 'Love & family'
                },
                nadi: {
                    score: factors.nadi,
                    max: maxScores.nadi,
                    name: 'Nadi',
                    description: 'Health & genetics'
                }
            },
            totalScore: totalScore,
            maxScore: maxTotal,
            percentage: Math.round((totalScore / maxTotal) * 100),
            manglik: {
                personA: manglikA,
                personB: manglikB,
                match: manglikMatch,
                warning: !manglikMatch ? 'Manglik mismatch detected. Consider remedies.' : null
            },
            recommendation: recommendation
        };

        // Store in localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('vedicCompatResults') || '[]');
            stored.push(result);
            if (stored.length > 50) stored.shift();
            localStorage.setItem('vedicCompatResults', JSON.stringify(stored));
        } catch (e) {
            console.warn('Could not store result in localStorage:', e);
        }

        return result;
    }

    /**
     * Get all nakshatras for dropdown population
     */
    function getNakshatras() {
        return NAKSHATRAS.map(n => ({ name: n.name, index: NAKSHATRAS.indexOf(n) }));
    }

    /**
     * Get stored results from localStorage
     */
    function getStoredResults() {
        try {
            return JSON.parse(localStorage.getItem('vedicCompatResults') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear stored results from localStorage
     */
    function clearStoredResults() {
        try {
            localStorage.removeItem('vedicCompatResults');
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Initialize the calculator and bind to DOM elements
     */
    function init() {
        const nakSelectA = document.getElementById('nakshatraA');
        const nakSelectB = document.getElementById('nakshatraB');
        const calculateBtn = document.getElementById('calculateCompat');
        const resultsDiv = document.getElementById('compatResults');

        // Populate nakshatra dropdowns
        if (nakSelectA && nakSelectB) {
            const nakshatras = getNakshatras();
            nakSelectA.innerHTML = '<option value="">Select Nakshatra</option>' +
                nakshatras.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
            nakSelectB.innerHTML = '<option value="">Select Nakshatra</option>' +
                nakshatras.map(n => `<option value="${n.name}">${n.name}</option>`).join('');
        }

        // Bind calculate button
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function() {
                const nameA = nakSelectA ? nakSelectA.value : '';
                const nameB = nakSelectB ? nakSelectB.value : '';

                if (!nameA || !nameB) {
                    if (resultsDiv) {
                        resultsDiv.innerHTML = '<div class="compat-error">Please select both nakshatras.</div>';
                    }
                    return;
                }

                const result = calculate(nameA, nameB);

                if (resultsDiv && !result.error) {
                    displayResults(resultsDiv, result);
                } else if (resultsDiv) {
                    resultsDiv.innerHTML = `<div class="compat-error">${result.message}</div>`;
                }
            });
        }

        // Bind clear button
        const clearBtn = document.getElementById('clearCompatResults');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                clearStoredResults();
                if (resultsDiv) {
                    resultsDiv.innerHTML = '<div class="compat-info">Results cleared.</div>';
                }
            });
        }

        // Load history button
        const historyBtn = document.getElementById('showCompatHistory');
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                const results = getStoredResults();
                if (resultsDiv) {
                    if (results.length === 0) {
                        resultsDiv.innerHTML = '<div class="compat-info">No previous results found.</div>';
                    } else {
                        const historyHtml = results.slice(-5).reverse().map(r =>
                            `<div class="compat-history-item">
                                <strong>${r.personA.name} & ${r.personB.name}</strong>: ${r.totalScore}/${r.maxScore} (${r.percentage}%)
                                <span class="compat-date">${new Date(r.timestamp).toLocaleDateString()}</span>
                            </div>`
                        ).join('');
                        resultsDiv.innerHTML = `<div class="compat-history"><h4>Recent Calculations</h4>${historyHtml}</div>`;
                    }
                }
            });
        }
    }

    /**
     * Display compatibility results in DOM
     */
    function displayResults(container, result) {
        let html = `
            <div class="compat-result">
                <div class="compat-header">
                    <h3>Ashtakoot Compatibility</h3>
                    <div class="compat-names">${result.personA.name} & ${result.personB.name}</div>
                    <div class="compat-score">
                        <span class="score-value">${result.totalScore}</span>
                        <span class="score-max">/ ${result.maxScore}</span>
                        <span class="score-percent">(${result.percentage}%)</span>
                    </div>
                </div>
                
                <div class="compat-category">${result.recommendation.range}: ${result.recommendation.text}</div>
                
                <div class="compat-factors">
                    <h4>Factor Breakdown</h4>`;

        Object.values(result.factors).forEach(factor => {
            const percentage = Math.round((factor.score / factor.max) * 100);
            const barClass = percentage >= 80 ? 'high' : percentage >= 50 ? 'medium' : 'low';
            html += `
                    <div class="compat-factor">
                        <div class="factor-name">${factor.name}</div>
                        <div class="factor-desc">${factor.description}</div>
                        <div class="factor-score">${factor.score}/${factor.max}</div>
                        <div class="factor-bar"><div class="factor-fill ${barClass}" style="width:${percentage}%"></div></div>
                    </div>`;
        });

        html += `
                </div>
                
                <div class="compat-manglik">
                    <h4>Manglik Dosha</h4>
                    <div class="manglik-status">
                        ${result.personA.name}: ${result.manglik.personA ? 'Yes' : 'No'} | 
                        ${result.personB.name}: ${result.manglik.personB ? 'Yes' : 'No'}
                    </div>`;

        if (result.manglik.warning) {
            html += `<div class="manglik-warning">${result.manglik.warning}</div>`;
        }

        html += `
                </div>
                
                <div class="compat-advice">
                    <h4>Recommendation</h4>
                    <p>${result.recommendation.advice}</p>
                </div>
            </div>`;

        container.innerHTML = html;
    }

    // Export public API
    window.VedicCompat = {
        init: init,
        calculate: calculate,
        getRecommendation: getRecommendation,
        getNakshatras: getNakshatras,
        getNakshatraByName: getNakshatraByName,
        hasManglikDosha: hasManglikDosha,
        getStoredResults: getStoredResults,
        clearStoredResults: clearStoredResults
    };

})();
