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

async function runTests() {
  console.log('🧪 Starting Phase 3 Backend Automated Tests...\n');
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
    // 1. Public Salons List
    const salonsRes = await request('GET', '/api/salons');
    assert(salonsRes.status === 200 && Array.isArray(salonsRes.body), 'GET /api/salons returns salons list');

    // 2. Salons Filter by Area
    const areaFilterRes = await request('GET', '/api/salons?area=1');
    assert(areaFilterRes.status === 200 && Array.isArray(areaFilterRes.body), 'GET /api/salons?area=1 returns filtered salons');

    // 3. Single Salon Details & Slots (if salons exist)
    if (salonsRes.body.length > 0) {
      const salonId = salonsRes.body[0].id;
      const salonDetail = await request('GET', `/api/salons/${salonId}`);
      assert(salonDetail.status === 200 && salonDetail.body.salon, 'GET /api/salons/:id returns salon details, services & images');

      const slotsRes = await request('GET', `/api/salons/${salonId}/slots`);
      assert(
        slotsRes.status === 200 && Array.isArray(slotsRes.body.slots) && slotsRes.body.slots.length > 0,
        'GET /api/salons/:id/slots returns generated hourly slots'
      );
    }

    // 4. User Registration & Login for testing User endpoints
    const userEmail = `tester_${Date.now()}@example.com`;
    await request('POST', '/api/auth/register', {
      name: 'Phase 3 Customer',
      userName: 'p3customer',
      email: userEmail,
      phoneNumber: '9876543210',
      password: 'Password@123',
      usertype: 'User',
    });

    const userLogin = await request('POST', '/api/auth/login', {
      email: userEmail,
      password: 'Password@123',
      role: 'user',
    });
    const userToken = userLogin.body.token;
    const userAuth = { Authorization: `Bearer ${userToken}` };

    // 5. User Profile
    const userProfile = await request('GET', '/api/user/profile', null, userAuth);
    assert(userProfile.status === 200 && userProfile.body.email === userEmail, 'GET /api/user/profile returns user profile');

    const updateProf = await request(
      'PUT',
      '/api/user/profile',
      {
        name: 'Phase 3 Customer Updated',
        userName: 'p3customer',
        email: userEmail,
        phoneNumber: '9876543210',
      },
      userAuth
    );
    assert(updateProf.status === 200 && updateProf.body.user.name === 'Phase 3 Customer Updated', 'PUT /api/user/profile updates profile');

    // 6. Owner Login (Verified Owner)
    const ownerEmail = `owner_p3_${Date.now()}@example.com`;
    const regOwner = await request('POST', '/api/auth/register', {
      name: 'Owner Phase 3',
      userName: 'ownerp3',
      email: ownerEmail,
      phoneNumber: '9876512345',
      password: 'Password@123',
      usertype: 'Owner',
    });
    const ownerUserId = regOwner.body.userId;

    // Admin verifies owner
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'Admin',
      role: 'admin',
    });
    const adminAuth = { Authorization: `Bearer ${adminLogin.body.token}` };
    await request('PATCH', `/api/admin/owners/${ownerUserId}/status`, { status: 'verified' }, adminAuth);

    const ownerLogin = await request('POST', '/api/auth/login', {
      email: ownerEmail,
      password: 'Password@123',
      role: 'owner',
    });
    const ownerToken = ownerLogin.body.token;
    const ownerAuth = { Authorization: `Bearer ${ownerToken}` };

    // 7. Owner Profile (needsSalon = true initially)
    const ownerProfileInit = await request('GET', '/api/owner/profile', null, ownerAuth);
    assert(ownerProfileInit.status === 200 && ownerProfileInit.body.needsSalon === true, 'GET /api/owner/profile returns needsSalon: true when no salon exists');

    // 8. Owner Creates Salon
    const createSal = await request(
      'POST',
      '/api/owner/salon',
      {
        name: 'Phase 3 Luxury Salon',
        location: '123 Test Street',
        areaId: 1,
        cityId: 1,
        openTime: '09:00:00',
        closeTime: '20:00:00',
        numberOfSeats: 5,
        type: 'Unisex',
      },
      ownerAuth
    );
    assert(createSal.status === 201 && createSal.body.salonId, 'POST /api/owner/salon registers new salon for owner');
    const createdSalonId = createSal.body.salonId;

    // 9. Owner adds service to salon
    const addSrv = await request(
      'POST',
      '/api/owner/services',
      {
        serviceId: 1,
        price: 500,
      },
      ownerAuth
    );
    assert(addSrv.status === 201 || addSrv.status === 200, 'POST /api/owner/services adds service pricing to salon');

    // 10. User Books Appointment
    const bookRes = await request(
      'POST',
      '/api/bookings',
      {
        salonId: createdSalonId,
        serviceId: 1,
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
        timeSlot: '10:00 AM - 11:00 AM',
      },
      userAuth
    );
    assert(bookRes.status === 201 && bookRes.body.bookingId, 'POST /api/bookings creates appointment with Status=Pending');
    const bookingId = bookRes.body.bookingId;

    // 11. User views bookings
    const userBookings = await request('GET', '/api/user/bookings', null, userAuth);
    assert(userBookings.status === 200 && userBookings.body.some((b) => b.id === bookingId), 'GET /api/user/bookings returns customer appointments');

    // 12. Owner Accepts Appointment
    const acceptRes = await request(
      'PATCH',
      `/api/bookings/${bookingId}/status`,
      { status: 'Accepted' },
      ownerAuth
    );
    assert(acceptRes.status === 200 && acceptRes.body.status === 'Accepted', 'PATCH /api/bookings/:id/status updates appointment status to Accepted');

    console.log(`\n📊 Phase 3 Test Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Phase 3 test suite execution error:', err);
    process.exit(1);
  }
}

runTests();
