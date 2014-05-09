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
        if(xhr.readyState === 4 && xhr.status === 200) {

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
				alert('Nessun Treno trovato');
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
                
            if (orari[ 1 ] === "") {
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
				stazione : stazioneArrivo,
				compagnia: "trenitalia"
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
    };
    /* Sending parameter, then let the onreadystatechange() function running */
    xhr.send(parameters);
};

scrapeItalo = function(numeroTreno) {
    /* Def+init of a XMLHttpRequest object. Passing the needed JSON-object */
    if(numeroTreno <= 9999 && numeroTreno >= 9900){
        xhr = new XMLHttpRequest( {mozSystem: true} );
 
        /* Opening a POST request to 'viaggiatreno.it' */
        baseUrl = 'http://www.italotreno.it/IT/italo/Pagine/default.aspx';
        xhr.open('GET', baseUrl, false);
	
        xhr.setRequestHeader("Content-Type", "text");
        xhr.send(null);
        if(xhr.status === 200) {
            scrapedSource = xhr.responseText.spacesOnItalo();
			regexNum = /Italo (99\d\d)/gm;
			numtreni=scrapedSource.match(regexNum);
			searchIndex=-1;
			for(i=0;i<numtreni.length;i++){
				numtreni[i]=numtreni[i].slice(6,10);
				if(numtreni[i] === numeroTreno){
					searchIndex=i;
				}
			}
			if(searchIndex === -1){
				alert('Nessun Treno trovato');
				return;
			}
			
			regex2 = /'>\w*\D+\d+:\d+\s-\s\D+\d+:\d+/gm;
			treni2 = scrapedSource.match(regex2);
			treni2[searchIndex] = treni2[searchIndex].slice(2,treni2[searchIndex].length);
			console.log(treni2[searchIndex]);
			
			regexScomponi=/(\D+)\s*(\d+:\d+)\s*-\s*(\D+)\s*(\d+:\d+)/;
			trenoCaratt=treni2[searchIndex].match(regexScomponi);
			console.log(trenoCaratt);
			
			regexLatestStop = /<strong>\D{1,19}<\/strong>/gm;
			treniLatestStop = scrapedSource.match(regexLatestStop);
			treniLatestStop[searchIndex]=treniLatestStop[searchIndex].slice(8,treniLatestStop[searchIndex].search('</strong>'));
			console.log(treniLatestStop[searchIndex].toUpperCase());
			
			regexArrivoPrevisto = /ora'><strong>\d+:\d+/gm;
			treniArrivo = scrapedSource.match(regexArrivoPrevisto);
			treniArrivo[searchIndex]=treniArrivo[searchIndex].slice(13,18); 
			console.log(treniArrivo[searchIndex]); 
			
			regexStato = /<span class='evidenza'>\s[I|R|A].*<\/span>/gm;
			treniStato = scrapedSource.match(regexStato);
			treniStato[searchIndex]=treniStato[searchIndex].slice(24, treniStato[searchIndex].search(' </span>'));
			console.log(treniStato[searchIndex]); 
			
			/* Adding the train to the database ... */
			train= {id : numtreni[searchIndex],
				stazionePartenza : trenoCaratt[1].toUpperCase(),
				partenza : trenoCaratt[2],
				stazione : trenoCaratt[3].toUpperCase(),
				compagnia: "italo"
			};
			addTrain(train);
			
			/* In order to have the train state in correct italian language ... */
			if(treniStato[searchIndex]=== "IN ORARIO") {
			    treniStato[searchIndex] = "Il treno viaggia " + treniStato[searchIndex].toLowerCase();
			}
			else {
			    treniStato[searchIndex] = "Il treno viaggia con un " + treniStato[searchIndex].toLowerCase();
			}
			
			$( '#nomeTreno > span' ).text( 'Italo '+numtreni[searchIndex] );
            $( '#situazioneCorrente > span' ).text(treniStato[searchIndex]);
            $( '#partenza').append("<p>" + trenoCaratt[1].toUpperCase() + "<br>Partenza programmata: " + trenoCaratt[2] + "</p>");
            $( '#arrivo').append("<p>" + trenoCaratt[3].toUpperCase() + "<br>Arrivo programmato: " + trenoCaratt[4] + "</p>");
			$('#ultima').append("<div><header>Prossima Fermata</header><p>" + treniLatestStop[searchIndex].toUpperCase() + "<br>Arrivo programmato: " + treniArrivo[searchIndex] + "</p></div>");
			
			 /* Transition ... */
	        $( '#resultsScreen' ).attr( 'class', 'current' );
	        $( '[data-position="current"]' ).attr( 'class', 'left' );
        }
    }
    else { 
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
        
		if(numeroTreno <= 9999 && numeroTreno >= 9900){
			scrapeItalo(numeroTreno);
		}else{
			scrape(parameters);
		}
    });
	
    function switchMode(alerting){
	    if(!deleteMode && alerting){
		    deleteMode=true;
		    $('#div1').prepend("<p style='text-align: center; color: red;'>MODALITA' MODIFICA ATTIVA</p>");
		    $('.history').append('<img style="float:right; position:relative;" class="deletable" src="/style/icons/delete.png"/>');
	    }
	    else{
		    if(alerting)
			    alert('Si è tornati alla modalità normale');
		    deleteMode=false;
		    $('#div1 > p').remove();
		    $('.deletable').remove();
	    }
    }
	$('#del_item').click(function(){
		switchMode(true);
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
    
    /* Check if not Firefox OS */
      if (navigator.userAgent.indexOf("Android") > -1 || navigator.userAgent.indexOf("Mobile") === -1) {
        $('.scrollable').css('overflow','auto');
      }
});