/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib;

import foam.core.FObject;

import java.io.Closeable;
import java.io.Flushable;

// not modelled because method with
// name stringify is not generated
public interface Outputter
  extends Closeable, Flushable
{
  String stringify(FObject obj);
  void output(Object value);
}