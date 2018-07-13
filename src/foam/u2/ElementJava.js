/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2',
  name: 'BooleanElementJavaRefine',
  refines: 'foam.core.Boolean',
  properties: [ 'tableCellFormatter', 'tableCellView', 'tableWidth', 'attribute', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'CurrencyElementJavaRefine',
  refines: 'foam.core.Currency',
  properties: [ 'tableCellFormatter' , 'precision' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'DateElementJavaRefine',
  refines: 'foam.core.Date',
  properties: [ 'tableCellFormatter' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'DateTimeElementJavaRefine',
  refines: 'foam.core.DateTime',
  properties: [ 'tableCellFormatter', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'DoubleElementJavaRefine',
  refines: 'foam.core.Double',
  properties: [ 'tableCellFormatter', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'EnumElementJavaRefine',
  refines: 'foam.core.Enum',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FloatElementJavaRefine',
  refines: 'foam.core.Float',
  properties: [ 'view' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectArrayElementJavaRefine',
  refines: 'foam.core.FObjectArray',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectPropertyElementJavaRefine',
  refines: 'foam.core.FObjectProperty',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'IntElementJavaRefine',
  refines: 'foam.core.Int',
  properties: [ 'attribute' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'LongElementJavaRefine',
  refines: 'foam.core.Long',
  properties: [ 'tableCellFormatter', 'visibility', 'tableWidth' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ModelElementJavaRefine',
  refines: 'foam.core.Model',
  properties: [ 'tableProperties', 'tableColumns', 'generateJava', 'searchColumns', 'tableCellFormatter', 'css', 'import', 'description' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyElementJavaRefine',
  refines: 'foam.core.Property',
  properties: [ 'tableCellFormatter', 'searchView', 'attribute', 'view' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ReferenceElementJavaRefine',
  refines: 'foam.core.Reference',
  properties: [ 'view', 'visibility' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'StringElementJavaRefine',
  refines: 'foam.core.String',
  properties: [ 'tableCellFormatter', 'tableCellView', 'displayWidth', 'view', 'visibility', 'tableWidth', 'description' ]
});
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'AddressDetailView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'PhoneDetailView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',
  properties: [ 'code' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Element',
  methods: [ 
    function initE() { }
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Tab'
});
foam.CLASS({
  package: 'foam.u2',
  name: 'Tabs',
  methods: [ 
    function add() { },
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'TextField',
  methods: [ 
    function fromProperty() { } ,
    function load() { },
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FloatView',
  methods: [ 
    function initE() { } ,
  ],
});
foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  methods: [ 
    function fromProperty() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Input',
  methods: [ 
    function initE() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Select',
  methods: [ 
    function initE() { } 
  ],
});
foam.CLASS({
  package: 'foam.u2.tag',
  name: 'TextArea',
  methods: [ 
    function initE() { } ,
    function load() { },
  ],
});
foam.CLASS({
  package: 'foam.graphics',
  name: 'Transform'
});
foam.CLASS({
  package: 'foam.graphics',
  name: 'Canvas'
});
