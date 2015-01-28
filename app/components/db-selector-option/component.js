import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':col-xs-4', 'isSelected:selected-option', 'dbType.value'],

  dbType:null,
  selectedDbType: null,
  selectCallback: Ember.K,

  isSelected: Ember.computed('dbType', 'selectedDbType', function(){
    return this.get('dbType') === this.get('selectedDbType');
  }),

  actions: {
    selectDbType: function(dbType){
      this.get('selectCallback')(dbType);
    }
  }
});
