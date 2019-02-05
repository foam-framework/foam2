/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
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

package foam.dao.java;

import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.X;

/**
 * This DAO is a decorator around the innerDAO (MapDAO, MDAO, etc.). It returns
 * the innerDAO when replaying journal directly into the innerDAO, bypassing
 * all of the decorators.
 */
public class FindReplayDAO
  extends ProxyDAO {

  public final static Object FIND_REPLAY_DAO_CMD = new Object();

  public FindReplayDAO (DAO d) {
    setDelegate(d);
  }

  public Object cmd_ (X x, Object obj) {
    if ( obj == FIND_REPLAY_DAO_CMD ) {
      return getDelegate();
    }

    return super.cmd_(x, obj);
  }
}
