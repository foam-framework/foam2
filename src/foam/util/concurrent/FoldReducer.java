/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util.concurrent;

import java.util.*;


/** Thread(Local) state information. **/
class LocalState {
  FoldReducer fr_;
  State       state_;
  boolean     connected_ = false;

  public LocalState(FoldReducer fr) {
    fr_    = fr;
    state_ = fr_.initialState();
  }


  /**
   * Fold an operation into the state.
   *
   * Needs to be synchronized because it can be accessed by
   * either the local thread or by the FoldReducer.
   *
   * However, this lock should rarely be contested so the
   * overhead is very small.
   **/
   public synchronized void fold(Operation op) {
      // This looks like it could be a deadlock but
      // that isn't possible because this would have
      // to be connected first
      if ( ! connected_ ) {
         fr_.connect(this);

         connected_ = true;
      }

      fr_.getFoldReduction().fold(state_, op);
   }


  /**
   * Return the previous State while resetting to a new initialState
   *
   * @return the old state
   *
   * Needs to be synchronized because it can be accessed by
   * either the local thread or by the FoldReducer.
   *
   * However, this lock should rarely be contested so the
   * overhead is very small.
   **/
  public synchronized State resetState() {
    State ret = state_;

    state_ = fr_.initialState();

    connected_ = false;

    return ret;
  }
}


/**
 * This delegates to a FoldReduction rather than just being an AbstractFoldReduction because
 * this approach lets me model FoldReduction objects as JavaBeans if required.
 **/
public class FoldReducer {
  /**
   * Number of new LocalState connections which causes a FoldReduce
   * to prevent memory usage from accumulating
   **/
  protected final static int    CLEANUP_COUNT = 5000;

  protected final ThreadLocal   local__;
  protected final FoldReduction foldReduction_;
  protected final List          states_       = new ArrayList();
  protected       State         state_        = null;
  /** Number of LocalState objects connected since last FoldReduce. **/
  protected       int           connectCount_ = 0;

	public FoldReducer(FoldReduction FoldReduction) {
    foldReduction_ = FoldReduction;

    resetState();

    local__ = new ThreadLocal() {
      protected Object initialValue() {
        LocalState ret = new LocalState(FoldReducer.this);

        return ret;
      }
    };
	}


  protected synchronized void connect(LocalState local) {
    if ( connectCount_++ == CLEANUP_COUNT ) {
      connectCount_ = 0;
      getState();
    }

    states_.add(local);
  }


  public FoldReduction getFoldReduction() {
    return foldReduction_;
  }


  /**
   * Get the LocalState object specific to the calling Thread.
   * ie. a ThreadLocal copy
   **/
  public LocalState getLocalState() {
    LocalState local = (LocalState) local__.get();

    return local;
  }


	public State initialState() {
    return getFoldReduction().initialState();
  }

   // TODO: make not be an Operation
	public void fold(Operation op) {
    getLocalState().fold(op);
	}

  public synchronized void setState(State state) {
    state_ = state;
  }


  /**
   * Reset to initial state.
   *
   * @return the state just prior to being reset
   **/
  public synchronized State resetState() {
    State ret = getState();

    setState(initialState());

    return ret;
  }


  /**
   * Reduce all ThreadLocal States into a single State
   **/
	public synchronized State getState() {
    try {
      for ( Iterator i = states_.iterator() ; i.hasNext() ; ) {
        state_ = getFoldReduction().reduce(state_, ((LocalState) i.next()).resetState());
      }
    } finally {
      // Once we have called resetState above we must ensure it is disconnected which is
      // done by clearing out all LocalStates at once (faster then doing in resetState one
      // at a time). If the above exits with OOME the combination of the existing connect
      // (presence in states_) with a connected_ state of false can (and did) lead to
      // deadlock. This finally block adds some extra resilience.
      states_.clear();
    }

    return state_;
	}
}
