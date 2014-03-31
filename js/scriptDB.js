function initDB(){
	if(localStorage.getItem('counter')===null){
		localStorage.setItem('counter','0');
		console.log('initialized');
	}
}

function addTrain(JSONTrain){
	JString=JSON.stringify(JSONTrain);
	count=parseInt(localStorage.getItem('counter'));
	localStorage.setItem('counter',(++count)+"");
	localStorage.setItem(count+"", JString);
	console.log('added');
}

function getTrains(){
	count=parseInt(localStorage.getItem('counter'));
	for(i=1; i<=count;i++)
		console.log(JSON.parse(localStorage.getItem(i+"")));
}