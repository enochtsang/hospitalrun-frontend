import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'hospitalrun/tests/helpers/start-app';

module('Acceptance | invoices', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test('visiting /invoices', function(assert) {
  runWithPouchDump('billing', function() {
    authenticateUser();
    visit('/invoices');
    andThen(function() {
      assert.equal(currentURL(), '/invoices');
    });
  });
});

test('create invoice', function(assert) {
  runWithPouchDump('billing', function() {
    authenticateUser();
    visit('/invoices/edit/new');
    andThen(function() {
      assert.equal(currentURL(), '/invoices/edit/new');
    });
    fillIn('.invoice-patient .tt-input', 'Joe Bagadonuts - TCH 00001');
    triggerEvent('.invoice-patient .tt-input', 'input');
    triggerEvent('.invoice-patient .tt-input', 'blur');

    var utcStartTime = moment.utc('2015-11-1 05:00:00').format('YYYY-MM-DD HH:mm:ss');
    var localStartTime  = moment.utc(utcStartTime).toDate();
    localStartTime = moment(localStartTime).format('M/D/YYYY');

    var utcEndTime = moment.utc('2015-11-12 05:00:00').format('YYYY-MM-DD HH:mm:ss');
    var localEndTime  = moment.utc(utcEndTime).toDate();
    localEndTime = moment(localEndTime).format('M/D/YYYY');

    var dateRange = localStartTime + ' - ' + localEndTime;

    waitToAppear('.invoice-visit option:contains(' + dateRange + ' (Admission)');
    andThen(function() {
      select('.invoice-visit', dateRange + ' (Admission)');
      fillIn('.external-invoice-no input', 'inv000002');
    });
    waitToAppear('button:contains(Update)');
    andThen(function() {
      click('button:contains(Update)');
    });
    waitToAppear('.modal-dialog');
    andThen(() => {
      assert.equal(find('.modal-title').text(), 'Invoice Saved', 'Invoice was saved successfully');
    });
  });
});

test('delete invoice', function(assert) {
  runWithPouchDump('billing', function() {
    authenticateUser();
    visit('/invoices');
    andThen(function() {
      assert.equal(currentURL(), '/invoices');
      assert.equal(find('.invoice-number:contains(inv00001)').length, 1, 'Invoice is displayed for deletion');
    });
    click('button:contains(Delete)');
    andThen(function() {
      waitToAppear('.modal-dialog');
    });
    andThen(() => {
      assert.equal(find('.alert').text().trim(), 'Are you sure you wish to delete inv00001?', 'Invoice deletion confirm displays');
    });
    click('button:contains(Delete):last');
    waitToDisappear('.invoice-number:contains(inv00001)');
    andThen(() => {
      assert.equal(find('.invoice-number:contains(inv00001)').length, 0, 'Invoice is deleted');
    });
  });
});

test('add payment', function(assert) {
  runWithPouchDump('billing', function() {
    authenticateUser();
    visit('/invoices');
    andThen(function() {
      assert.equal(currentURL(), '/invoices');
    });
    click('button:contains(Add Payment)');
    waitToAppear('.modal-dialog');
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Add Payment', 'Add Payment modal displays');
    });
    fillIn('.payment-amount input', 100);
    click('.update-payment-btn');
    waitToAppear('.modal-title:contains(Payment Added)');
    andThen(() => {
      assert.equal(find('.modal-title').text(), 'Payment Added', 'Payment was saved successfully');
    });
  });
});

test('add deposit', function(assert) {
  runWithPouchDump('billing', function() {
    authenticateUser();
    visit('/invoices');
    andThen(function() {
      assert.equal(currentURL(), '/invoices');
    });
    click('button:contains(add deposit)');
    waitToAppear('.modal-dialog');
    andThen(function() {
      assert.equal(find('.modal-title').text(), 'Add Deposit', 'Add Deposit modal displays');
    });
    fillIn('.payment-amount input', 140);
    fillIn('.payment-patient .tt-input', 'Joe Bagadonuts - TCH 00001');
    triggerEvent('.payment-patient .tt-input', 'input');
    triggerEvent('.payment-patient .tt-input', 'blur');
    click('.update-payment-btn');
    waitToAppear('.modal-title:contains(Deposit Added)');
    andThen(() => {
      assert.equal(find('.modal-title').text(), 'Deposit Added', 'Deposit was saved successfully');
    });
  });
});
