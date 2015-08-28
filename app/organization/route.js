import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate() {
    this._super.apply(this, arguments);
    this.render('sidebars/settings', {
      into: 'dashboard',
      outlet: 'sidebar'
    });
  }
});
