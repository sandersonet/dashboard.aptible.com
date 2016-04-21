import Ember from 'ember';

export default Ember.Route.extend({
  redirect() {
<<<<<<< HEAD
    this.transitionTo('organization.members');
=======
    return this.transitionTo('training');
>>>>>>> 07b387add395c2d35acc4423f8352da13e75e3f8
  }
});
