---
icon: IbDocument
---
#PHP #Blog #JSON #Data/Transformation 

​![[Populate from JSON using the  Compose Object Properties function  of Div PHP Template Engine.png]]

Let's kick off with a simple yet powerful use case of the `cop` function within [Div PHP Template Engine](https://divengine.org/documentation/div-php-template-engine/div-php-template-engine.html), part of [[Divengine Open Source Ecosystem]]. Consider a straightforward scenario where you have two PHP arrays, and you want to effortlessly copy data from one to another.

**Example:** Suppose we have two arrays representing user data:

```php
<?php

// Source array

$sourceData = [
  'id' => 1, 
  'name' => 
  'John Doe',
  'email' => 'john.doe@example.com'
];

// Destination array with default values

$destinationData = [ 
  'id' => 0, 
  'name' => '', 
  'email' => ''
];
```

Now, let's use the `cop` function to copy data from the source array to the destination array:

```php
use divengine\div;

include "vendor/autoload.php";

// Using cop to copy data

div::cop($destinationData, $sourceData);

// Output the updated destination array

var_dump($destinationData);
```

In this example, `cop` effortlessly copies data from the source array to the destination array, ensuring that the destination array now reflects the values from the source array.

Now, let's take it a step further and explore how `cop` seamlessly handles data from different sources, including JSON.

JSON (JavaScript Object Notation) is just one way to store and transport data. Div PHP Template Engine simplifies the process of loading data from JSON using either PHP's built-in functions or the static method `div::jsonDecode()`.

Suppose we have a JSON payload. Now, let's load this JSON data into a PHP array using `div::jsonDecode()` and then use `cop` to update our destination array:

```php
// JSON payload

$jsonPayload = '{ "id": 2, "name": "Jane Doe", "email": "jane.doe@example.com" }';

// Loading JSON data into a PHP array

$jsonData = div::jsonDecode($jsonPayload, true);

// Using cop to update the destination array

div::cop($destinationData, $jsonData);

// Output the updated destination array

var_dump($destinationData);
```

This showcases the versatility of `cop` in seamlessly handling data from various sources, making data composition a breeze within Div PHP Template Engine.

Now look at the following complex example:

```php
<?php

class Geo
{
    public float $lat;
    public float $lng;
}

class Address
{
    public string $street;
    public string $suite;
    public string $city;
    public string $zipcode;

    public Geo $geo;
}

class User
{
    public int $id;
    public string $name;
    public string $username;

    /** @var array<Address> */
    public array $addresses;
}

$rawJson = '{
	"id": 1,
	"name": "John Doe",
	"username": "johndoe",
	"addresses": [
		{
			"street": "Kulas Light",
			"suite": "Apt. 556",
			"city": "Gwenborough",
			"zipcode": "92998-3874",
			"geo": {
				"lat": -37.3159,
				"lng": 81.1496
			}
		},
		{
			"street": "Sunset Boulevard",
			"suite": "Apt. 123",
			"city": "Los Angeles",
			"zipcode": "90210",
			"geo": {
				"lat": 34.0522,
				"lng": -118.2437
			}
		}
	]
}';

$u = new User;
$jsonObject = json_decode($rawJson);
div::cop($u, $jsonObject, strict: false);
print_r($u);
```

As you can see, the cop function was responsible for recognizing the classes, arrays and other elements and placing each data in its place.

```
User Object
(
    [id] => 1
    [name] => John Doe
    [username] => johndoe
    [addresses] => Array
        (
            [0] => Address Object
                (
                    [street] => Kulas Light
                    [suite] => Apt. 556
                    [city] => Gwenborough
                    [zipcode] => 92998-3874
                    [geo] => Geo Object
                        (
                            [lat] => -37.3159
                            [lng] => 81.1496
                        )

                )

            [1] => Address Object
                (
                    [street] => Sunset Boulevard
                    [suite] => Apt. 123
                    [city] => Los Angeles
                    [zipcode] => 90210
                    [geo] => Geo Object
                        (
                            [lat] => 34.0522
                            [lng] => -118.2437
                        )

                )

        )

)
```



​