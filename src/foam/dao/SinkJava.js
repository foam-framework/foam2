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

foam.INTERFACE({
  refines: 'foam.dao.Sink',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ]
    },
    {
      name: 'remove',
      javaReturns: 'void',
      args: [
        {
          name: 'obj',
          javaType: 'Object'
        },
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        },
      ]
    },
    {
      name: 'eof',
      javaReturns: 'void'
    },
    {
      name: 'reset',
      javaReturns: 'void',
      args: [
        {
          name: 'sub',
          javaType: 'foam.core.Detachable'
        }
      ]
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.AbstractSink',
  flags: ['java'],
  methods: [
    // TODO: have a method of put() that doesn't include the Detachable argument
    {
      name: 'put',
      javaCode: 'return;'
    },
    {
      name: 'remove',
      javaCode: 'return;'
    },
    {
      name: 'eof',
      javaCode: 'return;'
    },
    {
      name: 'reset',
      javaCode: 'return;'
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.PredicatedSink',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaCode: `
        try {
          if ( getPredicate().f(obj) ) getDelegate().put(obj, sub);
        } catch (ClassCastException exp) {
        }
      `
    },
    {
      name: 'remove',
      javaCode: 'if ( getPredicate().f(obj) ) getDelegate().remove(obj, sub);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.LimitedSink',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaCode: 'if ( getCount() >= getLimit() ) {\n'
              + '  if ( sub != null ) sub.detach();\n'
              + '} else {\n'
              + '  setCount(getCount() + 1);\n'
              + '  getDelegate().put(obj, sub);\n'
              + '}\n'
    },
    {
      name: 'remove',
      javaCode: 'if ( getCount() >= getLimit() ) {\n'
              + '  if ( sub != null ) sub.detach();\n'
              + '} else {'
              + '  setCount(getCount() + 1);\n'
              + '  getDelegate().put(obj, sub);\n'
              + '}\n'
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.SkipSink',
  flags: ['java'],
  methods: [
    {
      name: 'put',
      javaCode: 'if ( getCount() < getSkip() ) {\n'
              + '  setCount(getCount() + 1);\n'
              + '  return;'
              + '}\n'
              + 'getDelegate().put(obj, sub);'
    },
    {
      name: 'remove',
      javaCode: 'if ( getCount() < getSkip() ) {\n'
              + '  setCount(getCount() + 1);\n'
              + '  return;'
              + '}\n'
              + 'getDelegate().remove(obj, sub);'
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.OrderedSink',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
                + 'getArray().add(obj);'
    },
    {
      name: 'eof',
      javaCode: 'if ( getArray() == null ) setArray(new java.util.ArrayList());\n'
                + 'java.util.Collections.sort(getArray(), getComparator());\n'
                + 'foam.dao.Subscription sub = new foam.dao.Subscription();\n'
                + 'for ( Object o : getArray() ) {\n'
                + '  if ( sub.getDetached() ) {\n'
                + '    break;\n'
                + '  }\n'
                + '  getDelegate().put(o, sub);\n'
                + '}'
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.DedupSink',
  flags: ['java'],

  methods: [
    {
      name: 'put',
      javaCode: 'if ( getResults() == null ) setResults(new java.util.HashSet<>());\n' +
      '    if ( ! getResults().contains(((foam.core.FObject)obj).getProperty("id")) ) {\n' +
      '      getDelegate().put(obj, sub);\n' +
      '      getResults().add(((foam.core.FObject)obj).getProperty("id"));\n' +
      '    }'
    }
  ]
});
