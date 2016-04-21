import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('invite-team-modal', 'InviteTeamModalUnitTest', {
  needs: ['component:modal-wrapper']
});

let testCases = [
  'skylar@aptible.com;;frank@aptible.com;\n\n\n;robert@aptible.com; gib@aptible.com',
  'skylar@aptible.com; \n;frank@aptible.com robert@aptible.com;\tgib@aptible.com'
];

let expected = ['skylar@aptible.com', 'frank@aptible.com', 'robert@aptible.com',
                'gib@aptible.com'];

testCases.forEach((testCase) => {
  test('correct params are passed to external inviteTeam action', function(assert) {
    assert.expect(3);

    let targetObject = {
      externalAction: function(emails, role) {
        assert.ok(true, 'inviteTeam event triggered');
        assert.deepEqual(emails, expected, 'valid emails are included in action');
        assert.equal(role, 'r1', 'role id is included in action');
      }
    };

    let component = this.subject({
      invitesList: testCase,
      role: 'r1',
      targetObject: targetObject,
      inviteTeam: 'externalAction',
    });

    this.render();
    this.$('button.send-invites').click();
  });
});

test('splitInviteList spits emails using delimiter', function(assert) {
  let testCase = 'skylar@aptible.com; s@ap.it; zergrush gogo';
  let expected = ['skylar@aptible.com', 's@ap.it', 'zergrush', 'gogo'];
  let component = this.subject({ invitesList: testCase, role: 'r1' });

  assert.deepEqual(component.get('splitInviteList'), expected,
                   'splitInviteList is correct');
});

test('validEmails only includes valid emails', function(assert) {
  let testCase = 'skylar@aptible.com; zergrush;s@ap.it; gogo';
  let expected = ['skylar@aptible.com', 's@ap.it'];
  let component = this.subject({ invitesList: testCase, role: 'r1' });

  assert.deepEqual(component.get('validEmails'), expected,
                   'validEmails is correct');
});

test('invalidEmails includes invalid emails', function(assert) {
  let testCase = 'skylar@aptible.com; zergrush;s@ap.it; gogo';
  let expected = ['zergrush', 'gogo'];
  let component = this.subject({ invitesList: testCase, role: 'r1' });

  assert.deepEqual(component.get('invalidEmails'), expected,
                   'invalidEmails is correct');
});