---
title: Object-oriented Programming in C
draft
---

Implementing object-orientation in C is a fantastic way to understand how
object-oriented code works at the low level. Of course C++ exists to solve this
very problem. However, C++ arguably has its own problems. Top programmers, [such
as Linus Torvalds](http://harmful.cat-v.org/software/c++/linus), have spoken out
about how C++ is a "horrible language". It's easy to fall into the argument of
whether C++ is an incredibly powerful programming language, or whether it leads
to bad code. Quite frankly, I'm not qualified to say. The whole point of this
article is to demonstrate object-orientation in C. So we will avoid the flame
wars, for now.

## Objects

Objects are the key data structure in object-oriented programming. C has the
`struct` data type to create, what basically are, objects.

Here is an example:

```
// Declaration
typedef struct RectangleTag Rectangle;

struct RectangleTag {
    float width;
    float height;
};

// Instantiation
Rectangle rect;

rect.width = 4;
rect.height = 2;
```

As you can see, this behaves very similar to an object in other object-oriented
programming languages, such as Java. Let's just call it an object, for ease of
understanding. However, there are a few problems. For it to be object-oriented,
we'll need methods that are assigned to the object. Let's start by creating a
"constructor" function.

## Constructors and Destructors

A constructor is a type of function that is specifically used to create an
object. In Java and many other object-oriented programming languages, you invoke
the constructor with the `new` keyword. In the previous example, we created an
object that was allocated to the stack. This isn't helpful. The details aren't
important as to why, for now. Instead we are going to allocate the object on the
heap. Then a pointer to that object will be returned from the constructor
function. The C standard library has a function for allocating memory on the
heap; it's called `malloc`.

Here is an example of a constructor function for `Rectangle`:

```
#include <stdlib.h>

// Constructor
Rectangle *Rectangle_new(float width, float height)
{
    // Allocate memory to object
    Rectangle *self = malloc(sizeof(Rectangle));

    // Default parameters
    self->width = width;
    self->height = height;

    // Return pointer to object
    return self;
}
```

Creating an instance of `Rectangle` using the constructor function:

```
Rectangle *rect = Rectangle_new(2, 2);
```

When you're allocating memory on the heap, it isn't deallocated when you go out
of function scope, like it does for objects allocated on the stack. Therefore, a
"destructor" function has to be created, in order to deallocate the object. The
C standard library has a function for cleaning up memory allocated on the heap;
it's called `free`. As shown below:

```
#include <stdlib.h>

// Destructor
void Rectangle_destroy(Rectangle *self)
{
    // Free the memory
    free(self);
}
```

Although it may seem pointless to have a destructor function if `free` is just
going to be called, it is important to have a destructor function because
objects may need to clear up more objects that are on that object, if that makes
sense?

## Methods

Methods are very important to object-oriented programming. In Java and many
other object-oriented languages, methods associated with an object reference the
object with the `this` keyword. In C++, the object's properties are all in the
method's scope. In C, we are going to take the Java approach as it is easiest to
implement. A slight tweak: we'll use `self` instead of `this`, since `this` is a
reserved keyword in C++, which may harm cross compatibility.

To do this, our function's first parameter will take a pointer to its object.
Below is a sample method for calculating the `Rectangle`'s area.

```
float Rectangle_get_area(Rectangle *self)
{
    return self->width * self->height;
}
```

This is used as below. The `area` variable should be equal to `4`.

```
Rectangle *rect = Rectangle_new(2, 2);

float area = Rectangle_get_area(rect);
```

Just for reference, here is an example of a method for calculating the
perimeter.

```
float Rectangle_get_perimeter(Rectangle *self)
{
    return (self->width * 2) + (self->height * 2);
}
```

There are a few issues with this. The main issue is it is not polymorphic. We
don't have a method that can be called for all `Shape`s to calculate that
`Shape`'s area. On another `Shape`, the `width` and `height` properties may not
exist; the method would fall over when it was called with a `Shape`.

## Dynamic Methods

There are a few issues with our previous method of implementing methods. There
is no method dispatching. No way to decide what method to call depending on the
type of object. We have to do that manually. However, polymorphism is achievable
in C. We must use function pointers on the `struct`s themselves.

Let's redeclare our `Rectangle` `struct` to have the methods declared on the
`struct` itself:

```
typedef struct RectangleTag Rectangle;

struct RectangleTag {
    float width;
    float height;

    float (*get_width)(Rectange *self);
    float (*get_perimeter)(Rectange *self);
};
```

Then the `Rectangle` constructor has to be updated to assign the static function
(defined earlier) to the `*get_width` and `*get_perimeter` function pointers.

```
// Constructor
Rectangle *Rectangle_new(void)
{
    // Allocate memory
    Rectangle *self = malloc(sizeof(Rectangle));

    // Default parameters
    self->width = 2;
    self->height = 2;

    // Methods
    self->get_width = Rectange_get_width;
    self->get_perimeter = Rectange_get_perimeter;

    return self;
}
```

Now the methods can be called dynamically from the object itself.

```
Rectangle *rect = Rectangle_new(2, 2);

float area = rect->get_area(rect);
```

In this example, `rect->get_area(rect)` would return `4`.

## Inheritance

In C, it's pretty simple to do object composition, where one object is
referenced from inside of another. But how to do we do `struct`-based
inheritance? There isn't a built in way to do it in C.

Let's say we want to have a `Cube` `struct` that extends the `Rectangle`
`struct`, adding the `depth` property. It's not possible to do that with
`struct`s. We could do this:

```
typedef struct RectangleTag Rectangle;

struct RectangleTag {
    float width;
    float height;
};

typedef struct CubeTag Cube;

struct CubeTag {
    float width;
    float height;
    float depth;
};
```

However, it's not a good idea to copy to properties over. In addition, you can't
tell that `Cube` is actually inheriting from `Rectangle`.

We are going to solve this problem with macros. Consider this example:

```
#define RECTANGLE_PROPS\
    float width;\
    float height;

typedef struct RectangleTag Rectangle;

struct RectangleTag {
    RECTANGLE_PROPS
};

#define CUBE_PROPS\
    RECTANGLE_PROPS\
    float depth;

typedef struct CubeTag Cube;

struct CubeTag {
    CUBE_PROPS
};
```

Here `Cube` is inheriting from `Rectangle` using macros and adding the `depth`
property. Although it's a little messy, it's clear that `Cube` is inheriting
from `Rectangle`. All that needs to be created is constructors for each
`struct`.

Sometimes you want to call the parent `struct`'s constructor. This is done with
the `super` method in Java. However, in C, if we call the `Rectangle_new`
function to create a new `Cube`. It's going to only allocate enough memory for
the `Rectangle`. The `depth` property won't be allocated. This can cause a
segmentation fault. I like to solve this problem by creating an `apply` method.
This behaves like a constructor but doesn't allocate any memory. It just takes a
pointer to the object and assigns its properties appropriately. In fact, the
constructor will call its respective `apply` method.

```
void Rectangle_apply(Rectangle *self, float width, float height)
{
    self->width = width;
    self->height = height;
}

Rectangle *Rectangle_new(float width, float height)
{
    Rectangle *self = malloc(sizeof(Rectangle));

    Rectangle_apply(self);

    return self;
}

void Cube_apply(Cube *self, float width, float height, float depth)
{
    Rectangle_apply((void *)self, width, height);

    self->depth = depth;
}

Cube *Cube_new(float width, float height, float depth)
{
    Cube *self = malloc(sizeof(Cube));

    Cube_apply(self, width, height, depth);

    return self;
}
```

Yes, the function pointers could have been added onto the `Rectangle` and `Cube`
`struct`s. However, the power of that, and proper implementation, you are about
to be shown.

## Polymorphism

Polymorphism is a massive aspect of object-oriented programming. It is possible
to use polymorphism in C, even though inheritance isn't natively supported. It's
achieved by having `struct`s with the same memory layout and using casts to cast
a child `struct` to its parent `struct`.

Let's implement an "abstract class" or "interface", as they're called in other
languages. An "interface" is a type of class that isn't implemented by itself,
but rather by its child classes. In C, interfaces can be thought of as a
template for all child `struct`s to conform to.

A good example of this, using the previous example of `Rectangle`, is to create
a `Shape` which is going to behave as our interface.

```
#define SHAPE_PROPS(self_t)\
    float (*get_area)(self_t *self);\
    float (*get_perimeter)(self_t *self);

typedef struct ShapeTag Shape;

struct ShapeTag {
    SHAPE_PROPS(Shape)
};
```

As you can see, the `Shape` has the `get_area` and `get_perimeter` methods. But
it doesn't actually implement, like we would do with a constructor. It's
important that the macro used for an interface is a macro function. This way,
the type can be passed into the function. Allowing for inheritance of methods.

Now let's create a `Rectangle` which is going to inherit from this `Shape`
"interface".

```
#define RECTANGLE_PROPS(self_t)\
    SHAPE_PROPS(self_t)\
    float width;\
    float height;

typedef struct RectangleTag Rectangle;

struct RectangleTag {
    RECTANGLE_PROPS(Rectangle)
};
```

Then the `Rectangle` constructor must be created, as demonstrated earlier.

```
void Rectangle_apply(Rectangle *self, float width, float height)
{
    self->get_area = Rectangle_get_area;
    self->get_perimeter = Rectangle_get_perimeter;

    self->width = width;
    self->height = height;
}

Rectangle *Rectangle_new(float width, float height)
{
    Rectangle *self = malloc(sizeof(Rectangle));

    Rectangle_apply(self);

    return self;
}
```

For demonstration purposes, we're going to create a `Circle` which will also
conform to the `Shape` interface.

```
#define CIRCLE_PROPS(self_t)\
    SHAPE_PROPS(self_t)\
    float radius;

typedef struct CircleTag Circle;

struct CircleTag {
    CIRCLE_PROPS(Circle)
};
```

Then the circle's `get_area` and `get_permieter` methods.

```
#include <math.h>

float Circle_get_area(Circle *self)
{
    return M_PI * pow(self->radius, 2);
}

float Circle_get_perimeter(Circle *self)
{
    float diameter = self->radius * 2;

    return M_PI * diameter;
}
```

And finally the constructor:

```
void Circle_apply(Circle *self, float width, float height)
{
    self->get_area = Circle_get_area;
    self->get_perimeter = Circle_get_perimeter;

    self->width = width;
    self->height = height;
}

Circle *Circle_new(float width, float height)
{
    Circle *self = malloc(sizeof(Circle));

    Circle_apply(self);

    return self;
}
```

Now let's create a method which prints the area of any `Shape` to the console.
Thanks to polymorphism and inheritance, this is easy.

```
void print_area(Shape *shape)
{
    float area = shape->get_area(shape);

    printf("Area: %f\n", area);
}
```

This method can be called with any type that implements the `Shape` interface.
This is the power of polymorphism. Now let's actually call `print_area`. Make
sure to cast your types, otherwise the compiler will warn you.

```
Rectangle *rect = Rectangle_new(2, 2);
Circle *circle = Circle_new(3);

print_area((void *)rect); // Prints "Area: 4.000000"
print_area((void *)circle); // Prints "Area: 28.274334"
```

Dynamic dispatching in action, in C! What more could anyone want?

## Dependency Injection

Dependency injection is key to decoupling. Test driven development normally
isn't easy in C, with everything depending on concretions. However, using the
techniques we have just learnt, it's very easy.

Let's say we had an interface which specified a canvas for a game. It's job is
to draw players. It's most likely not practical, but good for demonstration
purposes.

```
#define CANVAS_PROPS(self_t)\
    void clear_screen(self_t *self);\
    void draw_player(self_t *self, Player *player);\
    void clear_player(self_t *self, Player *player);\
    void update_score(self_t *self, Score *score);

typedef struct CanvasTag Canvas;

struct CanvasTag {
    CANVAS_PROPS(Canvas)
};
```

Now this canvas can be implemented however we want. We could implement it to
draw the game like [NetHack](https://en.wikipedia.org/wiki/NetHack) does. Or
perhaps draw it in 3D, as long as we're using the correct library.

We've got our `Game` `struct`. Let's inject `Canvas` into the constructor
of `Game`.

```
#define GAME_PROPS(self_t)\
    Canvas *canvas;\
    // Other methods and properties can go here

typedef struct GameTag Game;

struct GameTag {
    GAME_PROPS(Game)
};

void Game_apply(Game *self, Canvas *canvas)
{
    self->canvas = canvas;
    // Assign other properties and methods here
}

// Constructor
Game *Game_new(Canvas *canvas)
{
    Game *self = malloc(sizeof(Game));

    Game_apply(self, canvas);

    return self;
}
```

In any `Game` method, `self->canvas->method_name(...)` can be called. Yet, it
doesn't matter how `Canvas` is implemented, as long as we pass a `Canvas`
derived object that does implement `Canvas`. It doesn't affect our code in
`Game`. It also makes `Game` much easier to unit test. This is because mocked
objects of `Canvas`, instead of proper implementations, can be injected into
`Game`. That is beyond the scope of this article.

## Classes

Time for a more complete example.

You may have thought earlier, with regards to the destroy method, that it could
be attached to each object. This is an interesting idea. It would mean that all
`struct`s, that are meant to be classes, should derive from an interface stating
the destroy method. The beauty of this pattern is that you can modify it however
you want. We could even create a `clone` method which clones the object! Let's
do that.

```
// Class.h
#define CLASS_PROPS(self_t)\
    void (*destroy)(self_t *self);
    self_t *(*clone)(self_t *self);

typedef struct ClassTag Class;

struct ClassTag {
    CLASS_PROPS(Class)
};
```

That way all of our classes can inherit. They must implement destroy. I'm going
to show the `Rectangle` example from earlier. First we'll have to redeclare
`Shape`. But this time, we are going to state that `Shape` has coordinates. So
it will have a property for `Coords`.

```
// Shape.h
#define SHAPE_PROPS(self_t)\
    CLASS_PROPS(self_t)\
    Coords *coords;\
    float (*get_area)(self_t *self);\
    float (*get_perimeter)(self_t *self);

typedef struct ShapeTag Shape;

struct ShapeTag {
    SHAPE_PROPS(Shape)
};
```

Then redeclare `Rectangle`.

```
// Rectangle.h
#define RECTANGLE_PROPS(self_t)\
    SHAPE_PROPS(self_t)\
    float width;\
    float height;

typedef struct RectangleTag Rectangle;

struct RectangleTag {
    RECTANGLE_PROPS(Rectangle)
};

Rectangle *Rectangle_new(Coords *coords, float width, float height);
void Rectangle_apply(
    Rectangle *self, Coords *coords, float width, float height);
void Rectangle_destroy(Rectangle *self);
Rectangle *Rectangle_clone(Rectangle *self);
float Rectangle_get_area(Rectangle *self);
float Rectangle_get_perimeter(Rectangle *self);
```

Finally reimplement `Rectangle`.

```
// Rectangle.c
#include <stdlib.h>
#include "Class.h"
#include "Shape.h"
#include "Rectangle.h"

Rectangle *Rectangle_new(Coords *coords, float width, float height)
{
    Rectangle *self = malloc(sizeof(Rectangle));

    Rectangle_apply(self, coords, width, height);

    return self;
}

void Rectangle_apply(Rectangle *self, Coords *coords, float width, float height)
{
    self->width = width;
    self->height = height;
    self->coords = coords;

    self->get_area = Rectangle_get_area;
    self->get_perimeter = Rectangle_get_perimeter;
    self->destroy = Rectangle_destroy;
    self-> = Rectangle_destroy;
}

void Rectangle_destroy(Rectangle *self)
{
    self->coords->destroy(self->coords);

    free(self);
}

Rectangle *Rectangle_clone(Rectangle *self)
{
    Rectangle *clone = malloc(sizeof(Rectangle));

    Coords *coords_clone = self->coords->clone(self->coords);

    return Rectangle_new(coords_clone, self->width, self->height);
}

// Definition of `Rectangle_get_area` and `Rectangle_get_perimeter` here
```

Then creating an instance of `Rectangle` and destroying it, you know it's going
to work. It's pretty self explanatory how `Coords` would work, so I'm not going
to go into the implementation of it.

```
// main.c
#include "Rectangle.h"
#include "Coords.h"

int main()
{
    Coords *coords = Coords_new(15, 10);
    Rectangle *rect = Rectangle_new(coords, 2, 2);

    float area = rect->get_area(rect);

    printf("%f\n", area); // Will print 4

    rect->destroy(rect); // Will call `coords->destroy`

    return 0;
}
```

## Conclusion

It's a fantastic exercise implementing object-orientation in C. It better helps
you understand polymorphism with regards to memory management. It better helps
you understand destructors. It better helps you understand constructors. It also
better helps you understand where the `this` object comes from. With C being low
level, it shows how object-oriented code works at the low level.

There are many drawbacks to this style though. For one, it takes a lot of boiler
plate, just to create a simple class. In addition, C++ has all of these
features, and more, with "nice", or rather quick, easily written syntax. Maybe
this is one of the issues with C++ the fact that it has too much.

I have written this [`connect-four`
program](https://github.com/logiclogue/connect-four), which is a simple
command-line program using the principles stated in this article. It also is
totally developed using test-driven development. That's something that this
paradigm allows.

Anyway, I'd like to think that implementing object-oriented programming, in C
even if it isn't that practical, is a great way to get a better understanding of
object-oriented code. It certainly was the case for me.
