---
title: 6502 vs ZX Spectrum - A Graphics Experiment You Didn’t Expect
publishDate: 2025-02-03
---

# Introduction

Okay so this might seem like a bit of a strange article. But trust me. I've had
this burning idea recently to combine retro computer components to create
something a bit different. In this case, it's an emulation of a ZX Spectrum
display wired up with a 6502 processor. What makes this strange is that the ZX
Spectrum uses a Z80 processor, not a 6502. This will be part of a series of
articles where I'll combine retro and modern technology together in weird and
wonderful ways to create experiments. There is a lot of support for the 6502
processor thanks to the worldwide popularity of systems like the Commodore 64
and the Nintendo Entertainment System.

There is something special about the ZX Spectrum. It was released in the UK in
1983 for £125, taking the domestic home computer market by storm. It almost
instantly took off as a kind of *game console of its day*, birthing the likes
Manic Miner, Knight Lore and Atic Atac. Being an incredibly cheap machine of its
day, a lot of corners were cut. One corner most notable was its graphics
capability.

The graphics of the ZX Spectrum consist of a 256x192 bitmapped screen, with
8x8 pixel attribute blocks. Now, the most striking thing here is that each
attribute blocks could only have two colours. Those attribute blocks were fixed
to a grid. This was unlike other machines at the time, which had support for
more than two colours and even native sprites. In a way, it was like the ZX
Spectrum was actually monochrome, with a sprinkle of colour added to its
monochromatic display to give the illusion of colour. The result - a breadth of
games that had an unusual, unpolished, but undoubtedly unique ZX Spectrum
look to it.

# How does it work?

The display itself is memory mapped into two main sections. The pixel data is
written from addresses 0x4000 to 0x57FF. The attribute data written from 0x5800
to 0x5AFF. This meant that the pixel data has 6144 bytes, while each byte of the
attribute corresponded to its respective 8x8 block.

# Pixel Data

Let's look at the pixel data specifically for now. It's a 256 pixel width (32
columns), with 192 pixels height (24 rows). That is further broken down into 3
areas. Each area is 8 rows and 32 columns, conveniently totaling 2048 bytes
each. Something to note about areas, each line in the 8 rows are interleaved. So
if setting the first line of your block is done at address 0x4000, the second
line is set at 0x4100, the third at 0x4200.

For demonstration sake, let's set the first 256 bytes to 0xFF, from address
0x4000 to 0x40FF. This will show the interleaved nature of the areas.

<textarea class="hljs logiclogue-6502-asm" data-ram-id="example-1" style="width: 100%; height: 200px;">
init:
    ; Store the pixel address in zero page for indirect addressing
    LDA #$00
    STA $00
    LDA #$40
    STA $01
    ; Store the attribute address in zero page for indirect addressing
    LDA #$00
    STA $02
    LDA #$58
    STA $03
    ; Counter
    LDY #$00
loop:
    ; Set the pixel byte at address 0x4000 + Y
    LDA #$FF
    STA ($00),Y
    ; Set the attribute byte as green at 0x5400 + Y
    LDA #%00000100
    STA ($02),Y
    ; Ending the program
    INY
    CPY #$00
    BNE loop
    JMP loop
</textarea>

<canvas class="u-full-width logiclogue-zx-screen" data-ram-id="example-1" width="256" height="192" style="image-rendering: pixelated"></canvas>

# Attribute Data

The attribute data is what defines an 8x8 block's colour. The attribute block is
broken town into two components, the least significant 3-bits which are used for
storing the 'ink', the next least significant 3-bits for the 'paper'. Then the
7th most significant bit for whether the colours are bright or not. Finally the
most significant bit is for the 'flash'. The 'paper' dictates how the 0 bits are
coloured, the 'ink' dictates how the 1 bits are coloured.

| bit 8 | bit 7  | bit 6-4 | bit 3-1 |
|-------|--------|---------|---------|
| flash | bright | paper   | ink     |

The ZX Spectrum used a GRB colour scheme instead of a RGB one. Looking at each
3-bit colour, here is the table by bit breakdown.

| G | R | B | #n | Colour  |
|---|---|---|----|---------|
| 0 | 0 | 0 |  0 | Black   |
| 0 | 0 | 1 |  1 | Blue    |
| 0 | 1 | 0 |  2 | Red     |
| 0 | 1 | 1 |  3 | Magenta |
| 1 | 0 | 0 |  4 | Green   |
| 1 | 0 | 1 |  5 | Cyan    |
| 1 | 1 | 0 |  6 | Yellow  |
| 1 | 1 | 1 |  7 | White   |

