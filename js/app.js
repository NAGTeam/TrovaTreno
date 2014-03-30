/* Adding a String method for uglyfing a HTML source -- useful for regex's matching */
String.prototype.shrinkHTML = function() { return this.replace( /\s+/g, ' ' ); };

$( document ).ready( function(){

    /* Using jQuery event-handler for the 'btn-search' object */
    $( '#btn-search' ).click( function(){

        /* Catching value of the form with the 'name=numeroTreno' attribute set */
        numeroTreno = $( 'input[name=numeroTreno]' ).val();
        /* Def+init of a XMLHttpRequest object. Passing the needed JSON-object */
        xhr = new XMLHttpRequest( {mozSystem: true} );

        /* Loading server-param's for the POST request */
        parameters = "numeroTreno=" + numeroTreno;

        /* Opening a POST request to 'viaggiatreno.it' */
        baseUrl = 'http://mobile.viaggiatreno.it/vt_pax_internet/mobile/numero';
        xhr.open('POST', baseUrl, true);

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
                    alert( 'Il treno cercato non esiste' );
                    $( 'input[name=numeroTreno]' ).val( '' );
                    return;
                }

                /* ... then catch elements by their tag, id, class, etc. */

                var nomeTreno = $scrapedSource.find( 'h1' ).text();
                console.log(nomeTreno);
                
                stazioni = $scrapedSource.find( '.corpocentrale h2' ).map(
                    function( i, el ) { return $( el ).text(); }
                );
				
				if(stazioni.length<3){
					var stazionePartenza = stazioni[0];
					var stazioneArrivo = stazioni[1];
                }
                else {
					var stazionePartenza = stazioni[0];
					var stazioneArrivoUltimo = stazioni[1];
					var stazioneArrivo = stazioni[2];
		        }
                /* Schedules are nested inside <div .corpocentrale><p><strong>, hence ... */

                orari = $scrapedSource.find( '.corpocentrale p strong' ).map(
                    function( i, el ) { return $( el ).text(); }
                );
                
                if(stazioni.length < 3) {
                    var partenzaProgrammata = orari[ 0 ];
                    var partenzaEffettiva = orari[ 1 ];
                    var arrivoProgrammato = orari[ 2 ];
                    var arrivoPrevisto = orari[ 3 ];
                }
                else {
                    var partenzaProgrammata = orari[ 0 ];
                    var partenzaEffettiva = orari[ 1 ];
                    var arrivoProgrammato = orari[ 4 ];
                    var arrivoPrevisto = orari[ 5 ]; 
                }               

                var binarioPrevistoPartenza = scrapedSource.match( /<!-- ORIGINE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];
                
                /* 
		 * When more info's about the train is loaded, source changes,
		 * wrapping the effective binary in a <strong> tag.
		 * Otherwise, there's a placeholder couple of dashes.
		 */

                if ( $scrapedSource.find( '.corpocentrale > strong' ).length < 1 ) {
                    var binarioRealePartenza = '--';
                    var binarioRealeArrivo = '--';
                } 
                else if ( $scrapedSource.find( '.corpocentrale > strong' ).length < 2 ) {
                    var binarioRealePartenza =
                       $scrapedSource.find( '.corpocentrale > strong' ).text();
                    var binarioRealeArrivo = '--';
                }
                else {
                    var binarioRealePartenza =
                       $scrapedSource.find( '.corpocentrale > strong' ).first().text();
                    var binarioRealeArrivo =
                       $scrapedSource.find( '.corpocentrale > strong' ).last().text();
                }
                
                var binarioPrevistoArrivo = scrapedSource.match( /<!-- DESTINAZIONE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];
                
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

    });

    /* If back-button is clicked, come back to the initial screen ... */
    $( '.btn-back' ).click( function(){
	    $( 'input[name=numeroTreno]' ).val( '' );
	    $('#partenza > p').remove();
	    $('#ultima > div').remove();
	    $('#arrivo > p').remove();
	    $( '[data-position="current"]' ).attr( 'class', 'current' );
	    $( '[data-position="right"]' ).attr( 'class', 'right' );
	    $( '[data-position="left"]' ).attr( 'class', 'left');
    });
    
    /* Button to About screen ...*/
    $( '#btn-about' ).click( function() {
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
    document.querySelector("#btn-send").onclick = function () {
        var testo = 
        new MozActivity({
            name: "new",
            data: {
                type : "mail",
                url: "mailto:?body=" + situazioneCorrente.textContent + "&subject=" + nomeTreno.textContent
            }
        });
    };  
});
