/*jshint browser:true devel:true*/
/*global AbstractApp Flotr */

////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Sub Class /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//var temp_time =-1;
var temp_array= new Array;
function MyApp(divobj,uuid,dash){
  this.myuuid = uuid;
  if (!divobj) {
    throw "First argument must be a valid html object";
  }
  this.div = divobj;
  this.dash = dash;
}
MyApp.prototype = Object.create(AbstractApp.prototype);

//overwrite start and update
MyApp.prototype.start = function() {
  //
  //Starts app and loads gui.
  //
  var this_app = this;

  //set some attributes for the app div
  this.div.style.backgroundColor = "#BBFFBB";
    
  this.getUIhtml(function(e,h){
    this_app.div.innerHTML = h;
    this_app.getAllElements();
    this_app.start_button.addEventListener('click',function(){
      this_app.sendEvent('forward',{cmd: 'startLog',uuid: this_app.myuuid},
                         function(err,resp){
      });
	console.log('start work');  
    });
    this_app.stop_button.addEventListener('click',function(){
      this_app.sendEvent('forward',{cmd: 'stopLog',uuid: this_app.myuuid},
                         function(err,resp){
      });
	console.log('stop work');
    });
    this_app.heat_on.addEventListener('click',function(){
      this_app.sendEvent('forward',{cmd: 'heatOn',uuid: this_app.myuuid},
                         function(err,resp){
      });
	console.log('start heat');  
    });
    this_app.heat_off.addEventListener('click',function(){
      this_app.sendEvent('forward',{cmd: 'heatOff',uuid: this_app.myuuid},
                         function(err,resp){
      });
	console.log('stop heat');  
    });
    this_app.dash.loadScript(
      "http://www.humblesoftware.com//static/js/flotr2.min.js",
      function(){
        this_app.Flotr = Flotr; //save ref to library
        this_app.update();
    });
  });
  this.setUpdateInterval(1*1000);
};

MyApp.prototype.update = function(){
  var now_epoch = (new Date()).getTime();
  var now_time = new Date();
  var time_offset =(new Date()).getTimezoneOffset();
  var now_pdt = now_epoch-time_offset*1000;
  var http = new XMLHttpRequest();
  var td;
  var this_app = this;
    console.log('now_pdt '+now_pdt+' now_utc '+now_epoch);
  http.open("GET","/?action=retrieve&uuid="+this.myuuid+"&since="+"latest");
  http.onreadystatechange=function(){
    if (http.readyState==4 && http.status == 200) {
      var result = http.responseText;
      //console.log('datasum ' + result);
      var data =result.split(",");
      var occupy =data[0];
      var temp = data[1];
      var tem_num = parseFloat(temp).toFixed(2);
      //var temp_array =[];
      //console.log('temp array '+ temp_array);
	//td = temp_array.map(function(x){
        //temp_time = temp_time +1;
       // return [temp_time, parseFloat(x)];
     // });
	temp_array.push([now_pdt,tem_num]);
	if (temp_array.length >20){
	    temp_array.shift();
	}
        console.log('temp '+temp_array+' time '+now_pdt);
	this_app.Flotr.draw(this_app.data_div,[temp_array],{
            HtmlText: false,
	    title: 'Temperature Record',
	    xaxis: {
		mode: "time",
		timeMode: 'local',
	        timeformat: "%h/%m/%s",
		title: 'Local time'
            },
	    yaxis: {
		title: 'Temperature',
		titleAngel: 90
	    },
	});
	//document.getElementById('current_temp').innerHTML =parseFloat(d).toFixed(2);
      this_app.current_temp.innerHTML=tem_num;
	this_app.current_time.innerHTML = now_time.toLocaleTimeString();
	console.log('show temp ' +occupy);
	if (occupy==1){
	this_app.occupy_info.innerHTML='Occupied';
	}
	else if (occupy==0) {
	    this_app.occupy_info.innerHTML='Idle';
	}
	else {
	    this_app.occupy_info.innerHTML='Error';
	}
    }
  };
  http.send();
};

////////////////////////////////// Some "Private" Methods //////////////////////
MyApp.prototype.getAllElements = function(){
  this.data_div = this.getElement("data");
  this.stop_button = this.getElement("stop");
  this.start_button = this.getElement("start");
    this.heat_on =this.getElement("heaton");
    this.heat_off = this.getElement("heatoff");
  this.current_temp = document.getElementById('current_temp');
  this.occupy_info = document.getElementById('occupy_info');
  this.current_time = document.getElementById('current_time');
};

//spec says app needs to be named App
var App = MyApp;
