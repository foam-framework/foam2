/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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

// Most functors are async/blocking, but may offer a synchronous+fast 
// version as well
foam.INTERFACE({
  package: 'com.google.urlz'
  name: 'Functor',
  methods: [
    { 
      name: 'f',
      args: [
        'object', // the object to operate on
        'scope'   // runtime context for temporary storage
      ],
      returns: 'Thenable'
    },
    { name: 'toSync' },
    //{ name: 'runCost' }, // hmmmm??
  ]
})
// foam.INTERFACE({
//   name: 'FunctorSync',
//   methods: [
//     {
//       name: 'fsync'
//     }
//   ]
// })

foam.CLASS({
  name: 'DObject',
  package: 'com.google.urlz',
  implements: ['com.google.urlz.Functor'],
  
  properties: [
    '__src_url__'
  ],
  
  methods: [
    function f(obj, scope) {
      // By default, a local object returns itself
      return Promise.resolve(this);
    },
    function do(functor) {
      //return this.f().then(o => functor.f(o, {})); // async version for a stub object
      return functor.f(this, this.__context__.createSubContext());
    },
  ],
});

foam.CLASS({
  name: 'DObjectStub',
  package: 'com.google.urlz',
  extends: 'com.google.urlz.DObject',
  imports: ['Fetch'],
  
  methods: [
    function f(obj, scope) {
      // async object loads itself when run as a functor
      return this.Fetch(this.__src_url__);
    },
    function do(functor) {
      // get actual copy of object and run the functor
      return this.f().then(o => functor.f(o, o.__context__.createSubContext()));
      // more advanced impl. may send the functor off to run remotely
    }
  ]
})

foam.CLASS({
  name: 'Call',
  package: 'com.google.urlz.functors',
  implements: ['com.google.urlz.Functor'],
  
  properties: ['methodName', 'args'],
  
  methods: [
    function f(obj, scope) {
      var methodP = this.methodName.f(obj, scope);
      ps = this.args.map(function(a) {
        return a.f(obj, scope);
      });
      return methodP.then(method =>
        Promise.all(ps).then(results => 
          obj[method].apply(results)));
    },
    function fsync(obj, scope) {
      return obj[methodName.f(obj, scope)].apply(this.args.map(a => a.f(obj, scope)));
    }
  ],
});

foam.INTERFACE({
  name: 'Collection',
  package: 'com.google.urlz',
  
  methods: [
    'create', 'read', 'update', 'delete',
    'enumerator' // returns Functor
  ]
})
foam.CLASS({
  name: 'MapEnumerator', // for use with MapCollection
  package: 'com.google.urlz',
  
  properties: [
    'delegate'
  ],
  
  methods: [
    function f(obj, scope) {
      for (key in obj.map) {
        this.delegate.f(obj.map[key]);
      }
    }
  ]
})

foam.CLASS({
  name: 'Select',
  package: 'com.google.urlz',
  
  properties: ['delegate'],
  
  methods: [
    function f(obj, scope) {
      // obj is a collection
      var enumerator = obj.enumerator(this.delegate); // do not .f() the delegate, let enumerator() optimize it
      return enumerator.f(obj, scope);
    },
  ],
})


/*
// Something like U2 DSL, but for expressions

// Simple change to a single object, executes anywhere -----------

// o.a = o.b + o.c
// o.commit()

o.do(
  Commit(
    Set(PROP_A,
      Plus(PROP_B, PROP_C)
    )
  )
).then(function(dObj) {
  // continue with dObj's new confirmed state
}

// Async change to a separate object, executes anywhere -----------

// b.a = o.b + o.c
// b.commit()

b.do(
  Commit(
    Set(B_PROP_A,
      With(
        Fetch('/my/app/o'), // or Fetch(o.url_) if I have a local copy. Better way to include extra deps?
        Plus(A_PROP_B, A_PROP_C)
      )
    )
  )
).then(function(dObj) {
  // continue with dObj's new confirmed state
}


// Potential Transaction building ---------------
// With a context or state that is passed down might make variable-scoping easier

// o.a = b.a
// b.foo()
// b.commit()
// o.commit()

o.do(
  Scope({ 'b': Fetch(b.url_), 'o': o }, // scope is passed down and serialized as needed
    Do(
      Set(A_PROP_A, 
          With(Scoped(b.url_), B_PROP_A)
      ),
      With(Scoped('b'), // maybe shorter With(Scoped(...)) syntax
        Do(
          Call('foo'),
          Commit()
        )
      )
      With(Scoped('o'), Commit()),
      Return(Scoped('o')) // a With() that takes no subsequent op, "returning" the given value into the next .f()
    )
  )
)

// functors pass through a target object and a scope for sharing temporary objects
Functor.f(object, scope)

// things in scope are also Functors, such as Constant
Scope(scope, delegate)
Scope.f(obj, scope) {
  let childScope = this.scope;
  if (scope) {
    childScope = Object.create(scope);
    for (key in this.scope) {
      childScope[key] = this.scope[key];
    }
  }
  return delegate.f(obj, childScope);
}

// async so we can fetch. Avoid? Deps loaded at start instead? What about commit?
// maybe just fast cheater thenables that don't wait for next frame
With(withObj, delegate)
With.f(obj, scope) {
  return withObj.f(obj, scope).then(function(o) {
    return delegate.f(o, scope);
  });
}

Scoped(name, delegate)
Scoped.f(obj, scope) {
  return scope[name].f(obj, scope);
}

Commit()
Commit.f(obj, scope) {
  return obj.commit();
  // or this.context.commit(obj)?
}

If(predicate, trufe, falsey)
// Might be getting too crazy with loops
While(predicate, delegate)

Select(pred, order, delegate) // delegate runs on each query result
Select(obj, scope) {
  if (obj.select) {
    return obj.select... // is this just a Call()?
  }
  // or fall back on manual eval of collection
  // if array sort, then pred each item
  scope = Object.create(scope);
  scope.__select__ = {};
  var promises = [];
  for (key in obj) {
    var o = obj[key];
    // async predicates make a mess of ordering. Either make them sync, or convey ordering elsewhere.
    promises.push(this.pred.f(o, scope).then(function(b) { return b ? this.delegate.f(o, scope) : undefined; })
  }
  return Promose.all(promises);
}

Skip(num)
Skip.f(obj, scope) {
  // init scope.__select__ if needed
  function doSkip(count) {
    this.num.f(obj, scope).then(function(num) { // async predicates being difficult again
      return count > num;
    })
  }
  doSkip(++(scope.__select__.skip)); // count recorded in the order called
}
*/