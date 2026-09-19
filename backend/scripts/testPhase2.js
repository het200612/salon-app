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
  console.log('🧪 Starting Phase 2 Backend Automated Tests...\n');
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
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@gmail.com',
      password: 'Admin',
      role: 'admin',
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, 'POST /api/auth/login (Admin) returns JWT');
    const adminToken = adminLogin.body.token;
    const authHeader = { Authorization: `Bearer ${adminToken}` };

    // 3. Admin Dashboard
    const dashboard = await request('GET', '/api/admin/dashboard', null, authHeader);
    assert(
      dashboard.status === 200 && Array.isArray(dashboard.body.salonRequests),
      'GET /api/admin/dashboard returns salon requests and stats'
    );

    // 4. City CRUD
    const getCities = await request('GET', '/api/admin/cities', null, authHeader);
    assert(getCities.status === 200 && Array.isArray(getCities.body), 'GET /api/admin/cities returns city list');

    const createCity = await request('POST', '/api/admin/cities', { cityName: 'TestCity_' + Date.now() }, authHeader);
    assert(createCity.status === 201 && createCity.body.id, 'POST /api/admin/cities creates new city');
    const newCityId = createCity.body.id;

    const updateCity = await request('PUT', `/api/admin/cities/${newCityId}`, { cityName: 'UpdatedCity' }, authHeader);
    assert(updateCity.status === 200, 'PUT /api/admin/cities/:id updates city');

    // 5. Area CRUD
    const createArea = await request(
      'POST',
      '/api/admin/areas',
      { areaName: 'TestArea_' + Date.now(), cityNameId: newCityId },
      authHeader
    );
    assert(createArea.status === 201 && createArea.body.id, 'POST /api/admin/areas creates new area');
    const newAreaId = createArea.body.id;

    const getAreas = await request('GET', '/api/admin/areas', null, authHeader);
    assert(getAreas.status === 200 && getAreas.body.length > 0, 'GET /api/admin/areas returns area list');

    const deleteArea = await request('DELETE', `/api/admin/areas/${newAreaId}`, null, authHeader);
    assert(deleteArea.status === 200, 'DELETE /api/admin/areas/:id deletes area');

    const deleteCity = await request('DELETE', `/api/admin/cities/${newCityId}`, null, authHeader);
    assert(deleteCity.status === 200, 'DELETE /api/admin/cities/:id deletes city');

    // 6. Service CRUD
    const createService = await request('POST', '/api/admin/services', { serviceName: 'TestService_' + Date.now() }, authHeader);
    assert(createService.status === 201 && createService.body.id, 'POST /api/admin/services creates service');
    const newServiceId = createService.body.id;

    const getServices = await request('GET', '/api/admin/services', null, authHeader);
    assert(getServices.status === 200 && getServices.body.length > 0, 'GET /api/admin/services returns services');

    const deleteService = await request('DELETE', `/api/admin/services/${newServiceId}`, null, authHeader);
    assert(deleteService.status === 200, 'DELETE /api/admin/services/:id deletes service');

    // 7. User Registration & Login
    const testEmail = `user_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Test Customer',
      userName: 'testcustomer',
      email: testEmail,
      phoneNumber: '9123456780',
      password: 'Password@123',
      usertype: 'User',
    });
    assert(regRes.status === 201, 'POST /api/auth/register registers new user');

    const userLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Password@123',
      role: 'user',
    });
    assert(userLogin.status === 200 && userLogin.body.token, 'POST /api/auth/login (User) authenticates and returns JWT');

    // 8. Owner pending status check
    const ownerEmail = `owner_${Date.now()}@example.com`;
    const regOwner = await request('POST', '/api/auth/register', {
      name: 'Test Salon Owner',
      userName: 'testowner',
      email: ownerEmail,
      phoneNumber: '9876501234',
      password: 'Password@123',
      usertype: 'Owner',
    });
    assert(regOwner.status === 201 && regOwner.body.userId, 'POST /api/auth/register registers owner as pending');
    const ownerUserId = regOwner.body.userId;

    const ownerPendingLogin = await request('POST', '/api/auth/login', {
      email: ownerEmail,
      password: 'Password@123',
      role: 'owner',
    });
    assert(ownerPendingLogin.status === 403, 'POST /api/auth/login blocks pending owner with 403 Forbidden');

    // 9. Admin verifies owner
    const verifyOwner = await request(
      'PATCH',
      `/api/admin/owners/${ownerUserId}/status`,
      { status: 'verified' },
      authHeader
    );
    assert(verifyOwner.status === 200, 'PATCH /api/admin/owners/:id/status updates owner status to verified');

    // 10. Owner login succeeds after verification
    const ownerVerifiedLogin = await request('POST', '/api/auth/login', {
      email: ownerEmail,
      password: 'Password@123',
      role: 'owner',
    });
    assert(
      ownerVerifiedLogin.status === 200 && ownerVerifiedLogin.body.role === 'owner',
      'POST /api/auth/login succeeds for verified owner'
    );

    // 11. Forgot Password
    const forgotRes = await request('POST', '/api/auth/forgot-password', { email: testEmail });
    assert(forgotRes.status === 200, 'POST /api/auth/forgot-password accepts request');

    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Test suite execution error:', err);
    process.exit(1);
  }
}

runTests();
