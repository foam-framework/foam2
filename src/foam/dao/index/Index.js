/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

/* Indexed Memory-based DAO. */

/*
 * TODO:
 *  update(oldValue, newValue)
 *  reuse plans
 *  add ability for indices to pre-populate data
 */

/** The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class. */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  methods: [
    /** JS-prototype based 'Flyweight' constructor. Creates plain
      javascript objects that are __proto__'d to a modeled instance. */
    function create(args) {
      var c = Object.create(this);
      args && c.copyFrom(args);
      c.init && c.init();
      return c;
    },

    /** Adds or updates the given value in the index */
    function put() {},

    /** Removes the given value from the index */
    function remove() {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(sink, skip, limit, order, predicate) {},

    /** @return the stored value for the given key. */
    function get() {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink */
    function select(sink, skip, limit, order, predicate) { },

    /** Selects matching items in reverse order from the index and puts
      them into sink */
    function selectReverse(sink, skip, limit, order, predicate) { },
  ]
});

