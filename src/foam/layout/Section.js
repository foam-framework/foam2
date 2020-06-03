/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.layout',
  name: 'Section',

  documentation: `
    Provides model data sectioned viewing when using section views.
    Used for sectioning/grouping model properties and actions.

    Example:
    foam.CLASS({
      name: 'myModel',
      sections: [
        {
          name: 'mainSection'
          title: function(myProp) {
            return myProp ? 'Set this title if myProp true' : 'Set this title if myProp false';
          }
          isAvailable: function(myProp) {
            return ! myProp;
          }
        }
      ],
      properties: [
        {
          class: 'Boolean',
          name: 'myProp',
          section: 'mainSection'
        }
      ]
    });

    Displaying this model in foam.u2.detail.SectionView will section properties and display
    the sections title, subtitle, and help. Sections are capable of being available based on instance data
    and support dynamic titles and subtitles.
  `,

  requires: [
    'foam.core.Action',
    'foam.core.Property'
  ],

  properties: [
    {
      // Accepts function and string
      name: 'title'
    },
    {
      // Accepts function and string
      name: 'subTitle'
    },
    {
      class: 'String',
      name: 'help'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Property',
      name: 'properties'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actions'
    },
    {
      name: 'gridColumns'
    },
    {
      class: 'Function',
      name: 'createIsAvailableFor',
      value: function(data$) {
        return foam.core.ConstantSlot.create({value: true});
      }
    },
    {
      class: 'String',
      name: 'fromClass',
      documentation: 'The class name to which the section belongs to.'
    }
  ],

  methods: [
    function createErrorSlotFor(data$) {
      var errorSlots = data$.map(d => {
        return foam.core.ArraySlot.create({
          slots: this.properties
            .filter(p => p.validateObj)
            .map(p => d.slot(p.validateObj))
        });
      });

      var retSlot = foam.core.ProxySlot.create({ delegate: errorSlots.get() });
      this.onDetach(errorSlots.sub(slot => {
        retSlot.delegate = slot;
      }));

      return retSlot;
    },

    function fromSectionAxiom(a, cls) {
      this.copyFrom(a);
      this.copyFrom({
        createIsAvailableFor: a.createIsAvailableFor.bind(a),
        fromClass: a.sourceCls_.name,
        properties: cls.getAxiomsByClass(this.Property)
          .filter(p => p.section == a.name)
          .filter(p => ! p.hidden)
          .sort((p1, p2) => p1.order - p2.order),
        actions: cls.getAxiomsByClass(this.Action)
          .filter(action => action.section == a.name)
      });

      return this;
    }
  ]
});
