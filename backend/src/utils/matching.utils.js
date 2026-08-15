const BLOOD_COMPATIBILITY_RECIPIENT = {
  //if the patient has this blood type, which donor blood types can they receive?
  //RECIPIENT <- possible DONORS
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

const BLOOD_COMPATIBILITY_DONOR = {
  //If I am this blood type, which recipients can I donate to?
  //DONOR → possible RECIPIENTS
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

//The system uses 56 days as the minimum interval between whole-blood donations.
const MIN_DONATION_INTERVAL_DAYS = 56;

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @param {number|null} lat1 Latitude of point 1
 * @param {number|null} lon1 Longitude of point 1
 * @param {number|null} lat2 Latitude of point 2
 * @param {number|null} lon2 Longitude of point 2
 * @returns {number|null} Distance in kilometers rounded to 2 decimal places, or null if coordinates are missing
 */
//It calculates the distance between two locations.
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  //Converting values to numbers "6.921" -> 6.921
  const p1Lat = parseFloat(lat1);
  const p1Lon = parseFloat(lon1);
  const p2Lat = parseFloat(lat2);
  const p2Lon = parseFloat(lon2);

  //isNaN - Is this value Not a Number 
  //isNaN(6.9271) -> false
  if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) {
    return null;
  }

  //degrees → radians
  //JavaScript's trigonometric functions such as:
  // Math.sin()
  // Math.cos()
  // work with radians.
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in kilometers

  const dLat = toRad(p2Lat - p1Lat);
  const dLon = toRad(p2Lon - p1Lon);
  const rLat1 = toRad(p1Lat);
  const rLat2 = toRad(p2Lat);

  //The Haversine formula calculates the great-circle distance between two points on the Earth's surface using latitude and longitude.
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100;
}

/**
 * Match Score = compatibility + eligibility + availability + proximity + urgency
 * Total maximum score = 100 points
 *
 * @param {Object} params
 * @param {string} params.donorBloodGroup
 * @param {string} params.recipientBloodGroup
 * @param {boolean} params.available
 * @param {string|Date|null} params.lastDonationDate
 * @param {number|null} params.distanceKm
 * @param {string} params.urgency - 'critical' | 'high' | 'medium' | 'low'
 * @returns {{ score: number, breakdown: { compatibility: number, eligibility: number, availability: number, proximity: number, urgency: number } }}
 */
function calculateMatchScore({
  donorBloodGroup,
  recipientBloodGroup,
  available,
  lastDonationDate,
  distanceKm,
  urgency,
}) {
  // 1. Compatibility (max 30 pts): Exact blood type match = 30, compatible blood type = 25
  let compatibility = 0;
  const compatibleDonors = BLOOD_COMPATIBILITY_RECIPIENT[recipientBloodGroup] || [];
  if (donorBloodGroup === recipientBloodGroup) {
    compatibility = 30; // Exact match
  } else if (compatibleDonors.includes(donorBloodGroup)) {
    compatibility = 25; // Medically compatible
  }

  // 2. Eligibility (max 15 pts): Eligible if >= 56 days since last donation or never donated
  let eligibility = 0;
  if (!lastDonationDate) {
    eligibility = 15;
  } else {
    const lastDate = new Date(lastDonationDate);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays >= MIN_DONATION_INTERVAL_DAYS) {
      eligibility = 15;
    }
  }

  // 3. Availability (max 10 pts): Donor marked as active/available
  const availability = available ? 10 : 0;

  // 4. Proximity (max 25 pts): Higher score for closer donors, decaying over distance
  let proximity = 0;
  if (distanceKm !== null && distanceKm !== undefined && !isNaN(distanceKm)) {
    if (distanceKm <= 5) {
      proximity = 25;
    } else if (distanceKm <= 50) {
      proximity = Math.round((25 - ((distanceKm - 5) / 45) * 20) * 10) / 10;
    } else {
      proximity = 2; // > 50km
    }
  } else {
    proximity = 5; // Default when location is unknown
  }

  // 5. Urgency (max 20 pts): Higher urgency receives higher priority
  const urgencyScores = {
    critical: 20,
    high: 15,
    medium: 10,
    low: 5,
  };
  const urgencyScore = urgencyScores[urgency?.toLowerCase()] || 10;

  // Total Match Score = compatibility + eligibility + availability + proximity + urgency
  const totalScore = Math.round(
    compatibility + eligibility + availability + proximity + urgencyScore
  );

  return {
    score: totalScore,
    breakdown: {
      compatibility,
      eligibility,
      availability,
      proximity,
      urgency: urgencyScore,
    },
  };
}

//Other JavaScript files are allowed to use these things.
module.exports = {
  BLOOD_COMPATIBILITY_RECIPIENT,
  BLOOD_COMPATIBILITY_DONOR,
  MIN_DONATION_INTERVAL_DAYS,
  calculateDistanceKm,
  calculateMatchScore,
};
