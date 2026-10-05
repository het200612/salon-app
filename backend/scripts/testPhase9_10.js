/**
 * Automated Test Suite for Phase 9 (Polish & Validation) & Phase 10 (Deployment Prep)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      if (typeof postData === 'object' && !Buffer.isBuffer(postData)) {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Phase 9 & Phase 10 Automated Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Register & Login User
    console.log('1. Authentication Validations & User Token');
    const dynamicEmail = `phase9_user_${Date.now()}@example.com`;
    const regRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: 'Phase9 User',
      userName: `p9_${Date.now().toString().slice(-6)}`,
      email: dynamicEmail,
      phoneNumber: '9876543210',
      password: 'Password@123',
      usertype: 'User',
    });
    assert(regRes.status === 201, 'User registered successfully for validation tests');

    const userLoginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: dynamicEmail,
      password: 'Password@123',
    });
    assert(userLoginRes.status === 200 && userLoginRes.body.token, 'User logs in successfully with valid token');
    const userToken = userLoginRes.body.token;

    // 2. Verify Owner Login
    console.log('\n2. Owner Login & Token');
    const ownerLoginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, {
      email: 'rajesh@example.com',
      password: 'Owner@123',
    });
    assert(ownerLoginRes.status === 200 && ownerLoginRes.body.token, 'Verified owner rajesh@example.com logs in successfully');
    const ownerToken = ownerLoginRes.body.token;

    // 3. Validation: Booking appointment with date in the past
    console.log('\n3. Phase 9 Validation: Booking Date Past Check');
    const pastBookingRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    }, {
      salonId: 1,
      date: '2020-01-01',
      timeSlot: '10:00 AM - 11:00 AM',
      serviceId: 1,
    });
    assert(
      pastBookingRes.status === 400 && pastBookingRes.body.message.includes('past'),
      `Rejects appointment date in the past with 400: "${pastBookingRes.body.message}"`
    );

    // 4. Validation: Change Password old === new check
    console.log('\n4. Phase 9 Validation: Change Password old === new check');
    const samePasswordRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/change-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    }, {
      currentPassword: 'Password@123',
      newPassword: 'Password@123',
    });
    assert(
      samePasswordRes.status === 400 && samePasswordRes.body.message.includes('cannot be the same'),
      `Rejects changing to same password with 400: "${samePasswordRes.body.message}"`
    );

    // 5. Validation: Time validation (OpenTime >= CloseTime)
    console.log('\n5. Phase 9 Validation: Salon OpenTime >= CloseTime');
    const invalidTimeSalonRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/owner/salon/1',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
    }, {
      name: 'Elite Salon & Spa',
      location: 'Near Iscon Cross Road',
      cityId: 1,
      areaId: 1,
      openTime: '18:00:00',
      closeTime: '09:00:00',
      numberOfSeats: 4,
      type: 'Unisex',
    });
    assert(
      invalidTimeSalonRes.status === 400 && invalidTimeSalonRes.body.message.includes('Closing time must be after opening time'),
      `Rejects invalid opening/closing time with 400: "${invalidTimeSalonRes.body.message}"`
    );

    // 6. Validation: Salon seats <= 0
    console.log('\n6. Phase 9 Validation: Salon seats <= 0');
    const zeroSeatsSalonRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/owner/salon/1',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
    }, {
      name: 'Elite Salon & Spa',
      location: 'Near Iscon Cross Road',
      cityId: 1,
      areaId: 1,
      openTime: '09:00:00',
      closeTime: '20:00:00',
      numberOfSeats: 0,
      type: 'Unisex',
    });
    assert(
      zeroSeatsSalonRes.status === 400 && zeroSeatsSalonRes.body.message.includes('positive integer'),
      `Rejects 0 seats with 400: "${zeroSeatsSalonRes.body.message}"`
    );

    // 7. City-based cascading filter on /api/areas
    console.log('\n7. City-Based Data Filtering: /api/areas?cityId=1');
    const areasRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/areas?cityId=1',
      method: 'GET',
    });
    const allMatchCity = Array.isArray(areasRes.body) && areasRes.body.every(a => Number(a.CityName_id) === 1);
    assert(
      areasRes.status === 200 && allMatchCity && areasRes.body.length > 0,
      `Filters areas strictly by CityId=1 (${areasRes.body.length} areas found, all match cityId 1)`
    );

    // 8. City-based cascading filter on /api/salons
    console.log('\n8. City-Based Data Filtering: /api/salons?cityId=1');
    const salonsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/salons?cityId=1',
      method: 'GET',
    });
    const allSalonsMatchCity = Array.isArray(salonsRes.body) && salonsRes.body.every(s => Number(s.City_id) === 1);
    assert(
      salonsRes.status === 200 && allSalonsMatchCity,
      `Filters salons strictly by CityId=1 (${salonsRes.body.length} salons found, all match cityId 1)`
    );

    // 9. Static file upload serving and default.jpg
    console.log('\n9. Phase 10 Asset & Environment Check');
    const defaultJpgPath = path.join(__dirname, '..', 'uploads', 'default.jpg');
    assert(fs.existsSync(defaultJpgPath), 'backend/uploads/default.jpg exists on disk');

    const gitkeepPath = path.join(__dirname, '..', 'uploads', '.gitkeep');
    assert(fs.existsSync(gitkeepPath), 'backend/uploads/.gitkeep exists on disk');

    const envExamplePath = path.join(__dirname, '..', '.env.example');
    assert(fs.existsSync(envExamplePath), 'backend/.env.example exists on disk');

    // 10. Check default.jpg static HTTP serving
    const staticRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/uploads/default.jpg',
      method: 'GET',
    });
    assert(
      staticRes.status === 200,
      `Static serving /uploads/default.jpg returns HTTP 200`
    );

    console.log('\n========================================');
    console.log(`Phase 9 & 10 Verification: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test suite failed with unexpected error:', err);
    process.exit(1);
  }
}

runTests();
