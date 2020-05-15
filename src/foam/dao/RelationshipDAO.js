/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RelationshipDAO',
  extends: 'foam.dao.FilteredDAO',

  requires: [
    'foam.mlang.predicate.Eq'
  ],

  documentation: 'Adapts a DAO based on a Relationship.',

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'Object',
      name: 'sourceId'
    },
    {
      class: 'String',
      name: 'targetDAOKey'
    },
    {
      class: 'String',
      name: 'unauthorizedTargetDAOKey'
    },
    {
      class: 'Object',
      name: 'targetProperty',
      javaType: 'foam.core.PropertyInfo',
      swiftType: 'PropertyInfo'
    },
    {
      name: 'predicate',
      factory: function() {
        return this.Eq.create({ arg1: this.targetProperty, arg2: this.sourceId });
      },
      javaFactory: 'return foam.mlang.MLang.EQ(getTargetProperty(), getSourceId());',
      swiftFactory: `
        return Eq_create([
          "arg1": self.targetProperty,
          "arg2": self.sourceId
        ])
      `,
    },
    {
      name: 'delegate',
      factory: function() {
        var key      = this.targetDAOKey;
        var delegate = this.__context__[key];

        foam.assert(delegate, 'Missing relationship DAO:', key);

        return delegate;
      },
      javaFactory:`
      try {
        Subject subject = (Subject) getX().get("subject");
//        User user = ((Subject) getX().get("subject")).getUser();
        if ( subject != null && subject.getUser() != null && subject.getUser().getId() == User.SYSTEM_USER_ID && getUnauthorizedTargetDAOKey().length() != 0 ) {
          return ((foam.dao.DAO) getX().get(getUnauthorizedTargetDAOKey())).inX(getX());
        }
        return ((foam.dao.DAO) getX().get(getTargetDAOKey())).inX(getX());
      } catch ( NullPointerException e ) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
        logger.error("TargetDAOKey", getTargetDAOKey(), "not found.", e);
        throw e;
      }
      `,
      swiftFactory: `return __context__[targetDAOKey] as! foam_dao_DAO`,
    }
  ],

  methods: [
    {
      name: 'put_',
      type: 'FObject',
      code: function put_(x, obj) {
        return this.SUPER(x, this.adaptTarget(obj));
      },
      javaCode: `return super.put_(x, adaptTarget(obj));`,
      swiftCode: `return try super.put_(x, adaptTarget(obj))`
    },
    {
      name: 'adaptTarget',
      type: 'FObject',
      args: [
        {
          name: 'target',
          type: 'FObject'
        }
      ],
      javaCode: `
        getTargetProperty().set(target, getSourceId());
        return target;
      `,
      code: function(target) {
        this.targetProperty.set(target, this.sourceId);
        return target;
      },
      swiftCode: `
        targetProperty.set(target, value: sourceId)
        return target;
      `,
    },

    function clone() {
      // Prevent cloneing
      return this;
    }
  ]
});
