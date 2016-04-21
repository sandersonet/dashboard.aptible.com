import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.find('organization');
  },

  afterModel(model) {
    this.transitionTo('stacks');
  }
});
