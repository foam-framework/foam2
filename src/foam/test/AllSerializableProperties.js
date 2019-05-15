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
  name: 'AllSerializableProperties',
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
    // {
    //   class: 'foam.core.Function',
    //   name: 'functionProp'
    // },
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
      class: 'foam.core.Currency',
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
    // {
    //   class: 'foam.core.List',
    //   name: 'listProp'
    // },
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
    {
      class: 'foam.core.Blob',
      name: 'blobProp'
    },
  ],
  static: [
    function createPopulated() {
      return foam.test.AllSerializableProperties.create({
        intProp: 12,
        stringProp: "asdf",
        fObjectArrayProp: [foam.test.TestObj.create({ description: 'An object in an array!' }),
                           foam.test.TestObj.create({ description: 'Another object in an array!' })],
        objectProp: [1, 'foo', new Date(), foam.test.AllSerializableProperties, [3, 4]],
//        function: null,
        stringArrayProp: ['Hello', 'World'],
        classProp: foam.test.AllSerializableProperties,
        fObjectPropertyProp: foam.test.TestObj.create({ description: 'some object' }),
        emailProp: 'test@example.com',
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
