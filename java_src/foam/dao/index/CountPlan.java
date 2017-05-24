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

import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.Count;
import java.util.Comparator;

public class CountPlan implements SelectPlan
{
  protected long count_;

  public CountPlan(long count) { count_ = count; }

  public long cost() { return 0; }

  public void select(Object state, Sink sink, int skip, int limit, Comparator order, Predicate predicate) {
    ((Count) sink).setValue((int)count_);
  }

  public String toString() { return "short-circuit-count(" + count_ + ")"; }
}