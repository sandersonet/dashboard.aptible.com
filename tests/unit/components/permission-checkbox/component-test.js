import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('permission-checkbox', {
  unit: true
});

test('it renders', function(assert) {
  assert.expect(2);

  let mockChangeset = {
    value: Ember.K,
    setValue: Ember.K,
    subscribe: Ember.K
  };

  // creates the component instance
  var component = this.subject({
    changeset: mockChangeset
  });
  assert.equal(component._state, 'preRender');

  // renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
