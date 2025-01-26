ctrl = $2000
status = $2001
objptr = $2002
graptr = $2004
bscrlx = $2006
bscrly = $2007
wscrlx = $2008
wscrly = $2009

sprite_table = $4000
background_table = $5000
background_attr_table = $5400
window_array = $5500
palettes = $58c0
object_table = $3000

web3_status = $6000
web3_request = $6001
mouse_down = $3FFD
mouse_x = $3FFE
mouse_y = $3FFF

.macro STAI address
    LDX address
    STX $00
    LDX address + 1
    STX $01
    LDY #$00
    STA ($00),Y
.end

.macro TX2 address_1, address_2
    LDA address_1
    STA address_2
    LDA address_1 + 1
    STA address_2 + 1
.end

.macro TX16 address_1, address_2
    LDA address_1
    STA address_2
    LDA address_1 + 1
    STA address_2 + 1
    LDA address_1 + 2
    STA address_2 + 2
    LDA address_1 + 3
    STA address_2 + 3
    LDA address_1 + 4
    STA address_2 + 4
    LDA address_1 + 5
    STA address_2 + 5
    LDA address_1 + 6
    STA address_2 + 6
    LDA address_1 + 7
    STA address_2 + 7
    LDA address_1 + 8
    STA address_2 + 8
    LDA address_1 + 9
    STA address_2 + 9
    LDA address_1 + 10
    STA address_2 + 10
    LDA address_1 + 11
    STA address_2 + 11
    LDA address_1 + 12
    STA address_2 + 12
    LDA address_1 + 13
    STA address_2 + 13
    LDA address_1 + 14
    STA address_2 + 14
    LDA address_1 + 15
    STA address_2 + 15
.end

.macro CMP2 address_1, address_2
    LDA address_1
    CMP address_2
    BNE done
    LDA address_1 + 1
    CMP address_2 + 1
done:
    NOP
.end

init:
    ; Set the graphics mode to 1
    LDA #$01
    STA ctrl

    ; Set the graphics pointer
    LDA #<sprite_table
    STA graptr
    LDA #>sprite_table
    STA graptr + 1

    ; Set the object pointer
    LDA #<object_table
    STA objptr
    LDA #>object_table
    STA objptr + 1

    ; Set the sprites
    ; TODO, not working after introducing this
    TX16 sprite_sheet, sprite_table
    TX16 sprite_sheet + $10, sprite_table + $10
    TX16 sprite_sheet + $20, sprite_table + $20
    TX16 sprite_sheet + $30, sprite_table + $30

    ; Set the first object
    LDA #$FD
    STA object_table ; X
    LDA #$10
    STA object_table + 1 ; Y
    LDA #%00011000
    STA object_table + 2 ; attr
    LDA #$00
    STA object_table + 3 ; sprite

    ; Set the first palette
    LDA #%01010000
    STA palettes
    LDA #%00010101
    STA palettes + 1
    LDA #%00010100
    STA palettes + 2
    LDA #%00000101
    STA palettes + 3

    ; Set the second palette
    LDA #%01101010
    STA palettes + 4
    LDA #%01111110
    STA palettes + 5
    LDA #%01110100
    STA palettes + 6
    LDA #%11000101
    STA palettes + 7

    ; Set the attribute block
    LDA #$01
    STA background_attr_table + 2
    LDA #$01
    STA background_attr_table + 19

    JSR init_background_sprite_sheet

    JMP loop

; X, Y registers as coordinates
xy_to_background_table_addr_i:
    .word $0000
xy_to_background_table_addr_result:
    .word $0000
xy_to_background_table_addr:
    ; reset
    LDA #$00
    STA xy_to_background_table_addr_i
    STA xy_to_background_table_addr_i + 1
    STA xy_to_background_table_addr_result
    STA xy_to_background_table_addr_result + 1
    ; X / 8
    TXA
    AND #%11111000
    ROR
    ROR
    ROR
    STA xy_to_background_table_addr_i
    ; first part of Y - 00111000 -> 11100000
    TYA
    AND #%00111000
    ROL
    ROL
    ORA xy_to_background_table_addr_i
    STA xy_to_background_table_addr_i
    ; second part of Y - 11000000 -> 00000011
    TYA
    AND #%11000000
    ROL
    ROL
    ROL
    STA xy_to_background_table_addr_i + 1
    ; calculate address = background table + i
    CLC
    LDA #<background_table
    ADC xy_to_background_table_addr_i
    STA xy_to_background_table_addr_result
    LDA #>background_table
    ADC xy_to_background_table_addr_i + 1
    STA xy_to_background_table_addr_result + 1
    RTS

init_background_sprite_sheet_i:
    .byte $00
init_background_sprite_sheet:
    ; iterate 256 - 0 to 255
    LDA #$00
    STA init_background_sprite_sheet_i
