import Ember from 'ember';
import {module, test} from 'qunit';
import startApp from '../../helpers/start-app';
import { stubRequest } from '../../helpers/fake-server';
import {
  signupInputsTest,
  doSignupSteps
} from '../../helpers/shared-tests';

let App;
let signupIndexPath = 'signup.index';
let claimUrls = ['/claims/user', '/claims/account', '/claims/app', '/claims/database'];
let userInput = {
  email: 'good@email.com',
  password: 'Correct#Password1!3',
  name: 'Test User',
  organization: 'Great Co.'
};
let url = '/signup';

module('Acceptance: Signup', {
  beforeEach: function() {
    App = startApp();
    claimUrls.forEach((claimUrl) => {
      stubRequest('post', claimUrl, function() {
        return [204, {}, ''];
      });
    });
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test(`visiting ${url} when logged in redirects`, function() {
  expectRedirectsWhenLoggedIn(url);
});

test(`visiting ${url} shows signup inputs`, function() {
  signupInputsTest(url);
});

test('Creating an account directs to welcome wizard', function(assert) {
  // for loading information on the welcome.first-app screen
  stubStacks({}, []);
  stubOrganizations();

  stubRequest('post', '/organizations', function(request){
    let params = this.json(request);
    assert.equal(params.name, userInput.organization, 'correct organization is passed');
    return this.success({
      id: 'my-organization',
      name: userInput.organization
    });
  });

  doSignupSteps(url, userInput, {clickButton:false});
  fillInput('organization', userInput.organization);
  clickButton('Create account');
  andThen(function(){
    assert.equal(currentPath(), 'welcome.first-app', 'directs to first app');
  });
});

test('Signing up with a platform plan shows platform copy', function(assert) {
  // for loading information on the welcome.first-app screen
  stubStacks({}, []);
  stubOrganizations();
  url = `${url}?plan=platform`;

  stubRequest('post', '/organizations', function(request){
    let params = this.json(request);
    assert.equal(params.name, userInput.organization, 'correct organization is passed');
    return this.success({
      id: 'my-organization',
      name: userInput.organization
    });
  });

  doSignupSteps(url, userInput, {clickButton:false});
  fillInput('organization', userInput.organization);
  clickButton('Create account');

  andThen(function() {
    assert.equal(currentPath(), 'welcome.first-app', 'directs to first app');
    assert.ok(find(':contains(Create Your Aptible platform Environment)'));
    assert.ok(find(':contains(Create a database to store PHI)'));
  });
});

test('Signing up with no plan shows development copy', function(assert) {
  // for loading information on the welcome.first-app screen
  stubStacks({}, []);
  stubOrganizations();

  stubRequest('post', '/organizations', function(request){
    let params = this.json(request);
    assert.equal(params.name, userInput.organization, 'correct organization is passed');
    return this.success({
      id: 'my-organization',
      name: userInput.organization
    });
  });

  doSignupSteps(url, userInput, {clickButton:false});
  fillInput('organization', userInput.organization);
  clickButton('Create account');

  andThen(function() {
    assert.equal(currentPath(), 'welcome.first-app', 'directs to first app');
    assert.ok(find(':contains(Create Your Aptible development Environment)'));
    assert.ok(find(':contains(Create a database for your app)'));
  });
});

test(`visiting ${url} and signing up with too-short organization name shows error`, function(assert) {
  let tooShortOrganizationName = 'ba';

  doSignupSteps(url, userInput, {clickButton:false});
  fillInput('organization', tooShortOrganizationName);
  clickButton('Create account');
  andThen(() => {
    assert.equal(currentPath(), signupIndexPath, 'path does not change');
    let error = find(':contains(minimum is 3 characters)');
    assert.ok(error.length, 'has error on the screen');
  });
});

test(`visiting ${url} and signing up with invalid data shows errors`, function(assert){
  let userInput = {
    name: 'ab', // too short
    password: 'notgood',
    email: 'not-an-email'
  };
  doSignupSteps(url, userInput);
  andThen(() => {
    assert.equal(currentPath(), signupIndexPath, 'path does not change');
    assert.ok(find(':contains(must contain at least one uppercase)').length,
              'shows password error message');
    assert.ok(find(':contains(is not valid)').length,
              'shows email error message');
    assert.ok(find(':contains(is too short)').length,
              'shows name message');
  });
});

test('Creating an account shows validation errors', function(assert) {
  visit(url);
  clickButton('Create account');
  andThen(function(){
    assert.equal(currentPath(), signupIndexPath, 'path does not change');

    let error = find(":contains(can't be blank)");
    assert.ok(error.length, "has error(s) on the screen");
  });
});
