/* Storing the source from mobile.viaggiatreno.it */

$( document ).ready( function() {

    if ( !navigator.onLine ) { alert( 'Not online ...'); }
	
	$('#btn-search').click(function (){
		
		numeroTreno=$('input[nome=numeroTreno]').val();

		myRequest = new XMLHttpRequest( {mozSystem: true} );
		
		parameters='numeroTreno='+numeroTreno;
		baseUrl = 'http://mobile.viaggiatreno.it/vt_pax_internet/mobile'+param;

		myRequest.open( 'POST', baseUrl,true);

		myRequest.addEventListener( 'load', function() {

			if ( myRequest.status == 200 ) {

				alert( 'Content loaded!' );

				console.log( myRequest.responseText );
				//$( '#src' ).text( myRequest.responseText );
			}

		});

		alert( 'Sending ...' );

		myRequest.send();
	});
});
