---
title: Object-oriented Programming in C
draft
---

Implementing object-oriented programming in C is a fantastic way to understand
how object-oriented code works at the low level. Of course C++ exists to solve
this very problem. However, C++ has its own problems. Top programming, [such as
Linus Torvalds](http://harmful.cat-v.org/software/c++/linus), have spoken out
about how C++ is a "horrible language". It's easy to fall into the argument of
whether C++ is an incredibly powerful programming language, or whether it leads
to bad code. Quite frankly, I'm not qualified to say. The whole point of this
article is to demonstrate object-orientated programming in C. So we will avoid
the flame wars, for now.

## Objects

Objects are the key data structure in object-oriented programming. C has the
`struct` data type to create, what basically are, objects.

Here is an example:

```
// Declaration
typedef struct RectangleTag Rectangle;

struct RectangleTag {
    int width;
    int height;
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
Rectangle *Rectangle_new(int width, int height)
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
implement.

To do this, our function's first parameter will take a pointer to its object.
Below is a sample method for calculating the `Rectangle`'s area.

```
int Rectangle_get_area(Rectangle *self)
{
    return self->width * self->height;
}
```

This is used as below. The `area` variable should be equal to `4`.

```
Rectangle *rect = Rectangle_new(2, 2);

int area = Rectangle_get_area(rect);
```

Just for reference, here is an example of a method for calculating the
perimeter.

```
int Rectangle_get_perimeter(Rectangle *self)
{
    return (self->width * 2) + (self->height * 2);
}
```

There are a few issues with this. The main issue is it is not polymorphic. We
don't have a method that can be called for all shapes to calculate that shape's
area. On another shape, the `width` and `height` properties may not exist; the
method would fall over when it was called with a `Shape`.

## Dynamic Methods

There are a few issues with our previous method of implementing methods. There
is no method dispatching. No way to decide what method to call depending on the
type of object. We have to do that manually. However, polymorphism is achievable
in C. We must use function pointers on the `struct`s themselves.

Let's redeclare our `Rectangle` `struct` to have the methods declared on the
`struct` itself:

```
struct RectangleTag {
    int width;
    int height;

    int (*get_width)(Rectange *self);
    int (*get_perimeter)(Rectange *self);
};
```

Then the `Rectangle` constructor has to be updated to assign the `*get_width`
and `*get_perimeter` function pointers to the static functions that were defined
earlier.

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

int area = rect->get_area(rect);
```

In this example, `rect->get_area(rect)` would return `4`.

## Inheritance

In C, it's pretty simple to do object composition where once object is
referenced from inside of another. But how to do we do `struct`-based
inheritance? There isn't a built in way to do it in C.

Let's say we want to have a `Cube` `struct` that extends the `Rectangle`
`struct`, adding the `depth` property. It's not possible to do that with
structs. We could do this:

```
struct Rectangle {
    int width;
    int height;
}

struct Cube {
    int width;
    int height;
    int depth;
}
```

However, it's not a good idea to copy to properties over. In addition, you can't
tell that `Cube` is actually inheriting from `Rectangle`.

We are going to solve this problem with macros. Consider this example:

```
#define RECTANGLE_PROPS\
    int width;\
    int height;

struct Rectangle {
    RECTANGLE_PROPS
}

#define CUBE_PROPS\
    RECTANGLE_PROPS\
    int depth;

struct Cube {
    CUBE_PROPS
}
```

Here `Cube` is inheriting from `Rectangle` using macros and adding the `depth`
property. Although it's a little messy, it's clear that `Cube` is inheriting
from `Rectangle`. All that needs to be done is constructors for each method.

Sometimes you want to call the parent "class"' constructor. This is done with
the `super` method in Java. However, in C, if we call the `Rectangle_new`
function to create a new `Cube`. It's going to only allocate enough memory for
the `Rectangle`. The `depth` property won't be allocated. This can cause a
segmentation fault. I like to solve this problem by creating an `apply` method.
This behaves like a constructor but doesn't allocate any memory. It just takes a
pointer to the object and assigns its properties appropriately. In fact, the
constructor will call its respective `apply` method.

```
void Rectangle_apply(Rectangle *self, int width, int height)
{
    self->width = width;
    self->height = height;
}

Rectangle *Rectangle_new(int width, int height)
{
    Rectangle *self = malloc(sizeof(Rectangle));

    Rectangle_apply(self);

    return self;
}

void Cube_apply(Cube *self, int width, int height, int depth)
{
    Rectangle_apply(self, width, height);

    self->depth = depth;
}

Cube *Cube_new(int width, int height, int depth)
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
    int (*get_area)(self_t *self);\
    int (*get_perimeter)(self_t *self);

struct Shape {
    SHAPE_PROPS(Shape)
}
```

As you can see, the `Shape` has the `get_area` and `get_perimeter` methods. But
it doesn't actually implement, like we would do with a constructor. It's
important that the macro used for an interface is a macro function. This way,
the type can be passed into the function. This allows for inheritance of
methods.

Now let's create a `Rectangle` which is going to inherit from this `Shape`
"interface".

```
#define RECTANGLE_PROPS(self_t)\
    SHAPE_PROPS(self_t)\
    int width;\
    int height;

struct Rectangle {
    RECTANGLE_PROPS(Rectangle)
}
```

Then the `Rectangle` constructor must be created, as demonstrated earlier.

```
void Rectangle_apply(Rectangle *self, int width, int height)
{
    self->get_area = Rectangle_get_area;
    self->get_perimeter = Rectangle_get_perimeter;

    self->width = width;
    self->height = height;
}

Rectangle *Rectangle_new(int width, int height)
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
    int radius;

struct Circle {
    CIRCLE_PROPS(Circle)
}
```

Then the circle's `get_area` and `get_permieter` methods.

```
#include <math.h>

int Circle_get_area(Circle *self)
{
    return M_PI * pow(self->radius, 2);
}

int Circle_get_perimeter(Circle *self)
{
    int diameter = self->radius * 2;

    return M_PI * diameter;
}
```

And finally the constructor:

```
void Circle_apply(Circle *self, int width, int height)
{
    self->get_area = Circle_get_area;
    self->get_perimeter = Circle_get_perimeter;

    self->width = width;
    self->height = height;
}

Circle *Circle_new(int width, int height)
{
    Circle *self = malloc(sizeof(Circle));

    Circle_apply(self);

    return self;
}
```

Now I want to create a method which prints the area of any `Shape` to the
console. Thanks to polymorphism and inheritance, this is easy.

```
void print_area(Shape *shape)
{
    int area = shape->get_area(shape);

    printf("Area: %f\n", area);
}
```

This method can be called with any type that implements the `Shape` interface.
This is the power of polymorphism. Now let's actually call `print_area`. Make
sure to cast you're types, otherwise the compiler will warn you.

```
Rectangle *rect = Rectangle_new(2, 2);
Circle *circle = Circle_new(3);

print_area((void *)rect); // Prints "Area: 4.000000"
print_area((void *)circle); // Prints "Area: 28.274334"
```

Dynamic dispatching in action, in C! What more could anyone want?

## Dependency Inversion

## Conclusion

Lots of boiler plate required.
