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

foam.CLASS({
  package: 'foam.dao',
  name: 'ValidationDAODecorator',
  extends: 'foam.dao.AbstractDAODecorator',
  documentation: 'DAO decorator that rejects puts of objects that are invalid.',
  methods: [
    function write(X, dao, obj, existing) {
      if ( obj.errors_ ) {
        return Promise.reject(foam.dao.ValidationException.create({
          errors: obj.errors_,
        }));
      }
      return Promise.resolve(obj);
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ValidationException',
  extends: 'foam.dao.ExternalException',
  properties: [
    'errors',
    {
      name: 'message',
      expression: function(errors) {
        return errors.join(', ');
      },
    },
  ],
});
