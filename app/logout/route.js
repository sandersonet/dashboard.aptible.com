import Ember from 'ember';
import Location from '../utils/location';

export default Ember.Route.extend({
  beforeModel: function(){
    if (!this.session.get('isAuthenticated')) {
      this.transitionTo('login');
    }
  },
  activate: function(){
    this.session.close('application', this.get('session.token')).then(function(){
      Location.replace('/');
    });
  }
});
