import { 
  REAL_SERVICES, 
  validateEquipmentItem, 
  validateEquipmentList, 
  validateServiceItem, 
  sanitizeServiceItem 
} from '../src/data/services';

function runValidationTests() {
  console.log('--- STARTING SERVICES VALIDATION TESTS ---');

  // Test 1: All existing REAL_SERVICES must pass validation
  REAL_SERVICES.forEach((srv) => {
    const res = validateServiceItem(srv);
    if (!res.isValid) {
      console.error(`FAIL: Real service ${srv.id} failed validation:`, res.errors);
      process.exit(1);
    }
  });
  console.log(`PASS: All ${REAL_SERVICES.length} real services passed validation.`);

  // Test 2: Empty fields must be rejected
  const emptyService = validateServiceItem({
    title: '',
    shortDesc: '',
    fullDesc: '',
  });
  if (emptyService.isValid) {
    console.error('FAIL: Empty service should have been rejected');
    process.exit(1);
  }
  if (!emptyService.errorMap.title || !emptyService.errorMap.shortDesc || !emptyService.errorMap.fullDesc) {
    console.error('FAIL: Missing expected field errors for empty service:', emptyService.errorMap);
    process.exit(1);
  }
  console.log('PASS: Empty fields rejected correctly.');

  // Test 3: Equipment validation
  // Invalid formats:
  const invalidEquipments = [
    '',
    '   ',
    'ab',
    '12345',
    '????',
    '----',
    'Демо-центр в Тольятти',
    'Демоцентр приборов',
    'Демонстрационный зал Жигулевская долина'
  ];

  invalidEquipments.forEach((eq) => {
    const res = validateEquipmentItem(eq);
    if (res.isValid) {
      console.error(`FAIL: Expected "${eq}" to be invalid equipment, but passed!`);
      process.exit(1);
    }
  });
  console.log(`PASS: All ${invalidEquipments.length} invalid equipment formats rejected.`);

  // Valid formats:
  const validEquipments = [
    'Лазерный 3D-сканер Shining 3D FreeScan Combo',
    'ScanLine EasyScan Omni',
    'ПО PolyWorks|Inspector™',
    'TopSolid 7 Design',
    'КИМ PMT Alpha Arm',
    'Измерительные щупы Renishaw TP20'
  ];

  validEquipments.forEach((eq) => {
    const res = validateEquipmentItem(eq);
    if (!res.isValid) {
      console.error(`FAIL: Expected "${eq}" to be valid, but got error:`, res.error);
      process.exit(1);
    }
  });
  console.log(`PASS: All ${validEquipments.length} valid equipment formats accepted.`);

  // Test 4: Equipment list with empty or invalid items
  const invalidListResult = validateEquipmentList(['', '123']);
  if (invalidListResult.isValid) {
    console.error('FAIL: Expected equipment list with invalid items to fail');
    process.exit(1);
  }
  console.log('PASS: Equipment list with invalid items rejected.');

  // Test 5: Service with forbidden demo center in description
  const forbiddenService = validateServiceItem({
    ...REAL_SERVICES[0],
    shortDesc: 'Осмотр и замеры в нашем новом демо-центре в технопарке',
  });
  if (forbiddenService.isValid || !forbiddenService.errorMap.general) {
    console.error('FAIL: Service with demo-center mention should be rejected');
    process.exit(1);
  }
  console.log('PASS: Service with demo-center mention correctly flagged.');

  console.log('--- ALL VALIDATION TESTS PASSED SUCCESSFULLY! ---');
}

runValidationTests();
