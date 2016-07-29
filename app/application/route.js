import Ember from "ember";

export default Ember.Route.extend({
  raven: Ember.inject.service(),
  actions: {
    accessDenied() {
      this.transitionTo('login');
    },

    xerror(err) {
      this.intermediateTransitionTo('error', err);
      this.get('raven').captureException(err);
    }
  }
});

