bitmap = $4000
attributes = $5800
last_attributes = $5B00
web3_status = $6000
web3_request = $6001
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
.macro CMP2 address_1, address_2
    LDA address_1
    CMP address_2
    BNE done
    LDA address_1 + 1
    CMP address_2 + 1
done:
    NOP
.end
.macro DEBUG address, pos
    LDA #%00100011
    STA attributes + pos
    LDA address
    STA bitmap + pos
    LDA address + 1
    STA bitmap + pos + 256
.end
init:
    JMP loop
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
mouse_attribute_offset:
    .word $0000
update_mouse_attribute_offset:
    LDA mouse_record_x
    AND #%11111000
    ROR
    ROR
    ROR
    STA mouse_attribute_offset
    LDA mouse_record_y
    AND #%00111000
    ASL
    ASL
    ORA mouse_attribute_offset
    STA mouse_attribute_offset
    LDA mouse_record_y
    AND #%11000000
    ROR
    ROR
    ROR
    ROR
    ROR
    ROR
    STA mouse_attribute_offset + 1
    RTS
attribute_address_offset:
    .word $0000
attribute_address_result:
    .word attributes
get_attribute_address_from_offset:
    CLC
    LDA #<attributes
    ADC attribute_address_offset
    STA attribute_address_result
    LDA #>attributes
    ADC attribute_address_offset + 1
    STA attribute_address_result + 1
    RTS
update_web3_request:
    LDA web3_status
    AND #%00000110
    BNE cancel_web3_connect
    LDA is_mouse_over_web3_square
    BNE try_web3_connect
    RTS
try_web3_connect:
    LDA web3_request
    ORA #%00000001
    STA web3_request
    RTS
cancel_web3_connect:
    LDA #$00
    STA web3_request
    RTS
is_mouse_over_web3_square:
    .byte $00
update_is_mouse_over_web3_square:
    CMP2 mouse_attribute_offset, web3_square_attribute_offset
    BNE set_is_mouse_over_web3_square_0
set_is_mouse_over_web3_square_1:
    LDA #$01
    STA is_mouse_over_web3_square
    RTS
set_is_mouse_over_web3_square_0:
    LDA #$00
    STA is_mouse_over_web3_square
    RTS
web3_square_attribute_offset:
    .word $001F
web3_square_state:
    .byte $00
update_web3_square_state:
    ;LDA is_mouse_over_web3_square
    LDA web3_status
    STA web3_square_state
    RTS
web3_square_attribute:
    .byte %00010000 ; no eth - red
    .byte %00110000 ; eth - yellow
    .byte %00000000
    .byte %01001000 ; connection requested - bright blue
    .byte %00000000
    .byte %01100000 ; connected - bright green
draw_web3_square:
    TX2 web3_square_attribute_offset, attribute_address_offset
    JSR get_attribute_address_from_offset
    LDX web3_square_state
    LDA web3_square_attribute,X
    STAI attribute_address_result
    RTS
draw_mouse_square:
    LDA is_mouse_over_web3_square
    BEQ draw_mouse_square_force
    RTS
draw_mouse_square_force:
    TX2 mouse_attribute_offset, attribute_address_offset
    JSR get_attribute_address_from_offset
    LDA #%00110000
    STAI attribute_address_result
    RTS
loop:
    JSR update_mouse_record
    JSR update_mouse_attribute_offset
    JSR update_is_mouse_over_web3_square
    JSR update_web3_request
    JSR update_web3_square_state
    JSR draw_mouse_square
    JSR draw_web3_square
    DEBUG mouse_attribute_offset, 2
    DEBUG web3_square_attribute_offset, 3
    DEBUG is_mouse_over_web3_square, 1
    DEBUG web3_status, 4
    JMP loop
