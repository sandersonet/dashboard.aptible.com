import Ember from "ember";

export default Ember.Controller.extend({
  sortBy: ['name:asc'],
  sortedRoles: Ember.computed.sort('model', 'sortBy'),
  confirmationModal: Ember.inject.service(),

  actions: {
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
