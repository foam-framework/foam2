package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;


public class ApprovalStatusTest extends ApprovalStatusTestExecutor {
  public ApprovalStatusTest() {
    super("all_successful", new ApprovalStatusTestExecutorState[] {
      // 1. initiator cannot approve own request
      // 2. initiator cannot reject own request
      // 3. initiator can cancel own request
      // 4. Someone else can approve the initiator's request
      // 5. Someone else can reject the initiator's request
      // 6. Someone else can cancel the initiator's request
      new ApprovalStatusTestExecutorState(ApprovalStatus.APPROVED, true),
      new ApprovalStatusTestExecutorState(ApprovalStatus.REJECTED, true),
      new ApprovalStatusTestExecutorState(ApprovalStatus.CANCELLED, true),
      new ApprovalStatusTestExecutorState(ApprovalStatus.APPROVED, false),
      new ApprovalStatusTestExecutorState(ApprovalStatus.REJECTED, false),
      new ApprovalStatusTestExecutorState(ApprovalStatus.CANCELLED, false),
    });
  }
}
