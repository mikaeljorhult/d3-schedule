define( [ 'd3', 'Events' ], function( d3, Events ) {
	'use strict';
	
	var container = d3.selectAll( '.schedule' ),
		schedule = container.append( 'svg' ),
		dateFormat = d3.time.format( '%Y-%m-%d %H:%M:%S' ),
		timeScale,
		objects = [],
		width = 400,
		height = 400,
		paddingLeft = 150,
		rowHeight = 24;
	
	// Set height and width of schedule.
	d3.select( window ).on( 'resize', resize );
	resize();
	
	// Get bookings.
	d3.json( 'bookings.json', function( error, json ) {
		objects = json;
		
		// Trigger event.
		Events.publish( 'objects:updated' );
	} );
	
	function visualize() {
		if ( objects !== undefined && objects.length < 1 ) { return; }
		
		// Select all objects.
		var d3Objects = schedule.selectAll( 'g.object' )
			.data( objects )
				.enter();
		
		// Draw objects
		d3Objects.append( 'g' )
			.attr( 'x', 0 )
			.attr( 'y', function( datum, index ) { return index * rowHeight; } )
			.attr( 'width', width )
			.attr( 'height', rowHeight )
			.attr( 'class', 'object' )
			.each( function( object, index ) {
				// Select bookings.
				var currentObject = d3.select( this ),
					bookings = currentObject
						.selectAll( 'rect' )
						.data( object.bookings )
							.enter();
				
				// Add object names.
				currentObject.append( 'svg:text' )
					.text( object.name )
					.attr( 'x', 0 )
					.attr( 'y', ( index * rowHeight ) + ( 0.625 * rowHeight ) )
					.attr( 'height', rowHeight );
				
				
				// Draw bookings within object.
				bookings.append( 'rect' )
					.attr( 'rx', 3 )
					.attr( 'ry', 3 )
					.attr( 'y', index * rowHeight )
					.attr( 'x', function( datum ) { return timeScale( dateFormat.parse( datum.startTime ) ); } )
					.attr( 'height', rowHeight - 2 )
					.attr( 'width', function( datum ) { return timeScale( dateFormat.parse( datum.endTime ) ) - timeScale( dateFormat.parse( datum.startTime ) ); } )
					.attr( 'fill', function( datum ) { return datum.color; } )
					.attr( 'class', 'booking' );
			} );
	}
	
	function getWidth() {
		return parseInt( container.style( 'width' ), 10 );
	}
	
	function resize() {
		if ( objects.length < 1 ) { return; }
		
		// Get the new width of the container.
		width = getWidth();
		
		// Update time scale.
		timeScale.range( [ paddingLeft, width ] );
		
		// Resize SVG element.
		schedule
			.attr( 'width', width )
			.attr( 'height', height );
		
		// Resize all objects.
		schedule.selectAll( '.object' )
			.attr( 'width', width );
		
		// Resize all bookings.
		schedule.selectAll( '.booking' )
			.attr( 'x', function( datum ) { return timeScale( dateFormat.parse( datum.startTime ) ); } )
			.attr( 'width', function( datum ) { return timeScale( dateFormat.parse( datum.endTime ) ) - timeScale( dateFormat.parse( datum.startTime ) ); } );
	}
	
	// Subscribe to events.
	Events.subscribe( 'objects:updated', function () {
		// Setup timescale.
		timeScale = d3.time.scale()
			.domain( [
				d3.min( objects, function( datum ) {
					return d3.min( datum.bookings, function( booking ) {
						return dateFormat.parse( booking.startTime );
					} );
				} ),
				d3.max( objects, function( datum ) {
					return d3.max( datum.bookings, function( booking ) {
						return dateFormat.parse( booking.endTime );
					} );
				} )
			] )
			.range( [ paddingLeft, width ] );
		
		// Set height of schedule.
		height = rowHeight * objects.length;
		
		// Render bookings.
		visualize();
	} );
} );