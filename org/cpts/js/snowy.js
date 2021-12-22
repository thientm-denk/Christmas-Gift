/*
 * Snowy
 * 
 * @version: 1.0
 */

(function()
{
	this.Snowy = (function()
	{
		//Camera
		var camera = null;
		//Scene
		var scene = null;
		//Renderer
		var renderer = null;
		//Material
		var material = null;
		//Container
		var container = null;
		//Width
		var width = 0;
		//Height
		var height = 0;
		//Mouse X
		var mouseX = 0;
		//Mouse Y
		var mouseY = 0;
		//Window Half X
		var windowHalfX = 0;
		//Window Half Y
		var windowHalfY = 0;
		//Particles
		var particles = null;
		//Particle image
		var particleImage = null;
		
		//constructor
		function Snowy(container, count, move)
		{
			//Set default position
			this.mouseX = 0;
			this.mouseY = 0;
			//Get current instance
			var self = this;	
			//Set container
			this.container = $(container);
			//Create particles array
			this.particles = [];
			//Create particle image
			this.particleImage = new Image();
			//Set particle image
			this.particleImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAMAAADzapwJAAAAVFBMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////+UMeA9AAAAHHRSTlMBBAkUJQ5rTTswGOm81s2zopmRgXNeSCsd3olS4sNQLwAAAKVJREFUGNN1kUkWgyAQRIMg0Mg8q/e/Z5CY+LLo2vG7Hj3U6ysydT8etkz9VQZcKVWK0nV5+AU7awCN9avwo4qBrEJUCUzdnJBBpSg8Z16EHJyQaaZMnjzFEGLip2R0mXjtIPjhndbOH1xAX8ltLslra4zVPpVpv3CrPDq7b9tuXeS1fbACkYM225DRIQtQCEY/QVoiAyLrIMsjp0IOi8SAhIZE/AYm2Q1NKwkxLAAAAABJRU5ErkJggg==';
			//On window resize
			$(window).resize(function() { self.onResize(); }).trigger("resize");
			//Create camera
			this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10000);
			//Set camera Z position
			this.camera.position.z = 1000;
			//Create scene
			this.scene = new THREE.Scene();
			//Add camera to scene
			this.scene.add(this.camera);
			//Create renderer
			this.renderer = new THREE.CanvasRenderer();
			//Set renderer size
			this.renderer.setSize(this.width, this.height);
			//Create material
			this.material = new THREE.ParticleBasicMaterial({ map: new THREE.Texture(this.particleImage) });
			//Check for count
			if (typeof count === 'undefined')
			{
				count = 250;
			}
			//Check for move
			if(typeof move === 'undefined')
			{
				move = false;
			}
			//Create particle variable
			var particle = null;
			//Add particles
			for (var i = 0; i < count; i++)
			{
				particle = new Snowflake(this.material);
				particle.position.x = Math.random() * 2000 - 1000;
				particle.position.y = Math.random() * 2000 - 1000;
				particle.position.z = Math.random() * 2000 - 1000;
				particle.scale.x = particle.scale.y = 1;
				this.scene.add(particle);
				this.particles.push(particle);
			}
			//Add renderer to container
			this.container.append(this.renderer.domElement);
			//Check for move
			if(move)
			{
				//On mouse move
				$(document).on('mousemove', function(e) { self.onMouseMove(e); });
				//On touch start
				$(document).on('touchstart', function(e) { self.onTouchStart(e); });
				//On touch start
				$(document).on('touchmove', function(e) { self.onTouchMove(e); });
			}
			//Start main loop
			setInterval(function() { self.loop(); }, 1000 / 25);
		}
		
		//On resize event
		Snowy.prototype.onResize = function()
		{
			//Set dimentsions
			this.width = this.container.outerWidth();
			this.height = this.container.outerHeight();
			this.windowHalfX = $(window).innerWidth() / 2;
			this.windowHalfY = $(window).innerHeight() / 2;
			//Set camera aspect
			if(this.camera)
			{
				this.camera.aspect = this.width / this.height;
			}
			//Set renderer size
			if(this.renderer)
			{
				this.renderer.setSize(this.width, this.height);
			}
		};
		
		//On mouse move
		Snowy.prototype.onMouseMove = function(event)
		{
			this.mouseX = event.clientX - this.windowHalfX;
			this.mouseY = event.clientY - this.windowHalfY;
		};
		
		//On touch start
		Snowy.prototype.onTouchStart = function(event)
		{
			if (event.touches.length == 1)
			{
				event.preventDefault();

				this.mouseX = event.touches[0].pageX - this.windowHalfX;
				this.mouseY = event.touches[0].pageY - this.windowHalfY;
			}
		};
		
		//On touch move
		Snowy.prototype.onTouchMove = function(event)
		{
			if (event.touches.length == 1)
			{
				event.preventDefault();

				this.mouseX = event.touches[0].pageX - this.windowHalfX;
				this.mouseY = event.touches[0].pageY - this.windowHalfY;
			}
		};
		
		//Main loop
		Snowy.prototype.loop = function()
		{
			for (var i = 0; i < this.particles.length; i++)
			{
				var particle = this.particles[i];
				particle.updatePhysics();

				with (particle.position)
				{
					if (y < -1000) y += 2000;
					if (x > 1000) x -= 2000;
					else if (x < -1000) x += 2000;
					if (z > 1000) z -= 2000;
					else if (z < -1000) z += 2000;
				}
			}

			this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.1;
			this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.1;
			this.camera.lookAt(this.scene.position);
			this.renderer.render(this.scene, this.camera);
		};
		
		return Snowy;
		
	})();
	
}).call(this);

