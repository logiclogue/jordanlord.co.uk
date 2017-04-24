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
Rectangle *Rectangle_new(void)
{
    // Allocate memory to object
    Rectangle *self = malloc(sizeof(Rectangle));

    // Default parameters
    self->width = 2;
    self->height = 2;

    // Return pointer to object
    return self;
}
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

```
int Rectangle_get_area(Rectangle *self)
{
    return self->width * self->height;
}

int Rectangle_get_perimeter(Rectangle *self)
{
    return (self->width * 2) + (self->height * 2);
}
```

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

## Inheritance

```
// Shape.h

#define SHAPE_PROPS(self_t)\
    int (*get_area)(self_t *self);\
    int (*get_perimeter)(self_t *self);

struct Shape {
    SHAPE_PROPS(Shape)
}

// Rectangle.h

#define RECTANGLE_PROPS(self_t)\
    SHAPE_PROPS(self_t)\
    int width;\
    int height;

struct Rectangle {
    RECTANGLE_PROPS(Rectangle)
}
```

## Polymorphism

## Dependency Inversion

## Conclusion

Lots of boiler plate required.
