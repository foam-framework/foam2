/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.approval;

import java.util.HashMap;
import java.util.Map;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestClassificationEnum;

/**
 * This class provides support for getting approval state (combined status) of
 * a series of approval requests given to it's {@code test} method.
 *
 * All approval requests have to run through {@code test()} for the
 * {@code rejected_} and {@code approval_} points to be collected and follow by
 * a {@code getState()} call to return the approval {@code state_} for all the
 * approval requests.
 *
 */
public class ApprovalTester {
  /**
   * The total rejected points collected. The rejection points are aggregated by
   * by approval request classification.
   */
  protected Map<String, Integer> rejected_ = new HashMap<>();

  /**
   * The total approval points collected. Use hash map to store and group the
   * approval points by approval request classification and the value of the
   * item in the hash map is a tuple (represented by two-element array) where
   * the first element store the total approval points collected and the
   * second is the total approval points required for the approval request.
   *
   * For example, the `approval_` with an item of ("class1", [2, 5]) entails
   * there are approval requests for "class1" that have 2 approval points and
   * total required points is 5.
   */
  protected Map<ApprovalRequestClassificationEnum, int[]> approval_ = new HashMap<>();

  /**
   * State is the combined status of approval requests.
   */
  protected ApprovalStatus state_;

  /**
   * Tests an approval request and updates the approval state_.
   *
   * If the approval request has status=REQUESTED then set state_ to REQUESTED.
   *
   * If there are sufficient rejected points collected then set state_ to
   * REJECTED.
   *
   *
   * @param request is the approval request to be tested
   * @return approval status of the test
   */
  public ApprovalStatus test(ApprovalRequest request) {
    if ( request.getStatus() == ApprovalStatus.REQUESTED
      || incrRejected(request) >= request.getRequiredRejectedPoints()
    ) {
      state_ = request.getStatus();
    } else {
      incrApproval(request);
    }
    return state_;
  }

  /**
   * Get approval state of approval requests run through the {@link test} thus
   * far.
   *
   * If state_ hasn't been set, check if there are sufficient approval points
   * collected for each classification of all the approval requests seen thus
   * far then returns APPROVED. Otherwise, {@code state_} is returned.
   *
   * @return approval state (combined status)
   */
  public ApprovalStatus getState() {
    if ( state_ == null
      && ! approval_.isEmpty()
      && approval_.values().stream()
          .allMatch(value -> value[0] >= value[1])
    ) {
      return ApprovalStatus.APPROVED;
    }
    return state_;
  }

  private void incrApproval(ApprovalRequest request) {
    ApprovalRequestClassificationEnum key = request.getClassificationEnum();
    int[] value = approval_.get(key);
    if ( value == null ) {
      value = new int[] { 0, request.getRequiredPoints() };
    }

    if ( request.getStatus() == ApprovalStatus.APPROVED ) {
      value[0] += request.getPoints();
    }
    approval_.put(key, value);
  }

  private int incrRejected(ApprovalRequest request) {
    String key = request.getClassification();
    int value = 0;
    if ( rejected_.containsKey(key) ) {
      value = rejected_.get(key);
    }

    if ( request.getStatus() == ApprovalStatus.REJECTED ) {
      value += request.getPoints();
      rejected_.put(key, value);
    }
    return value;
  }
}
