var ExpressUrlchart;
var ExpressUrloptions
var ExpressUrldata;
var mostPopularMethodCalls = [];
function drawExpressUrlChart() {

  ExpressUrldata = new google.visualization.DataTable();
  ExpressUrldata.addColumn('string', 'method');
  ExpressUrldata.addColumn('number', 'frequency');
  ExpressUrldata.addColumn({type: 'string', role: 'tooltip'});

  ExpressUrloptions = {
    title: 'Most Frequently Called Express Routes',
    backgroundColor: '#3b4b54',
    legendTextStyle: { color: '#FFF' },
    titleTextStyle: { color: '#FFF' },
    hAxis: {
      textStyle:{color: '#FFF'}
    },
    vAxis: {
      textStyle:{color: '#FFF'}
    },
    legend: { position: 'bottom'}
  };

  ExpressUrlchart = new google.visualization.ColumnChart(document.getElementById('expressUrlGraph'));
  ExpressUrlchart.draw(ExpressUrldata, ExpressUrloptions);
}
function updateUrlData(newExpressData) {
  
  var url = newExpressData.url;
  var method = newExpressData.method;

  //Find url in our popularMethodCalls array
  var exists = false;
  var newCount = 1;
  for (var i=0; i<mostPopularMethodCalls.length; i++) {
    var existing = mostPopularMethodCalls[i];
    if (existing.url === url) {
      exists = true;
      //Update count
      existing.count ++;
      newCount = existing.count;
      break;
    }
  }
  if (!exists) {
    mostPopularMethodCalls.push({method: method, url: url, count: newCount});
  }

  //If we have more than 5
  if (mostPopularMethodCalls.length > 5) {
    //Find lowest element
    var lowestIndex = 0;
    var lowestCount = mostPopularMethodCalls[lowestIndex].count;
    for (var i=1; i<mostPopularMethodCalls.length; i++) {
      if (mostPopularMethodCalls[i].count < lowestCount) {
        lowestCount = mostPopularMethodCalls[i].count;
        lowestIndex = i;
      }
    }

    //Remove it
    mostPopularMethodCalls.splice(lowestIndex,1);
  }

  //update the ExpressUrldata
  ExpressUrldata.removeRows(0,ExpressUrldata.getNumberOfRows());
  for (var i=0; i<mostPopularMethodCalls.length; i++) {
    var thisObj = mostPopularMethodCalls[i];
    ExpressUrldata.addRow([thisObj.url,thisObj.count,'Request: ' +(thisObj.method)+'\n URL: '+(thisObj.url)]);
  }

  
  ExpressUrlchart.draw(ExpressUrldata, ExpressUrloptions);
}

var Expressdata;
var Expressoptions;
var Expresschart;

function drawExpressChart() {
  Expressdata = new google.visualization.DataTable();
  Expressdata.addColumn('datetime', 'time');
  Expressdata.addColumn('number', 'duration');
  Expressdata.addColumn({type: 'string', role: 'tooltip'});

  Expressoptions = {
    title: 'Express Use',
    curveType: 'function',
    backgroundColor: '#3b4b54',
    legendTextStyle: { color: '#FFF' },
    titleTextStyle: { color: '#FFF' },
    hAxis: {
      textStyle:{color: '#FFF'}
    },
    vAxis: {
      textStyle:{color: '#FFF'}
    },
    legend: { position: 'bottom'}
  };

  Expresschart = new google.visualization.LineChart(document.getElementById('expressGraph'));
  Expresschart.draw(Expressdata, Expressoptions);
}

var Memorydata;
var Memoryoptions;
var Memorychart;

function drawMemoryChart() {
  Memorydata = new google.visualization.DataTable();
  Memorydata.addColumn('datetime', 'time');
  Memorydata.addColumn('number', 'Physical Memory');
  Memorydata.addColumn('number', 'Virtual Memory');
  Memorydata.addColumn('number', 'Private Memory');

  Memoryoptions = {
    title: 'Memory Use',
    curveType: 'function',
    backgroundColor: '#3b4b54',
    legendTextStyle: { color: '#FFF' },
    titleTextStyle: { color: '#FFF' },
    hAxis: {
      textStyle:{color: '#FFF'}
    },
    vAxis: {
      textStyle:{color: '#FFF'}
    },
    legend: { position: 'bottom'}
  };

  Memorychart = new google.visualization.LineChart(document.getElementById('memoryGraph'));
  Memorychart.draw(Memorydata, Memoryoptions);
}

