import Ember from 'ember';
import SPDRouteMixin from 'sheriff/mixins/routes/spd-route';
import Attestation from 'sheriff/models/attestation';
import buildTeamDocument from 'sheriff/utils/build-team-document';
import loadSchema from 'sheriff/utils/load-schema';

export default Ember.Route.extend(SPDRouteMixin, {
  attestationValidator: Ember.inject.service(),
  model() {
    let handle = 'workforce_roles';
    let organization = this.modelFor('organization');
    let organizationUrl = organization.get('data.links.self');

    return loadSchema(handle).then((schema) => {
      let attestationParams = { handle, schemaId: schema.id, document: [],
                                organizationUrl };

      let attestation = Attestation.findOrCreate(attestationParams, this.store);

      return Ember.RSVP.hash({
        schema, attestation,
        users: organization.get('users'),
        invitations: organization.get('invitations'),
        securityOfficer: organization.get('securityOfficer')
      });
    });
  },

  setupController(controller, model) {
    let organization = this.modelFor('organization');
    let { schema, attestation, invitations, users } = model;
    let schemaDocument = buildTeamDocument(users, invitations,
                                           attestation.get('document'), schema);

    controller.set('users', model.users);
    controller.set('roles', organization.get('roles'));
    controller.set('organization', organization);
    controller.set('invitations', invitations);
    controller.set('schemaDocument', schemaDocument);
    controller.set('properties', schema.itemProperties);
  },

  validateAttestation(schemaDocument) {
    let { attestation } = this.currentModel;
    let errors = this.get('attestationValidator').validate(attestation, schemaDocument);

    this.controller.set('errors', errors);

    return errors;
  },

  actions: {
    onSave() {
      let { attestation } = this.currentModel;
      let schemaDocument = this.controller.get('schemaDocument');
      attestation.set('document', schemaDocument.dump());

      attestation.save().then(() => {
        let message = 'Progress saved.';
        Ember.get(this, 'flashMessages').success(message);
      }, (e) => {
        let message = Ember.getWithDefault(e, 'responseJSON.message', 'An error occured');
        Ember.get(this, 'flashMessages').danger(`Save Failed! ${message}`);
      });
    },

    onNext() {
      let { attestation } = this.currentModel;
      let profile = this.modelFor('setup');
      let schemaDocument = this.controller.get('schemaDocument').dump();

      this.validateAttestation(schemaDocument);

      if (this.controller.get('errors.length') > 0) {
        return;
      }

      attestation.set('document', schemaDocument);
      attestation.save().then(() => {
        profile.next(this.get('stepName'));
        return profile.save().then(() => {
          this.transitionTo(`setup.${profile.get('currentStep')}`);
        });
      }).catch((e) => {
        let message = Ember.getWithDefault(e, 'responseJSON.message', 'An error occured');
        Ember.get(this, 'flashMessages').danger(`Save Failed! ${message}`);
      });
    },

    showInviteModal() {
      this.controller.set('showInviteModal', true);
    },

    inviteTeam(inviteList, roleId) {
      let organization = this.modelFor('organization');
      let role = organization.get('roles').findBy('id', roleId);

      inviteList.map((email) => {
        let inviteParams = { organization, role, email };
        return this.store.createRecord('invitation', inviteParams).save();
      });

      let existingDocument = this.controller.get('schemaDocument').dump();
      let newSchemaDocument = buildTeamDocument(organization.get('users'),
                                                organization.get('invitations'),
                                                existingDocument,
                                                this.currentModel.schema);
      this.controller.set('schemaDocument', newSchemaDocument);
      this.controller.set('showInviteMOdal', false);
    }
  }
});
