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
      name: 'int'
    },
    {
      class: 'foam.core.String',
      name: 'string'
    },
    {
      class: 'foam.core.FObjectArray',
      of: 'foam.test.TestObj',
      name: 'fObjectArray'
    },
    {
      class: 'foam.core.Object',
      name: 'object'
    },
    {
      class: 'foam.core.Function',
      name: 'function'
    },
    {
      class: 'foam.core.StringArray',
      name: 'stringArray'
    },
    {
      class: 'foam.core.Class',
      name: 'class'
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.test.TestObj',
      name: 'fObjectProperty'
    },
    {
      class: 'foam.core.EMail',
      name: 'eMail'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewSpec'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.test.TestEnum',
      name: 'enum'
    },
    {
      class: 'foam.core.Date',
      name: 'date'
    },
    {
      class: 'foam.core.DateTime',
      name: 'dateTime'
    },
    {
      class: 'foam.core.Float',
      name: 'float'
    },
    {
      class: 'foam.core.Long',
      name: 'long'
    },
    {
      class: 'foam.core.Currency',
      name: 'currency'
    },
    {
      class: 'foam.core.Color',
      name: 'color'
    },
    // {
    //   class: 'foam.core.Reference',
    //   name: 'reference'
    // },
    {
      class: 'foam.core.Array',
      name: 'array'
    },
    {
      class: 'foam.core.Map',
      name: 'map'
    },
    {
      class: 'foam.u2.view.TableCellFormatter',
      name: 'tableCellFormatter'
    },
    {
      class: 'foam.core.Byte',
      name: 'byte'
    },
    {
      class: 'foam.core.Short',
      name: 'short'
    },
    {
      class: 'foam.core.Double',
      name: 'double'
    },
    {
      class: 'foam.core.List',
      name: 'list'
    },
    {
      class: 'foam.core.Image',
      name: 'image'
    },
    {
      class: 'foam.core.URL',
      name: 'uRL'
    },
    {
      class: 'foam.core.Password',
      name: 'password'
    },
    {
      class: 'foam.core.PhoneNumber',
      name: 'phoneNumber'
    },
    // {
    //   class: 'foam.core.MultiPartID',
    //   name: 'multiPartID'
    // },
    {
      class: 'foam.parse.ParserArray',
      name: 'parserArray'
    },
    {
      class: 'foam.parse.ParserProperty',
      name: 'parserProperty'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'exprProperty'
    },
    {
      class: 'foam.mlang.SinkProperty',
      name: 'sinkProperty'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicateProperty'
    },
    {
      class: 'foam.mlang.predicate.PredicateArray',
      name: 'predicateArray'
    },
    // {
    //   class: 'foam.dao.RelationshipProperty',
    //   name: 'relationshipProperty'
    // },
    {
      class: 'foam.core.Blob',
      name: 'blob'
    },
    // {
    //   class: 'foam.core.Stub',
    //   name: 'stub'
    // },
    {
      class: 'foam.u2.ViewFactory',
      name: 'viewFactory'
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
      class: 'foam.core.Currency',
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
  ]
});
