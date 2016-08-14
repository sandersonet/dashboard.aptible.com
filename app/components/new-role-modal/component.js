import Ember from 'ember';


export default Ember.Component.extend({
  actions: {
    addRole(role) {},
    onDismiss() {
      this.get('newRole').rollback();
      this.set('errors', null);
      this.sendAction('dismiss');
    },
    outsideClick: Ember.K
  }
});

