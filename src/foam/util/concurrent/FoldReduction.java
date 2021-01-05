/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

/**
 * Interface for an object which can be both folded and reduced.
 * Useful for maintaining high-peformance concurrent state.
 **/
public interface FoldReduction {

  /** Create initial state. **/
  public State initialState();

  /** Fold a new update into a state. **/
  public void fold(State state, Operation op);

  /** Merge two states. **/
  public State reduce(State state1, State state2);

}
