import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    let invitationId = params.invitation_id;
    let verificationCode = params.verification_code;

    return this.store.find('invitation', invitationId).then((invitation) => {
      return { invitation, verificationCode };
    });
  },

  setupController(controller, model){
    let {invitation, verificationCode} = model;
    controller.set('model', invitation);
    controller.set('verificationCode', verificationCode);
  },

  afterModel(model, transition){
    if (!this.get('session.isAuthenticated')) {
      this.get('session').attemptedTransition = transition;

      let invitationId = model.invitation.id;
      let verificationCode = model.verificationCode;
      this.transitionTo('signup.invitation', invitationId, verificationCode);
    }
  },

  actions: {
    claim: function(){
      let invitation = this.controller.get('model');
      let verificationCode = this.controller.get('verificationCode');

      let verification = this.store.createRecord('verification', {
        type: 'invitation',
        invitationId: invitation.get('id'),
        verificationCode
      });

      verification.save().then( () => {
        this.replaceWith('index');
      }, () => {
        this.controllerFor('claim').set('error', `
          There was an error accepting this invitation. Perhaps
          the verification code has expired?
        `);
      });
    }
  }
});
