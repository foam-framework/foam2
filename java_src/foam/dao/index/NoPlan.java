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
package foam.dao.index;

import foam.core.FObject;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import java.util.Comparator;

/** Have-no-plan Plan. **/
public class NoPlan implements FindPlan, SelectPlan
{
  protected final static NoPlan instance_ = new NoPlan();

  public static NoPlan instance() { return instance_; }

  protected NoPlan() {}

  public long cost() { return Long.MAX_VALUE; }

  public FObject find(Object state, Object key) {
    throw new IllegalStateException("Attempt to use NoPlan.");
  }

  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    throw new IllegalStateException("Attempt to use NoPlan.");
  }
}
