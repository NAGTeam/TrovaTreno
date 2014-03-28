/* Storing the source from mobile.viaggiatreno.it */

$( document ).ready( function() {

    if ( !navigator.onLine ) { alert( 'Not online ...'); }

    myRequest = new XMLHttpRequest( {mozSystem: true} );

    myRequest.open( 'GET', 'http://mobile.viaggiatreno.it/vt_pax_internet/mobile' );

    myRequest.addEventListener( 'load', function() {

        if ( myRequest.status == 200 ) {

            alert( 'Content loaded!' );

            console.log( myRequest.responseText );
            $( '#src' ).text( myRequest.responseText );
        }

    });

    alert( 'Sending ...' );

    myRequest.send();

});
