/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.test',
  name: 'AllProperties',
  properties: [
    {
      class: 'foam.core.Int',
      name: 'intProp'
    },
    {
      class: 'foam.core.String',
      name: 'stringProp'
    },
    {
      class: 'foam.core.FObjectArray',
      of: 'foam.test.TestObj',
      name: 'fObjectArrayProp'
    },
    {
      class: 'foam.core.Object',
      name: 'objectProp'
    },
    {
      class: 'foam.core.Function',
      name: 'functionProp'
    },
    {
      class: 'foam.core.StringArray',
      name: 'stringArray'
    },
    {
      class: 'foam.core.Class',
      name: 'classProp'
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.test.TestObj',
      name: 'fObjectPropertyProp'
    },
    {
      class: 'foam.core.EMail',
      name: 'emailProp'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpecProp'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.test.TestEnum',
      name: 'enumProp'
    },
    {
      class: 'foam.core.Date',
      name: 'dateProp'
    },
    {
      class: 'foam.core.DateTime',
      name: 'dateTimeProp'
    },
    {
      class: 'foam.core.Float',
      name: 'floatProp'
    },
    {
      class: 'foam.core.Long',
      name: 'longProp'
    },
    {
      class: 'foam.core.UnitValue',
      name: 'currencyProp'
    },
    {
      class: 'foam.core.Color',
      name: 'colorProp'
    },
    // {
    //   class: 'foam.core.Reference',
    //   name: 'reference'
    // },
    {
      class: 'foam.core.Array',
      name: 'arrayProp'
    },
    {
      class: 'foam.core.Map',
      name: 'mapProp'
    },
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatterProp'
    },
    {
      class: 'foam.core.Byte',
      name: 'byteProp'
    },
    {
      class: 'foam.core.Short',
      name: 'shortProp'
    },
    {
      class: 'foam.core.Double',
      name: 'doubleProp'
    },
    {
      class: 'foam.core.List',
      name: 'listProp'
    },
    {
      class: 'foam.core.Image',
      name: 'imageProp'
    },
    {
      class: 'foam.core.URL',
      name: 'urlProp'
    },
    {
      class: 'foam.core.Password',
      name: 'passwordProp'
    },
    {
      class: 'foam.core.PhoneNumber',
      name: 'phoneNumberProp'
    },
    // {
    //   class: 'foam.core.MultiPartID',
    //   name: 'multiPartID'
    // },
    {
      class: 'foam.parse.ParserArray',
      name: 'parserArrayProp'
    },
    {
      class: 'foam.parse.ParserProperty',
      name: 'parserPropertyProp'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'exprPropertyProp'
    },
    {
      class: 'foam.mlang.SinkProperty',
      name: 'sinkPropertyProp'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicatePropertyProp'
    },
    {
      class: 'foam.mlang.predicate.PredicateArray',
      name: 'predicateArrayProp'
    },
    // {
    //   class: 'foam.dao.RelationshipProperty',
    //   name: 'relationshipProperty'
    // },
    {
      class: 'foam.core.Blob',
      name: 'blobProp'
    },
    // {
    //   class: 'foam.core.Stub',
    //   name: 'stub'
    // },
    {
      class: 'foam.u2.ViewFactory',
      name: 'viewFactoryProp'
    },
    {
      class: 'foam.core.Int',
      transient: true,
      name: 'transientInt'
    },
    {
      class: 'foam.core.String',
      transient: true,
      name: 'transientString'
    },
    {
      class: 'foam.core.FObjectArray',
      of: 'foam.test.TestObj',
      transient: true,
      name: 'transientFObjectArray'
    },
    {
      class: 'foam.core.Object',
      transient: true,
      name: 'transientObject'
    },
    {
      class: 'foam.core.Function',
      transient: true,
      name: 'transientFunction'
    },
    {
      class: 'foam.core.StringArray',
      transient: true,
      name: 'transientStringArray'
    },
    {
      class: 'foam.core.Class',
      transient: true,
      name: 'transientClass'
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.test.TestObj',
      transient: true,
      name: 'transientFObjectProperty',
    },
    {
      class: 'foam.core.EMail',
      transient: true,
      name: 'transientEMail'
    },
    {
      class: 'foam.u2.ViewSpec',
      transient: true,
      name: 'transientViewSpec'
    },
    {
      class: 'foam.core.Enum',
      transient: true,
      of: 'foam.test.TestEnum',
      name: 'transientEnum'
    },
    {
      class: 'foam.core.Date',
      transient: true,
      name: 'transientDate'
    },
    {
      class: 'foam.core.DateTime',
      transient: true,
      name: 'transientDateTime'
    },
    {
      class: 'foam.core.Float',
      transient: true,
      name: 'transientFloat'
    },
    {
      class: 'foam.core.Long',
      transient: true,
      name: 'transientLong'
    },
    {
      class: 'foam.core.UnitValue',
      transient: true,
      name: 'transientCurrency'
    },
    {
      class: 'foam.core.Color',
      transient: true,
      name: 'transientColor'
    },
    // {
    //   class: 'foam.core.Reference',
    //   transient: true,
    //   name: 'transientReference'
    // },
    {
      class: 'foam.core.Array',
      transient: true,
      name: 'transientArray'
    },
    {
      class: 'foam.core.Map',
      transient: true,
      name: 'transientMap'
    },
    {
      class: 'foam.u2.view.TableCellFormatter',
      transient: true,
      name: 'transientTableCellFormatter'
    },
    {
      class: 'foam.core.Byte',
      transient: true,
      name: 'transientByte'
    },
    {
      class: 'foam.core.Short',
      transient: true,
      name: 'transientShort'
    },
    {
      class: 'foam.core.Double',
      transient: true,
      name: 'transientDouble'
    },
    {
      class: 'foam.core.List',
      transient: true,
      name: 'transientList'
    },
    {
      class: 'foam.core.Image',
      transient: true,
      name: 'transientImage'
    },
    {
      class: 'foam.core.URL',
      transient: true,
      name: 'transientURL'
    },
    {
      class: 'foam.core.Password',
      transient: true,
      name: 'transientPassword'
    },
    {
      class: 'foam.core.PhoneNumber',
      transient: true,
      name: 'transientPhoneNumber'
    },
    // {
    //   class: 'foam.core.MultiPartID',
    //   transient: true,
    //   name: 'transientMultiPartID'
    // },
    {
      class: 'foam.parse.ParserArray',
      transient: true,
      name: 'transientParserArray'
    },
    {
      class: 'foam.parse.ParserProperty',
      transient: true,
      name: 'transientParserProperty'
    },
    {
      class: 'foam.mlang.ExprProperty',
      transient: true,
      name: 'transientExprProperty'
    },
    {
      class: 'foam.mlang.SinkProperty',
      transient: true,
      name: 'transientSinkProperty'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      transient: true,
      name: 'transientPredicateProperty'
    },
    {
      class: 'foam.mlang.predicate.PredicateArray',
      transient: true,
      name: 'transientPredicateArray'
    },
    // {
    //   class: 'foam.dao.RelationshipProperty',
    //   transient: true,
    //   name: 'transientRelationshipProperty'
    // },
    {
      class: 'foam.core.Blob',
      transient: true,
      name: 'transientBlob'
    },
    {
      class: 'foam.u2.ViewFactory',
      transient: true,
      name: 'transientViewFactory'
    }
  ],
  classes: [
    {
      name: 'InnerClass1',
      properties: [
        {
          class: 'String',
          name: 'name'
        }
      ]
    }
  ],
  static: [
    function createPopulated() {
      return foam.test.AllProperties.create({
        intProp: 12,
        stringProp: "asdf",
        fObjectArrayProp: [foam.test.TestObj.create({ description: 'An object in an array!' }),
                           foam.test.TestObj.create({ description: 'Another object in an array!' })],
        objectProp: [1, 2, 3],
//        function: null,
        stringArrayProp: ['Hello', 'World'],
        classProp: foam.test.AllProperties,
        fObjectPropertyProp: foam.test.TestObj.create({ description: 'some object' }),
        emailProp: 'test@example.com',
//        viewSpec: null
        enumProp: foam.test.TestEnum.BAR,
        dateProp: new Date("1995-12-17T03:24:00"),
        dateTimeProp: new Date("1995-12-18T04:23:44"),
        floatProp: 1.2345,
        longProp: 12341234,
        currencyProp: 342342,
        colorProp: 'rgba(0, 0, 255, 0)',
//        list: null
        imageProp: '/favicon/favicon-32x32.png',
        urlProp: 'https://google.com/',
        passwordProp: 'superSecret111!',
        phoneNumberProp: '555-3455'
      });
    }
  ]
});
