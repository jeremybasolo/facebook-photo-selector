(function($) {

	$.fn.fbphotoselector = function(options) {
		
		var opts = $.extend({}, $.fn.fbphotoselector.defaults, options);
	
    	return this.each(function() {
    		var container = $(this);
			FB.getLoginStatus(function(response) {
 				if(response.status === 'connected') {
			   		displaySelector(response.authResponse.accessToken);
 			 	} else {
 			 		container.html("<a class='facebookLogin' href=''>Login with facebook</a>");
 			 		$('.facebookLogin').click(function() {
 			 			FB.login(function(response) {
  							if (response.authResponse) {
  								displaySelector(response.authResponse.accessToken);
  							}
  						}, {scope: 'user_photos'});
 						return false;
					});
			 	}
 			});
			
			// Function displaying the selector
			function displaySelector(sessionToken) {
				
				container.html(opts.loadingText);
				
				FB.api('/me/albums?limit=0', function(response) {    
				    //List albums
				    var ulAlbums = "<ul class='fbAlbums'>";			
				    var albums = response.data;
				    var nbAlbums = albums.length;
				    if(opts.albumsByPage > 0 && opts.albumsByPage < albums.length) {
				    	var nbPages = Math.ceil(albums.length / opts.albumsByPage);
				    	nbAlbums = opts.albumsByPage;
				    }
				    for (var i=0, l= nbAlbums ; i<l; i++){
				    	var album = albums[i];
				    	ulAlbums = ulAlbums + displayAlbum(album, sessionToken);	
				    }
				    ulAlbums = ulAlbums + "</ul>";
				    var output = '';
				    if(opts.breadcrumb === true) {
				        output = "<nav class='breadcrumb'>Albums</nav>";
				    }
				    output = output + ulAlbums;
				    
				    if(opts.albumsByPage > 0 && opts.albumsByPage < albums.length) {
				    	var pagination = "<nav class='pagination'><ul>";
				    	for (var i=0, l= nbPages ; i<l; i++){
				    		numPage = i+1;
				    		pagination = pagination + "<li><a ";
				    		if(numPage == 1) {
				    			pagination = pagination + "class='current'";
				    		}
				    		pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
				    	}				    	
				    	pagination = pagination + "</ul></nav>";
						output = output + pagination;
					}
				    
				    container.html(output);
				    
				    //Album pagination click function
				    $(".pagination ul li a").click(function() {
				    	$(".pagination ul li a").removeClass('current');
				    	$(this).addClass('current');
				        var numPage = $(this).html();
				        var start = opts.albumsByPage * (numPage - 1);
				        var ulAlbums = "";
				        for (var i=start, l=(start + opts.albumsByPage)  ; i<l; i++){
				        	var album = albums[i];
				        	if(album !== undefined) {
				        		ulAlbums = ulAlbums + displayAlbum(album, sessionToken);
				        	}
				        }
				        $('ul.fbAlbums',container).html(ulAlbums);
				        
				    	$('.albumLink', container).click(function() {
				    		albumLinkClick($(this));
						});
				    });
				    
				    var albumLinkClick = function(elem) {
				    	
						var albumName = $('p', elem).html();
						container.html(opts.loadingText);
						
				    	//After albums selection
				    	FB.api('/' + elem.data('id') + '/photos?limit=0', function(response) {
				    		var ulPhotos = "<ul class='fbPhotos'>";
				    		var photos = response.data;
				    		var nbPhotos = photos.length;
				    		if(opts.photosByPage > 0 && opts.photosByPage < photos.length) {
				    		    var nbPages = Math.ceil(photos.length / opts.photosByPage);
				    		    nbPhotos = opts.photosByPage;
				    		}
				    		for (var i=0, l=nbPhotos; i<l; i++){
				    			var photo = photos[i];
				    			ulPhotos = ulPhotos + displayPhoto(photo, sessionToken);
				    		}
				    		ulPhotos = ulPhotos + "</ul>";
				    		var output = '';
				    		if(opts.breadcrumb === true) {
				    			output = "<nav class='breadcrumb'><a class='albumBack' href='javascript:void(0);'>Albums</a> > " + albumName + "</nav>";
				    		}
							var backButton = "<a class='btn btnBack' href='javascript:void(0);'>" + opts.backText + "</a>";
				    		if(opts.backButtonOnTop === true) {
				    			output = output + backButton; 
				    		}
				    		output = output + ulPhotos;
				    		
				    		if(opts.photosByPage > 0 && opts.photosByPage < photos.length) {
				    			var pagination = "<nav class='pagination'><ul>";
				    			for (var i=0, l= nbPages ; i<l; i++){
				    				numPage = i+1;
				    				pagination = pagination + "<li><a ";
				    				if(numPage == 1) {
				    					pagination = pagination + "class='current'";
				    				}
				    				pagination = pagination + " href='javascript:void(0);'>" + numPage + "</a></li>";				    		
				    			}				    	
				    			pagination = pagination + "</ul></nav>";
								output = output + pagination;
							}
				    		
				    		if(opts.backButtonOnBottom === true) {
				    			output = output + backButton; 
				    		}
				    		container.html(output);
				    		
				    		//Album pagination click function
				    		$(".pagination ul li a").click(function() {
				    			$(".pagination ul li a").removeClass('current');
				    			$(this).addClass('current');
				    		    var numPage = $(this).html();
				    		    var start = opts.photosByPage * (numPage - 1);
				    		    var ulPhotos = "";
				    		    for (var i=start, l=(start + opts.photosByPage)  ; i<l; i++){
				    		    	var photo = photos[i];
				    		    	if(photo !== undefined) {
				    		    		ulPhotos = ulPhotos + displayPhoto(photo, sessionToken);
				    		    	}
				    		    }
				    		    $('ul.fbPhotos',container).html(ulPhotos);
				    		    
				    			$('.photoLink', container).click(function() {
				    				photoLinkClick($(this));
								});
				    		});
				    				
				    		$('.albumBack,.btnBack', container).click(function(){
				    			displaySelector(sessionToken);
				    		});
				    		
				    		var photoLinkClick = function(elem) {
				    			var data = {
				    			    'id' : elem.data('id'),
				    			    'image' : elem.data('image'),
				    			    'thumbnail' : elem.data('thumbnail')
				    			}
				    			opts.onSelect(data);
				    		}
				    		
				    		$('.photoLink', container).click(function(){
				    			photoLinkClick($(this));
				    		});
				    	});	
				    };
				    
				    $('.albumLink', container).click(function() {
				    	albumLinkClick($(this));
					});
				});
			}
			// End of displaySelector()
			
			// Function to display a li album item
			function displayAlbum (album, sessionToken) {
				var ulAlbums = "";
				ulAlbums = ulAlbums + "<li>";
				ulAlbums = ulAlbums + "<a href='javascript:void(0);' data-id='"+album.id+"' class='albumLink'>";
				ulAlbums = ulAlbums + "<img src='https://graph.facebook.com/" + album.cover_photo + "/picture?type=" + opts.sizeAlbum + "&access_token=" + sessionToken + "'>";
				ulAlbums = ulAlbums + "<p>" + album.name + "</p>";
				ulAlbums = ulAlbums + "</a>";
				ulAlbums = ulAlbums + "</li>";
				return ulAlbums;
			}
			
			// Function to display a li photo item 
			function displayPhoto (photo, sessionToken) {
				var ulPhotos = "";
				ulPhotos = ulPhotos + "<li>";
				ulPhotos = ulPhotos + "<a href='javascript:void(0);' data-id='" + photo.id + "' data-image='https://graph.facebook.com/" + photo.id + "/picture?type=normal&access_token=" + sessionToken + "' data-thumbnail='https://graph.facebook.com/" + photo.id + "/picture?type=thumbnail&access_token=" + sessionToken + "' class='photoLink'>";
				ulPhotos = ulPhotos + "<img src='https://graph.facebook.com/" + photo.id + "/picture?type=" + opts.sizePhoto + "&access_token=" + sessionToken + "'>";
				ulPhotos = ulPhotos + "</a>";
				ulPhotos = ulPhotos + "</li>";
				return ulPhotos;
			}
			
    	});
  	}
  	
  	//Default configuration
  	$.fn.fbphotoselector.defaults = { 
  		breadcrumb: true, 
  		backButtonOnTop: false, 
  		backButtonOnBottom: true, 
  		sizeAlbum: 'thumbnail', 
  		sizePhoto: 'thumbnail', 
  		loadingText: 'Loading...', 
  		backText: 'Back',
  		albumsByPage: 0,
  		photosByPage: 0,
  		onSelect: function(data) {
  			var display = 'Id: ' + data.id + '\n\nLink image: ' + data.image + '\n\nLink thumbnail: ' + data.thumbnail;
  			console.log(display);
  		}
  	}

})(jQuery);

