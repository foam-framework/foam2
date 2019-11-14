/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

public interface AssemblyLine {
  // TODO: add a lock id
  public void enqueue(Assembly job);
}


/*
TODO:
public class NonBlockingAssemblyLine
implements AssemblyLine
{

  public void enqueue(Assembly job) {

  }
}
*/
