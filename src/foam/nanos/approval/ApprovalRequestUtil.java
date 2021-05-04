/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.approval;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.sink.Sum;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.approval.ApprovalRequest;
import foam.nanos.approval.ApprovalRequestClassificationEnum;

import static foam.mlang.MLang.*;

public class ApprovalRequestUtil {

  public static DAO getAllRequests(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return getAllRequests(x, (DAO) x.get("approvalRequestDAO"), objId, classification);
  }

  public static DAO getAllRequests(X x, DAO dao, Object objId, ApprovalRequestClassificationEnum classification) {
    return dao.where(AND(
      EQ(ApprovalRequest.OBJ_ID, objId),
      EQ(ApprovalRequest.CLASSIFICATION_ENUM, classification)
    ));
  }

  public static DAO getAllApprovalRequests(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return getAllRequests(x, objId, classification).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED));
  }

  public static DAO getAllApprovedRequests(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return getAllRequests(x, objId, classification).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED));
  }

  public static DAO getAllRejectedRequests(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return getAllRequests(x, objId, classification).where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED));
  }

  public static int getApprovedPoints(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return ((Double) ((Sum) getAllApprovedRequests(x, objId, classification).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }

  public static int getRejectedPoints(X x, Object objId, ApprovalRequestClassificationEnum classification) {
    return ((Double) ((Sum) getAllRejectedRequests(x, objId, classification).select(SUM(ApprovalRequest.POINTS))).getValue()).intValue();
  }
  public static ApprovalStatus getStatus(X x, Object id, ApprovalRequestClassificationEnum classification) {
    ApprovalRequest request = (ApprovalRequest) ((ArraySink)getAllRequests(x, id, classification).select(new ArraySink())).getArray().get(0);
    return getApprovedPoints(x, id, classification) >= request.getRequiredPoints()
      ? ApprovalStatus.APPROVED
      : getRejectedPoints(x, id, classification) >= request.getRequiredRejectedPoints()
        ? ApprovalStatus.REJECTED
        : ApprovalStatus.REQUESTED;
  }

  /**
   * Returns approval state (combined status) of a given collection of approval
   * requests.
   *
   * @param collection (DAO) of approval request
   * @return approval status (combined) for approval requests in the collection
   */
  public static ApprovalStatus getState(DAO collection) {
    ApprovalTester tester = new ApprovalTester();
    try {
      collection.select(new AbstractSink() {
        @Override
        public void put(Object obj, Detachable sub) {
          if ( tester.test((ApprovalRequest) obj) != null )
            // Approval request state is determined.
            // Therefore, throw to break out of AbstractSink.
            throw new RuntimeException();
          }
        }
      );
    } catch (Exception e){
      return tester.getState();
    }
    return tester.getState();
  }
}
