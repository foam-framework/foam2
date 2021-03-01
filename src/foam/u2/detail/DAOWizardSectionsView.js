/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'DAOWizardSectionsView',
  extends: 'foam.u2.detail.WizardSectionsView',

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `Set to true when editing a contact from
      contact controller.`,
      value: false
    },
    {
      name: 'config'
      // Map of property-name: {map of property overrides} for configuring properties
      // values include 'label', 'units', and 'view'

      // example
      // config: {
      //   id: { updateVisibility: 'HIDDEN' },
      //   summary: { updateVisibility: 'HIDDEN' }
      // }
    }
  ],

  actions: [
    {
      name: 'prev',
      label: 'Go back',
      code: function(X) {
        this.isConnecting = false;
        if ( this.isEdit && this.currentIndex === 0 ) {
          this.data.isEdit = false;
          X.closeDialog();
        }
        else if ( this.currentIndex > 0 ) {
          this.currentIndex = this.prevIndex;
        } else {
          X.closeDialog();
        }
      },
      isAvailable: function(prevIndex, nextIndex) { return nextIndex != -1 || prevIndex != -1; }
    },
    {
      name: 'next',
      label: 'Next',//'Continue'
      isEnabled: function(lastUpdate, data$errors_, sections, currentIndex) {
        return sections[currentIndex]
          .createErrorSlotFor(this.data$).get()
          .filter(e => e).length == 0;
      },
      isAvailable: function(nextIndex) {//TODO delete if we can inherited from WizardSectionsView
        return nextIndex !== -1;
      },
      code: function() {
        this.currentIndex = this.nextIndex;
      }
    }
  ]
});
