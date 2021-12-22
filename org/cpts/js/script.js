$(function()
{
	//active snow
	if($.isFunction($.fn.snowy))
	{
		$('.snowy').each(function()
		{
			//check for data
			if($(this).is('[data-snowy]'))
			{
				$(this).snowy($(this).data('snowy'));
			}
			else
			{
				$(this).snowy();
			}
		});
	}
	
	//countdown
	if($.isFunction($.fn.countdown))
	{
		$('.countdown[data-date]').countdown(
		{
			date: $(this).data('date'),
			render: function(data)
			{
				$(this.el).html
				(
					"<div class=\"countdown-box\"><h2 class=\"countdown-number\">" + data.days + "</h2>" + " <h4 class=\"countdown-title\">days</h4></div>" +
					"<div class=\"countdown-box\"><h2 class=\"countdown-number\">" + data.hours + "</h2>" + " <h4 class=\"countdown-title\">hours</h4></div>" +
					"<div class=\"countdown-box\"><h2 class=\"countdown-number\">" + this.leadingZeros(data.min, 2) + "</h2>" + " <h4 class=\"countdown-title\">minutes</h4></div>" +
					"<div class=\"countdown-box\"><h2 class=\"countdown-number\">" + this.leadingZeros(data.sec, 2) + "</h2>" + " <h4 class=\"countdown-title\">seconds</h4></div>"
				);
			}
		});
	}
	
	//fullpage
	if($.isFunction($.fn.fullpage))
	{
		$('.fullpage').fullpage(
		{
			navigation: true,
			verticalCentered: true,
			afterRender: function()
			{
				//get container
				var container = $(this);
				//find section count
				var count = container.find('.section').length;
				//create previous slide button
				var prev = $('<a href="#" class="fp-prev"><i class="fa fa-arrow-up" aria-hidden="true"></i></a>');
				//create next slide button
				var next = $('<a href="#" class="fp-next"><i class="fa fa-arrow-down" aria-hidden="true"></i></a>');
				//add previous slide button action
				prev.on('click', function(e)
				{
					e.preventDefault();
					$.fn.fullpage.moveSectionUp();
				});
				//add next slide button action
				next.on('click', function(e)
				{
					e.preventDefault();
					$.fn.fullpage.moveSectionDown();
				});
				//add buttons to body
				$('body').append(prev);
				$('body').append(next);
				//set prev as unvisible
				prev.addClass('unvisible');
				//check for slides
				if(count <= 1)
				{
					//set next as unvisible
					next.addClass('unvisible');
				}
				//set prev data section
				prev.attr('data-section', 1);
				//set next data section
				next.attr('data-section', Math.min(count, 2));
			},
			afterLoad: function(anchorLink, index)
			{
				//get section
				var section = $(this);
				//find section count
				var count = section.parent().find('.section').length;
				
				//check for first section
				if(index == 1)
				{
					//hide prev slide
					$('.fp-prev').removeClass('visible').addClass('unvisible');
				}
				else
				{
					//show prev slide
					$('.fp-prev').removeClass('unvisible').addClass('visible');
				}
				
				//check for last section
				if(index == count)
				{
					//hide next slide
					$('.fp-next').removeClass('visible').addClass('unvisible');
				}
				else
				{
					//show next slide
					$('.fp-next').removeClass('unvisible').addClass('visible');
				}
				
				//set data section tags
				$('.fp-prev').attr('data-section', Math.max(1, index - 1));
				$('.fp-next').attr('data-section', Math.min(count, index + 1));
			}
		});
	}
	
	//audio player
	$('.audio-player').each(function()
	{
		//get audio element
		var audio = $(this);
		//create container
		var container = $('<div class="audio-player-container"></div>');
		//create div element
		var player = $('<div class="audio-player"></div>');
		//create bars
		var bars = $
		(
			'<div class="audio-bars">' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
				'<div class="audio-bar"></div>' +
			'</div>'
		);
		
		//remove audio player class from audio tag
		audio.removeClass('audio-player');
		
		//insert player in container
		container.append(player);
		//insert container element
		container.insertAfter(audio);
		
		//add audio bars
		player.append(bars);
		
		//on audio play
		audio[0].onplay = function()
		{
			player.addClass('on').removeClass('off');
		};
		
		//on audio pause
		audio[0].onpause = function()
		{
			player.addClass('off').removeClass('on');
		};
		
		//on audio player click
		bars.on('click', function()
		{
			if (audio[0].paused == false)
			{
				audio[0].pause();
			}
			else
			{
				audio[0].play();
			}
		});
		
		//set player status
		if(audio[0].paused == false)
		{
			player.addClass('on').removeClass('off');
		}
		else
		{
			player.addClass('off').removeClass('on');
		}
	});
	
	//ajax forms
	$('.ajax-form').on('submit', function(e)
	{
		//get current form
		var $form = $(this);
		//get method
		var method = $form.attr('method').toUpperCase();
		//get action
		var action = $form.attr('action');
		//send ajax request
		$.ajax(
		{
			type: method,
			url: action,
			data: $form.serialize(),
			success: function(data)
			{
				if(data.indexOf('alert-success') > 0)
				{
					$form.trigger('reset');
				}
			
				if($form.is('[data-result]'))
				{
					$($form.data('result')).html(data);
				}
			}
		});
		
		e.preventDefault();
	});
	
	//snow text
	$(window).on('resize', function()
	{
		$('.snow-text').each(function()
		{
			//get element
			var $this = $(this);
			//get text
			var text = $this.text();
			//get chars count
			var chars = text.length;
			//check for portrait/landscape mode
			if($(window).width() > $(window).height())
			{
				//calculate font size
				var font_size = Math.min(16, 200 / chars);
				//set font size
				$this.css('font-size', font_size + 'vh');
			}
			else
			{
				//calculate font size
				var font_size = Math.min(15, 160 / chars);
				//set font size
				$this.css('font-size', font_size + 'vw');
			}
		});
		
	}).trigger('resize');
	
});