//Add as jQuery plugin
$.fn.snowy = function(count, move)
{
	//Return new snowy
	return new Snowy(this, count, move);
};

/**
 * Snowflake
**/

//Variables
var TO_RADIANS = Math.PI / 180; 

//Constructor
var Snowflake = function(material)
{
	//call particle constructor
	THREE.Particle.call(this, material);
	//define properties
	this.velocity = new THREE.Vector3(0,-8,0);
	this.velocity.rotateX(randomRange(-45,45)); 
	this.velocity.rotateY(randomRange(0,360)); 
	this.gravity = new THREE.Vector3(0,0,0); 
	this.drag = 1; 
};

//Create prototype
Snowflake.prototype = new THREE.Particle();
Snowflake.prototype.constructor = Snowflake;

//Update physics
Snowflake.prototype.updatePhysics = function()
{
	this.velocity.multiplyScalar(this.drag); 
	this.velocity.addSelf(this.gravity);
	this.position.addSelf(this.velocity);
}

//Add rotate Y vector function
THREE.Vector3.prototype.rotateY = function(angle)
{					
	cosRY = Math.cos(angle * TO_RADIANS);
	sinRY = Math.sin(angle * TO_RADIANS);
	
	var tempz = this.z;; 
	var tempx = this.x; 

	this.x= (tempx*cosRY)+(tempz*sinRY);
	this.z= (tempx*-sinRY)+(tempz*cosRY);
}

//Add rotate X vector function
THREE.Vector3.prototype.rotateX = function(angle)
{
	cosRY = Math.cos(angle * TO_RADIANS);
	sinRY = Math.sin(angle * TO_RADIANS);
	
	var tempz = this.z;; 
	var tempy = this.y; 

	this.y= (tempy*cosRY)+(tempz*sinRY);
	this.z= (tempy*-sinRY)+(tempz*cosRY);
}

//Add rotate Z vector function
THREE.Vector3.prototype.rotateZ = function(angle)
{	
	cosRY = Math.cos(angle * TO_RADIANS);
	sinRY = Math.sin(angle * TO_RADIANS);
	
	var tempx = this.x;; 
	var tempy = this.y; 

	this.y= (tempy*cosRY)+(tempx*sinRY);
	this.x= (tempy*-sinRY)+(tempx*cosRY);
}

//returns a random number
function randomRange(min, max)
{
	return ((Math.random()*(max-min)) + min); 
}
