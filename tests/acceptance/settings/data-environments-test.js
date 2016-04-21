import Ember from 'ember';
import { module, test, skip } from 'qunit';
import startApp from 'sheriff/tests/helpers/start-app';
import { stubRequest } from 'ember-cli-fake-server';
import { orgId, rolesHref, usersHref, invitationsHref, securityOfficerId,
         securityOfficerHref } from '../../helpers/organization-stub';

let application;
let attestationHandle = 'selected_data_environments';
let dataEnvironmentsUrl = `${orgId}/settings/data-environments`;
let userId = 'basic-user-1';
let developerId = 'developer-user-2';
let basicRoleId = 'basic-role-1';
let developerRoleId = 'developer-role-2';
let dataEnvironments = ['Aptible', 'Amazon Simple Storage Service (Amazon S3)', 'Gmail'];
let users = [
  {
    id: userId,
    name: 'Basic User',
    email: 'basicuser@asdf.com',
    _links: {
      self: { href: `/users/${userId}` }
    }
  }
];

let roles = [
  {
    id: basicRoleId,
    privileged: false,
    name: 'Basic Role',
    _links: {
      self: { href: `/roles/${basicRoleId}` },
      users: { href: `/roles/${basicRoleId}/users`}
    }
  }
];

let permissions = [
  {
    id: '1',
    scope: 'manage',
    _links: {
      role: { href: `/roles/${developerRoleId}` }
    }
  }
];

module('Acceptance: Security Program Settings: Data Environments', {
  beforeEach() {
    application = startApp();
  },

  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('Lists all data environments', function(assert) {
  stubCurrentAttestations(attestationHandle, []);
  stubProfile({ currentStep: 'data-environments' });
  stubRequests();
  signInAndVisit(dataEnvironmentsUrl);

  andThen(() => {
    assert.equal(find('tr:contains(Aptible)').length, 0, 'has no Aptible row');

    dataEnvironments.forEach(function(de) {
      if (de !== 'Aptible') {
        assert.ok(find(`td:contains(${de})`), `${de} is rendered`);
      }
    });
  });
});


test('Clicking Save saves data environment selections to attestation', function(assert) {
  expect(3);
  stubCurrentAttestations({ selected_data_environments: { aptible: true }, team: [] });
  let expectedDataEnvironmentPayload = {
    amazonS3: true,
    aptible: true,
    gmail: true
  };

  stubProfile({ currentStep: 'data-environments' });
  stubRequests();
  signInAndVisit(dataEnvironmentsUrl);

  stubRequest('post', '/attestations', function(request) {
    let json = this.json(request);

    assert.ok(true, 'posts to /attestations');
    assert.equal(json.handle, attestationHandle, 'includes attestation handle');
    assert.deepEqual(json.document, expectedDataEnvironmentPayload, 'includes selected data environments as a document payload');

    return this.success({ id: 1 });
  });

  andThen(() => {
    toggleDataEnvironment('Amazon S3');
    toggleDataEnvironment('Gmail');
  });

  andThen(clickSaveButton);
});

test('Should load existing selections when attestation already exists', function(assert) {
  expect(5);
  let existingSelection = {
    amazonS3: false,
    aptible: true,
    gmail: false,
  };

  let expectedDataEnvironmentPayload = {
    amazonS3: false,
    aptible: true,
    gmail: true,
  };

  stubCurrentAttestations({ selected_data_environments: existingSelection });
  stubProfile({ currentStep: 'data-environments' });
  stubRequests();
  signInAndVisit(dataEnvironmentsUrl);

  stubRequest('post', '/attestations', function(request) {
    let json = this.json(request);

    assert.ok(true, 'posts to /attestations');
    assert.equal(json.handle, attestationHandle, 'includes attestation handle');
    assert.deepEqual(json.document, expectedDataEnvironmentPayload, 'includes selected data environments as a document payload');

    return this.success({ id: 1 });
  });

  andThen(() => {
    // For each DE verify toggle state matches existing attestation
    for(var deName in existingSelection) {
      if(deName !== 'aptible') {
        assert.equal(find(`input[name="${deName}"]`).is(':checked'), existingSelection[deName], `${deName} loaded`);
      }
    }
  });

  andThen(() => {
    // Toggle Gmail
    toggleDataEnvironment('Gmail');
  });

  // Save and inspect attestation for updated values
  andThen(clickSaveButton);
});

function toggleDataEnvironment(environment) {
  let toggle = findWithAssert(`tr:contains(${environment}) input[type="checkbox"]`);
  toggle.click();
}

function clickSaveButton() {
  let button = findWithAssert('button.save-settings');
  button.click();
}

function stubRequests() {
  stubValidOrganization();
  stubSchemasAPI();
  stubProfile({ hasCompletedSetup: true });

  stubRequest('get', rolesHref, function(request) {
    return this.success({ _embedded: { roles } });
  });

  stubRequest('get', usersHref, function(request) {
    return this.success({ _embedded: { users }});
  });

  stubRequest('get', invitationsHref, function(request) {
    return this.success({ _embedded: { invitations: [] }});
  });

  stubRequest('get', securityOfficerHref, function(request) {
    return this.success(users[0]);
  });

  stubRequest('get', '/permissions', function(request) {
    return this.success({ _embedded: { permissions }});
  });
}