The example below shows each block incremented one at a time. So the first
attribute block would be binary `%00000000` (black paper, black ink),
`%00000001` (black paper, blue ink) and so on.

<textarea class="hljs logiclogue-6502-asm" data-ram-id="example-2" style="width: 100%; height: 200px;">
init:
    JMP loop
set_attributes:
    LDA #$00
    STA $00
    LDA #$58
    STA $01
    LDY #$00
loop_set_attributes:
    TYA
    STA ($00),Y
    INY
    BNE loop_set_attributes
    RTS
draw_char:
    ; Load bitmap address into zero space
    LDA current_letter_pos
    STA $02
    LDA #$40
    STA $03
    ; Letter counter
    LDY #$00
    ; Load letter_a address into memory
    LDA #<letter_a
    STA $04
    LDA #>letter_a
    STA $05
draw_char_line:
    ; Load the byte line
    LDA ($04),Y
    ; Write byte line to bitmap
    LDX #$00
    STA ($02,X)
    ; Increment significant bit of address
    INC $03
    ; Increment counter
    INY
    ; Check to see whether counter has written all 8 lines
    CPY #$08
    BNE draw_char_line
    RTS
current_letter_pos:
    .byte $00
draw_letters:
    JSR draw_char
    INC current_letter_pos
    CMP current_letter_pos
    BNE draw_letters
    RTS
loop:
    JSR set_attributes
    JSR draw_letters
    LDA #$00
    STA $00
    LDA #$01
    STA $01
    JSR draw_char
    JMP loop
letter_a:
    ; Character 'A'
    .byte %00111100  ; Line 1:   00111100
    .byte %01100110  ; Line 2:   01100110
    .byte %01100110  ; Line 3:   01100110
    .byte %01111110  ; Line 4:   01111110
    .byte %01100110  ; Line 5:   01100110
    .byte %01100110  ; Line 6:   01100110
    .byte %01100110  ; Line 7:   01100110
    .byte %00000000  ; Line 8:   00000000
</textarea>

<canvas class="u-full-width logiclogue-zx-screen" data-ram-id="example-2" width="256" height="192" style="image-rendering: pixelated"></canvas>

# Useful functions

Let's try a more interesting example. Let's say we want to draw a pixel at the
mouse cursor. We're going to memory map the mouse X and Y positions relative to
the screen to addresses 0x3FFE and 0x3FFF respectively.

In order to draw the mouse position on the screen, we have to calculate a few
different things. We have to calculate the row, column, line and area that we'd
like to draw onto. As well as calculating the individual byte itself.

The row is calculated by taking the mouse y position, masking it against
`00111000` and bit-shifting twice to the left.

```
mouse_row:
    .byte $00
update_mouse_row:
    LDA mouse_record_y
    AND #%00111000
    ASL
    ASL
    STA mouse_row
    RTS
```

To get the column, we take the mouse x position and bit-shift right three times.
`abcdefgh` -> `000abcde`.

```
mouse_column:
    .byte $00
update_mouse_column:
    LDA mouse_record_x
    ROR
    CLC
    ROR
    CLC
    ROR
    STA mouse_column
    RTS
```

For the line, we're going to mask the first 3 bits. `abcdefgh` -> `00000fgh`.

```
mouse_line:
    .byte $00
update_mouse_line:
    LDA mouse_record_y
    AND #%00000111
    STA mouse_line
    RTS
```

To calculate the area, take the most significant 2 bits. In this example, we
just bit-shift three times to make it easier to calculate the final address
where we're going to draw to the screen.

```
mouse_area:
    .byte $00
update_mouse_area:
    LDA mouse_record_y
    AND #%11000000
    ROR
    ROR
    ROR
    STA mouse_area
    RTS
```

Having the row, column and area is only good enough to draw to a specific byte
on the screen. However, we also want to draw to a specific pixel. To achieve
this we have to bit-shift a single pixel right n number of times. We calculate n
by masking the least significant 3 bits from the mouse's x position.

```
mouse_byte:
    .byte %10000000
update_mouse_byte:
    LDA mouse_record_x
    AND #%00000111
    TAX
    INX
    SEC
    LDA #%00000000
loop_update_mouse_byte:
    ROR
    DEX
    BNE loop_update_mouse_byte
    STA mouse_byte
    RTS
```

Finally to draw, we have to calculate the address, then write the byte to that
address in memory in order to draw to the screen.  Fortunately, the address is
two bytes, so the calculation can be broken down into two separate ones.

Let's calculate the offsets. For the least significant byte of the offset we do
`column + row`, simple!

```
    LDA mouse_column
    ADC mouse_row
    STA draw_pixel_offset
```

