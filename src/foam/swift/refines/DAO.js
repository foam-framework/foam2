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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
    },
    {
      name: 'pipe',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink'
        }
      ],
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
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
      swiftEnabled: true,
    },
  ]
});
