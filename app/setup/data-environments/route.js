import Ember from 'ember';
import SPDRouteMixin from 'sheriff/mixins/routes/spd-route';
import Attestation from 'sheriff/models/attestation';
import loadSchema from 'sheriff/utils/load-schema';

export default Ember.Route.extend(SPDRouteMixin, {
  model() {
    let handle = 'selected_data_environments';
    let organizationUrl = this.modelFor('organization').get('data.links.self');

    return loadSchema(handle).then((schema) => {
      let attestationParams = { handle, schemaId: schema.id, organizationUrl,
                                document: {} };
      let attestation = Attestation.findOrCreate(attestationParams, this.store);
      let schemaDocument = schema.buildDocument();

      return Ember.RSVP.hash({ schema, attestation, schemaDocument });
    });
  },

  setupController(controller, model) {
    let { schema, schemaDocument, attestation } = model;

    controller.set('model', schema);
    controller.set('schemaDocument', schemaDocument);
    controller.set('attestation', attestation);
  },

  actions: {
    onNext() {
      let { attestation, schemaDocument } = this.currentModel;
      let profile = this.modelFor('setup');
      let selectedDataEnvironments = schemaDocument.dump({ excludeInvalid: true });

      attestation.set('document', selectedDataEnvironments);
      attestation.setUser(this.session.get('currentUser'));
      attestation.save().then(() => {
        profile.next(this.get('stepName'));
        return profile.save().then(() => {
          this.transitionTo(`setup.${profile.get('currentStep')}.index`);
        });
      }).catch((e) => {
        let message = Ember.getWithDefault(e, 'responseJSON.message', 'An error occured');
        Ember.get(this, 'flashMessages').danger(`Save Failed! ${message}`);
      });
    }
  }
});