init_background_sprite_sheet_loop:
    ; calculate X
    LDA init_background_sprite_sheet_i
    AND #%00001111
    ROL
    ROL
    ROL
    TAX
    ; calculate Y
    LDA init_background_sprite_sheet_i
    AND #$F0
    ROR
    TAY
    JSR xy_to_background_table_addr
    TX2 xy_to_background_table_addr_result, $00
    ; store tile
    LDA init_background_sprite_sheet_i
    LDY #$00
    STA ($00),Y
    INC init_background_sprite_sheet_i
    BNE init_background_sprite_sheet_loop
    RTS

draw_sprite_to_background_sprite:
    .byte $00
draw_sprite_to_background_x:
    .byte $00
draw_sprite_to_background_y:
    .byte $00
draw_sprite_to_background_byte_a:
    .byte $00
draw_sprite_to_background_byte_b:
    .byte $00
draw_sprite_to_background_row:
    .byte $00
draw_sprite_to_background:
    ; init
    LDA #$00
    STA draw_sprite_to_background_row
draw_sprite_to_background_loop:
    ; use ZP for indexing the sprite table
    LDA #<sprite_table
    STA $00
    LDA #>sprite_table
    STA $01

    ; load sprite row
    LDY draw_sprite_to_background_row
    LDA ($00),Y
    STA draw_word_to_background_word
    TYA
    CLC
    ADC #$08
    TAY
    LDA ($00),Y
    STA draw_word_to_background_word + 1

    ; the word
    LDA draw_sprite_to_background_x
    STA draw_word_to_background_x
    LDA draw_sprite_to_background_y
    STA draw_word_to_background_y
    JSR draw_word_to_background

    ; iterate
    CLC
    LDA draw_sprite_to_background_y
    ADC #$08
    STA draw_sprite_to_background_y
    INC draw_sprite_to_background_row
    LDA draw_sprite_to_background_row
    CMP #$08
    BNE draw_sprite_to_background_loop

    RTS

draw_word_to_background_word:
    .word $0000
draw_word_to_background_x:
    .byte $00
draw_word_to_background_y:
    .byte $00
draw_word_to_background_i:
    .byte $08
draw_word_to_background:
    ; reset
    LDA #$08
    STA draw_word_to_background_i
    CLC
    LDA #$38
    ADC draw_word_to_background_x
    STA draw_word_to_background_x
draw_word_to_background_loop:
    ; calculate pixel
    LDA draw_word_to_background_word
    CLC
    AND #$01
    ROL
    STA draw_pixel_to_background_pixel
    LDA draw_word_to_background_word + 1
    AND #$01
    ORA draw_pixel_to_background_pixel
    ; invoke drawing
    STA draw_pixel_to_background_pixel
    LDA draw_word_to_background_x
    STA draw_pixel_to_background_x
    LDA draw_word_to_background_y
    STA draw_pixel_to_background_y
    JSR draw_pixel_to_background
    ; iterate backwards
    SEC
    LDA draw_word_to_background_x
    SBC #$08
    STA draw_word_to_background_x
    CLC
    LDA draw_word_to_background_word
    ROR
    STA draw_word_to_background_word
    CLC
    LDA draw_word_to_background_word + 1
    ROR
    STA draw_word_to_background_word + 1
    DEC draw_word_to_background_i
    BNE draw_word_to_background_loop
    RTS

; draw pixel to background, byte corresponds to colour
draw_pixel_to_background_pixel:
    .byte $00
draw_pixel_to_background_x:
    .byte $00
draw_pixel_to_background_y:
    .byte $00
draw_pixel_to_background:
    LDX draw_pixel_to_background_x
    LDY draw_pixel_to_background_y
    JSR xy_to_background_table_addr
    TX2 xy_to_background_table_addr_result, $00
    LDY #$00
    LDA draw_pixel_to_background_pixel
    STA ($00),Y
    RTS

; TODO - draw a sprite
; TODO - sprite editor
; TODO - background editor
; TODO - palette editor

fine_scroll_x:
    .byte $00, $00, $00

loop:
    ; draw a sprite
    LDA #$00
    STA draw_sprite_to_background_sprite
    LDA #$90
    STA draw_sprite_to_background_x
    LDA #$00
    STA draw_sprite_to_background_y
    JSR draw_sprite_to_background

    ; increment x scroll register
    ; increment y scroll register
    CLC
    LDA #$01
    ADC fine_scroll_x
    STA fine_scroll_x
    LDA #$00
    ADC fine_scroll_x + 1
    STA fine_scroll_x + 1
    LDA #$00
    ADC fine_scroll_x + 2
    STA fine_scroll_x + 2
    LDA fine_scroll_x + 1
    STA bscrlx
    STA bscrly

    JMP loop

sprite_sheet:
    ; sprite 1
    .byte %11111111
    .byte %10000001
    .byte %10000001
    .byte %10000001
    .byte %00000001
    .byte %10000001
    .byte %10000001
    .byte %11111111

    .byte %11111111
    .byte %11110111
    .byte %10110011
    .byte %11111111
    .byte %11101111
    .byte %10111111
    .byte %11111101
    .byte %11111111

    ; sprite 2
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000

    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111

    ; sprite 3
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111

    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000
    .byte %00000000

    ; sprite 4
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111

    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
    .byte %11111111
