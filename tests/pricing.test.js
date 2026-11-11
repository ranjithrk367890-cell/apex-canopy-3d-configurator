import assert from 'node:assert';

console.log('--- RUNNING PRICING API & INR CALCULATION TESTS ---');

const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5001';

async function runTests() {
  // Test 1: Health Check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check must return 200 OK');
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Status must be "ok"');
  console.log('✓ Test 1 Passed: Express Pricing API health check is live');

  // Test 2: Standard 10x10 Tent Calculation (INR)
  const standardPayload = {
    size: '10x10',
    frameFinish: 'anodized-silver',
    walls: {
      back: { enabled: true, color: '#F8FAFC', style: 'solid' }
    },
    surfaceDesigns: {
      'roof-front': [{ id: '1' }],
      'valance-front': [{ id: '2' }]
    },
    accessories: {
      weightPlates: true,
      wheeledRollerBag: true
    }
  };

  const stdRes = await fetch(`${BASE_URL}/api/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(standardPayload)
  });
  assert.strictEqual(stdRes.status, 200, 'Pricing API must return 200 OK');
  const stdData = await stdRes.json();

  assert.strictEqual(stdData.currency, 'INR', 'Currency must be INR');
  assert.strictEqual(stdData.basePrice, 18999, '10x10 base price must be ₹18,999');
  assert.strictEqual(stdData.frameFinishSurcharge, 0, 'Silver frame surcharge must be ₹0');
  assert.strictEqual(stdData.wallsPrice, 2499, 'Single solid back wall must be ₹2,499');
  assert.strictEqual(stdData.customPrintPrice, 3600, 'Roof logo (₹1,800) + valance text (₹1,800) must be ₹3,600');
  assert.strictEqual(stdData.accessoriesPrice, 4498, 'Weight plates (₹2,499) + roller bag (₹1,999) must be ₹4,498');
  assert.strictEqual(stdData.subtotal, 29596, 'Subtotal must be 18999 + 2499 + 3600 + 4498 = ₹29,596');
  assert.strictEqual(stdData.estimatedTax, 5327.28, 'GST (18%) must be ₹5,327.28');
  assert.strictEqual(stdData.total, 34923.28, 'Total must be ₹34,923.28');
  console.log('✓ Test 2 Passed: Standard 10x10 configuration INR calculation verified');

  // Test 3: Upgrade Upgrades (Matte Black Frame + Cathedral Window + Roll-up Door)
  const proPayload = {
    size: '10x20',
    frameFinish: 'matte-black',
    walls: {
      back: { enabled: true, color: '#1E3A8A', style: 'window' }, // 3299
      front: { enabled: true, color: '#1E3A8A', style: 'door' },   // 3799
      left: { enabled: true, color: '#1E3A8A', style: 'solid' }    // 2499
    },
    surfaceDesigns: {},
    accessories: {
      weightPlates: true,
      ledTentLightSystem: true
    }
  };

  const proRes = await fetch(`${BASE_URL}/api/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proPayload)
  });
  assert.strictEqual(proRes.status, 200);
  const proData = await proRes.json();

  assert.strictEqual(proData.currency, 'INR');
  assert.strictEqual(proData.basePrice, 34999, '10x20 base price must be ₹34,999');
  assert.strictEqual(proData.frameFinishSurcharge, 1800, 'Matte black frame must be ₹1,800');
  assert.strictEqual(proData.wallsPrice, 9597, 'Window (₹3,299) + Door (₹3,799) + Solid (₹2,499) must be ₹9,597');
  assert.strictEqual(proData.accessoriesPrice, 5698, 'Weight plates (₹2,499) + LED (₹3,199) must be ₹5,698');
  console.log('✓ Test 3 Passed: 10x20 sizing, finishes, and wall enclosure INR charges verified');

  // Test 4: Validation Error Handling (Invalid Size)
  const invalidRes = await fetch(`${BASE_URL}/api/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size: '50x50_unsupported' })
  });
  assert.strictEqual(invalidRes.status, 400, 'Invalid size must return 400 Bad Request');
  const errData = await invalidRes.json();
  assert.ok(errData.error, 'Must return structured error message');
  console.log('✓ Test 4 Passed: Input validation rejects invalid payload with HTTP 400');

  console.log('All pricing API tests passed successfully!\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
