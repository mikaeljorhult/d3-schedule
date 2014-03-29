define( [ 'd3', 'Events' ], function( d3, Events ) {
	'use strict';
	
	var D3Schedule,
		container,
		schedule,
		dateFormat = d3.time.format( '%Y-%m-%d %H:%M:%S' ),
		timeScale = d3.time.scale(),
		objects = [],
		url,
		
		// Dimensions.
		width = 400,
		height = 400,
		paddingLeft = 150,
		rowHeight = 24;
	
	// Create main module for returning.
	D3Schedule = {
		setElement: setElement,
		setSource: setSource,
		update: update
	};
	
	// Attach resize function.
	d3.select( window ).on( 'resize', resize );
	
	function setElement( selector ) {
		container = d3.selectAll( selector );
		schedule = container.append( 'svg' );
		
		// Set height and width of schedule.
		resize();
		
		return D3Schedule;
	}
	
	function setSource( newURL ) {
		url = newURL;
		
		return update();
	}
	
	function update() {
		// Get bookings.
		d3.json( url, function( error, json ) {
			objects = json;
			
			// Trigger event.
			Events.publish( 'objects:updated' );
		} );
		
		return D3Schedule;
	}
	
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
				
				// Add rectangle for styling rows.
				currentObject.append( 'rect' )
					.attr( 'x', 0 )
					.attr( 'y', index * rowHeight )
					.attr( 'width', '100%' )
					.attr( 'height', rowHeight )
					.attr( 'fill', 'transparent' )
					.attr( 'class', 'row' );
				
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
		// Get the new width of the container.
		width = getWidth();
		
		// Update time scale.
		timeScale.range( [ paddingLeft, width ] );
		
		// Resize SVG element.
		schedule
			.attr( 'width', width )
			.attr( 'height', height );
		
		if ( objects.length > 0 ) {
			// Resize all objects.
			schedule.selectAll( '.object' )
				.attr( 'width', width );
			
			// Resize all bookings.
			schedule.selectAll( '.booking' )
				.attr( 'x', function( datum ) { return timeScale( dateFormat.parse( datum.startTime ) ); } )
				.attr( 'width', function( datum ) { return timeScale( dateFormat.parse( datum.endTime ) ) - timeScale( dateFormat.parse( datum.startTime ) ); } );
		}
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
	
	// Return object to allow access to functions.
	return D3Schedule;
} );