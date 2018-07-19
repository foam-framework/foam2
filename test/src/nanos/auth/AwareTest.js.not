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

describe('Created/LastModified Aware tests', function() {
  it('should set created/By, lastModifed/By properties on put()', function(done) {
    foam.CLASS({
      package: 'foam.nanos.auth',
      name: 'AwareTest',

      implements: [
        'foam.nanos.auth.CreatedAware',
        'foam.nanos.auth.CreatedByAware',
        'foam.nanos.auth.LastModifiedAware',
        'foam.nanos.auth.LastModifiedByAware'
      ],

      properties: [
        {
          class: 'Long',
          name: 'id',
        },
        {
          class: 'String',
          name: 'name',
        },
        {
          class: 'DateTime',
          name: 'created'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'createdBy'
        },
        {
          class: 'DateTime',
          name: 'lastModified'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'lastModifiedBy'
        }
      ]
    });

    expect( typeof foam.nanos.auth.User ).not.toBeUndefined();
    var user = foam.nanos.auth.User.create({
      'id': 1,
      'firstName': 'Test',
      'lastName': 'Test' });
    var ctx = foam.createSubContext({ 'user': user });
    var of = foam.nanos.auth.AwareTest;
    expect(of).not.toBeNull();
    var dao = foam.nanos.auth.CreatedAwareDAO.create({
      x: ctx,
      delegate: foam.nanos.auth.CreatedByAwareDAO.create({
        x: ctx,
        delegate: foam.nanos.auth.LastModifiedAwareDAO.create({
          x: ctx,
          delegate: foam.nanos.auth.LastModifiedByAwareDAO.create({
            x: ctx,
            delegate: foam.dao.SequenceNumberDAO.create({
              x: ctx,
              delegate: foam.dao.ArrayDAO.create({
                of: of
              })
            })
          })
        })
      })
    });

    return dao.put_(ctx, of.create({ 'name': 'first' })).then(function(a) {
      expect(a).not.toBeNull();
      expect(a.createdBy).toBe(user.id);
      expect(a.created).not.toBeNull();
      expect(a.lastModifiedBy).toBe(user.id);
      expect(a.lastModified).not.toBeNull();
      expect(a.id).not.toBeNull();

      // delay to test last modified
      setTimeout(function() {
        return dao.put_(ctx, of.create().copyFrom(a)).then(function(c) {
          expect(c).not.toBeNull();
          expect(c.id).toEqual(a.id);
          expect(c.createdBy).not.toBeNull();
          expect(c.createdBy).toEqual(a.createdBy);
          expect(c.created).not.toBeNull();
          var delta = c.created.getTime() - a.created.getTime();
          // expect(c.created.getTime()).toEqual(a.created.getTime());
          expect(delta).toEqual(0);
          expect(c.lastModifiedBy).toEqual(a.lastModifiedBy);
          expect(c.lastModified.getTime()).not.toEqual(a.lastModified.getTime());
          done();
        }, 1000);
      });
    });
  });
});
