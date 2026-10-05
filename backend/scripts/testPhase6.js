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

async function runPhase6Tests() {
  console.log('🧪 Starting Phase 6 (Owner Dashboard & Workflows) End-to-End Tests...\n');
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
    // 1. Check Public dropdown routes
    const citiesRes = await request('GET', '/api/cities');
    assert(citiesRes.status === 200 && Array.isArray(citiesRes.body), 'GET /api/cities returns array of cities');

    const areasRes = await request('GET', '/api/areas');
    assert(areasRes.status === 200 && Array.isArray(areasRes.body), 'GET /api/areas returns array of areas');

    const servicesRes = await request('GET', '/api/services');
    assert(servicesRes.status === 200 && Array.isArray(servicesRes.body), 'GET /api/services returns master services');

    // 2. Owner Login
    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'rajesh@example.com',
      password: 'Owner@123',
    });
    assert(ownerLogin.status === 200 && ownerLogin.body.token, 'Owner login successful with JWT');
    const ownerToken = ownerLogin.body.token;
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };

    // 3. Owner Profile & Dashboard
    const profileRes = await request('GET', '/api/owner/profile', null, ownerHeaders);
    assert(profileRes.status === 200, 'GET /api/owner/profile returns 200');
    assert(profileRes.body.owner && profileRes.body.owner.Email === 'rajesh@example.com', 'Profile contains owner user info');
    assert(profileRes.body.salon !== undefined, 'Profile indicates salon presence or needsSalon flag');

    const salon = profileRes.body.salon;

    // 4. Owner Services Management
    const ownerServicesRes = await request('GET', '/api/owner/services', null, ownerHeaders);
    assert(ownerServicesRes.status === 200, 'GET /api/owner/services returns 200');
    assert(Array.isArray(ownerServicesRes.body.allServices), 'Returns master service catalog');
    assert(Array.isArray(ownerServicesRes.body.selectedServices), 'Returns salon active selected services');

    // 5. Add / Update a Service Offering
    const masterServiceId = ownerServicesRes.body.allServices[0]?.id || 1;
    const addServiceRes = await request(
      'POST',
      '/api/owner/services',
      { serviceId: masterServiceId, price: 450 },
      ownerHeaders
    );
    assert(
      addServiceRes.status === 200 || addServiceRes.status === 201,
      'POST /api/owner/services adds/updates service price'
    );

    // Verify service was recorded
    const refreshedServices = await request('GET', '/api/owner/services', null, ownerHeaders);
    const addedItem = refreshedServices.body.selectedServices.find(
      (s) => s.ServiceMstId === masterServiceId || s.ServiceName_id === masterServiceId
    );
    assert(addedItem !== undefined, 'Newly added/updated service exists in salon selected services');

    // 6. Delete Service Offering (if we have an item)
    if (addedItem) {
      const deleteServiceRes = await request('DELETE', `/api/owner/services/${addedItem.id}`, null, ownerHeaders);
      assert(deleteServiceRes.status === 200, `DELETE /api/owner/services/${addedItem.id} removes service`);
      
      // Re-add it back for testing bookings
      await request('POST', '/api/owner/services', { serviceId: masterServiceId, price: 450 }, ownerHeaders);
    }

    // 7. Update Salon Profile
    if (salon) {
      const updateSalonRes = await request(
        'PUT',
        `/api/owner/salon/${salon.id}`,
        {
          name: salon.Name,
          location: salon.Location,
          cityId: salon.City_id,
          areaId: salon.Area_id,
          openTime: '09:00',
          closeTime: '21:00',
          numberOfSeats: salon.NumberOfSeats || 4,
          type: salon.Type || 'Unisex',
        },
        ownerHeaders
      );
      assert(updateSalonRes.status === 200, 'PUT /api/owner/salon/:id updates salon details');
    }

    // 8. Filter Appointments by Date
    const today = new Date().toISOString().split('T')[0];
    const dateFiltered = await request('GET', `/api/owner/profile?date=${today}`, null, ownerHeaders);
    assert(dateFiltered.status === 200 && Array.isArray(dateFiltered.body.bookings), 'GET /api/owner/profile?date=... returns bookings array');

    // 9. Check Status Update & Reason Support
    // We can create a test booking or check existing booking
    const customerLogin = await request('POST', '/api/auth/login', {
      email: 'het@example.com',
      password: 'Password@123',
    });
    if (customerLogin.status === 200 && customerLogin.body.token && salon) {
      const custHeaders = { Authorization: `Bearer ${customerLogin.body.token}` };
      const createBooking = await request('POST', '/api/bookings', {
        salonId: salon.id,
        date: today,
        timeSlot: '11:00 - 12:00',
        serviceId: masterServiceId,
      }, custHeaders);

      if (createBooking.status === 201) {
        const testBookingId = createBooking.body.bookingId;
        assert(true, `Created test booking #${testBookingId} for status flow`);

        // Owner Accepts Booking
        const acceptRes = await request(
          'PATCH',
          `/api/bookings/${testBookingId}/status`,
          { status: 'confirmed' },
          ownerHeaders
        );
        assert(acceptRes.status === 200, `Owner accepts booking #${testBookingId}`);

        // Owner Updates to Completed or Cancelled with reason
        const rejectRes = await request(
          'PATCH',
          `/api/bookings/${testBookingId}/status`,
          { status: 'cancelled', reason: 'Emergency slot maintenance' },
          ownerHeaders
        );
        assert(rejectRes.status === 200, `Owner cancels/rejects booking #${testBookingId} with reason`);
      }
    }

    console.log(`\n========================================`);
    console.log(`Phase 6 Tests Completed: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runPhase6Tests();
