foam.INTERFACE({
  refines: 'foam.dao.DAO',
  methods: [
    {
      name: 'put',
      swiftReturns: 'FObject?',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ],
    },
    {
      name: 'remove',
      swiftReturns: 'FObject?',
      args: [
        {
          name: 'obj',
          swiftType: 'FObject'
        }
      ],
    },
    {
      name: 'find',
      swiftReturns: 'FObject?',
      args: [
        {
          name: 'id',
          swiftType: 'Any?'
        }
      ],
    },
    {
      name: 'select',
      swiftReturns: 'Sink',
      args: [
        {
          name: 'sink',
	  swiftExternalName: 'sink',
          swiftType: 'Sink',
          swiftDefaultValue: 'ArraySink()',
        },
        {
          name: 'skip',
	  swiftExternalName: 'skip',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'limit',
	  swiftExternalName: 'limit',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'order',
	  swiftExternalName: 'order',
          swiftType: 'Comparator?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
	  swiftExternalName: 'predicate',
          swiftType: 'FoamPredicate?',
          swiftDefaultValue: 'nil',
        }
      ],
    },
    {
      name: 'removeAll',
      args: [
        {
          name: 'skip',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'order',
          swiftType: 'Comparator?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
          swiftDefaultValue: 'nil',
        }
      ],
    },
    {
      name: 'pipe',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink'
        }
      ],
    },
    {
      name: 'where',
      swiftReturns: 'AbstractDAO',
      args: [
        {
          name: 'predicate',
          swiftType: 'FoamPredicate'
        }
      ],
    },
    {
      name: 'orderBy',
      swiftReturns: 'AbstractDAO',
      args: [
        {
          name: 'comparator',
          swiftType: 'Comparator'
        }
      ],
    },
    {
      name: 'skip',
      swiftReturns: 'AbstractDAO',
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ],
    },
    {
      name: 'limit',
      swiftReturns: 'AbstractDAO',
      args: [
        {
          name: 'count',
          swiftType: 'Int'
        }
      ],
    },
    {
      name: 'listen',
      swiftReturns: 'Subscription',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
          swiftDefaultValue: 'ArraySink()',
        },
        {
          name: 'skip',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'order',
          swiftType: 'Comparator?',
          swiftDefaultValue: 'nil',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
          swiftDefaultValue: 'nil',
        }
      ],
    },
  ]
});
