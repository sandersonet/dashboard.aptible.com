import Ember from "ember";

export default Ember.Controller.extend({
  newRole: null,
  confirmationModal: Ember.inject.service(),

  ownerRole: Ember.computed.filterBy('model', 'isAccountOwner'),
  platformOwnerRole: Ember.computed.filterBy('model', 'isPlatformOwner'),
  platformUserRoles: Ember.computed('model.@each.name', function() {
    return this.get('model').filterBy('isPlatformUser').sortBy('name');
  }),

  actions: {
    openNewRoleModal() {
      let newRole = this.store.createRecord('role');
      this.set('newRole', newRole);
    },

    inviteTo(role) {
      let organization = this.get('organization');
      this.transitionToRoute('organization.invite', organization, {queryParams: {role}});
    },

    delete(role) {
      this.get('confirmationModal').open({
        partial: 'confirmation-modals/delete-role',
        model: role,
        onConfirm: () => {
          role.deleteRecord();
          return role.save();
        }
      });
    }
  }
});
