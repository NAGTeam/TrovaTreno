var nomeTreno, stazionePartenza, stazioneArrivo, partenzaProgrammata, partenzaEffettiva, arrivoProgrammato, arrivoPrevisto, binarioRealePartenza, binarioRealeArrivo, binarioPrevistoPartenza, binarioPrevistoArrivo, el;

/* Adding a String method for uglyfing a HTML source -- useful for regex's matching */
String.prototype.shrinkHTML = function() { return this.replace( /\s+/g, ' ' ); };

String.prototype.spacesOnItalo = function() { 
    return this.replace( /&nbsp;/g, ' ')
               .replace( /&nbsp;&nbsp;/g, '');
};

var deleteMode=false;

scrape = function(parameters) {
    /* Def+init of a XMLHttpRequest object. Passing the needed JSON-object */
    xhr = new XMLHttpRequest( {mozSystem: true} );
    /* Opening a POST request to 'viaggiatreno.it' */
    baseUrl = 'http://mobile.viaggiatreno.it/vt_pax_internet/mobile/numero';
    xhr.open('POST', baseUrl, true);
	
	xhr.timeout=5750;
	xhr.addEventListener('error', function(){
		alert('Nessuna Connessione');
	});
	
	xhr.addEventListener('timeout', function(){
		alert('Nessuna Connessione');
	});
	
    /* Setting the correct headers for the POST request */
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Content-length', parameters.length);
    xhr.setRequestHeader('Connection', 'close');

    /* Setting the function to run when the XMLHttpRequest's ready */
    xhr.onreadystatechange = function() {

        /* When request has been closed on success ... */
        if(xhr.readyState == 4 && xhr.status == 200) {

            /* ... format source for correctly being parsed by jQuery ... */
            scrapedSource =
               xhr.responseText.shrinkHTML().replace( /(<br>|<br \/>)/g, '<br/>')
                                            .replace( /&/g, '&amp;' )
                                            .replace( /'/g, '"' )
                                            .replace( /<\?(.*)\?>/g, '' );

                
            /* ... hence parse it ...*/
            scrapedSourceDoc = $.parseXML( scrapedSource );

            /* ... and cause jQuery to handle the parsing result ... */
            $scrapedSource = $( scrapedSourceDoc );

            /* ... */
            if ($scrapedSource.find( '.errore' ).text().length > 0) {
                scrapeItalo(numeroTreno);
                return;
            }

            /* ... then catch elements by their tag, id, class, etc. */
            nomeTreno = $scrapedSource.find( 'h1' ).text();
                
            stazioni = $scrapedSource.find( '.corpocentrale h2' ).map(
                function( i, el ) { return $( el ).text(); }
            );
				
    		if(stazioni.length<3){
    			stazionePartenza = stazioni[0];
    			stazioneArrivo = stazioni[1];
            }
            else {
    			stazionePartenza = stazioni[0];
				stazioneArrivoUltimo = stazioni[1];
				stazioneArrivo = stazioni[2];
	        }
            /* Schedules are nested inside <div .corpocentrale><p><strong>, hence ... */

            orari = $scrapedSource.find( '.corpocentrale p strong' ).map(
                function( i, el ) { return $( el ).text(); }
            );
            
            partenzaProgrammata = orari[ 0 ];
                
            if (orari[ 1 ] == "") {
                partenzaEffettiva = "--";
            }
            else {
                partenzaEffettiva = orari[ 1 ];
            }
                
            if(stazioni.length < 3) {
                arrivoProgrammato = orari[ 2 ];
                arrivoPrevisto = orari[ 3 ];
            }
            else {
                arrivoProgrammato = orari[ 4 ];
                arrivoPrevisto = orari[ 5 ]; 
            }               
				
    		numeroTreno="";
			for(i=0;i<=nomeTreno.length;i++){
				chari=nomeTreno.charAt(i);
				if(!isNaN(chari))
					numeroTreno=numeroTreno+chari;
			}
			numeroTreno=parseInt(numeroTreno);
			console.log(numeroTreno);
			train= {id : numeroTreno,
				stazionePartenza : stazionePartenza,
				partenza : partenzaProgrammata,
				stazione : stazioneArrivo
			};
			addTrain(train);
            binarioPrevistoPartenza = scrapedSource.match( /<!-- ORIGINE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];
                
            /* 
    		 * When more info's about the train is loaded, source changes,
    		 * wrapping the effective binary in a <strong> tag.
    		 * Otherwise, there's a placeholder couple of dashes.
    		 */

            if ( $scrapedSource.find( '.corpocentrale > strong' ).length < 1 ) {
                binarioRealePartenza = '--';
                binarioRealeArrivo = '--';
            } 
            else if ( $scrapedSource.find( '.corpocentrale > strong' ).length < 2 ) {
                binarioRealePartenza =
                   $scrapedSource.find( '.corpocentrale > strong' ).text();
                binarioRealeArrivo = '--';
            }
            else {
                binarioRealePartenza =
                   $scrapedSource.find( '.corpocentrale > strong' ).first().text();
                binarioRealeArrivo =
                   $scrapedSource.find( '.corpocentrale > strong' ).last().text();
            }
                
            binarioPrevistoArrivo = scrapedSource.match( /<!-- DESTINAZIONE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];
                
            var situazioneCorrente =
		   $scrapedSource.find( '.evidenziato > strong' ).text().replace( /<br\/>?/, '' ).replace( /&#039;/, '\'' );
                
            /* Appending some html code, according to the scraped datas */
            $( '#nomeTreno > span' ).text( nomeTreno );
            $( '#situazioneCorrente > span' ).text( situazioneCorrente );
            $( '#partenza').append("<p>" + stazionePartenza + "<br>Partenza programmata: " + partenzaProgrammata + "<br>Partenza Effettiva: " + partenzaEffettiva + "<br>Binario previsto: " + binarioPrevistoPartenza + "<br>Binario reale: " + binarioRealePartenza + "</p>");
            $( '#arrivo').append("<p>" + stazioneArrivo + "<br>Arrivo programmato: " + arrivoProgrammato + "<br>Arrivo previsto: " + arrivoPrevisto + "<br>Binario previsto: " + binarioPrevistoArrivo + "<br>Binario reale: " + binarioRealeArrivo + "</p>");
				
    		if(stazioni.length >= 3) {
			    $('#ultima').append("<div><header>Ultima fermata</header><p>" + stazioni[1] + "<br>Arrivo programmato: " + orari[2] + "<br>Arrivo effettivo: " + orari[3] + "</p></div>");
		    }
		
	        /* Transition ... */
	        $( '#resultsScreen' ).attr( 'class', 'current' );
	        $( '[data-position="current"]' ).attr( 'class', 'left' );

        }
    }
    /* Sending parameter, then let the onreadystatechange() function running */
    xhr.send(parameters);
};

scrapeItalo = function(numeroTreno) {
    /* Def+init of a XMLHttpRequest object. Passing the needed JSON-object */
    if(numeroTreno == 9906 || numeroTreno == 9915 || numeroTreno == 9930 || numeroTreno == 9923 || numeroTreno == 9931 || numeroTreno == 9995 || numeroTreno == 9938 || numeroTreno == 9974 || numeroTreno == 9985 || numeroTreno == 9986 || numeroTreno == 9975 || numeroTreno == 9946 || numeroTreno == 9939 || numeroTreno == 9943 || numeroTreno == 9987 || numeroTreno == 9954 || numeroTreno == 9988 || numeroTreno == 9947 || numeroTreno == 9950 || numeroTreno == 9951 || numeroTreno == 9962 || numeroTreno == 9977 || numeroTreno == 9996 || numeroTreno == 9997 || numeroTreno == 9978 || numeroTreno == 9990 || numeroTreno == 9991 || numeroTreno == 9966) {
        xhr = new XMLHttpRequest( {mozSystem: true} );
        console.log(baseUrl);
        /* Opening a POST request to 'viaggiatreno.it' */
        baseUrl = 'http://www.italotreno.it/IT/italo/Pagine/default.aspx';
        console.log(baseUrl);
        xhr.open('GET', baseUrl, false);
	
        xhr.setRequestHeader("Content-Type", "text");
        xhr.send(null)
        if(xhr.status == 200) {
            scrapedSource = xhr.responseText.spacesOnItalo();
            console.log(scrapedSource);
            console.log(numeroTreno);
            console.log("found!"); 
			regexNum = /Italo (99\d\d)/gm;
			numtreni=scrapedSource.match(regexNum);
            console.log(numtreni);
			regex2 = (/'>\w*\D+\d+:\d+\s-\s\D+\d+:\d+/gm);
			treni2 = scrapedSource.match(regex2);
			console.log(treni2);
			regexLatestStop(/<strong>\D{1,19}<\/strong>/gm);
			regexArrivoPrevisto(/ora'><strong>\d+:\d+/gm);
        }
    }
    else { 
        console.log("not found"); 
        alert( 'Il treno cercato non esiste' );
        $( 'input[name=numeroTreno]' ).val( '' );
        return;
    }
};

$( document ).ready( function(){
	initDB();
	getTrains();

    /* Using jQuery event-handler for the 'btn-search' object */
    $( '#btn-search' ).click( function(){

		/*if it's in delete mode, switch back to normal mode*/
		deleteMode=false;
		
        /* Catching value of the form with the 'name=numeroTreno' attribute set */
        numeroTreno = $( 'input[name=numeroTreno]' ).val();

        /* Loading server-param's for the POST request */
        parameters = "numeroTreno=" + numeroTreno;
        
        scrape(parameters);
    });
	
	$('#del_item').click(function(){
		if(!deleteMode){
				deleteMode=true;
				$('#div1').prepend("<p style='text-align: center; color: red;'>MODALITA' MODIFICA ATTIVA</p>");
		}
		else{
			alert('Si è tornati alla modalità normale');
			deleteMode=false;
			$('#div1 > p').remove();
		}
	});
	
	$(document).on('click','.history',function(){
		if(deleteMode){
		    if(confirm('Eliminare il treno dalla cronologia? Questa operazione è irreversibile')) {
			    toRemove= $(this).attr('id');
			    console.log(toRemove);
			    removeTrain(toRemove);
			    $('#cronologia').empty();
			    getTrains();
			}
		}else{
			numeroTreno= $(this).attr('id');
			parameters = "numeroTreno=" + numeroTreno;
			scrape(parameters);
		}
	});
	
	$('#clear').click( function(){
		ClearData();
		$('#cronologia').empty();
		getTrains();
	});

    /* If back-button is clicked, come back to the initial screen ... */
    $( '.btn-back' ).click( function(){
	    $( 'input[name=numeroTreno]' ).val( '' );
	    $('#partenza > p').remove();
	    $('#ultima > div').remove();
	    $('#arrivo > p').remove();
        /* remove all items under #cronologia in order to
         * have a list without doubles.
         * Actually the function that prints the element in the DB
         * uses "append()" method. This will cause the doubles
         * in the list.
         */
        $('#cronologia > li').remove();
		getTrains();
	    $( '[data-position="current"]' ).attr( 'class', 'current' );
	    $( '[data-position="right"]' ).attr( 'class', 'right' );
	    $( '[data-position="left"]' ).attr( 'class', 'left');
    });
    
    /* Button to About screen ...*/
    $( '#btn-about' ).click( function() {
		deleteMode=false;
		$( '#aboutScreen' ).attr( 'class', 'current' );
		$( '[data-position="current"]' ).attr( 'class', 'left' );
    });
    
    /* Delegating the opening of the links to the browser ...*/
    document.querySelector("#git-link").onclick = function () {
        new MozActivity({
            name: "view",
            data: {
                type: "url",
                url: "https://github.com/nag-motherfuckers/TrovaTreno.git"
            }
        });
    };
    document.querySelector("#ffoshackathon").onclick = function () {
        new MozActivity({
            name: "view",
            data: {
                type: "url",
                url: "http://www.mozillaitalia.org/home/2014/03/13/firefox-os-conference-hackaton-milano-27-28-marzo-2014/"
            }
        });
    };      
    document.querySelector("#aro94").onclick = function () {
        new MozActivity({
            name: "view",
            data: {
                type: "url",
                url: "http://twitter.com/aro94"
            }
       });
    };
    document.querySelector("#nicokant").onclick = function () {
        new MozActivity({
            name: "view",
            data: {
                type: "url",
                url: "http://twitter.com/nicokant"
            }
        });
    }; 
    document.querySelector("#giuscri").onclick = function () {
        new MozActivity({
            name: "view",
            data: {
                type: "url",
                url: "http://twitter.com/giuscri"
            }
        });
    }; 
    
    /* Sending trains' information by email ... */
    document.querySelector("#btn-send").onclick = function () {
        var testo = "-SITUAZIONE:" + situazioneCorrente.textContent + " -PARTENZA: " + stazionePartenza + " Partenza programmata: " + partenzaProgrammata + " Partenza effettiva: " + partenzaEffettiva + " Binario previsto: " + binarioPrevistoPartenza + " Binario reale: " + binarioRealePartenza + " -ARRIVO: " + stazioneArrivo + " Arrivo programmato: " + arrivoProgrammato + " Arrivo previsto: " + arrivoPrevisto + " Binario previsto: " + binarioPrevistoArrivo + " Binario reale: " + binarioRealeArrivo;
        new MozActivity({
            name: "new",
            data: {
                type : "mail",
                url: "mailto:?body=" + testo + "&subject=" + nomeTreno
            }
        });
    };   
});