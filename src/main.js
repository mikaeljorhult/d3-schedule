define( [ 'd3-schedule' ], function( schedule ) {
	'use strict';
	
	schedule
		.setElement( '.schedule' )
		.setSource( 'src/bookings.json' );
} );