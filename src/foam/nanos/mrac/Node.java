package foam.nanos.mrac;

//TODO: model this class
public class Node {

    private int id;
    private String idString;
    private String host;
    private int port;

    public Node(int id, String host, int port) {
        this.id = id;
        this.idString = Integer.toString(id);
        this.host = host;
        this.port = port;
    }

    public int id() {
        return id;
    }

    public String idString() {
        return idString;
    }

    public String host() {
        return host;
    }

    public int port() {
        return port;
    }

}