For the most significant byte of the offset, we do `line + area`. Also simple!
Although, figuring this out by hand is usually quite tedious.

```
    LDA mouse_line
    ADC mouse_area
    STA draw_pixel_offset + 1
```

Then finally you just add the bitmap address (`0x4000`) to the offset to get the
bitmap address you're actually going to write to.

We're not going to stop there, we also want the attribute offset so that we can
write the background colour too. Fortunately, that's also relatively simple.
I'm going to leave the assembly below for demonstration. Basically, it involving
bit masking and bit-shifting to achieve the desired final address offset. the
assembly below makes it look a lot more complex than it actually is.

```
attribute_offset:
    .word $0000
update_attribute_offset_from_mouse:
    LDA mouse_record_x
    AND #%11111000
    ROR
    ROR
    ROR
    STA attribute_offset
    LDA mouse_record_y
    AND #%00111000
    ASL
    ASL
    ORA attribute_offset
    STA attribute_offset
    LDA mouse_record_y
    AND #%11000000
    ROR
    ROR
    ROR
    ROR
    ROR
    ROR
    STA attribute_offset + 1
    RTS
```

<textarea class="hljs logiclogue-6502-asm" data-ram-id="example-3" style="width: 100%; height: 200px;">
bitmap = $4000
attributes = $5800
last_attributes = $5B00
mouse_x = $3FFE
mouse_y = $3FFF
init:
    JSR set_attributes
    JMP loop
current_attribute_address:
    .word attributes
set_attributes:
    ; Store the attribute address in zp
    LDA current_attribute_address
    STA $00
    LDA current_attribute_address + 1
    STA $01
    LDX #$00
    LDA #%00000100
    STA ($00,X)
    ; +1 to the current address
    CLC
    LDA #$01
    ADC current_attribute_address
    STA current_attribute_address
    LDA #$00
    ADC current_attribute_address + 1
    STA current_attribute_address + 1
    ; Check whether the address is at the end
    CLC
    LDA $01
    CMP #>last_attributes
    BNE set_attributes
    RTS
draw_pixel_offset:
    .word $0000
update_pixel_offset:
    CLC
    LDA mouse_column
    ADC mouse_row
    STA draw_pixel_offset
    CLC
    LDA mouse_line
    ADC mouse_area
    STA draw_pixel_offset + 1
    ; Debug info
    ;LDA mouse_line
    ;STA bitmap + 0x100
    ;LDA mouse_record_y
    ;STA bitmap + 0x200
    ;LDA draw_pixel_offset
    ;STA bitmap + 0x300
    ;LDA draw_pixel_offset + 1
    ;STA bitmap + 0x400
    ;LDA draw_pixel_byte
    ;STA bitmap + 0x500
    RTS
draw_pixel_byte:
    .byte %11111111
update_pixel_byte:
    LDA mouse_byte
    STA draw_pixel_byte
draw_pixel:
    CLC
    LDA draw_pixel_offset
    ADC #<bitmap
    STA $00
    LDA draw_pixel_offset + 1
    ADC #>bitmap
    STA $01
    LDX #$00
    LDA ($00,X)
    ORA draw_pixel_byte
    STA ($00,X)
    RTS
attribute_offset:
    .word $0000
update_attribute_offset_from_mouse:
    LDA mouse_record_x
    AND #%11111000
    ROR
    ROR
    ROR
    STA attribute_offset
    LDA mouse_record_y
    AND #%00111000
    ASL
    ASL
    ORA attribute_offset
    STA attribute_offset
    LDA mouse_record_y
    AND #%11000000
    ROR
    ROR
    ROR
    ROR
    ROR
    ROR
    STA attribute_offset + 1
    RTS
draw_attribute:
    CLC
    LDA #<attributes
    ADC attribute_offset
    STA $00
    LDA #>attributes
    ADC attribute_offset + 1
    STA $01
    LDA #%00010100
    LDX #$00
    STA ($00,X)
    RTS
mouse_column:
    .byte $00
update_mouse_column:
    LDA mouse_record_x
    ROR
    CLC
    ROR
    CLC
    ROR
    STA mouse_column
    RTS
mouse_line:
    .byte $00
update_mouse_line:
    LDA mouse_record_y
    AND #%00000111
    STA mouse_line
    RTS
mouse_row:
    .byte $00
update_mouse_row:
    LDA mouse_record_y
    AND #%00111000
    ASL
    ASL
    STA mouse_row
    RTS
mouse_area:
    .byte $00
update_mouse_area:
    LDA mouse_record_y
    AND #%11000000
    ROR
    ROR
    ROR
    STA mouse_area
    RTS
mouse_record_x:
    .byte $00
