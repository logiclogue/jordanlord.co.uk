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
struct Rectangle {
    int width;
    int height;
}

// Instantiation
Rectangle rect;

rect.width = 4;
rect.height = 2;
```

As you can see, this behaves very similar to an object in other object-oriented
programming languages, such as Java. However, there are a few problems. We a so
called "constructor" function that will assign default values for us.

## Constructors and Destructors

## Methods

## Inheritance

## Polymorphism

## Dependency Inversion

## Conclusion

Lots of boiler plate required.
