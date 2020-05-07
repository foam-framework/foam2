/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'OrgChart',
  extends: 'foam.graphics.TreeGraph',

  exports: [ 'showSalaries' ],

  properties: [
    [ 'width', 1300 ],
    [ 'height', 1000 ],
    [ 'x', 0 ],
    [ 'y', 0 ],
    {
      class: 'Boolean',
      name: 'showSalaries',
      value: false
    },
    {
      name: 'formatNode',
      value: function() {
        var c = this.hsl(Math.random()*360, 90, 45);
        var lead = this.data.lead;
        var showSalaries = this.__context__.showSalaries;

        this.add(this.Label.create({color: 'black', x: -this.width/2+10, y: 7, text: this.data.name, font: 'bold 15px sans-serif'}));
        this.add(this.Label.create({color: '#111',  x: this.width/2-8, y: 6, align: 'end', text: this.data.count, font: '15px sans-serif'}));

        if ( showSalaries ) {
          var salary = this.data.salary.toLocaleString("en-US", {style: "currency", currency: 'USD', minimumFractionDigits:0});
          this.add(this.Label.create({color: '#111',  x: this.width/2-8, y: -20, align: 'end', text: salary, font: '15px sans-serif'}));
        }

        if ( lead ) {
          this.add(this.Label.create({color: 'black',  x: -this.width/2+10, y: 22, text: lead.name + ', ' + lead.title, font: 'bold 13px sans-serif'}));
          if ( showSalaries ) {
            var lsalary = (lead.salary/1000).toLocaleString("en-US", {style: "currency", currency: 'USD', minimumFractionDigits:0});
            this.add(this.Label.create({color: 'black',  x:  this.width/2-8, y: 22, align: 'end', text: lsalary + 'k', font: 'bold 13px sans-serif'}));
          }
        }

        for ( var row = 0 ; row < this.data.members.length ; row++ ) {
          var e = this.data.members[row];
          this.add(this.Label.create({
            color: '#111',
            x: -this.width/2+10,
            y: 20+16*(row+1.5),
            text: e.name + ', ' + e.title,
            font: showSalaries ? '10px sans-serif' : '14px sans-serif'}));
          if ( showSalaries ) {
            var esalary = (e.salary/1000).toLocaleString("en-US", {style: "currency", currency: 'USD', minimumFractionDigits:0});
            this.add(this.Label.create({color: '#111',  x: this.width/2-8,   y: 20+16*(row+1.5), align: 'end', text: esalary + 'k', font: '12px sans-serif'}));
          }
        }
        /*
        this.add(this.Line.create({
          startX: -this.width/2+7,
          startY: 5,
          endX: -this.width/2+7,
          endY: this.height-5,
          color: c,
          lineWidth: 4
        }));
        */
      }
    },
    {
      name: 'teams',
      factory: function() {
        var ts = {};
        var d = [
          'R&D,,Kevin',
          'Platform,R&D,Mia',
          'Product,R&D,Jacob',
          'Security,R&D,Benjamin',
          'QA,Product,Ava',
          'Application Development,Product,Mike',
          'Transactions,Product,Grayson',
          'IT,Product,Lincoln',
          'Team A,Application Development,Leo',
          'Team B,Application Development,Kenny',
          'Services,Product,Jack',
          'nanoMeter,Services',
          'Developer Support,Services',
          'DevOps,Product,TBD'
        ];
        for ( var i = 0 ; i < d.length ; i++ ) {
          var t = d[i].split(',');
          var e = this.employees[t[2]];
          var team = ts[t[0]] = {
            name: t[0],
            parent: t[1],
            count: e ? 1 : 0,
            salary: e ? e.salary : 0,
            lead: e,
            children: [],
            members: []
          };
          if ( i ) {
            ts[t[1]].children.push(team);
            var t2 = ts[t[1]];
            while ( t2 ) {
              console.log(t2.name);
              t2.count += team.count;
              t2.salary += team.salary;
              t2 = ts[t2.parent];
            }
          }
        }

        for ( var key in this.employees ) {
          var e = this.employees[key];
          if ( ! ts[e.team] ) continue;
          try {
            var team = ts[e.team];
            if ( e !== team.lead ) {
              team.members.push(e);
              var t2 = team;
              while ( t2 ) {
                console.log(t2.name);
                t2.count++;
                t2.salary += e.salary;
                t2 = ts[t2.parent];
              }
            }
          } catch(x) {console.log(x);}
        }
        return ts;
      }
    },
    {
      name: 'employees',
      factory: function() {
        var es = {};
        var d = [
          'Sophia,QA,QA Engineer',
          'Olivia,Liquid,Software Engineer',
          'Jackson,nanoMeter,Software Engineer',
          'Noah,nanoMeter,Software Engineer',
          'Liam,nanoMeter,Software Engineer',
          'Lucas,Liquid,Software Engineer',
          'Benjamin,Security,Software Engineer',
          'Oliver,Developer Support,Software Engineer',
          'Ethan,Integrations,Software Engineer',
          'Jacob,,VP of R&D',
          'Emma,Platform,Software Engineer',
          'Leo,Liquid,Team Lead',
          'Logan,R&D,CTO',
          'Amelia,Developer Support,Technical Writer',
          'Aria,QA,QA Engineer',
          'William,Transactions,Software Engineer',
          'Grayson,Transactions,Systems Analyst',
          'Charlotte,Ablii,Software Engineer',
          'Grayson,Transactions,Software Engineer',
          'Jack,Ablii,Team Lead',
          'Ava,QA,QA Lead',
          'Mia,Security,Software Engineer',
          'Jack,Liquid,Director of Engineering',
          'James,Developer Support,Scientist (Contractor)',
          'Aiden,Platform,Software Engineer',
          'Lincoln,IT,Sys Admin'
        ];

        for ( var i = 0 ; i < d.length ; i++ ) {
          var e = d[i].split(',');
          es[e[0]] = {
            name: e[0],
            team: e[1],
            title: e[2],
            salary: e[3] ? Number.parseInt(e[3]) : 0
          }
        }

        return es;
      }
    }
  ],

  methods: [
    function expand(node) {
      for ( var i = 0 ; i < node.data.children.length ; i++ ) {
        var c = node.data.children[i];
        node.addChildNode({data: c, height: 140, width: 224, border: 'black'});
        var child = node.childNodes[node.childNodes.length-1];
        this.expand(child);
      }
    },
    function init() {
      var g = this.TreeNode.create({expanded: true, x:500, width: 216, height: 110, y:40, data: this.teams['R&D'], border: 'black'}, this);
      this.root = g;
      this.expand(g);
      this.add(g);
      /*
      this.add(g.addChildNode().addChildNode().addChildNode().addChildNode());
      g.childNodes[0].addChildNode();
      g.childNodes[0].addChildNode();
      g.childNodes[0].childNodes[0].childNodes[0].addChildNode().addChildNode().addChildNode();
      g.childNodes[0].childNodes[1].addChildNode();
      g.childNodes[1].addChildNode();
      // g.childNodes[1].childNodes[0].addChildNode(); // TODO: not supported
      g.childNodes[2].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].addChildNode();
      g.childNodes[2].childNodes[0].childNodes[1].addChildNode();
      g.childNodes[2].childNodes[0].childNodes[2].addChildNode().addChildNode();
      */
    }
  ]
});