var GCdata;
var GCoptions;
var GCchart;

function drawGCChart() {
  GCdata = new google.visualization.DataTable();
  GCdata.addColumn('datetime', 'time');
  GCdata.addColumn('number', 'Heap Size');
  GCdata.addColumn('number', 'Used Heap');
 

  GCoptions = {
    title: 'GC Activity',
    curveType: 'function',
    backgroundColor: '#3b4b54',
    legendTextStyle: { color: '#FFF' },
    titleTextStyle: { color: '#FFF' },
    hAxis: {
      textStyle:{color: '#FFF'}
    },
    vAxis: {
      textStyle:{color: '#FFF'}
    },
    legend: { position: 'bottom'}
  };

  GCchart = new google.visualization.LineChart(document.getElementById('gcGraph'));
  GCchart.draw(GCdata, GCoptions);
}


var cpuDialdata;
var cpuDialoptions;
var cpuDialchart;
function drawChart() {
   cpuDialdata = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['System CPU', 0],
    ['Process CPU', 0]
  ]);

  cpuDialoptions = {title: 'CPU Usage',
      width: 400, height: 120,
      redFrom: 90, redTo: 100,
      yellowFrom:75, yellowTo: 90,
      minorTicks: 5
  };

  cpuDialchart = new google.visualization.Gauge(document.getElementById('cpuDials'));
  cpuDialchart.draw(cpuDialdata, cpuDialoptions);
}

function initialiseSocketIO() {
  socket = io.connect();
  socket.emit('connected');
  socket.emit('disableprofiling'); //profiling disabled
  
  // cpu parsing
  socket.on('cpu', function (cpudata){
    cpu = JSON.parse(cpudata);  //parses the data into a JSON array
    cpuDialdata.setValue(0, 1, 40 + Math.round((cpu.system * 100).toFixed(2)));
    cpuDialdata.setValue(1, 1, 40 + Math.round((cpu.process * 100).toFixed(2)));
    cpuDialchart.draw(cpuDialdata, cpuDialoptions);
  });
  
  //memory parsing
  socket.on('memory', function (memorydata){
    memory = JSON.parse(memorydata);  //parses the data into a JSON array
    if(Memorydata.getNumberOfRows() > 0){
      var oldDate = Memorydata.getValue(0,0).getTime() / 1000; // convert to seconds
      if(((memory['time'] / 1000) - oldDate) > 120){
        Memorydata.removeRow(0);            
      }
    }
    Memorydata.addRow([new Date(memory['time']),(memory['physical']/1024),(memory['virtual']/1024),(memory['private']/1024)]);
    Memorychart.draw(Memorydata, Memoryoptions);
  });

  //express parsing
  socket.on('express', function (expressdata){
    express = JSON.parse(expressdata);  //parses the data into a JSON array

    if(Expressdata.getNumberOfRows() > 0){
      var oldDate = Expressdata.getValue(0,0).getTime() / 1000; // convert to seconds
      if(((express['time'] / 1000) - oldDate) > 120){
        Expressdata.removeRow(0);            
      }
    }
    Expressdata.addRow([new Date(express['time']),(express.duration), 
                        'Request: ' +(express.method)+'\n'+
                        'URL: '+(express.url)+'\n'+
                        'Response: ' +(express.statusCode)+'\n'+
                        'Duration: '+(express.duration)]);
    updateUrlData(express);
    Expresschart.draw(Expressdata, Expressoptions);
  });

  
  //GC parsing
  socket.on('gc', function (gcdata){
    gc = JSON.parse(gcdata);  //parses the data into a JSON array
    if(GCdata.getNumberOfRows() > 0){
      var oldDate = GCdata.getValue(0,0).getTime() / 1000; // convert to seconds
      if(((gc['time'] / 1000) - oldDate) > 120){
        GCdata.removeRow(0);            
      }
    }
    GCdata.addRow([new Date(gc['time']),(gc['size']/1024),(gc['used']/1024)]);
    GCchart.draw(GCdata, GCoptions);
  });

};

google.charts.load('current',{'packages':['gauge','corechart']});
google.charts.setOnLoadCallback(drawChart);
google.charts.setOnLoadCallback(drawMemoryChart);
google.charts.setOnLoadCallback(drawGCChart);
google.charts.setOnLoadCallback(drawExpressChart);
google.charts.setOnLoadCallback(drawExpressUrlChart);
