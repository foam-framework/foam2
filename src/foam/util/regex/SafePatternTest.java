/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.test.ConcurrencyTest;
import foam.util.regex.SafePattern;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SafePatternTest
  implements ConcurrencyTest
{
  List list_ = null;
  long threadCount_ = 100L;
  String result_ = null;

  public SafePatternTest() {}

  public SafePatternTest(long threadCount) {
    threadCount_ = threadCount;
  }

  @Override
  public void setup(X x) {
    list_ = new ArrayList();

    for ( int i = 0; i < threadCount_; i++ ) {
      list_.add(String.format("%s.%s.%s.%s", i, i+1, i+2, i+3));
    }
  }

  @Override
  public void execute(X x) {
    try {
      // get random entry
      int n = (int) (Math.random() * list_.size());
      boolean even = (n % 2 == 0);
      String s = (String) list_.get(n);
      String pattern = "^"+n+"\\.\\d+\\.\\d+\\.\\d+";
      Pattern p;
      if ( even ) {
        p = SafePattern.compile(pattern);
      } else {
        p = Pattern.compile(pattern);
      }
      Matcher m = p.matcher(s);
      if ( ! m.matches() ) {
        String s = String.format("%s did not match on %s", pattern, s);
        if ( even ) {
          result_ = s;
        } else {
          // nop - expected
          System.out.println("expected failure: "+s);
        }
      }
    } catch ( Throwable t ) {
      result_ = t.getMessage();
      t.printStackTrace();
    }
  }

  public String result() {
    return result_;
  }
}
