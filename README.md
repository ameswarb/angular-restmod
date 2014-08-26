<!-- load: restmod -->
<!-- provide: $provide -->
<!-- inject: $httpBackend -->
<!-- inject: $injector -->
<!-- inject: $injector -->
<!-- inject: restmod -->

<!-- before:
	$httpBackend.when('GET', '/bikes/1').respond({ model: 'Slash', brand: 'Trek' })
	$httpBackend.when('GET', '/bikes/1?includeParts=true').respond({ model: 'Slash', brand: 'Trek', parts: [] })
	$httpBackend.when('GET', '/bikes?brand=trek').respond([ { model: 'Slash' }, { model: 'Remedy' } ])
	$httpBackend.when('GET', '/bikes?category=enduro').respond([ { model: 'Slash' }, { model: 'Remedy' } ])

	module = $provide;
-->

Angular Restmod  [![Build Status](https://api.travis-ci.org/platanus/angular-restmod.png)](https://travis-ci.org/angular-platanus/restmod) [![Code Climate](https://codeclimate.com/github/platanus/angular-restmod/badges/gpa.svg)](https://codeclimate.com/github/platanus/angular-restmod) [![Stories in Ready](https://badge.waffle.io/platanus/angular-restmod.png?label=ready&title=Ready)](https://waffle.io/platanus/angular-restmod)
===============
Restmod creates objects that you can use from within Angular to interact with your RESTful API.

Saving bikes on your serverside database would be as easy as:

<!-- section: main example -->

```javascript
var newBike = Bike.$build({ brand: 'Trek' });
newBike.model = '5200';
newBike.$save(); // bike is persisted sending a POST to /bikes
```

<!-- end -->

It also supports collections, relations, lifecycle hooks, attribute renaming, side data loading and much more.
Continue reading for a quick start or check the API Reference for more: http://platanus.github.io/angular-restmod

If you are working with ruby on rails, we recommend [active_model_serializers](https://github.com/rails-api/active_model_serializers) for seamless integration.

## Why Restmod?

Restmod brings Rails ActiveRecord's ease of use to the Angular Framework. It succesfuly combines Angular's encapsulated design with Active Record's opinionated style. There are other alternatives available though:

* **$resource:** Might be enough for small projects, included as an Angular opt-in. It only provides a basic model type layer, with limited features.
* **Restangular:** very complete library, but does not propose a model layer and does not support linked resource responses as seen on jsonapi.org.
* **angular-activerecord:** Nice alternative to $resource, still very limited in its functionality.
* **ModelCore:** Inspired in angular-activerecord, provides a more complete set of features but lacks testing.

## Getting Started

#### 1. Get the code

You can get it straight from the repository

```
git clone git@github.com:platanus/angular-restmod.git
```

but we recommend you to use bower to retrieve the Restmod package

```
bower install angular-restmod --save
```

#### 2. Include it on your project

Make sure the restmod source is required in your code.

```html
<script type="text/javascript" src="js/angular-restmod-bundle.min.js"></script>
```

Next, include angular module as one of your app's dependencies

<!-- before: module = $provide; -->
<!-- ignore -->

```javascript
module = angular.module('MyApp', ['restmod'])
```

<!-- end -->

# REST API Integration

Restmod provides a series of configuration options to match your API style:

* Common url prefix configuration
* Primary key name configuration
* Json root property configuration
* Json metadata extraction
* Json side data resolving for jsonapi.org style APIs (for apis using 'links')
* Request customization
* Url formatting options

Make sure you read the [Api Integration FAQ](https://github.com/platanus/angular-restmod/blob/master/docs/guides/integration.md) before starting your API integration!

# Basic usage

You begin by creating a new model using the `restmod.model` method. We recommend you to put each model on a separate factory. The first argument for `model` is the resource URL.

```javascript
module.factory('Bike', function(restmod) {
	return restmod.model('/bikes');
});
```

<!-- before: Bike = $injector.get('Bike') -->
<!-- it: expect(Bike).not.toBeNull() -->

The generated model type provides basic CRUD operations to interact with the API:

<!-- section: $find -->

To retrieve an object by ID use `$find`, the returned object will be filled with the response data when the server response is received.

Let's say you have a REST API that responds JSON to a GET REQUEST on /bikes/1

```json
{
	"id": 1,
	"brand": "Trek",
	"created_at": "2014-05-23"
}
```

Then, on your code you would call

```javascript
bike = Bike.$find(1);
```

<!-- section: $then -->

The bike object will be populated as soon as the API returns some data. You can use `$then` to do something when data becomes available.

```javascript
bike.$then(function() {
	expect(bike.brand).toBeDefined();
});
```

<!-- it: $httpBackend.flush() -->
<!-- end -->

If you need to pass additional parameters to `$find`, you can use the second function argument.

```javascript
bike = Bike.$find(1, { includeParts: true });
```

**IMPORTANT**: RestMod will rename attributes from under_score to camelCase by default, refer to the building docs if you need to disable this feature. In the example above you should use `bike.createdAt` to refer to the value of the `created_at` returned by the API.

<!-- it: $httpBackend.flush(); expect(bike.model).toEqual('Slash') -->
<!-- end -->

<!-- section: $fetch -->

To reload an object use `$fetch`. **WARNING:** This will overwrite modified properties.

<!-- before: bike = Bike.$new(1) -->

```javascript
bike.$fetch();
```

<!-- it: $httpBackend.flush(); expect(bike.model).toEqual('Slash') -->
<!-- end -->

<!-- section: $collection and $search -->

To retrieve an object collection `$collection` or `$search` can be used.

```javascript
bikes = Bike.$search({ category: 'enduro' });
// same as
bikes = Bike.$collection({ category: 'enduro' }); // server request not yet sent
bikes.$refresh();
```

<!-- it: $httpBackend.flush(); expect(bikes.length).toEqual(2) -->
<!-- end -->

<!-- section: scoped -->

<!-- before: bikes = Bike.$collection({ category: 'enduro' }); -->

<!-- section: $refresh -->

To reload a collection use `$refresh`. To append more results use `$fetch`.

<!-- before:
	$httpBackend.when('GET', '/bikes?category=enduro&page=1').respond([{ model: 'Slash', brand: 'Trek' }]);
	$httpBackend.when('GET', '/bikes?category=enduro&page=2').respond([{ model: 'Meta', brand: 'Commencal' }]);
	$httpBackend.when('GET', '/bikes?category=enduro&page=3').respond([{ model: 'Mach 6', brand: 'Pivot' }]);
-->

```javascript
bikes = Bike.$collection({ category: 'enduro' });
bikes.$refresh({ page: 1 }); // clear collection and load page 1
bikes.$fetch({ page: 2 }); // page 2 is appended to page 1, usefull for infinite scrolls...
bikes.$refresh({ page: 3 }); // collection is reset, page 3 is loaded on response
```

<!-- it: $httpBackend.flush(); expect(bikes.length).toEqual(1) -->
<!-- end -->

<!-- section: $save -->

To update an object, just modify the properties and call `$save`.

```javascript
bike = Bike.$find(1);
bike.brand = 'Trek';
bike.$save();
```

<!-- it: $httpBackend.expectPUT('/bikes/1').respond(200, '{}'); $httpBackend.flush(); -->
<!-- end -->

<!-- section: $save -->

To create a new object use `$build` and then call `$save`. This will send a POST request to the server.

```javascript
var newBike = Bike.$build({ brand: 'Comencal' });
newBike.model = 'Meta';
newBike.$save(); // bike is persisted
```

<!-- it: $httpBackend.expectPOST('/bikes').respond(200, '{}'); $httpBackend.flush(); -->
<!-- end -->

<!-- section: $create on type -->

Or use `$create`

```javascript
var newBike = Bike.$create({ brand: 'Comencal', model: 'Meta' });
```

<!-- it: $httpBackend.expectPOST('/bikes').respond(200, '{}'); $httpBackend.flush(); -->
<!-- end -->

<!-- section: $create on collection -->

If called on a collection, `$build` and `$create` will return a collection-bound object that will be added when saved successfully.

```javascript
newBike = bikes.$create({ brand: 'Comencal', model: 'Meta' });
// after server returns, 'bikes' will contain 'newBike'.
```

<!-- it:
	expect(bikes.length).toEqual(0);
	$httpBackend.expectPOST('/bikes').respond(200, '{}');
	$httpBackend.flush();
	expect(bikes.length).toEqual(1);
-->
<!-- end -->

<!-- section: $reveal -->

To show a non saved object on the bound collection use `$reveal`

```javascript
var newBike = bikes.$create({ brand: 'Comencal', model: 'Meta' }).$reveal();
// 'newBike' is inmediatelly available at 'bikes'
```

<!-- it: expect(bikes.length).toEqual(1); -->
<!-- end -->

<!-- section: $destroy -->

Finally, to destroy an object just call `$destroy`. Destroying an object bound to a collection will remove it from the collection.

```javascript
bike.$destroy();
```
<!-- $httpBackend.expectDELETE('/bikes').respond(200, '{}'); $httpBackend.flush(); -->
<!-- end -->

<!-- section: $destroy on collection -->

As with $create, calling `$destroy` on a record bound to a collection will remove it from the collection on server response.

<!-- end -->

<!-- section: $then -->

<!-- before: bike = Bike.$new(1); -->
<!-- before: doSomething = jasmine.createSpy(); -->

All operations described above will set the `$promise` property. This property is a regular `$q` promise that is resolved when operation succeds or fail. It can be used directly or using the `$then` method.

```javascript
bike.$fetch().$then(function(_bike) {
	doSomething(_bike.brand);
});
// same as:
bike.$fetch().$promise.then(function(_bike) {
	doSomething(_bike.brand);
});
```

<!-- it: $httpBackend.flush(); expect(doSomething).toHaveBeenCalled(); -->
<!-- end -->

<!-- end -->


# Customizing model behaviour

When defining a model, you can pass a **definition object**

```javascript
Bike = restmod.model('api/bikes',
// This is the definition object:
{
	createdAt: { encode: 'date' },
	owner: { belongsTo: 'User' }
}
);
```

<!-- it:
	expect(Bike.$new().owner).toBeDefined();
	expect(typeof Bike.$build({ createdAt: new Date() }).$encode().created_at).toEqual('string');
-->

The **definition object** allows you to:
* Define **relations** between models
* Customize an attribute's **serialization** and **default values**
* Add **custom methods**
* Add lifecycle **hooks**


## Relations

Relations are defined like this:

<!-- before:
	module.factory('User', function() { return restmod.model(); });
	module.factory('Part', function() { return restmod.model(); });
	$httpBackend.when('GET', '/bikes/1/parts').respond([ { id: 1, brand: 'Shimano' }, { id: 2, brand: 'SRAM' } ]);
	$httpBackend.when('GET', '/parts/1').respond({ brand: 'Shimano', category: 'brakes' });
-->

```javascript
Bike = restmod.model('/bikes', {
	parts: { hasMany: 'Part' },
	owner: { belongsTo: 'User' }
});
```

<!-- it:
	expect(Bike.$new().owner).toBeDefined();
	expect(Bike.$new().parts).toBeDefined();
-->

There are three types of relations:

#### HasMany

Let's say you have the following 'Part' model:

```javascript
module.factory('Part', function() {
	return restmod.model('/parts');
});
```

The HasMany relation allows you to access parts of a specific bike directly from a bike object. In other words, HasMany is a hirearchical relation between a model instance (bike) and a model collection (parts).

```javascript
Bike = restmod.model('/bikes', {
	parts: { hasMany: 'Part' }
});

bike = Bike.$new(1); 			// no request are made to the server yet.
parts = bike.parts.$fetch(); 	// sends a GET to /bikes/1/parts
```

<!-- it:
	$httpBackend.expectGET('/bikes/1/parts');
	$httpBackend.flush();
	expect(parts.length).toEqual(2);
-->

<!-- section: $fetch -->

Later on, after 'parts' has already been resolved,

<!-- before: $httpBackend.flush() -->

```javascript
parts[0].$fetch(); // updates the part at index 0. This will do a GET /parts/:id
```

<!-- it:
	$httpBackend.expectGET('/parts/1');
	$httpBackend.flush();
	expect(parts[0].category).toEqual('brakes');
-->
<!-- end -->

<!-- section: $create -->

Calling `$create` on the collection will POST to the collection nested url.

```javascript
var part = bike.parts.$create({ serialNo: 'XX123', category: 'wheels' }); // sends POST /bikes/1/parts
```

<!-- it:
	$httpBackend.expectPOST('/bikes/1/parts').respond(200, {});
	$httpBackend.flush();
-->
<!-- end -->

<!-- section: anonymous -->

If the child collection model is anonymous (no url given to `model`) then all CRUD routes for the collection items are bound to the parent.

So if 'Part' was defined like:

```javascript
restmod.model(null);
```

<!-- section: $fetch -->

The example above would behave like this:

<!-- before:
	bike = restmod.model('/bikes', { parts: { hasMany: restmod.model(null) } }).$new(1);
	bike.parts.$decode([{ id: 1 }]);
-->

```javascript
console.log(bike.parts[0].$url())
bike.parts[0].$fetch();
```

Will send GET to /bikes/1/parts/:id instead of /parts/:id

<!-- it:
	$httpBackend.expectGET('/bikes/1/parts/1').respond(200, {});
	$httpBackend.flush();
-->

<!-- end -->

<!-- end -->

#### HasOne

This is a hirearchical relation between one model's instance and another model's instance.
The child instance url is bound to the parent url.
The child instance is created **at the same time** as the parent, so its available even if the parent is not resolved.

Let's say you have the following 'User' model:

```javascript
module.factory('User', function() {
	return restmod.model('/users');
});
```

That relates to a 'Bike' through a *hasOne* relation:

```javascript
Bike = restmod.model('/bikes', {
	owner: { hasOne: 'User' }
});
```

<!-- section: not anonymous -->

Then a bike's owner data can then be retrieved just by knowing the bike primary key (id):

```javascript
owner = Bike.$new(1).owner.$fetch();
```

> will send GET /bikes/1/owner

<!-- it:
	$httpBackend.expectGET('/bikes/1/owner').respond(200, {});
	$httpBackend.flush();
-->

<!-- end -->

<!-- section: not anonymous -->

Since the user resource has its own resource url defined:

<!-- before: owner = Bike.$new(1).owner.$decode({ id: 1 }); -->

```javascript
owner.name = 'User';
owner.$save();
```

<!-- it:
	$httpBackend.expectPUT('/users/1').respond(200, {});
	$httpBackend.flush();
-->

> will send PUT /user/X.

<!-- end -->

<!-- section: anonymous -->

If 'User' was to be defined like an anonymous resource:

```javascript
module.factory('User', function() {
	return restmod.model(null); // note that the url is null
});
```

<!-- before:
	owner = restmod.model('/bikes', { owner: { hasOne: 'User' } }).$new(1).owner;
-->

Then calling:

```javascript
owner.name = 'User';
owner.$save();
```

<!-- it:
	$httpBackend.expectPUT('/bikes/1/owner').respond(200, {});
	$httpBackend.flush();
-->

> will send a PUT to /bikes/1/owner

<!-- end -->

<!-- ignore -->

#### BelongsTo

This relation should be used in the following scenarios:

1. The api resource references another resource by id:

```
{
	name: '...',
	brand: '...',
	owner_id: 20
}
```

2. The api resource contanis another resource as an inline property and does not provide the same object as a nested url:

```
{
	name: '...',
	brand: '...',
	owner: {
		id: 20,
		user: 'extreme_rider_99'
	}
}
```

When applied, the referenced instance is not bound to the host's scope and is **generated after** server responds to a parent's `$fetch`.

Let's say you have the same 'User' model as before:

```javascript
module.factory('User', function() {
	return restmod.model('/users');
});
```

That relates to a 'Bike' through a *belongsTo* relation this time:

```javascript
Bike = restmod.model('/bikes', {
	owner: { belongsTo: 'User', key: 'last_owner_id' } // default key would be 'owner_id'
});
```

Also you have the following bike resource:

```
GET /bikes/1

{
	id: 1,
	brand: 'Transition',
	last_owner_id: 2
}
```

Then retrieving the resource:

```javascript
bike = Bike.$find(1);
```

Will produce a `bike` object with its owner property initialized to a user with id=2, the owner property will only be available **AFTER** server response arrives.

Then calling

```javascript
bike.owner.$fetch();
```

Will send a GET to /users/2 and populate the owner property with the user data.

This relation also support the child object data to come inlined in the parent object data.
The inline property name can be optionally selected using the `map` attribute.

Lets redefine the `Bike` model as:

```javascript
var Bike = restmod.model('/bikes', {
	owner: { belongsTo: 'User', map: 'last_owner' } // map would default to *owner*
});
```

And suppose that the last bike resource looks like:

```
GET /bikes/1

{
	id: 1,
	brand: 'Transition',
	last_owner: {
		id: 2
		name: 'Juanito'
	}
}
```

Then retrieving the bike resource:

```javascript
var bike = Bike.$find(1);
```

Will produce a `bike` object with its owner property initialized to a user with id=2 and name=Juanito. As before, the owner property will only be available **AFTER** server response arrives.

Whenever the host object is saved, the reference primary key will be sent in the request using the selected foreign key.

So given the previous model definition, doing:

```javascript
var bike = Bike.$create({ last_owner: User.$find(20) });
```

Will generate the following request:

```
POST /bikes

{
	owner_id: 20
}
```

#### BelongsToMany

This relation should be used in the following scenarios:

1. The api resource references another resource by id:

```
{
	name: '...',
	brand: '...',
	parts_ids: [1,2]
}
```

2. The api resource contanis another resource as an inline property and does not provide the same object as a nested url:

```
{
	name: '...',
	brand: '...',
	parts: [
		{ id: 1, user: 'handlebar' },
		{ id: 2, user: 'wheel' }
	]
}
```

When retrieved, the referenced instances will not be bound to the host's scope.

Let's say you have the following 'Part' definition:

```javascript
module.factory('Part', function() {
	return restmod.model('/parts');
});
```

That relates to a 'Bike' through a *belongsToMany* relation this time:

```javascript
Bike = restmod.model('/bikes', {
	parts: { belongsToMany: 'Part', keys: 'part_keys' } // default key would be 'parts_ids'
});
```

Also you have the following bike resource:

```
GET /bikes/1

{
	id: 1,
	brand: 'Transition',
	parts_keys: [1, 2]
}
```

Then retrieving the resource:

```javascript
bike = Bike.$find(1);
```

Will produce a `bike` object with the `parts` property containing two **Part** objects with $pks set to 1 and 2 (but empty).


This relation also support the childs object data to come inlined in the hosts object data.
The inline property name can be optionally selected using the `map` attribute.

Given the same **Bike** model as before, lets suppose now that the bike API resource looks like this:

And suppose that the last bike resource looks like:

```
GET /bikes/1

{
	id: 1,
	brand: 'Transition',
	parts: [
		{ id: 1, user: 'handlebar' },
		{ id: 2, user: 'wheel' }
	]
}
```

Then retrieving the bike resource:

```javascript
var bike = Bike.$find(1);
```

Will produce a `bike` object with the `parts` property containing two populated **Part** objects with $pks set to 1 and 2.

Whenever the host object is saved, the references primary keys will be sent in the request using the selected key.

So given the previous model definition, doing:

```javascript
var bike = Bike.$create({ parts: [Part.$find(1), Part.$find(2)] });
```

Will generate the following request:

```
POST /bikes

{
	parts_keys: [1, 2] // remember we changed the keys property name before!
}
```

<!-- ignore -->

## Serialization, masking and default values.

When you communicate with an API, some attribute types require special treatment (like a date, for instance)

### Decode

You can specify a way of decoding an attribute when it arrives from the server.

Let's say you have defined a filter like this:

```javascript
Angular.factory('DateParseFilter', function() {
	return function(_value) {
		date = new Date();
		date.setTime(Date.parse(_value));
		return date;
	}
})
```

then you use it as a standard decoder like this:

```javascript
var Bike = restmod.model('/bikes', {
	createdAt: {decode:'date_parse'}
});
```

### Encode

 To specify a way of encoding an attribute before you send it back to the server:
Just as with the previous example (decode), you use an Angular Filter. In this example we use the built in 'date' filter.

```javascript
var Bike = restmod.model('/bikes', {
	createdAt: {encode:'date', param:'yyyy-MM-dd'}
});
```

On both **encode** and **decode** you can use an inline function instead of the filter's name. It is also possible to bundle an encoder and decoder together using a Serializer object, check the [API Reference](http://platanus.github.io/angular-restmod) for more.

### Attribute masking

Following the Angular conventions, attributes that start with a '$' symbol are considered private and never sent to the server. Furthermore, you can define a mask that allows you to specify a more advanced behaviour for other attributes:

```javascript
var Bike = restmod.model('/bikes', {
	createdAt: {mask:'CU'}, // won't send this attribute on Create or Update
	viewCount: {mask:'R'}, // won't load this attribute on Read (fetch)
	opened: {mask:true}, // will ignore this attribute in relation to the API
});
```

### Default value

You can define default values for your attributes, both static and dynamic. Dynamic defaults are defined using a function that will be called on record creation.

```javascript
var Bike = restmod.model('/bikes', {
	wheels: { init: 2 }, // every new bike will have 2 wheels by default
	createdAt: { init: function() {
	 return new Date();
	}}
});
```

### Explicit attribute mapping

You can explicitly tell restmod to map a given server attribute to one of the model's attributs:

```javascript
var Bike = restmod.model('/bikes', {
	created: { map: 'stats.created_at' }
});
```

## Custom methods

You can add a custom instance method to a Model

```javascript
var Bike = restmod.model('/bikes', {
	pedal: function() {
	 this.strokes += 1;
	}
});
```

You can also add a class method to the Model type

```javascript
var Bike = restmod.model('/bikes', {
	'@searchByBrand': function(_brand) {
	 return this.$search({ brand: _brand });
	}
});
```

Methods added to the class are available to the Model's collections.

```javascript
var xc_bikes = Bike.$search({category:'xc'}); //$search returns a collection
xc_treks = xc_bikes.searchByBrand('Trek');
```


## Hooks (callbacks)

Just like you do with ActiveRecord, you can add triggers on certain steps of the object lifecycle

```javascript
var Bike = restmod.model('/bikes', {
	'~beforeSave': function() {
		this.partCount = this.parts.length;
	}
});

```
Note that a hook can be defined for a type, a collection or a record. Also, hooks can also be defined for a given execution context using $decorate. Check the [hooks advanced documentation](https://github.com/platanus/angular-restmod/blob/master/docs/guides/hooks.md).

# Mixins

To ease up the definition of models, and keep thing DRY, Restmod provides you with mixin capabilities. For example, say you already defined a Vehicle model as a factory:

```javascript
Angular.factory('Vehicle', function() {
	return restmod.model('/vehicle', {
	createdAt: {encode:'date', param:'yyyy-MM-dd'}
	});
})
```

You can then define your Bike model that inherits from the Vehicle model, and also sets additional functionality.

```javascript
var Bike = restmod.model('/bikes', 'Vehicle', {
	pedal: function (){
		alert('pedaling')
	}
});

```

<!-- end -->

Some links:

REST api designs guidelines: https://github.com/interagent/http-api-design
REST json api standard: http://jsonapi.org
