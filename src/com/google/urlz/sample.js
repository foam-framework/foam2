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
// A context or state that is passed down might make variable-scoping easier

// o.a = b.a
// b.foo()
// b.commit()
// o.commit()

o.do(
  Scope(Fetch(b.url_), o, // scope is passed down and serialized as needed
    AllOf(// ordering? serial, parallel, any order...
      Set(A_PROP_A, 
          With(Scoped(b.url_), B_PROP_A)
      ),
      With(Scoped(b.url_), Commit()), // maybe shorter With(Scoped(...)) syntax
      With(Scoped(o.url_), Commit()),
      Return(Scoped(o.url_)) // a With() that takes no subsequent op, "returning" the given value into the next .f()
    )
  )
)
