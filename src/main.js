define( [ 'd3-schedule' ], function( schedule ) {
	'use strict';
	
	schedule.setElement( '.schedule' );
	schedule.setSource( 'src/bookings.json' );
} );