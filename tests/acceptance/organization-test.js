import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from '../helpers/start-app';

let application;

module('Acceptance: Organization', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /organization', function(assert) {
  stubOrganization({ id: 42 });
  stubBillingDetail({ id: 42 });
  setFeature('organization-settings', true);
  signInAndVisit('/organizations/42');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard.organization.members.index');

    // sidebar
    expectLink('/organizations/42/members');
    expectLink('/organizations/42/roles');
  });
});
