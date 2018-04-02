/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.parse.StringParser;

public class FieldName extends foam.lib.parse.ProxyParser {

public FieldName() {
  setDelegate(new StringParser());
}

@Override
public PStream parse(PStream ps, ParserContext x) {
  ps = super.parse(ps, x);
  if ( ps == null || ps.value() == null) return null;  

    foam.core.PropertyInfo prop = (foam.core.PropertyInfo) ((foam.core.ClassInfo) x.get("classInfo"))
        .getAxiomByName((String) ps.value());

    if (prop != null) {
      return ps.setValue(prop);
    }
    return null;
  }
}
