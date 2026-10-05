const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runPhase5Tests() {
  console.log('🧪 Starting Phase 5 End-to-End Automated Tests...\n');
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
    // 1. Check Salons API
    const salonsRes = await request('GET', '/api/salons');
    assert(salonsRes.status === 200 && Array.isArray(salonsRes.body), 'GET /api/salons returns active salons');

    const salon = salonsRes.body[0];
    const salonId = salon ? salon.id : 1;

    // 2. Check Areas API
    const areasRes = await request('GET', '/api/salons/areas');
    assert(areasRes.status === 200 && Array.isArray(areasRes.body), 'GET /api/salons/areas returns areas list');

    // 3. Check Salon Details
    const salonDetails = await request('GET', `/api/salons/${salonId}`);
    assert(
      salonDetails.status === 200 && salonDetails.body.salon && Array.isArray(salonDetails.body.services),
      'GET /api/salons/:id returns salon details, services, and gallery'
    );

    // 4. Check Salon Slots
    const slotsRes = await request('GET', `/api/salons/${salonId}/slots`);
    assert(
      slotsRes.status === 200 && Array.isArray(slotsRes.body.slots) && slotsRes.body.slots.length > 0,
      'GET /api/salons/:id/slots returns generated 1-hour time slots'
    );

    // 5. Register and Login a fresh customer
    const dynamicEmail = `customer_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Customer',
      userName: `cust_${Date.now().toString().slice(-6)}`,
      email: dynamicEmail,
      phoneNumber: '9876543210',
      password: 'Password@123',
      usertype: 'User',
    });
    assert(regRes.status === 201, 'User registration succeeds (201 Created)');

    const loginRes = await request('POST', '/api/auth/login', {
      email: dynamicEmail,
      password: 'Password@123',
      role: 'user',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'User login succeeds and returns JWT token');
    const userToken = loginRes.body.token;
    const authHeader = { Authorization: `Bearer ${userToken}` };

    // 6. Get User Profile
    const profileRes = await request('GET', '/api/user/profile', null, authHeader);
    assert(profileRes.status === 200 && profileRes.body.email === dynamicEmail, 'GET /api/user/profile returns user details');

    // 7. Update User Profile
    const updateProfileRes = await request(
      'PUT',
      '/api/user/profile',
      {
        name: 'Updated Customer',
        userName: profileRes.body.userName,
        email: dynamicEmail,
        phoneNumber: '9123456789',
      },
      authHeader
    );
    if (updateProfileRes.status !== 200) {
      console.log('    [DEBUG] updateProfile status/body:', updateProfileRes.status, updateProfileRes.body);
    }
    assert(updateProfileRes.status === 200 && updateProfileRes.body?.user?.name === 'Updated Customer', 'PUT /api/user/profile successfully updates user data');

    // 8. Create Appointment Booking
    const testSlot = slotsRes.body.slots[0] || '10:00 AM - 11:00 AM';
    const testService = slotsRes.body.services[0];
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

    const bookingPayload = {
      salonId: salonId,
      date: futureDate,
      timeSlot: testSlot,
      serviceId: testService ? testService.id : 1,
    };

    const bookRes = await request('POST', '/api/bookings', bookingPayload, authHeader);
    assert(bookRes.status === 201 && bookRes.body.bookingId, 'POST /api/bookings successfully creates appointment');
    const bookingId = bookRes.body.bookingId;

    // 9. Get User Bookings
    const userBookings = await request('GET', '/api/user/bookings', null, authHeader);
    assert(
      userBookings.status === 200 && Array.isArray(userBookings.body) && userBookings.body.some((b) => b.id === bookingId),
      'GET /api/user/bookings contains newly booked appointment'
    );

    // 10. Cancel Appointment (Future appointment > 3 hours away should succeed)
    const cancelRes = await request('PATCH', `/api/bookings/${bookingId}/cancel`, null, authHeader);
    assert(cancelRes.status === 200, 'PATCH /api/bookings/:id/cancel cancels future appointment');

    // 11. Change Password
    const changePassRes = await request(
      'POST',
      '/api/auth/change-password',
      {
        currentPassword: 'Password@123',
        newPassword: 'NewPassword@456',
        confirmPassword: 'NewPassword@456',
      },
      authHeader
    );
    assert(changePassRes.status === 200, 'POST /api/auth/change-password updates user password');
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runPhase5Tests();
