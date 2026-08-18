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

function calculateMatchScore({
  donorBloodGroup,
  recipientBloodGroup,
  available,
  lastDonationDate,
  distanceKm,
  urgency,
}) {
  let compatibilityScore = 0;
  let eligibilityScore = 0;
  let availabilityScore = 0;
  let proximityScore = 0;
  let urgencyScore = 0;

  // 1. Blood compatibility — 30 points
  const compatibleDonors =
    BLOOD_COMPATIBILITY_RECIPIENT[recipientBloodGroup] || [];

  if (compatibleDonors.includes(donorBloodGroup)) {
    compatibilityScore = 30;
  }

  // 2. Donation eligibility — 20 points
  let eligible = true;

  if (lastDonationDate) {
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();

    const differenceMs = today - lastDonation;
    const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

    if (differenceDays < MIN_DONATION_INTERVAL_DAYS) {
      eligible = false;
    }
  }

  if (eligible) {
    eligibilityScore = 20;
  }

  // 3. Availability — 20 points
  if (available === true) {
    availabilityScore = 20;
  }

  // 4. Proximity — 20 points
  if (distanceKm !== null) {
    if (distanceKm <= 5) {
      proximityScore = 20;
    } else if (distanceKm <= 10) {
      proximityScore = 15;
    } else if (distanceKm <= 25) {
      proximityScore = 10;
    } else if (distanceKm <= 50) {
      proximityScore = 5;
    }
  }

  // 5. Urgency — 10 points
  const urgencyScores = {
    critical: 10,
    high: 8,
    medium: 5,
    low: 2,
  };

  urgencyScore = urgencyScores[urgency] || 0;

  const score =
    compatibilityScore +
    eligibilityScore +
    availabilityScore +
    proximityScore +
    urgencyScore;

  return {
    score,
    breakdown: {
      compatibility: compatibilityScore,
      eligibility: eligibilityScore,
      availability: availabilityScore,
      proximity: proximityScore,
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