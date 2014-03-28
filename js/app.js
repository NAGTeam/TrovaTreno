/* Adding a String method for uglyfing a HTML source -- useful for regex's matching */
String.prototype.shrinkHTML = function() { return this.replace( /\s+/g, ' ' ); };

$( document ).ready( function(){

    /* Using jQuery event-handler for the 'btn-search' object */
    $( '#btn-search' ).click( function(){

        /* Catching value of the form with the 'name=numeroTreno' attribute set */
        numeroTreno = $( 'input[name=numeroTreno]' ).val();

        /* Deleting user's input, once cought */
        //$( 'input[name=numeroTreno]' ).val( '' );

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

                partenzaEffettiva = orari[ 1 ];

                arrivoProgrammato = orari[ 2 ];

                arrivoPrevisto = orari[ 3 ];

                binarioPrevistoPartenza = scrapedSource.match( /<!-- ORIGINE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];

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

                binarioPrevistoArrivo = scrapedSource.match( /<!-- DESTINAZIONE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];

                situazioneCorrente =
		   $scrapedSource.find( '.evidenziato > strong' ).text().replace( /<br\/>?/, '' ).replace( /&#039;/, '\'' );

                /* Replace text wrapped by span's, according to the scraped data's */

                $( '#partenza > nomeTreno > span' ).text( nomeTreno );

                $( '#partenza > stazionePartenza > span' ).text( stazionePartenza );

                $( '#partenza > partenzaProgrammata > span' ).text( partenzaProgrammata );

                $( '#partenza > partenzaEffettiva > span' ).text( partenzaEffettiva );

                $( '#partenza > binarioPrevistoPartenza > span' ).text( binarioPrevistoPartenza );

                $( '#partenza > binarioRealePartenza > span' ).text( binarioRealePartenza );
				
                $( '#arrivo > stazioneArrivo > span' ).text( stazioneArrivo );

                $( '#arrivo > arrivoProgrammato > span' ).text( arrivoProgrammato );

                $( '#arrivo > arrivoPrevisto > span' ).text( arrivoPrevisto );

                $( '#arrivo > binarioPrevistoArrivo > span' ).text( binarioPrevistoArrivo );
               
                $( '#arrivo > binarioRealeArrivo > span' ).text( binarioRealeArrivo );
				
				if(orari>=6) {
					$( '#ultima > stazioneUltima > span' ).text( "..." );
					$( '#ultima > arrivoProgrammatoUltima> span' ).text( arrivoProgrammatoUltima );
					$( '#ultima > arrivoEffettivoUltima > span' ).text( arrivoPrevistoUltima );
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
	$( '[data-position="current"]' ).attr( 'class', 'current' );
	$( '[data-position="right"]' ).attr( 'class', 'right' );
	$( '[data-position="left"]' ).attr( 'class', 'left');

    });
    
    $('#preferiti').click( function() {
      $( '#bookmarksScreen' ).attr( 'class', 'current' );
		$( '[data-position="current"]' ).attr( 'class', 'left' );
    });

   /* $('#back').click( function() {
      $( '[data-position="current"]' ).attr( 'class', 'current' );
      $( '#bookmarksScreen' ).attr( 'class', 'right' );
    });*/
});
