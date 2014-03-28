/* Storing the source from mobile.viaggiatreno.it */

$( document ).ready( function() {

    if ( !navigator.onLine ) { alert( 'Not online ...'); }
	
	$('#btn-search').click(function (){
		
		numeroTreno=$('input[nome=numeroTreno]').val();

		myRequest = new XMLHttpRequest( {mozSystem: true} );
		
		parameters='numeroTreno='+numeroTreno;
		baseUrl = 'http://mobile.viaggiatreno.it/vt_pax_internet/mobile';

		myRequest.open( 'POST', baseUrl,true);

		myRequest.addEventListener( 'load', function() {

			if ( myRequest.status == 200 ) {

				alert( 'Content loaded!' );

				console.log( myRequest.responseText );
				//$( '#src' ).text( myRequest.responseText );
				scrapedSource =
                   xhr.responseText.shrinkHTML().replace( /(<br>|<br \/>)/g, '<br/>')
                                                .replace( /&/g, '&amp;' )
                                                .replace( /'/g, '"' )
                                                .replace( /<\?(.*)\?>/g, '' );
				scrapedSourceDoc = $.parseXML( scrapedSource );
				
				$scrapedSource = $( scrapedSourceDoc );
				
				if ($scrapedSource.find( '.errore' ).text().length > 0) {
                    alert( 'Il treno cercato non esiste' );
                    $( 'input[name=numeroTreno]' ).val( '' );
                    return;
                }
				
				nomeTreno = $scrapedSource.find( 'h1' ).text();

                stazioni = $scrapedSource.find( '.corpocentrale h2' ).map(
                    function( i, el ) { return $( el ).text(); }
                );
				
				if(stazioni.length<3){
					stazionePartenza = stazioni[0];
					stazioneArrivo = stazioni[1];
                }else{
					stazionePartenza = stazioni[0];
					stazioneArrivoUltimo = stazioni[1];
					stazioneArrivo = stazioni[2];
				
                orari = $scrapedSource.find( '.corpocentrale p strong' ).map(
                    function( i, el ) { return $( el ).text(); }
                );
				partenzaProgrammata = orari[ 0 ];

                partenzaEffettiva = orari[ 1 ];
				
				if( orari.length <6){
				
				
                arrivoProgrammato = orari[ 2 ];

                arrivoPrevisto = orari[ 3 ];
				
				}else{
				
				arrivoProgrammatoUltima = orari[2];
				
				arrivoPrevistoUltima = orari[3];
					
				arrivoProgrammato = orari[ 4 ];

                arrivoPrevisto = orari[ 5 ];
				
				}
				
				console.log(orari);
				
                binarioPrevistoPartenza = scrapedSource.match( /<!-- ORIGINE -->(.*?)Previsto:<br\/> (\d{1,2}|--)/ )[ 2 ];


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
				
				if(orario>=6)
					$( '#ultima > stazioneUltima > span' ).text(  );
					$( '#ultima > arrivoProgrammatoUltima> span' ).text( arrivoProgrammatoUltima );
					$( '#ultima > arrivoEffettivoUltima > span' ).text( arrivoPrevistoUltima );

		
		$( '#situazioneCorrente > span' ).text( situazioneCorrente );
		
		$( '#resultsScreen' ).attr( 'class', 'current' );
		
		$( '[data-position="current"]' ).attr( 'class', 'left' );

            }

        }
        myRequest.send(parameters);

    });

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
