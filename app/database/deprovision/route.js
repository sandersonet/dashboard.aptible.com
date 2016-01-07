import Ember from 'ember';

export default Ember.Route.extend({
  titleToken: function(){
    var database = this.modelFor('database');
    return `Deprovision ${database.get('handle')}`;
  },

  actions: {
    deprovision: function(){
      let database = this.currentModel;
      let route = this;
      let controller = this.controller;
      let store = this.store;
      let message = `${database.get('handle')} has been deprovisioned`;
      controller.set('error', null);

      database.get('stack').then(function(stack) {
        var op = store.createRecord('operation', {
          type: 'deprovision',
          database: database
        });
        op.save().then(function(){
          database.deleteRecord();
          route.transitionTo('databases', stack);
          Ember.get(route, 'flashMessages').success(message);
        }, function(e){
          controller.set('error', e);
        });
      });
    }
  }

});
