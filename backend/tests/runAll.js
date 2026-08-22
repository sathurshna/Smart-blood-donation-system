require('dotenv').config();
const pool = require('../src/config/db');
const runAuthTests = require('./auth.test');
const runDonorTests = require('./donor.test');
const runHospitalTests = require('./hospital.test');
const runRequestTests = require('./request.test');
const runMatchingTests = require('./matching.test');
const runDonationTests = require('./donation.test');

async function runMasterTestSuite() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║        SMART BLOOD DONATION — FULL TEST SUITE         ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  const testSuites = [
    { name: 'Auth & Authorization API', runner: runAuthTests },
    { name: 'Donor Profile & Availability API', runner: runDonorTests },
    { name: 'Hospital Profile API', runner: runHospitalTests },
    { name: 'Blood Request & Lifecycle API', runner: runRequestTests },
    { name: 'Donor Matching & Proximity Scoring API', runner: runMatchingTests },
    { name: 'Donation Tracking (Accept / Complete History)', runner: runDonationTests },
  ];

  const results = [];
  let hasFailed = false;

  for (const suite of testSuites) {
    console.log(`\n========================================================`);
    console.log(`▶ Starting Suite: ${suite.name}`);
    console.log(`========================================================`);
    try {
      await suite.runner();
      results.push({ name: suite.name, status: 'PASSED' });
    } catch (err) {
      console.error(`\n❌ [FAILURE] Suite "${suite.name}" encountered an error:`, err);
      results.push({ name: suite.name, status: 'FAILED', error: err.message });
      hasFailed = true;
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                   TEST RESULTS SUMMARY                ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  results.forEach((r, idx) => {
    const symbol = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`  ${idx + 1}. ${symbol} ${r.name.padEnd(42)} [${r.status}]`);
  });

  console.log('\n---------------------------------------------------------');
  if (hasFailed) {
    console.error('❌ ONE OR MORE TEST SUITES FAILED.\n');
    await pool.end();
    process.exit(1);
  } else {
    console.log('🎉 ALL 6 INTEGRATION TEST SUITES PASSED CLEANLY!\n');
    await pool.end();
    process.exit(0);
  }
}

runMasterTestSuite();
