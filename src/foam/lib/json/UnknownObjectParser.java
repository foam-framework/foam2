/**
  * @license
  * Copyright 2017 The FOAM Authors. All Rights Reserved.
  * http://www.apache.org/licenses/LICENSE-2.0
  */

  package foam.lib.json;
  
  import foam.lib.parse.*;
  
  public class UnknownObjectParser
    extends ProxyParser
  {
    public UnknownObjectParser() {
      super(new Seq0(new Whitespace(),
                     new Literal("{"),
                     new UnknownPropertiesParser(),
                     new Whitespace(),
                     new Literal("}")));
    }
  }