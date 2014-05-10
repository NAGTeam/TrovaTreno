function initDB() {
    if (localStorage.getItem('counter') === null) {
        localStorage.setItem('counter', '0');
    }
}

function addTrain(JSONTrain){
	count=parseInt(localStorage.getItem('counter'));
	add=true;
	if(JSONTrain['id'] === undefined)
	return;
	for(i=1; i<=count;i++){
		array=[];
		if(JSON.parse(localStorage.getItem(i)) !== null){
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
		if(JSON.parse(localStorage.getItem(i+"")) !== null){
			oggetto = JSON.parse(localStorage.getItem(i+""));
			if (oggetto.compagnia === "trenitalia") {
			    $( '#cronologia' ).prepend("<li><a href='#' id='"+oggetto.id+"' class='history'><p style='font-size: 1.5rem;'><img style='float:left; position:relative;' src='style/icons/trenitalia.jpeg'/>" + oggetto.stazionePartenza + oggetto.partenza + "</p><p style='font-size: 1.5rem;'>Direzione: " + oggetto.stazione + "</p></a></li>");
		    }
		    else {
		        $( '#cronologia' ).prepend("<li><a href='#' id='"+oggetto.id+"' class='history'><p style='font-size: 1.5rem;'><img style='float:left; position:relative;' src='style/icons/italo.png'/>" + oggetto.stazionePartenza + oggetto.partenza + "</p><p style='font-size: 1.5rem;'>Direzione: " + oggetto.stazione + "</p></a></li>");
		    }
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
	if(count === 1) {
	    localStorage.clear();
	    initDB();
	    deleteMode = false;
        $('#div1 > p').remove();
	}
	else {
	    for(i=1; i<=count;i++) {
		    if(JSON.parse(localStorage.getItem(i+"")) !== null){
			    oggetto = JSON.parse(localStorage.getItem(i+""));
			    if(oggetto.id+"" === id){
				    localStorage.removeItem(i+"");
				    break;
			    }
		    }
	    }
	}
}

function editMode() {
    count=parseInt(localStorage.getItem('counter'));
    if(count === 0) {
        $('.edit_mode').hide();
    } 
    else {
        $('.edit_mode').show();
    }
}   
    
    
    
    
    
    