mouse_record_y:
    .byte $00
update_mouse_record:
    LDA mouse_x
    STA mouse_record_x
    LDA mouse_y
    STA mouse_record_y
    RTS
mouse_byte:
    .byte %10000000
update_mouse_byte:
    LDA mouse_record_x
    AND #%00000111
    TAX
    INX
    SEC
    LDA #%00000000
loop_update_mouse_byte:
    ROR
    DEX
    BNE loop_update_mouse_byte
    STA mouse_byte
    RTS
loop:
    JSR update_mouse_record
    JSR update_mouse_column
    JSR update_mouse_line
    JSR update_mouse_row
    JSR update_mouse_area
    JSR update_mouse_byte
    JSR update_pixel_offset
    JSR update_pixel_byte
    JSR update_attribute_offset_from_mouse
    JSR draw_pixel
    JSR draw_attribute
    JMP loop
</textarea>

<canvas class="u-full-width logiclogue-zx-screen" data-ram-id="example-3" width="256" height="192" style="image-rendering: pixelated"></canvas>

I think that just about wraps it up. The article started by introducing the ZX
Spectrum, a little bit of history, then moved onto describing the memory layout
of the ZX Spectrum's display. Finally, we finished with an example of how pixel
and attribute coordinates can be calculated by using a virtual memory mapped
mouse for an example. There are more subtleties involved with the ZX Spectrum's
graphics that I've decided not to go into in this article. In future articles
I'll be exploring more in-depth graphics programming with 8-bit computers! While
also tying that with more modern technology. Happy hacking!

<textarea class="hljs logiclogue-6502-asm" data-ram-id="example-n" style="width: 100%; height: 200px;">
init:
    JMP loop
set_attributes:
    LDY #$00
    STY $00
    LDX #$58
    STX $01
loop_set_attributes:
    LDA #%00001111
    STA ($00),Y
    INY
    BNE loop_set_attributes
    INC $01
    LDA #$5B
    CMP $01
    BNE loop_set_attributes
    RTS
; (byte pos, byte char), byte *screen_location
draw_char:
    LDA $00
    STA $02
    LDA #$40
    STA $03
    LDY #$00
    ; Load CharMap address into memory
    LDA #<CharMap
    STA $04
    LDA #>CharMap
    STA $05
    ; (char * 8) + CharMap
    LDA $01
    ASL
    ASL
    ASL
    ADC $04
    STA $04
draw_char_line:
    LDA ($04),Y
    LDX #$00
    STA ($02,X)
    INC $03
    INY
    CPY #$08
    BNE draw_char_line
    RTS
loop:
    JSR set_attributes
    LDA #$00
    STA $00
    LDA #$00
    STA $01
    JSR draw_char
    LDA #$01
    STA $00
    LDA #$01
    STA $01
    JSR draw_char
    LDA #$02
    STA $00
    LDA #$02
    STA $01
    JSR draw_char
    JMP loop
CharMap:
    ; Character 'A'
    .byte %00111100  ; Line 1:   00111100
    .byte %01100110  ; Line 2:   01100110
    .byte %01100110  ; Line 3:   01100110
    .byte %01111110  ; Line 4:   01111110
    .byte %01100110  ; Line 5:   01100110
    .byte %01100110  ; Line 6:   01100110
    .byte %01100110  ; Line 7:   01100110
    .byte %00000000  ; Line 8:   00000000
    ; Character 'B'
    .byte %01111100  ; Line 1:   01111100
    .byte %01100110  ; Line 2:   01100110
    .byte %01100110  ; Line 3:   01100110
    .byte %01111100  ; Line 4:   01111100
    .byte %01100110  ; Line 5:   01100110
    .byte %01100110  ; Line 6:   01100110
    .byte %01111100  ; Line 7:   01111100
    .byte %00000000  ; Line 8:   00000000
    ; Character 'C'
    .byte %00111100  ; Line 1:   00111100
    .byte %01100110  ; Line 2:   01100110
    .byte %01100000  ; Line 3:   01100000
    .byte %01100000  ; Line 4:   01100000
    .byte %01100000  ; Line 5:   01100000
    .byte %01100110  ; Line 6:   01100110
    .byte %00111100  ; Line 7:   00111100
    .byte %00000000  ; Line 8:   00000000
</textarea>

<canvas class="u-full-width logiclogue-zx-screen" data-ram-id="example-n" width="256" height="192" style="image-rendering: pixelated"></canvas>

# References and Acknowledgements

- [jywlewis' 6502 Emulator](https://www.npmjs.com/package/6502-emulator)
- [kktos' 6502 Assembler](https://www.npmjs.com/package/jsasm6502)
