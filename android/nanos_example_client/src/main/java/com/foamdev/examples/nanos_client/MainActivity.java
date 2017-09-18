package com.foamdev.examples.nanos_client;

import android.os.Bundle;
import android.widget.*;
import android.view.*;

public class MainActivity extends android.app.ListActivity {
    //    protected TextView text;
    protected foam.dao.ClientDAO dao;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        foam.core.ProxyX proxyX = new foam.core.ProxyX();

        proxyX.put("registry", proxyX.create(foam.box.BoxRegistryBox.class));

        foam.box.ProxyBox me = proxyX.create(foam.box.ProxyBox.class);

        me.setDelegate((foam.box.Box)proxyX.get("registry"));

        proxyX.put("me", me);

        foam.box.HTTPBox box = proxyX.create(foam.box.HTTPBox.class);
        box.setUrl("http://localhost:8080/nSpecDAO");

        dao = proxyX.create(foam.dao.ClientDAO.class);
        dao.setDelegate(box);

        //        getListView().setAdapter(new ArrayAdapter<foam.nanos.boot.NSpec>(this, android.R.layout.simple_list_item_1, new foam.nanos.boot.NSpec[] { new foam.nanos.boot.NSpec((Object)"asdf", "hello", false, false, "serviceClass", "boxClass", "script", "client", null) }));

        final ArrayAdapter adapter = new ArrayAdapter<foam.nanos.boot.NSpec>(this, android.R.layout.simple_list_item_1);
        getListView().setAdapter(adapter);

        //               adapter.add(new foam.nanos.boot.NSpec((Object)"asdf", "hello", false, false, "serviceClass", "boxClass", "script", "client", null));

        final android.widget.ListView view = getListView();
        final android.app.ListActivity parent = this;
        new Thread(new Runnable() {
                public void run() {
                    final foam.dao.ArraySink sink;
                    try  {
                        sink = (foam.dao.ArraySink)dao.select(null);
                    } catch (final Exception e) {
                        parent.runOnUiThread(new Runnable() {
                                public void run() {
                                    adapter.clear();
                                    adapter.add("Failed to connect to server.");
                                    adapter.add(e);
                                }
                            });
                        return;
                    }

                    parent.runOnUiThread(new Runnable() {
                            public void run() {
                                adapter.clear();
                                adapter.addAll(sink.getArray().toArray());
                            }
                        });
                }
            }).start();

    }
}
