function initDB(){
	if(localStorage.getItem('counter')===null){
		localStorage.setItem('counter','0');
	}
}

function addTrain(JSONTrain){
	count=parseInt(localStorage.getItem('counter'));
	add=true;
	if(JSONTrain['id'] === undefined)
	return;
	for(i=1; i<=count;i++){
		array=[];
		if(JSON.parse(localStorage.getItem(i)) != null){
			array[i]=JSON.parse(localStorage.getItem(i));
			numEstratto = (array[i])['id'];
			numTreno = JSONTrain['id'];
			if(numEstratto !== numTreno){
				add=true;
			}else{
				add=false;
				break;
			}
		}
	}
	if(add){
		JString=JSON.stringify(JSONTrain);
		count=parseInt(localStorage.getItem('counter'));
		localStorage.setItem('counter',(++count)+"");
		localStorage.setItem(count+"", JString);
	}
}

function getTrains(){
	count=parseInt(localStorage.getItem('counter'));
	for(i=1; i<=count;i++) {
		if(JSON.parse(localStorage.getItem(i+""))!= null){
			oggetto = JSON.parse(localStorage.getItem(i+""));
			$( '#cronologia' ).prepend("<li id='chrono_el'><a href='#' id='"+oggetto.id+"' class='history'><p>" + oggetto.stazionePartenza + oggetto.partenza + "</p><p>Direzione: " + oggetto.stazione + "</p></a><a href='#' id='del_item'><img src='/style/icons/delete.png'/></a></li>");
		}	
	}
}

function ClearData(){
	if(confirm("Cancellare tutta la cronologia?")){
		localStorage.clear();
		initDB();
	}
}

function removeTrain(id){
	count=parseInt(localStorage.getItem('counter'));
	for(i=1; i<=count;i++) {
		if(JSON.parse(localStorage.getItem(i+"")) != null){
			oggetto = JSON.parse(localStorage.getItem(i+""));
			console.log(oggetto);
			console.log(oggetto.id);
			if(oggetto.id+"" === id){
				localStorage.removeItem(i+"");
				console.log('removed');
				break;
			}
		}
	}
}