function initDB(){
	if(localStorage.getItem('counter')===null){
		localStorage.setItem('counter','0');
		console.log('initialized');
	}
}

function addTrain(JSONTrain){
	count=parseInt(localStorage.getItem('counter'));
	console.log(count);
	add=true;
	 console.log('just start function');
	for(i=1; i<=count;i++){
		console.log('start loop');
		array=[];
		array[i]=JSON.parse(localStorage.getItem(i+""));
		console.log(array[i]);
		numEstratto = (array[i])['id'];
		console.log(numEstratto);
		numTreno = JSONTrain['id'];
		console.log(numTreno);
		if(numEstratto !== numTreno){
			add=true;
		}else{
			console.log('not added');
			add=false;
			break;
		}
	}
	if(add){
		JString=JSON.stringify(JSONTrain);
		count=parseInt(localStorage.getItem('counter'));
		localStorage.setItem('counter',(++count)+"");
		localStorage.setItem(count+"", JString);
		console.log('added');
	}
}

function getTrains(){
	count=parseInt(localStorage.getItem('counter'));
	for(i=1; i<=count;i++) {
	    oggetto = JSON.parse(localStorage.getItem(i+""));
		$( '#cronologia' ).append("<li id='"+oggetto.id+"'><p>" + oggetto.stazionePartenza + oggetto.partenza + "</p><p>Direzione: " + oggetto.stazione + "</p></li>");
    }
}
