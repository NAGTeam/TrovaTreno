/* Adding a String method for uglyfing a HTML source -- useful for regex's matching */
String.prototype.shrinkHTML = function() { return this.replace( /\s+/g, ' ' ); };

$( document ).ready( function(){

    alert( localforage.get( 0 ) );

    //if( localforage.get( 0 ) === null ){ initDB(); }
	
    /* Using jQuery event-handler for the 'btn-search' object */
    $( '#btn-search' ).click( function(){

        /* Catching value of the form with the 'name=numeroTreno' attribute set */
        numeroTreno = $( 'input[name=numeroTreno]' ).val();
        console.log(numeroTreno);
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
                console.log(scrapedSource);
                
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

                nomeTreno = $scrapedSource.find( 'h1' ).text();
                console.log(nomeTreno);
                
                stazioni = $scrapedSource.find( '.corpocentrale h2' ).map(
                    function( i, el ) { return $( el ).text(); }
                );

                console.log(stazioni);

                stazionePartenza = stazioni[ 0 ];

                if( stazioni.length < 3 ) {
                    stazioneArrivo = stazioni[1];
                } else {
                    stazioneArrivoUltimo = stazioni[1];
                    stazioneArrivo = stazioni[2];
                }

                alert( stazionePartenza );
                alert( stazioneArrivoUltimo );
                alert( stazioneArrivo );

                /* Schedules are nested inside <div .corpocentrale><p><strong>, hence ... */

                orari = $scrapedSource.find( '.corpocentrale p strong' ).map(
                    function( i, el ) { return $( el ).text(); }
                );

                console.log(orari);
                
                partenzaProgrammata = orari[ 0 ];

                partenzaEffettiva = orari[ 1 ];

                arrivoProgrammato = orari[ 2 ];

                arrivoPrevisto = orari[ 3 ];

                binarioPrevistoPartenza = scrapedSource.match( /<!-- ORIGINE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];
                console.log(binarioPrevistoPartenza);
                
                /* 
		 * When more info's about the train is loaded, source changes,
		 * wrapping the effective binary in a <strong> tag.
		 * Otherwise, there's a placeholder couple of dashes.
		 */

                if ( $scrapedSource.find( '.corpocentrale > strong' ).length < 1 ) {
                    binarioRealePartenza = '--';
                    binarioRealeArrivo = '--';
                } else {
                    binarioRealePartenza =
                       $scrapedSource.find( '.corpocentrale > strong' ).first().text();
                    binarioRealeArrivo =
                       $scrapedSource.find( '.corpocentrale > strong' ).last().text();
                }

                alert(  binarioRealePartenza );
                alert( binarioRealeArrivo );
                
                binarioPrevistoArrivo = scrapedSource.match( /<!-- DESTINAZIONE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];

                alert( binarioPrevistoArrivo );
                
                situazioneCorrente =
		   $scrapedSource.find( '.evidenziato > strong' ).text().replace( /<br\/>?/, '' ).replace( /&#039;/, '\'' );
                alert( situazioneCorrente );

                t['id'] = numeroTreno;
                t['stazionePartenza'] = stazionePartenza;
                t['stazioneArrivo'] = stazioneArrivo;
                t['partenzaProgrammata'] = partenzaProgrammata;
                t['arrivoProgrammato'] = arrivoProgrammato;
                t['cercato'] = Date.now();

                alert( JSON.stringify(t) );

                addTreno(t);
                
                /* Appending some html code, according to the scraped datas */
                $( '#nomeTreno > span' ).text( nomeTreno );
                $( '#situazioneCorrente > span' ).text( situazioneCorrente );
                $( '#partenza').append("<p>" + stazionePartenza + "<br>Partenza programmata: " + partenzaProgrammata + "<br>Partenza Effettiva: " + partenzaEffettiva + "<br>Binario previsto: " + binarioPrevistoPartenza + "<br>Binario reale: " + binarioRealePartenza + "</p>");
                $( '#arrivo').append("<p>" + stazioneArrivo + "<br>Arrivo programmato: " + arrivoProgrammato + "<br>Arrivo previsto: " + arrivoPrevisto + "<br>Binario previsto: " + binarioPrevistoArrivo + "<br>Binario reale: " + binarioRealeArrivo + "</p>");
				
				if(stazioni.length >= 3) {
				    $('#ultima').append("<header>Ultima fermata</header><p>" + stazioni[1] + "<br>Arrivo programmato: " + orari[2] + "<br>Arrivo effettivo: " + orari[3] + "</p>");
			    }
		
		$( '#situazioneCorrente > span' ).text( situazioneCorrente );
		
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
	    $('#ultima > p').remove();
	    $('#arrivo > p').remove();
	    $( '[data-position="current"]' ).attr( 'class', 'current' );
	    $( '[data-position="right"]' ).attr( 'class', 'right' );
	    $( '[data-position="left"]' ).attr( 'class', 'left');

    });
    
});
