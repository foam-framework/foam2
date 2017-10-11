package foam.box;

public class IdGenerator {
    private static volatile int nextId_ = 1;

    public static int nextId() {
        return nextId_++;
    }
}
