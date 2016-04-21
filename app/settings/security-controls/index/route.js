import Ember from 'ember';

export default Ember.Route.extend({
  stepName: 'security-controls',
  model() {
    return this.modelFor('settings.security-controls');
  },

  setupController(controller, model) {
    let organizationUrl = this.modelFor('organization').get('data.links.self');

    controller.set('model', model);
    controller.set('organizationUrl', organizationUrl);
  },

  actions: {
    onNext() {
      let transition;

      this.currentModel.forEach((securityControlGroup) => {
        if (!securityControlGroup.completed && !transition) {
          transition = this.transitionTo('settings.security-controls.show', securityControlGroup);
        }
      });

      if (!transition) {
        transition = this.finish();
      }
    }
  }
});
