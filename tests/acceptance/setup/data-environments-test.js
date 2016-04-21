import Ember from 'ember';
import { module, test, skip } from 'qunit';
import startApp from 'sheriff/tests/helpers/start-app';
import { stubRequest } from 'ember-cli-fake-server';
import { orgId, rolesHref, usersHref, invitationsHref, securityOfficerId,
         securityOfficerHref } from '../../helpers/organization-stub';

let application;
let attestationHandle = 'selected_data_environments';
let dataEnvironmentsUrl = `${orgId}/setup/data-environments`;
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

module('Acceptance: Setup: Data Environments', {
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

test('Clicking back should return you to previous step', function(assert) {
  stubCurrentAttestations({ selected_data_environments: {}, workforce_roles: [] });
  stubProfile({ currentStep: 'data-environments' });
  stubRequests();
  signInAndVisit(dataEnvironmentsUrl);

  stubRequest('put', `/organization_profiles/${orgId}`, function(request) {
    let json = this.json(request);
    json.id = orgId;
    return this.success(json);
  });

  andThen(() => {
    find('.spd-nav-back').click();
  });

  andThen(() => {
    assert.equal(currentPath(), 'organization.setup.team', 'returned to team step');
  });
});

test('Clicking continue saves data environment selections to organization profile', function(assert) {
  expect(6);
  stubCurrentAttestations({selected_data_environments: { aptible: true }, team: [] });
  let expectedDataEnvironmentPayload = {
    amazonS3: true,
    aptible: true,
    gmail: true
  };

  stubProfile({ currentStep: 'data-environments' });
  stubRequests();
  signInAndVisit(dataEnvironmentsUrl);

  stubRequest('put', `/organization_profiles/${orgId}`, function(request) {
    let json = this.json(request);
    json.id = orgId;

    assert.ok(true, 'updates organization profile');
    assert.equal(json.current_step, 'security-controls', 'updates current step');

    return this.success(json);
  });

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

  andThen(clickContinueButton);

  andThen(() => {
    assert.equal(currentPath(), 'organization.setup.security-controls.index', 'proceeds to next step');
  });
});

test('Should load existing selections when attestation already exists', function(assert) {
  expect(8);
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

  stubRequest('put', `/organization_profiles/${orgId}`, function(request) {
    let json = this.json(request);
    json.id = orgId;

    assert.ok(true, 'updates organization profile');
    assert.equal(json.current_step, 'security-controls', 'updates current step');

    return this.success(json);
  });

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
      if (deName !== 'aptible') {
        assert.equal(find(`input[name="${deName}"]`).is(':checked'), existingSelection[deName]);
      }
    }
  });

  andThen(() => {
    // Toggle Gmail
    toggleDataEnvironment('Gmail');
  });

  // Save and inspect attestation for updated values
  andThen(clickContinueButton);

  andThen(() => {
    assert.equal(currentPath(), 'organization.setup.security-controls.index', 'proceeds to next step');
  });
});

test('Save progress', function(assert) {
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
      if (deName !== 'aptible') {
        assert.equal(find(`input[name="${deName}"]`).is(':checked'), existingSelection[deName], `${deName} set correctly`);
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

function clickSaveButton() {
  let button = findWithAssert('button.spd-nav-save');
  button.click();
}

function toggleDataEnvironment(environment) {
  let toggle = findWithAssert(`tr:contains(${environment}) td:last input[type="checkbox"]`);
  toggle.click();
}

function stubRequests() {
  stubValidOrganization();
  stubSchemasAPI();

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