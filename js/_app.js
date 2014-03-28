/* Adding a String method for uglyfing a HTML source -- useful for regex's matching */
String.prototype.shrinkHTML = function() { return this.replace( /\s+/g, ' ' ); };

$( document ).ready( function(){

    if( localforage.getItem( 0 ) === null ) { initDB(); }
	
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

                t = {};

                t['id'] = numeroTreno;
                t['stazionePartenza'] = stazionePartenza;
                t['stazioneArrivo'] = stazioneArrivo;
                t['partenzaProgrammata'] = partenzaProgrammata;
                t['arrivoProgrammato'] = arrivoProgrammato;
                t['dataUltimaRicerca'] = ( function() {
                    today = new Date();
                    dd = today.getDate();
                    mm = today.getMonth() +1;
                    yyyy = today.getFullYear();

                    if ( dd < 10 ) { dd = '0' + dd; }

                    if ( mm < 10 ) { mm = '0' + mm; }

                    return dd + '/' + mm + '/' + + yyyy;

                })();

                alert( JSON.stringify(t) );

                addTreno(t);
                
                /* Replace text wrapped by span's, according to the scraped data's */

                $( '#nomeTreno > span' ).text( nomeTreno );

                $( '#stazionePartenza > span' ).text( stazionePartenza );

                $( '#partenzaProgrammata > span' ).text( partenzaProgrammata );

                $( '#partenzaEffettiva > span' ).text( partenzaEffettiva );

                $( '#binarioPrevistoPartenza > span' ).text( binarioPrevistoPartenza );

                $( '#binarioRealePartenza > span' ).text( binarioRealePartenza );
				
                $( '#stazioneArrivo > span' ).text( stazioneArrivo );

                $( '#arrivoProgrammato > span' ).text( arrivoProgrammato );

                $( '#arrivoPrevisto > span' ).text( arrivoPrevisto );

                $( '#binarioPrevistoArrivo > span' ).text( binarioPrevistoArrivo );
               
                $( '#binarioRealeArrivo > span' ).text( binarioRealeArrivo );

                if( stazioni.length >= 3 ) {
                    $('#ultima').prepend("<h2>Ultima fermata:</h2>");
                    $( '#stazioneUltima > span' ).text( stazioni[1] );
                    $( '#arrivoProgrammatoUltima> span' ).text( orari[2] );
                    $( '#arrivoEffettivoUltima > span' ).text( orari[3] );
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
    
});
