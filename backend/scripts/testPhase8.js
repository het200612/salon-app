require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendSalonApprovalEmail,
  sendSalonRejectionEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentRejectionEmail,
  sendPasswordChangeConfirmationEmail,
} = require('../utils/email');

async function testAllEmails() {
  console.log('🧪 Testing Phase 8: Email & File Upload Integration\n');

  // Test 1: Welcome email
  console.log('1. Testing sendWelcomeEmail...');
  const res1 = await sendWelcomeEmail('testuser@example.com', 'Test User');
  console.log('   Result:', res1 ? 'Success / Simulated' : 'Failed');

  // Test 2: Password changed
  console.log('2. Testing sendPasswordChangedEmail...');
  const res2 = await sendPasswordChangedEmail({ Email: 'testuser@example.com', Name: 'Test User' });
  console.log('   Result:', res2 ? 'Success / Simulated' : 'Failed');

  // Test 3: Password reset link
  console.log('3. Testing sendPasswordResetEmail...');
  const res3 = await sendPasswordResetEmail('testuser@example.com', 'test-sample-token-12345');
  console.log('   Result:', res3 ? 'Success / Simulated' : 'Failed');

  // Test 4: Salon approval
  console.log('4. Testing sendSalonApprovalEmail...');
  const res4 = await sendSalonApprovalEmail('owner@example.com', 'Owner Name');
  console.log('   Result:', res4 ? 'Success / Simulated' : 'Failed');

  // Test 5: Salon rejection
  console.log('5. Testing sendSalonRejectionEmail...');
  const res5 = await sendSalonRejectionEmail('owner@example.com', 'Owner Name', 'Incomplete documents');
  console.log('   Result:', res5 ? 'Success / Simulated' : 'Failed');

  // Test 6: Appointment confirmation
  console.log('6. Testing sendAppointmentConfirmationEmail...');
  const res6 = await sendAppointmentConfirmationEmail('client@example.com', 'Client Name', 'Glamour Salon', 'Haircut', '2026-10-01', '10:00 AM');
  console.log('   Result:', res6 ? 'Success / Simulated' : 'Failed');

  // Test 7: Appointment rejection
  console.log('7. Testing sendAppointmentRejectionEmail...');
  const res7 = await sendAppointmentRejectionEmail('client@example.com', 'Client Name', 'Glamour Salon', 'Haircut', '2026-10-01', '10:00 AM', 'Slot fully booked');
  console.log('   Result:', res7 ? 'Success / Simulated' : 'Failed');

  // Test 8: Password change confirmation
  console.log('8. Testing sendPasswordChangeConfirmationEmail...');
  const res8 = await sendPasswordChangeConfirmationEmail({ Email: 'testuser@example.com', Name: 'Test User' });
  console.log('   Result:', res8 ? 'Success / Simulated' : 'Failed');

  // File upload verification
  console.log('\n📁 Verifying file uploads and default image...');
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const defaultJpg = path.join(uploadsDir, 'default.jpg');
  if (fs.existsSync(defaultJpg)) {
    console.log('   ✓ default.jpg exists in uploads directory:', defaultJpg);
  } else {
    console.error('   ❌ default.jpg missing in uploads directory');
  }

  console.log('\n🎉 Phase 8 Email & File Upload verification complete!');
}

testAllEmails().catch(console.error);
