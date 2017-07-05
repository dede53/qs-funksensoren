var dgram					=	require('dgram');
var adapter					=	require('../../adapter-lib.js');
var bodyParser				=	require('body-parser');
var express					=	require('express.oi');
var app						=	express().http().io();
var funksensoren					=	new adapter("funksensoren");
var status					=	{};
var timeout					=	"";

process.on("message", function(request){
	var data				= request.data;
	var status				= request.status;
	if(data){
		switch(data.protocol){
			case "setSetting":
				funksensoren.setSetting(data);
				break;
			default:
				funksensoren.log.error("Problem mit dem Protocol:" + data.protocol);
				break;
		}
	}
});

app.use(bodyParser.json());									// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));			// for parsing application/x-www-form-urlencoded

app.get('/:id/:value', function(req, res){
	var data = req.params.value.split('&');
	data[0] = data[0].slice(2, data[0].length);
	data[1] = data[1].slice(2, data[1].length);
	console.log(data);
	funksensoren.setVariable("funksensoren." + req.params.id + ".batt", parseInt(data[0]) / 1000);
	funksensoren.setVariable("funksensoren." + req.params.id + ".temp", parseInt(data[1])/100);
	res.json(200);
});

try{
	app.listen(funksensoren.settings.port, function(){
		process.send({"statusMessage": "Läut auf Port:" + funksensoren.settings.port});
	});
}catch(e){
	funksensoren.log.error(e);
}