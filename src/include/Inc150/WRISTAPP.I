;
; Wristapp.i - For the Datalink 150
; Copyright (c) 1997 by John A. Toebes, VIII.  All Rights Reserved.
;
DISP_ROW        EQU     $1d     ; Hardware register to select which row of the display is to be written to.  You need to
                                ;    Combine this with setting DISP_COL to cause the segment to change
DISP_COL        EQU     $1e     ; Hardware register to select which col of the display is to be written to.  You must set
                                ;    DISP_ROW first to cause the segment to change
; It turns out that the segments on the display are readily accessible.  You can turn on/off any segment
; pretty easily.
;
; The top and middle lines are a series of segments which can be individually turned on to
; achieve the different letters.  I assign the segments as follows:
;      A
;    _____
;   |     |
; F |  |H | B
;   |  |  |
;    ---G-  
;   |  |  |
; E |  |I | C
;   |_____|
;      D
;
; Numbering the digits on the line from left to right we would get
;
;
;    1A         2A          3A         4A          5A         6A    
;   _____      _____       _____      _____       _____      _____  
; 1|     |1  2|     |2   3|     |3  4|     |4   5|     |5  6|     |6
; F|  |1 |B  F|  |2 |B   F|  |3 |B  F|  |4 |B   F|  |5 |B  F|  |6 |B
;  |  |H |    |  |H | D23 |  |H | D34|  |H | D45 |  |H |    |  |H | 
;   --1G-      --2G-  ---  --3G-  --  --4G-  ---  --5G-      --6G-  
; 1|  |1 |1  2|  |2 |2   3|  |3 |3  4|  |4 |4   5|  |5 |5  6|  |6 |6
; E|  |I |C  E|  |I |C   E|  |I |C  E|  |I |C   E|  |I |C  E|  |I |C
;  |_____|    |_____|  .  |_____|    |_____|  .  |_____|    |_____| 
;    1D         2D    P23   3D         4D    P45   5D         6D    
;
;  AM      PM       Remind               Night      Alarm     Note
; 
;
;    1A         2A          3A         4A          5A         6A    
;   _____      _____  C23  _____      _____       _____      _____  
; 1|     |1  2|     |2 o 3|     |3  4|     |4   5|     |5  6|     |6
; F|  |1 |B  F|  |2 |B   F|  |3 |B  F|  |4 |B   F|  |5 |B  F|  |6 |B
;  |  |H |    |  |H | D23 |  |H |    |  |H | D45 |  |H |    |  |H | 
;   --1G-      --2G-  ---  --3G-      --4G-  ---  --5G-      --6G-  
; 1|  |1 |1  2|  |2 |2   3|  |3 |3  4|  |4 |4   5|  |5 |5  6|  |6 |6
; E|  |I |C  E|  |I |C o E|  |I |C  E|  |I |C   E|  |I |C  E|  |I |C
;  |_____|    |_____|  .  |_____|    |_____|  .  |_____|    |_____| 
;    1D         2D    P23   3D         4D    P45   5D         6D    
;
; Note the two dashes between segments 2&3 and 4&5.  For convenience, I refer to these
; as D23 and D45 or DASH23 and DASH45 respectively.
; I prefix all of the items on the first row with a T and those on the middle row with a M.
;
; Pixels on the bottom line are addressed a little differently.  For these, we have 8 5x5 sets of
; segments.  We can reference them as follows:
;
;  S1       S2      S3      S4      S5      S6      S7      S8
; 12345   12345   12345   12345   12345   12345   12345   12345 
; *****A  *****A  *****A  *****A  *****A  *****A  *****A  *****A
; *****B  *****B  *****B  *****B  *****B  *****B  *****B  *****B
; *****C  *****C  *****C  *****C  *****C  *****C  *****C  *****C
; *****D  *****D  *****D  *****D  *****D  *****D  *****D  *****D
; *****E  *****E  *****E  *****E  *****E  *****E  *****E  *****E
;
; Hence, the lower right pixel is referenced as S8E5
;

; Value  Bit0   Bit1   Bit2   Bit3   Bit4   
; ------ ------ ------ ------ ------ ------
;  00    <none> <none> <none> <none> <none> 
;  02    S8E1   S8D1   S8A1   S8B1   S8C1   
;  04    S8E2   S8D2   S8A2   S8B2   S8C2   
;  06    S8E3   S8D3   S8A3   S8B3   S8C3   
;  08    S8E4   S8D4   S8A4   S8B4   S8C4   
;  0A    S8E5   S8D5   S8A5   S8B5   S8C5   
;  0C    <none> <none> <none> <none> <none> 
;  0E    T6C    T6B    M6C    M6B    Note   
;  10    T6D    T6G    T6A    <none> M6A    
;  12    T6I    T6H    M6I    M6G    M6H    
;  14    T6E    T6F    M6D    M6E    M6F    
;  16    <none> <none> <none> <none> <none> 
;  18    <none> <none> <none> <none> <none> 
;  1A    <none> <none> <none> <none> <none> 
;  1C    T5C    T5B    M5C    M5B    Alarm  
;  1E    T5D    T5G    T5A    <none> M5A    
;  20    T5I    T5H    M5I    M5G    M5H    
;  22    T5E    T5F    M5D    M5E    M5F    
;  24    TP45   TD45   MP45   MD45   <none> 
;  26    T4C    T4B    M4C    M4B    Night  
;  28    T4D    T4G    T4A    <none> M4A    
;  2A    T4I    T4H    M4I    M4G    M4H    
;  2C    T4E    T4F    M4D    M4E    M4F    
;  2E    T3C    T3B    M3C    M3B    TD34   
;  30    T3D    T3G    T3A    <none> M3A    
;  32    T3I    T3H    M3I    M3G    M3H    
;  34    T3E    T3F    M3D    M3E    M3F    
;  36    TP23   TD23   MP23   MC23   <none> 
;  38    T2C    T2B    M2C    M2B    Remind 
;  3A    T2D    T2G    T2A    <none> M2A    
;  3C    T2I    T2H    M2I    M2G    M2H    
;  3E    T2E    T2F    M2D    M2E    M2F    
;  40    T1C    T1B    M1C    M1B    PM     
;  42    T1D    T1G    T1A    <none> M1A    
;  44    T1I    T1H    M1I    M1G    M1H    
;  46    T1E    T1F    M1D    M1E    M1F    
;  48    <none> <none> <none> <none> AM     
;
; For the ODD Bits, we have:
;
; Value  Bit0   Bit1   Bit2   Bit3   Bit4   
; ------ ------ ------ ------ ------ ------
;  01    S7D5   S7E5   S7A5   S7B5   S7C5   
;  03    S7D4   S7E4   S7A4   S7B4   S7C4   
;  05    S7D3   S7E3   S7A3   S7B3   S7C3   
;  07    S7D2   S7E2   S7A2   S7B2   S7C2   
;  09    S7D1   S7E1   S7A1   S7B1   S7C1   
;  0B    S6D5   S6E5   S6A5   S6B5   S6C5   
;  0D    S6D4   S6E4   S6A4   S6B4   S6C4   
;  0F    S6D3   S6E3   S6A3   S6B3   S6C3   
;  11    S6D2   S6E2   S6A2   S6B2   S6C2   
;  13    S6D1   S6E1   S6A1   S6B1   S6C1   
;  15    S5D5   S5E5   S5A5   S5B5   S5C5   
;  17    S5D4   S5E4   S5A4   S5B4   S5C4   
;  19    S5D3   S5E3   S5A3   S5B3   S5C3   
;  1B    S5D2   S5E2   S5A2   S5B2   S5C2   
;  1D    S5D1   S5E1   S5A1   S5B1   S5C1   
;  1F    S4D5   S4E5   S4A5   S4B5   S4C5   
;  21    S4D4   S4E4   S4A4   S4B4   S4C4   
;  23    S4D3   S4E3   S4A3   S4B3   S4C3   
;  25    S4D2   S4E2   S4A2   S4B2   S4C2   
;  27    S4D1   S4E1   S4A1   S4B1   S4C1   
;  29    <none> <none> <none> <none> <none> 
;  2B    S3D5   S3E5   S3A5   S3B5   S3C5   
;  2D    S3D4   S3E4   S3A4   S3B4   S3C4   
;  2F    S3D3   S3E3   S3A3   S3B3   S3C3   
;  31    S3D2   S3E2   S3A2   S3B2   S3C2   
;  33    S3D1   S3E1   S3A1   S3B1   S3C1   
;  35    S2D5   S2E5   S2A5   S2B5   S2C5   
;  37    S2D4   S2E4   S2A4   S2B4   S2C4   
;  39    S2D3   S2E3   S2A3   S2B3   S2C3   
;  3B    S2D2   S2E2   S2A2   S2B2   S2C2   
;  3D    S2D1   S2E1   S2A1   S2B1   S2C1   
;  3F    S1D5   S1E5   S1A5   S1B5   S1C5   
;  41    S1D4   S1E4   S1A4   S1B4   S1C4   
;  43    S1D3   S1E3   S1A3   S1B3   S1C3   
;  45    S1D2   S1E2   S1A2   S1B2   S1C2   
;  47    S1D1   S1E1   S1A1   S1B1   S1C1   
;  
;
; Of course if you want to look it from the orientation of the segments on the display,
; you can use this information.  To make it more compact, I used the notation
;      bit:Value
; where value is what you store in $1D and Bit is which bit to set/clear in $1E to get the effect
;
; T1A=2:42  T2A=2:3A  T3A=2:30  T4A=2:28  T5A=2:1E  T6A=2:10  
; T1B=1:40  T2B=1:38  T3B=1:2E  T4B=1:26  T5B=1:1c  T6B=1:0e  
; T1C=0:40  T2C=0:38  T3C=0:2E  T4C=0:26  T5C=0:1c  T6C=0:0e  
; T1D=0:42  T2D=0:3A  T3D=0:30  T4D=0:28  T5D=0:1e  T6D=0:10  
; T1E=0:46  T2E=0:3E  T3E=0:34  T4E=0:2C  T5E=0:22  T6E=0:14  
; T1F=1:46  T2F=1:3E  T3F=1:34  T4F=1:2C  T5F=1:22  T6F=1:14  
; T1G=1:42  T2G=1:3A  T3G=1:30  T4G=1:28  T5G=1:1E  T6G=1:10  
; T1H=1:44  T2H=1:3C  T3H=1:32  T4H=1:2A  T5H=1:20  T6H=1:12  
; T1I=0:44  T2I=0:3C  T3I=0:32  T4I=0:2A  T5I=0:20  T6I=0:12  
;
; TP23=0:36
; TD23=1:36
; TD34=4:2E
; TD45=1:24
; TP45=0:24
;
; M1A=4:42  M2A=4:3A  M3A=4:30  M4A=4:28  M5A=4:1E  M6A=4:10  
; M1B=3:40  M2B=3:38  M3B=3:2E  M4B=3:26  M5B=3:1C  M6B=3:0E  
; M1C=2:40  M2C=2:38  M3C=2:2E  M4C=2:26  M5C=2:1C  M6C=2:0E  
; M1D=2:46  M2D=2:3E  M3D=2:34  M4D=2:2C  M5D=2:22  M6D=2:14  
; M1E=3:46  M2E=3:3E  M3E=3:34  M4E=3:2C  M5E=3:22  M6E=3:14  
; M1F=4:46  M2F=4:3E  M3F=4:34  M4F=4:2C  M5F=4:22  M6F=4:14  
; M1G=3:44  M2G=3:3C  M3G=3:32  M4G=3:2A  M5G=3:20  M6G=3:12  
; M1H=4:44  M2H=4:3C  M3H=4:32  M4H=4:2A  M5H=4:20  M6H=4:12  
; M1I=2:44  M2I=2:3C  M3I=2:32  M4I=2:2A  M5I=2:20  M6I=2:12  
;
; MC23=3:36
; MP23=2:36
; MD45=3:24
; MP45=2:24
;
; AM=4:48
; PM=4:40
; Remind=4:38
; Night=4:26
; Alarm=4:1C
; Note=4:0e

COL_T1A EQU     2
ROW_T1A EQU     $42  
COL_T2A EQU     2
ROW_T2A EQU     $3A  
COL_T3A EQU     2
ROW_T3A EQU     $30  
COL_T4A EQU     2
ROW_T4A EQU     $28  
COL_T5A EQU     2
ROW_T5A EQU     $1E  
COL_T6A EQU     2
ROW_T6A EQU     $10  
; 
COL_T1B EQU     1
ROW_T1B EQU     $40  
COL_T2B EQU     1
ROW_T2B EQU     $38  
COL_T3B EQU     1
ROW_T3B EQU     $2E  
COL_T4B EQU     1
ROW_T4B EQU     $26  
COL_T5B EQU     1
ROW_T5B EQU     $1c  
COL_T6B EQU     1
ROW_T6B EQU     $0e  
; 
COL_T1C EQU     0
ROW_T1C EQU     $40  
COL_T2C EQU     0
ROW_T2C EQU     $38  
COL_T3C EQU     0
ROW_T3C EQU     $2E  
COL_T4C EQU     0
ROW_T4C EQU     $26  
COL_T5C EQU     0
ROW_T5C EQU     $1c  
COL_T6C EQU     0
ROW_T6C EQU     $0e  
; 
COL_T1D EQU     0
ROW_T1D EQU     $42  
COL_T2D EQU     0
ROW_T2D EQU     $3A  
COL_T3D EQU     0
ROW_T3D EQU     $30  
COL_T4D EQU     0
ROW_T4D EQU     $28  
COL_T5D EQU     0
ROW_T5D EQU     $1e  
COL_T6D EQU     0
ROW_T6D EQU     $10  
; 
COL_T1E EQU     0
ROW_T1E EQU     $46  
COL_T2E EQU     0
ROW_T2E EQU     $3E  
COL_T3E EQU     0
ROW_T3E EQU     $34  
COL_T4E EQU     0
ROW_T4E EQU     $2C  
COL_T5E EQU     0
ROW_T5E EQU     $22  
COL_T6E EQU     0
ROW_T6E EQU     $14  
; 
COL_T1F EQU     1
ROW_T1F EQU     $46  
COL_T2F EQU     1
ROW_T2F EQU     $3E  
COL_T3F EQU     1
ROW_T3F EQU     $34  
COL_T4F EQU     1
ROW_T4F EQU     $2C  
COL_T5F EQU     1
ROW_T5F EQU     $22  
COL_T6F EQU     1
ROW_T6F EQU     $14  
; 
COL_T1G EQU     1
ROW_T1G EQU     $42  
COL_T2G EQU     1
ROW_T2G EQU     $3A  
COL_T3G EQU     1
ROW_T3G EQU     $30  
COL_T4G EQU     1
ROW_T4G EQU     $28  
COL_T5G EQU     1
ROW_T5G EQU     $1E  
COL_T6G EQU     1
ROW_T6G EQU     $10  
; 
COL_T1H EQU     1
ROW_T1H EQU     $44  
COL_T2H EQU     1
ROW_T2H EQU     $3C  
COL_T3H EQU     1
ROW_T3H EQU     $32  
COL_T4H EQU     1
ROW_T4H EQU     $2A  
COL_T5H EQU     1
ROW_T5H EQU     $20  
COL_T6H EQU     1
ROW_T6H EQU     $12  
; 
COL_T1I EQU     0
ROW_T1I EQU     $44  
COL_T2I EQU     0
ROW_T2I EQU     $3C  
COL_T3I EQU     0
ROW_T3I EQU     $32  
COL_T4I EQU     0
ROW_T4I EQU     $2A  
COL_T5I EQU     0
ROW_T5I EQU     $20  
COL_T6I EQU     0
ROW_T6I EQU     $12  
; 
;
COL_TP23        EQU     0
ROW_TP23        EQU     $36
; 
COL_TD23        EQU     1
ROW_TD23        EQU     $36
; 
COL_TD34        EQU     4
ROW_TD34        EQU     $2E
; 
COL_TD45        EQU     1
ROW_TD45        EQU     $24
; 
COL_TP45        EQU     0
ROW_TP45        EQU     $24
; 
;
COL_M1A EQU     4
ROW_M1A EQU     $42  
COL_M2A EQU     4
ROW_M2A EQU     $3A  
COL_M3A EQU     4
ROW_M3A EQU     $30  
COL_M4A EQU     4
ROW_M4A EQU     $28  
COL_M5A EQU     4
ROW_M5A EQU     $1E  
COL_M6A EQU     4
ROW_M6A EQU     $10  
; 
COL_M1B EQU     3
ROW_M1B EQU     $40  
COL_M2B EQU     3
ROW_M2B EQU     $38  
COL_M3B EQU     3
ROW_M3B EQU     $2E  
COL_M4B EQU     3
ROW_M4B EQU     $26  
COL_M5B EQU     3
ROW_M5B EQU     $1C  
COL_M6B EQU     3
ROW_M6B EQU     $0E  
; 
COL_M1C EQU     2
ROW_M1C EQU     $40  
COL_M2C EQU     2
ROW_M2C EQU     $38  
COL_M3C EQU     2
ROW_M3C EQU     $2E  
COL_M4C EQU     2
ROW_M4C EQU     $26  
COL_M5C EQU     2
ROW_M5C EQU     $1C  
COL_M6C EQU     2
ROW_M6C EQU     $0E  
; 
COL_M1D EQU     2
ROW_M1D EQU     $46  
COL_M2D EQU     2
ROW_M2D EQU     $3E  
COL_M3D EQU     2
ROW_M3D EQU     $34  
COL_M4D EQU     2
ROW_M4D EQU     $2C  
COL_M5D EQU     2
ROW_M5D EQU     $22  
COL_M6D EQU     2
ROW_M6D EQU     $14  
; 
COL_M1E EQU     3
ROW_M1E EQU     $46  
COL_M2E EQU     3
ROW_M2E EQU     $3E  
COL_M3E EQU     3
ROW_M3E EQU     $34  
COL_M4E EQU     3
ROW_M4E EQU     $2C  
COL_M5E EQU     3
ROW_M5E EQU     $22  
COL_M6E EQU     3
ROW_M6E EQU     $14  
; 
COL_M1F EQU     4
ROW_M1F EQU     $46  
COL_M2F EQU     4
ROW_M2F EQU     $3E  
COL_M3F EQU     4
ROW_M3F EQU     $34  
COL_M4F EQU     4
ROW_M4F EQU     $2C  
COL_M5F EQU     4
ROW_M5F EQU     $22  
COL_M6F EQU     4
ROW_M6F EQU     $14  
; 
COL_M1G EQU     3
ROW_M1G EQU     $44  
COL_M2G EQU     3
ROW_M2G EQU     $3C  
COL_M3G EQU     3
ROW_M3G EQU     $32  
COL_M4G EQU     3
ROW_M4G EQU     $2A  
COL_M5G EQU     3
ROW_M5G EQU     $20  
COL_M6G EQU     3
ROW_M6G EQU     $12  
; 
COL_M1H EQU     4
ROW_M1H EQU     $44  
COL_M2H EQU     4
ROW_M2H EQU     $3C  
COL_M3H EQU     4
ROW_M3H EQU     $32  
COL_M4H EQU     4
ROW_M4H EQU     $2A  
COL_M5H EQU     4
ROW_M5H EQU     $20  
COL_M6H EQU     4
ROW_M6H EQU     $12  
; 
COL_M1I EQU     2
ROW_M1I EQU     $44  
COL_M2I EQU     2
ROW_M2I EQU     $3C  
COL_M3I EQU     2
ROW_M3I EQU     $32  
COL_M4I EQU     2
ROW_M4I EQU     $2A  
COL_M5I EQU     2
ROW_M5I EQU     $20  
COL_M6I EQU     2
ROW_M6I EQU     $12  
; 
;
COL_MC23        EQU     3
ROW_MC23        EQU     $36
; 
COL_MP23        EQU     2
ROW_MP23        EQU     $36
; 
COL_MD45        EQU     3
ROW_MD45        EQU     $24
; 
COL_MP45        EQU     2
ROW_MP45        EQU     $24
; 
;
COL_AM  EQU     4
ROW_AM  EQU     $48
; 
COL_PM  EQU     4
ROW_PM  EQU     $40
; 
COL_REMIND      EQU     4
ROW_REMIND      EQU     $38
; 
COL_NIGHT       EQU     4
ROW_NIGHT       EQU     $26
; 
COL_ALARM       EQU     4
ROW_ALARM       EQU     $1C
; 
COL_NOTE        EQU     4
ROW_NOTE        EQU     $0E
;
; S1A1=2:47  S1B1=3:47  S1C1=4:47  S1D1=0:47  S1E1=1:47
; S1A2=2:45  S1B2=3:45  S1C2=4:45  S1D2=0:45  S1E2=1:45
; S1A3=2:43  S1B3=3:43  S1C3=4:43  S1D3=0:43  S1E3=1:43
; S1A4=2:41  S1B4=3:41  S1C4=4:41  S1D4=0:41  S1E4=1:41
; S1A5=2:3F  S1B5=3:3F  S1C5=4:3F  S1D5=0:3F  S1E5=1:3F
;
; S2A1=2:3D  S2B1=3:3D  S2C1=4:3D  S2D1=0:3D  S2E1=1:3D
; S2A2=2:3B  S2B2=3:3B  S2C2=4:3B  S2D2=0:3B  S2E2=1:3B
; S2A3=2:39  S2B3=3:39  S2C3=4:39  S2D3=0:39  S2E3=1:39
; S2A4=2:37  S2B4=3:37  S2C4=4:37  S2D4=0:37  S2E4=1:37
; S2A5=2:35  S2B5=3:35  S2C5=4:35  S2D5=0:35  S2E5=1:35
;
; S3A1=2:33  S3B1=3:33  S3C1=4:33  S3D1=0:33  S3E1=1:33
; S3A2=2:31  S3B2=3:31  S3C2=4:31  S3D2=0:31  S3E2=1:31
; S3A3=2:2F  S3B3=3:2F  S3C3=4:2F  S3D3=0:2F  S3E3=1:2F
; S3A4=2:2D  S3B4=3:2D  S3C4=4:2D  S3D4=0:2D  S3E4=1:2D
; S3A5=2:2B  S3B5=3:2B  S3C5=4:2B  S3D5=0:2B  S3E5=1:2B
;
; S4A1=2:27  S4B1=3:27  S4C1=4:27  S4D1=0:27  S4E1=1:27
; S4A2=2:25  S4B2=3:25  S4C2=4:25  S4D2=0:25  S4E2=1:25
; S4A3=2:23  S4B3=3:23  S4C3=4:23  S4D3=0:23  S4E3=1:23
; S4A4=2:21  S4B4=3:21  S4C4=4:21  S4D4=0:21  S4E4=1:21
; S4A5=2:1F  S4B5=3:1F  S4C5=4:1F  S4D5=0:1F  S4E5=1:1F
;
; S5A1=2:1D  S5B1=3:1D  S5C1=4:1D  S5D1=0:1D  S5E1=1:1D
; S5A2=2:1B  S5B2=3:1B  S5C2=4:1B  S5D2=0:1B  S5E2=1:1B
; S5A3=2:19  S5B3=3:19  S5C3=4:19  S5D3=0:19  S5E3=1:19
; S5A4=2:17  S5B4=3:17  S5C4=4:17  S5D4=0:17  S5E4=1:17
; S5A5=2:15  S5B5=3:15  S5C5=4:15  S5D5=0:15  S5E5=1:15
;
; S6A1=2:13  S6B1=3:13  S6C1=4:13  S6D1=0:13  S6E1=1:13
; S6A2=2:11  S6B2=3:11  S6C2=4:11  S6D2=0:11  S6E2=1:11
; S6A3=2:0F  S6B3=3:0F  S6C3=4:0F  S6D3=0:0F  S6E3=1:0F
; S6A4=2:0D  S6B4=3:0D  S6C4=4:0D  S6D4=0:0D  S6E4=1:0D
; S6A5=2:0B  S6B5=3:0B  S6C5=4:0B  S6D5=0:0B  S6E5=1:0B
;
; S7A1=2:09  S7B1=3:09  S7C1=4:09  S7D1=0:09  S7E1=1:09
; S7A2=2:07  S7B2=3:07  S7C2=4:07  S7D2=0:07  S7E2=1:07
; S7A3=2:05  S7B3=3:05  S7C3=4:05  S7D3=0:05  S7E3=1:05
; S7A4=2:03  S7B4=3:03  S7C4=4:03  S7D4=0:03  S7E4=1:03
; S7A5=2:01  S7B5=3:01  S7C5=4:01  S7D5=0:01  S7E5=1:01
;
; S8A1=2:02  S8B1=3:02  S8C1=4:02  S8D1=1:02  S8E1=0:02
; S8A2=2:04  S8B2=3:04  S8C2=4:04  S8D2=1:04  S8E2=0:04
; S8A3=2:06  S8B3=3:06  S8C3=4:06  S8D3=1:06  S8E3=0:06
; S8A4=2:08  S8B4=3:08  S8C4=4:08  S8D4=1:08  S8E4=0:08
; S8A5=2:0a  S8B5=3:0a  S8C5=4:0a  S8D5=1:0a  S8E5=0:0a
; 
;
; Character set
;
C_0             EQU     $00
C_1             EQU     $01
C_2             EQU     $02
C_3             EQU     $03
C_4             EQU     $04
C_5             EQU     $05
C_6             EQU     $06
C_7             EQU     $07
C_8             EQU     $08
C_9             EQU     $09
C_A             EQU     $0A
C_B             EQU     $0B
C_C             EQU     $0C
C_D             EQU     $0D
C_E             EQU     $0E
C_F             EQU     $0F
C_G             EQU     $10
C_H             EQU     $11
C_I             EQU     $12
C_J             EQU     $13
C_K             EQU     $14
C_L             EQU     $15
C_M             EQU     $16
C_N             EQU     $17
C_O             EQU     $18
C_P             EQU     $19
C_Q             EQU     $1A
C_R             EQU     $1B
C_S             EQU     $1C
C_T             EQU     $1D
C_U             EQU     $1E
C_V             EQU     $1F
C_W             EQU     $20
C_X             EQU     $21
C_Y             EQU     $22
C_Z             EQU     $23
C_BLANK         EQU     $24
C_SPACE         EQU     $24
C_EXCLAIM       EQU     $25
C_DQUOTE        EQU     $26
C_POUND         EQU     $27
C_DOLLAR        EQU     $28
C_PERCENT       EQU     $29
C_AMPERSAND     EQU     $2A
C_QUOTE         EQU     $2B
C_LPAREN        EQU     $2C
C_RPAREN        EQU     $2D
C_TIMES         EQU     $2E
C_PLUS          EQU     $2F
C_COMMA         EQU     $30
C_MINUS         EQU     $31
C_PERIOD        EQU     $32
C_SLASH         EQU     $33
C_COLON         EQU     $34
C_BACKSLASH     EQU     $35
C_DIVIDE        EQU     $36
C_EQUAL         EQU     $37
C_BELL          EQU     $38
C_QUESTION      EQU     $39
C_UNDER         EQU     $3A
C_CHECK         EQU     $3B
C_PREV          EQU     $3C
C_LEFTARR       EQU     $3C     ; Symbol for the previous key
C_NEXT          EQU     $3D
C_RIGHTARR      EQU     $3D     ; Symbol for the next key
C_BLOCK         EQU     $3E
C_SEP           EQU     $3F
C6_SPACE        EQU     $1d
; The basic timex character set is:
; 0 1 2 3 4 5 6 7 8 9 A B C D E F
; G H I J K L M N O P Q R S T U V
; W X Y Z   ! " # $ % & ' ( ) * +
; , - . / : ; < = > ? @ A B C D E
;
; We also have the timex6 character set as:
; 0 1 2 3 4 5 6 7 8 9 A B C D E F
; G H : L M N P R T U W Y r   - +
;

EVT_NEXT   EQU  $00     ; Next button pressed (not interested in the up transition)
EVT_MODE   EQU  $01     ; Mode button pressed  (not interested in the up transition)
EVT_SET    EQU  $02     ; Set/Delete button pressed (not interested in the up transition)
EVT_PREV   EQU  $03     ; Prev button pressed  (not interested in the up transition)
EVT_GLOW   EQU  $04     ; Indiglo button pressed (not interested in the up transition)
EVT_ANY    EQU  $05     ; Any button pressed (not interested in the up transition)
EVT_ANY4   EQU  $06     ; Any button pressed except indiglo (not interested in the up transition)
EVT_RESUME EQU  $1a     ; Called when resuming from a nested app
EVT_ENTER  EQU  $1b     ; Initial state. The Time value is generally $01 or $84 for a well behaved app
EVT_NEST   EQU  $1c     ; The state table 1 entry called when a nested application is called.  It is the equivalent of
                        ; EVT_ENTER for an interrupt.  This only occurs for Wristapps, Timer, and appt apps.
EVT_END    EQU  $1d     ; End of event table indicator
EVT_TIMER1 EQU  $1e     ; Timer event - This is fired for a $83 time request
EVT_TIMER2 EQU  $1f     ; Timer event - This is fired for a $82,$84,$01 timer request
;           $20-$36 - UNUSED
;           (I bet that you can have user specified events for these too)
EVT_USER0  EQU  $37
EVT_USER1  EQU  $38
EVT_USER2  EQU  $39
EVT_USER3  EQU  $3a     ; User specified events.  Queued by calling POSTEVENT ($4E89)
;           $3b-$7f - UNUSED
EVT_DNNEXT EQU  $80     ; Next button pressed
EVT_DNMODE EQU  $81     ; Mode button pressed
EVT_DNSET  EQU  $82     ; Set/Delete button pressed
EVT_DNPREV EQU  $83     ; Prev button pressed
EVT_DNGLOW EQU  $84     ; Indiglo button pressed
EVT_DNANY  EQU  $85     ; Any of the four buttons Pressed
EVT_DNANY4 EQU  $86     ; Any button pressed except indiglo

;           $87-$9F - UNUSED
EVT_UPNEXT EQU  $A0     ; Next button released
EVT_UPMODE EQU  $A1     ; Mode button released
EVT_UPSET  EQU  $A2     ; Set/Delete button released
EVT_UPPREV EQU  $A3     ; Prev button released
EVT_UPGLOW EQU  $A4     ; Indiglo button released
EVT_UPANY  EQU  $A5     ; Any of the four buttons Released
EVT_UPANY4 EQU  $A6     ; Any button Released except indiglo
           
ALARM_STATUS    EQU     $69     ; This is the status flags for the alarms.  The low order bit indicates that it is enabled
                                ; The next bit seems to indicate that the alarm is temporarily masked or disabled
                                ; Apparently the next bit can be set, but I haven't seen any use for it.
;               EQU     $69     ; Alarm 1 Status
;               EQU     $69     ; Alarm 1 Status
;               EQU     $6a     ; Alarm 2 Status
;               EQU     $6b     ; Alarm 3 Status
;               EQU     $6c     ; Alarm 4 Status
;               EQU     $6d     ; Alarm 5 Status

SCAN_MONTH      EQU     $7a     ; The current SCAN month
SCAN_DAY        EQU     $7b     ; The current SCAN day
SCAN_YEAR       EQU     $7c     ; The current SCAN year

MONTH_JAN       EQU     1
MONTH_FEB       EQU     2
MONTH_MAR       EQU     3
MONTH_APR       EQU     4
MONTH_MAY       EQU     5
MONTH_JUN       EQU     6
MONTH_JUL       EQU     7
MONTH_AUG       EQU     8
MONTH_SEP       EQU     9
MONTH_OCT       EQU     10
MONTH_NOV       EQU     11
MONTH_DEC       EQU     12

SYSTEMP0	EQU	$A0
SYSTEMP1	EQU	$A1

TIM_ONCE   EQU  $ff     ; No time interval.  Operation is executed just once

TIM1_TIC        EQU     $00
TIM1_2TIC       EQU     $01
TIM1_3TIC       EQU     $02
TIM1_4TIC       EQU     $03
TIM1_HALFSEC    EQU     $04
TIM1_SECOND     EQU     $05
TIM1_SECHALF    EQU     $06
TIM1_TWOSEC     EQU     $07
TIM1_TWOSEC1    EQU     $08
TIM1_12SEC      EQU     $09
TIM1_18SEC      EQU     $0a
;
; Note that the second part of this table is happen-stance since it is really a rollover
; of the second table on top of the first one. But it might be useful to someone...
;
TIM1_TICA       EQU     $0b     ; This is the typical scroll interval
TIM1_2TICA      EQU     $0c
TIM1_4TICA      EQU     $0d
TIM1_8TIC       EQU     $0e     ; This is the normal blink interval
TIM1_12TIC      EQU     $0f     ; Just over a second
TIM1_16TIC      EQU     $10     ; A second and a half
TIM1_24TIC      EQU     $11     ; Two and a half seconds
TIM1_32TIC      EQU     $12     ; Just over three seconds
TIM1_40TIC      EQU     $13     ; Four seconds
TIM1_48TIC      EQU     $14     ; Almost five seconds
TIM1_96TIC      EQU     $15     ; Almost ten seconds

TIM2_TIC        EQU     $80     ; This is the typical scroll interval
TIM2_2TIC       EQU     $81
TIM2_4TIC       EQU     $82
TIM2_8TIC       EQU     $83     ; This is the normal blink interval
TIM2_12TIC      EQU     $84     ; Just over a second
TIM2_16TIC      EQU     $85     ; A second and a half
TIM2_24TIC      EQU     $86     ; Two and a half seconds
TIM2_32TIC      EQU     $87     ; Just over three seconds
TIM2_40TIC      EQU     $88     ; Four seconds
TIM2_48TIC      EQU     $89     ; Almost five seconds
TIM2_96TIC      EQU     $8a     ; Almost ten seconds

TIM_LONG1  EQU  $01     ; Long shot time interval - Fires a $1F when the the timer expires
TIM_03     EQU  $03     ; Unknown
TIM_08     EQU  $08     ; Unknown

TIM_SHORT  EQU  $82     ; Short timer - Fires a $1F event when the timer expires
TIM_MED    EQU  $83     ; Medium timer - Fires a $1E event when the timer expires
TIM_LONG   EQU  $84     ; Long timer - Fires a $1F event when the timer expires
TIM_86     EQU  $86     ; ?Timer
;-----------------------------------------------------------------------------------------
TZ1_HOUR        EQU     $b0     ; Time zone 1 current hour (0-23)
TZ1_MINUTE      EQU     $b1     ; Time zone 1 current minute (0-59)
TZ1_MONTH       EQU     $b2     ; Time zone 1 current month of the year (1-12)
TZ1_DAY         EQU     $b3     ; Time zone 1 current day of the month (1-31)
TZ1_YEAR        EQU     $b4     ; Time zone 1 current year (mod 1900)
TZ1_NAME        EQU     $b5     ; Time zone 1 name (3 TIMEX characters)
;               EQU     $b6     ;    "   "  "   "
;               EQU     $b7     ;    "   "  "   "
TZ1_DOW         EQU     $b8     ; Time zone 1 day of week (0=Monday...6=Sunday)
;-----------------------------------------------------------------------------------------
TZ2_HOUR        EQU     $b9     ; Time zone 2 current hour (0-23) in Timezone 1
TZ2_MINUTE      EQU     $ba     ; Time zone 2 current minute (0-59)
TZ2_MONTH       EQU     $bb     ; Time zone 2 current month of the year (1-12)
TZ2_DAY         EQU     $bc     ; Time zone 2 current day of the month (1-31)
TZ2_YEAR        EQU     $bd     ; Time zone 2 current year (mod 1900)
TZ2_NAME        EQU     $be     ; Time zone 2 name (3 TIMEX characters)
;               EQU     $bf     ;    "   "  "   "
;               EQU     $c0     ;    "   "  "   "
TZ2_DOW         EQU     $c1     ; Time zone 2 day of the week (0=Monday..6=Sunday)
;-----------------------------------------------------------------------------------------
; Sound Support Values
TONE_END        EQU     $00     ; END
TONE_LOW_C      EQU     $10     ; Low C
TONE_HI_C       EQU     $20     ; High C
TONE_MID_C      EQU     $30     ; Middle C
TONE_VHI_C      EQU     $40     ; Very high C
TONE_HI_F       EQU     $50     ; High F (little bit lower than F)
TONE_MID_F      EQU     $60     ; Middle F
TONE_LO_F       EQU     $70     ; Low F
TONE_VHI_GSHARP EQU     $80     ; Very High G# (G Sharp)
TONE_HI_GSHARP  EQU     $90     ; High G#
TONE_MID_GSHARP EQU     $A0     ; Middle G#
TONE_LO_GSHARP  EQU     $B0     ; Low G#
TONE_HI_D       EQU     $C0     ; High D
TONE_MID_D      EQU     $D0     ; Middle D
TONE_LO_D       EQU     $E0     ; Low D
TONE_PAUSE      EQU     $F0     ; Pause
SND_END         EQU     $80
;--------------------------------------------------------------------------------
SNDSTART    EQU     $4e4a   ; Start playing the current sound in SYSSOUND
;--------------------------------------------------------------------------------
PLAYCONF    EQU     $4e7a   ; Play a confirmation sound
PLAYBUTTON  EQU     $4e80   ; Play the button beep sound if no other sound is currently playing
;--------------------------------------------------------------------------------
POSTEVENT   EQU     $4e89   ; Post a event to the internal processing queue
; Parameters:
;   A - Event to be posted.
; This posts an event to run through the processing loop for the current applet.
; Typical user events are in the $30-$3F range.
;
;--------------------------------------------------------------------------------
INDIGLO_OFF     EQU     $4e8e   ;   This routine turns off the indiglo light
;--------------------------------------------------------------------------------
SNDSTOP     EQU     $4f3a       ; This stops whatever sound is currently playing
;--------------------------------------------------------------------------------
CALL_NESTEDAPP  EQU     $4f4d
; Purpose:
;   This sets up to call a nested application while the current one is running.
;   Up to 5 apps may be nested (although there are only 3 potential ones defined).
;   If more than 5 have been called the oldest one will be forgotten.
;   When the nested app is called, NESTED_APP will be set to the application number
;   passed in and NESTED_PARM will contain the X parameter passed in
;
; Parameters:
;   A - Nested application number. This is one of the three defined apps:
;      9 = APP2_ALARM - Alarm (while another app is running)
;     10 = APP2_APPT  - Appointment (while another app is running)
;     11 = APP2_WRIST - Wristapp (while another app is running)
;   X - Parameter to pass to the nested application
;--------------------------------------------------------------------------------
SET_INDIGLO     EQU     $5504   ;   This routine turns on/off the indiglo light
; Parameters:
;   0,Sys_9e - Bit indicates request for on or off
;--------------------------------------------------------------------------------
PUTSCROLLMSG EQU     $5522      ; Make the buffer at MSGBUF visible
;--------------------------------------------------------------------------------
SCROLLMSG       EQU     $5545   ;   Start the scrolling cycle for the current message
; Parameters:
;   MSGBUF - Message to be scroll terminated by a SEPARATOR character
;--------------------------------------------------------------------------------
SCROLLMSG_CONT  EQU     $5549   ;   Start the scrolling cycle for the current message, but don't reset the
                                ;   scrolling cycle wait count.
; Parameters:
;   MSGBUF - Message to be scroll terminated by a SEPARATOR character
;   SCROLL_TICS - The current tic count in the cycle
;--------------------------------------------------------------------------------
START_BLINKX    EQU     $55bb   ;   Establish and call the specified blinking rountine
; Parameters:
;   X - single byte parameter to the particular blinking function
;   A - Blinking function to be selected
;--------------------------------------------------------------------------------
START_BLINKP    EQU     $55BF   ;   Establish and call the specified blinking rountine
; Parameters:
;   X - Address of parameter to the particular blinking function
;   A - Blinking function to be selected
BLINK_YEAR      EQU     0       ; Blink the year in the right place according to the current time format
BLINK_SECONDS   EQU     1       ; Blink two characters point to by UPDATE_PARM on the right two digits of the middle line - Used for the seconds
BLINK_AMPM      EQU     2       ; Blink AM/PM on the right most digits of the middle line (A or P pointed to by UPDATE_PARM)
BLINK_MONTH     EQU     3       ; Blink the month in the right place according to the current time format
BLINK_HMONTH    EQU     4       ; Blink the month in the right place according to the current time format for a half date (no year)
BLINK_DAY       EQU     5       ; Blink the day in the right place according to the current time format
BLINK_HDAY      EQU     6       ; Blink the day in the right place according to the current time format for half dates
BLINK_MID12     EQU     7       ; Blink the left two blank padded digits on the middle line (value pointed to by UPDATE_PARM)
BLINK_HOUR      EQU     8       ; Blink the Hour (left two segments on the middle line) and AM/PM indicator (hour point to by UPDATE_PARM)
BLINK_MID34     EQU     9       ; Blink the middle two zero padded digits on the middle line (value pointed to by UPDATE_PARM)
BLINK_SEGMENT   EQU     10      ; Blink a single segment indicated by UPDATE_POS and mask in UPDATE_VAL
BLINK_DIGIT     EQU     11      ; Blink solid black cursor for the digit (UPDATE_POS is the location on the bottom line)
BLINK_TZONE     EQU     12      ; Blink the timezone information (Pointed to by UPDATE_PARM)
BLINK_TOP34     EQU     13      ; Blink the middle zero padded two digits on the top line (value pointed to by UPDATE_PARM)
;--------------------------------------------------------------------------------
PUTLINE3    EQU     $56d5   ; Put a single character on the bottom line of the display
POSL3_1     EQU     $47
POSL3_2     EQU     $3d
POSL3_3     EQU     $33
POSL3_4     EQU     $27
POSL3_5     EQU     $1d
POSL3_6     EQU     $13
POSL3_7     EQU     $09
POSL3_8     EQU     $0a
; Parameters:
;   A = Position    S1    S2    S3    S4    S5    S6    S7    S8
;                 [$47] [$3D] [$33] [$27] [$1D] [$13] [$09] [$0A]
;                 [ 71] [ 61] [ 51] [ 39] [ 29] [ 19] [  9] [ 10]
;   X = Character in Timex Ascii to display
; Notes:
;   This appears to be an XOR operation.  Calling the same function twice in a row would
;   erase the character.  Writing on top of an existing character seems to let you generate
;   a non Ascii character.

PUTLINE1    EQU     $570D   ; Put a single character on the top line of the display
POSL1_1     EQU     $46
POSL1_2     EQU     $3e
POSL1_3     EQU     $34
POSL1_4     EQU     $2c
POSL1_5     EQU     $22
POSL1_6     EQU     $14
; Parameters:
;  A = Position [$46] [$3E] - [$34] [$2C] - [$22] [$14]
;               [ 70] [ 62]   [ 52] [ 44]   [ 34] [20]
;  X = Character in Timex Ascii to display

PUTLINE2    EQU     $5745     ; Put a single character on the second line of the display
POSL2_1     EQU     $46
POSL2_2     EQU     $3e
POSL2_3     EQU     $34
POSL2_4     EQU     $2c
POSL2_5     EQU     $22
POSL2_6     EQU     $14
; Parameters:
;  A = Position [$46] [$3E] - [$34] [$2C] - [$22] [$14]
;               [ 70] [ 62]   [ 52] [ 44]   [ 34] [20]
;  X = Character in Timex Ascii to display

CLEARALL    EQU     $577A       ; Clear the display
CLEARBOT    EQU     $5787       ; Clear the bottom line of the display
CLEARSYM    EQU     $579f       ; Turns off all the non digit symbols segments (including dots, dashes and colons)
;-------------------------------------------------------------------------
START_UPDATEX   equ     $57c3   ;   Establish and call the specified update function (See START_UPDATEP)
; Parameters:
;   X - single byte parameter to the particular update function
;   A - Update function to be selected
;-------------------------------------------------------------------------
START_UPDATEP     EQU     $57C7 ;   This establishes an update function.  Update functions are called every 8/10th
                                ;   of a second.  This function will update a number in an upward or downward
                                ;   direction based on the setting of 0,SYSFLAGS
; Parameters:
;   A - Update function to be selected
;   X - Pointer to parameters for the update function
UPD_YEAR        EQU     0       ; Update the year
UPD_MONTH       EQU     1       ; Update the Month
UPD_HMONTH      EQU     2       ; Update the Month in Half date format
UPD_DAY         EQU     3       ; Update the day
UPD_HDAY        EQU     4       ; Update the day in half date format
UPD_MID12       EQU     5       ; Update MID12
UPD_HOUR        EQU     6       ; Update the hour
UPD_MID34       EQU     7       ; Update MID34
UPD_DIGIT       EQU     8       ; Update the digit at UPDATE_POS
;-------------------------------------------------------------------------
BANNER8     EQU     $5845       ; Display an 8 character string
; Parameters
;   A = Offset from 0110 for the start of an 8 character timex string
;
;-------------------------------------------------------------------------
PUTMSGXBOT  EQU     $5849       ; Puts a message on the bottom of the screen.
; Parameters
;  A = Message selector number.  Valid values from 0 to 27.  They correspond to
;      the same strings passed into PUTMSGBOT scaled down by 8
;-------------------------------------------------------------------------
PUTMSGBOT   EQU     $584c       ; Puts a message on the bottom of the screen.
; Parameters
;  A = Offset into message selector string.  Valid values from from $00 to $d8 at
;      8 Byte offsets.  $E0 is the start of the 6 byte top/mid message strings.
SYS8_MON        EQU     $00 ;   $00 = "MON     "
SYS8_TUE        EQU     $08 ;   $08 = "TUE     "
SYS8_WED        EQU     $10 ;   $10 = "WED     "
SYS8_THU        EQU     $18 ;   $18 = "THU     "
SYS8_FRI        EQU     $20 ;   $20 = "FRI     "
SYS8_SAT        EQU     $28 ;   $28 = "SAT     "
SYS8_SUN        EQU     $30 ;   $30 = "SUN     "
SYS8_VERDATE    EQU     $38 ;   $38 = " 802003 "
SYS8_VERSION    EQU     $40 ;   $40 = "  V2.0  "
SYS8_MODE       EQU     $48 ;   $48 = "  MODE  "
SYS8_SET_MODE   EQU     $50 ;   $50 = "SET MODE"
SYS8_SET        EQU     $58 ;   $58 = "SET     "
SYS8_TO         EQU     $60 ;   $60 = "TO      "
SYS8_FOR        EQU     $68 ;   $68 = "FOR     "
SYS8_ENTRIES    EQU     $70 ;   $70 = "ENTRIES "
SYS8_UPCOMING   EQU     $78 ;   $78 = "UPCOMING"
SYS8_ENTRY      EQU     $80 ;   $80 = " ENTRY  "
SYS8_SCAN       EQU     $88 ;   $88 = "  SCAN  "
SYS8_SCAN_RIGHT EQU     $90 ;   $90 = "    SCAN"
SYS8_SYNCING    EQU     $98 ;   $98 = " SYNCING"
SYS8_PROGRESS   EQU     $a0 ;   $a0 = "PROGRESS"
SYS8_DATA_OK    EQU     $a8 ;   $a8 = " DATA OK"
SYS8_RESEND     EQU     $b0 ;   $b0 = "-RESEND-"
SYS8_ABORTED    EQU     $b8 ;   $b8 = " ABORTED"
SYS8_MISMATCH   EQU     $c0 ;   $c0 = "MISMATCH"
SYS8_SPLIT      EQU     $c8 ;   $c8 = " SPLIT  "
SYS8_START      EQU     $d0 ;   $d0 = ">=START "
SYS8_STOP       EQU     $d8 ;   $d8 = ">=STOP  "
;   $e0 is the start of the message table SYS6_SET
;
PUT6TOP     EQU     $587e
;  Parameters: 
;   A = Offset from 0110 for the start of a 6 byte data item to be put on the top
;       line of the screen.  This uses a different encoding for characters where:
;       we have 32 different values which correspond to:
;        "0123456789ABCDEFGH:LMNPRTUWYr -+"
;         0123456789abcdef0123456789abcdef
;        e.g. $12=':', $13='L'.
;        It appears that things wrap when you get to $20
;
PUTMSG1     EQU     $5882   ; Put up a message on the top line
; Parameters - Offset into message selector string.  
; Typically you want a multiple of 6 to choose from these below
;
SYS6_SET        EQU     $00 ;  00 = " SET  "  (This is stored at $5F5F in the roms)
SYS6_HOLDTO     EQU     $06 ;  06 = "HOLDTO"
SYS6_ALARM      EQU     $0C ;  0C = "ALARM "
SYS6_ENTER      EQU     $12 ;  12 = "ENTER "
SYS6_HR         EQU     $18 ;  18 = "    HR"
SYS6_SWITCH     EQU     $1E ;  1E = "SWITCH"
SYS6_TIME       EQU     $24 ;  24 = " TIME "
SYS6_FORMAT     EQU     $2A ;  2A = "FORMAT"
SYS6_DAILY      EQU     $30 ;  30 = "DAILY "
SYS6_APPT       EQU     $36 ;  36 = " APPT "
SYS6_NO         EQU     $3c ;  3c = "  NO  "
SYS6_APPTS      EQU     $42 ;  42 = "APPTS "
SYS6_END_OF     EQU     $48 ;  48 = "END OF"
SYS6_LIST       EQU     $4e ;  4e = " LIST "
SYS6_DELETE     EQU     $54 ;  54 = "DELETE"
SYS6_ANN        EQU     $5a ;  5a = " ANN  "
SYS6_PHONE      EQU     $60 ;  60 = "PHONE "
SYS6_DONE       EQU     $66 ;  66 = " DONE "
SYS6_PRI        EQU     $6c ;  6c = "PRI   "
SYS6_COMM       EQU     $72 ;  72 = " COMM "
SYS6_READY      EQU     $78 ;  78 = "READY "
SYS6_IN         EQU     $7e ;  7e = "  IN  "
SYS6_ERROR      EQU     $84 ;  84 = "ERROR "
SYS6_CEASED     EQU     $8a ;  8a = "CEASED"
SYS6_PC         EQU     $90 ;  90 = "PC-   "
SYS6_WATCH      EQU     $96 ;  96 = "WATCH "
SYS6_CHRONO     EQU     $9c ;  9c = "CHRONO"
SYS6_TIMER      EQU     $A2 ;  A2 = "TIMER "
SYS6_000000     EQU     $a8 ;  a8 = "000000"
;  ae = "MTWTFS"
;  B4 = "SOUEHR"
;  BA = "AUG+74"
;  C0 = "P16174"
;  C6 = "P1OY40"
;  CC = "W+0++0"
;  D2 = "251332"
;  D8 = "0321++"
;  DE = "R++ 0+"
;  E4 = "+12+1T"
;  EA = "+0 0+1"
;  F0 = "26+2U+"
;  F6 = "0 C100"
;  FC = "C0GW"
;
PUT6MID     EQU     $58a8
;  Parameters: 
;   A = Offset from 0110 for the start of a 6 byte data item to be put on the top
;       line of the screen.  This uses a different encoding for characters where:
;       we have 32 different values which correspond to:
;        "0123456789ABCDEFGH:LMNPRTUWYr -+"
;        e.g. $12=':', $13='L'.
;        It appears that things wrap when you get to $20
;
; PUT6MIDA was identified wrong...
PUTMSG2    EQU     $58AC    ; This functions just the same as PUTMSG1 except it puts things on the middle line
CLEARTOP     EQU     $58d2 ;   Puts blanks into all 6 top digits (Blanks out the top line)
; Parameters:
;   None
CLEARMID     EQU     $58d8 ;   Puts blanks into all 6 Middle digits (Blanks out the middle line)
; Parameters:
;   None
;-------------------------------------------------------------------------
; These next 6 routines take the two bytes in DATDIGIT1 ($A2) and DATDIGIT2($A3) and put them
; on the display in the appropriate locations.  The digits are represented using the TIMEX6
; character set.
;
PUTTOP12    EQU     $58e0   ; Puts DATDIGIT1/2 into TOP Digits 1 and 2
PUTTOP34    EQU     $58f0   ; Puts DATDIGIT1/2 into TOP Digits 3 and 4
PUTTOP56    EQU     $5900   ; Puts DATDIGIT1/2 into TOP Digits 5 and 6
PUTMID12    EQU     $5910   ; Puts DATDIGIT1/2 into Middle Digits 1 and 2
PUTMID34    EQU     $5920   ; Puts DATDIGIT1/2 into Middle Digits 3 and 4
PUTMID56    EQU     $5930   ; Puts DATDIGIT1/2 into Middle Digits 5 and 6
; These 6 routines blank out parts of the display
CLRTOP12    EQU     $58de   ; Puts Blanks into TOP Digits 1 and 2
CLRTOP34    EQU     $58ee   ; Puts Blanks into TOP Digits 3 and 4
CLRTOP56    EQU     $59fe   ; Puts Blanks into TOP Digits 5 and 6
CLRMID12    EQU     $590e   ; Puts Blanks into Middle Digits 1 and 2
CLRMID34    EQU     $591e   ; Puts Blanks into Middle Digits 3 and 4
CLRMID56    EQU     $592e   ; Puts Blanks into Middle Digits 5 and 6
;
FMTXLEAD0    EQU     $593E   ; Formats into DATDIGIT1/2 with leading zeros
; Parameters:
;    X - value to be formatted.  0-9 results in 0 followed by the digit
;                                10-99 results in number for both digits
FMTBLANK0   EQU     $594d   ; Format into DATDIGIT1/2
; Parameters:
;    X - value to be formatted.  0 results in all blanks.
;                                1-9 results in blank followed by the digit
;                                10-99 results in number for both digits
FMTX        EQU     $5951   ; Format into DATDIGIT1/2
; Parameters:
;    X - value to be formatted.  0-9 results in blank followed by the digit
;                                10-99 results in number for both digits

FMTSPACE    EQU     $595C   ; Format blankes into DATDIGIT1/2
; Parameters: NONE
; This routine simply puts spaces into DATDIGIT1 DATDIGIT2
;
SAYEOLMSG   EQU     $5979   ; Puts 'END OF LIST' on the display
PUTBOT678   EQU     $5a86   ;   Puts three digits into the lower corner of the display.
;     Typically this is the time zone information.
; Parameters:
;   X - Pointer to 3 byte location containing bytes to put on the display
;   (pointed to by x) 3 bytes in TIMEX ascii.  Because the X register iss
;   used to index to them, they must be located in the first 256 bytes of
;   memory.
PUTDATESEP  EQU     $5aab   ; Put either Dashes or periods on the top line

DIGLOCTOP   EQU     $5e26       ; Locations of digits on the top line
DIGLOCMID   EQU     $5e2c       ; Locations of digits on the middle line
DIGLOCBOT   EQU     $5e32       ; Locations of digits on the bottom line

;-------------------------------------------------------------------------
PUT_YEARX   EQU     $67cc       ; Put the leading zero 2 digit year in the appropriate spot on the display based
                                ; on the current time zone date format
; Parameters:
;   X - Year to be displayed
;-------------------------------------------------------------------------
PUT_MONTHX      EQU     $67d0   ; Put the leading space 2 digit month in the appropriate spot on the display based
                                ; on the current time zone date format
; Parameters:
;   X - Month to be displayed
;-------------------------------------------------------------------------
PUT_DAYX     EQU     $67d4      ;   Put the leading zero 2 digit day in the appropriate spot on the display based
                                ;   on the current time zone date format
; Parameters:
;   X - Day to be displayed
;-------------------------------------------------------------------------
SAY_HOURX       EQU     $67d8   ; Puts up the hour on the display along with an AM/PM indicator and a Colon.
                                ; This code respects the current 12/24 hour format.
; Parameters:
;   X - Hour to be displayed
;-------------------------------------------------------------------------
PUT_MINUTEX     EQU     $6823   ;   This puts the minute in the middle two digits on the middle line followed by a period
; Parameters:
;   X - minute (0-59) to be displayed
;-------------------------------------------------------------------------
SHOWSEC_TENS    EQU     $6830   ;   Puts the character at SECOND_TENS onto the next to the last digit on the middle line
; Parameters:
;   SECOND_TENS - Value to be put on the display
;-------------------------------------------------------------------------
SHOWSEC_ONES    EQU     $6838   ;   Puts the character at SECOND_ONES onto the last digit on the middle line
; Parameters:
;   SECOND_ONES - Value to be put on the display
;-------------------------------------------------------------------------
CALC_DOW_X      EQU     $68d5   ;   Computes the Day of the Week from the Month, Day, Year information
; Parameters:
;   X - Pointer to Month, Day, Year block
;-------------------------------------------------------------------------
ACQUIRE     EQU     $68e8       ; Disable interrupts for a short piece of code
RELEASE     EQU     $68f2       ; Reenable interrupts
;-------------------------------------------------------------------------
GET_MONTHLEN    EQU     $68f9   ;   Computes the number of days in a given month
; Parameters:
;   PARM_MONTH, PARM_YEAR contain the month and year to look for
; Returns:
;   A - Number of days in the month
;-------------------------------------------------------------------------
SETALL          EQU     $5776   ; Turn on all segments on the display
INCA_WRAPX      EQU     $6b0d   ;   Advance to the next value wrapped within a range
; Parameters:
;   A - Number to be incremented
;   X - Range to hold number within
;-------------------------------------------------------------------------
GETBCDHI    EQU     $6B52
; Parameters:
;   X - Hex value to be converted (Range 0-99)
; Returns:
;   A - High byte of number in timex ascii
;-------------------------------------------------------------------------
GETBCDLOW   EQU     $6B5A
; Parameters:
;   X - Hex value to be converted (Range 0-99)
; Returns:
;   A - Low byte of number in timex ascii
;-------------------------------------------------------------------------
TABHEX2BCD  EQU     $6b60   ; 100 bytes from 6b60-6bc3
; This is a 100 byte table of HEX to BCD conversion values.  You can take the value you want
; to convert, load it into the X register and then load TABHEX2BCX,X.  To get the high order byte,
; just shift it right by 4.  The low order is just an and with $0f.

SYS_26          EQU     $26
MODE_FLAGS      EQU     $68     ; FLAGS
                                ; Bit0 = Indicates that we are in alarm set mode (SET=IN SET MODE)
                                ; Bit1 = Indicates that we have a backup mode pending alarm (SET=PENDING)
                                ; Bit2 = Indicates that hourly chimes are to be played (SET=ENABLED)
                                ; Bit3 = Indicates that hourly chimes are temporarily disabled (SET=DISABLED)
                                ; Bit4 = Enables beep for any button pressed (SET=BEEP)
                                ; Bit5 = Indicates that we are in COMM Mode (SET=IN COMM Mode)
                                ; Bit6 = Indicates that ALARM SET MODE is on the display (SET=On Display)
                                ; Bit7 = <UNUSED>
APP_FLAGS       EQU     $8f     ; System Flags
                                ; Bit0 = Event has been posted (SET=TRUE)
                                ; Bit1 = We want to allow the app to be suspended (SET=ALLOW)
                                ; Bit2 = Run a nested application (SET=TRUE) - only for ALARM,APPT, WRISTAPP
                                ; Bit3 = A button beep has already been played (SET=PLAYED)
                                ; Bit4 = <UNUSED>
                                ; Bit5 = <UNUSED>
                                ; Bit6 = <UNUSED>
                                ; Bit7 = <UNUSED>
BTNFLAGS        EQU     $90     ; Flags for the timer.  Note that bits 5 and 7 are exclusive because they happen to
                                ;    use the same variables to hold their information.
                                ; Bit0 = <UNUSED>
                                ; Bit1 = wristapp wants a 1/10 second timer function called (WRIST_DOTIC) (SET=CALL)
                                ; Bit2 = Indicates a blink routine is pending (SET=PENDING)
                                ; Bit3 = Indicates a scrolling message is pending (SET=PENDING)
                                ; Bit4 = Indicates an update routine is pending (SET=PENDING)
                                ; Bit5 = Indicates a blink routine has been established (SET=ACTIVE)
                                ; Bit6 = Indicates a scrolling message is in progress (SET=ACTIVE)
                                ; Bit7 = Indicates an update routine has been established (SET=ACTIVE)
BTNSTATE        EQU     $91     ; Current event/button press
TIMER_FLAGS     EQU     $94     ; System Flags
                                ; Bit0 = Indicates that the timer2 timer has been enabled (SET=ENABLED)
                                ; Bit1 = Indicates that the TIC timer has been enabled (SET=ENABLED)
                                ; Bit2 = Indicates that we want to turn off the indiglo automatically (SET=TURN OFF)
                                ; Bit3 = Indicates that they have done something in this applet (SET=done something)
                                ; Bit4 = Request to reset the watch (SET=Reset Watch)
                                ; Bit5 = Request to turn off the INDIGLO at some future time
                                ; Bit6 = <UNUSED>
                                ; Bit7 = ????Related to indicating that sound is currently playing
MAIN_FLAGS      EQU     $95     ; Flags to set queue requests to do something in the main loop
                                ; Bit0 = Indicates that a button has changed state (SET=CHANGED)
                                ; Bit1 = Indicates that the current app should be suspended and TIME activated (SET=Suspend)
                                ; Bit2 = Indicates that the TIMER_TICS has been updated (SET=Updated)
                                ; Bit3 = Indicates that the hourly chimes need to be played (SET=Please Play)
                                ; Bit4 = Indicates that the appointments should be checked (SET=Please Check)
                                ; Bit5 = Indicates that the anniversaries need to be checked (SET=Please Check)
                                ; Bit6 = <UNUSED>
                                ; Bit7 = <UNUSED>
WRISTAPP_FLAGS  EQU     $96     ; System Flags
                                ; Bit0 = wristapp wants a second timer function called at start of interrupt (WRIST_DOTIC) (SET=CALL)
                                ; Bit1 = wristapp wants a call once a minute when it changes (WRIST_DOTIC) (SET=CALL)
                                ; Bit2 = wristapp wants a call once an hour when it changes (WRIST_DOTIC) (SET=CALL)
                                ; Bit3 = wristapp wants a call once a day when it changes (WRIST_DOTIC) (SET=CALL)
                                ; Bit4 = Play button beep sound on wristapp for any button (SET=ENABLE)
                                ; Bit5 = Play button beep sound on wristapp for mode button (SET=ENABLE)
                                ; Bit6 = Uses system rules for button beep decisions (SET=SYSTEM RULES)
                                ; Bit7 = Wristapp has been loaded (SET=LOADED)
NEST_PARM       EQU     $99     ; Holds the parameter passed to the current nested app
SYSSOUND        EQU     $9B         ; Current sound to be played
HW_FLAGS        EQU     $9e     ; System Variable
                                ; Bit0 = Request state for Indiglo light (SET=ON)
                                ; Bit1 = Indicates the the SYS_07 hardware has been reset
                                ; Bit2 = <UNUSED>
                                ; Bit3 = Indicates that we want to load some code from the serial port at reset (SET=ON)
                                ; Bit4 = Set but never used.  Mimics the state of 0,PORT_C_DATA & 0,PORT_C_DDR
                                ; Bit5 = Set but never used.  Mimics the state of 1,PORT_C_DATA & 1,PORT_C_DDR
                                ; Bit6 = Indicates that INST_ADDR is a pointer into the EEPROM (SET=EEPROM Address)
                                ; Bit7 = Interrupts have been disabled (SET=DISABLED)
SYSFLAGS        EQU     $9F     ; System flags
                                ; Bit0 = Indicates the update direction.  (SET=UP)
                                ; Bit1 = Indicates that the screen needs to be cleared (SET=no need to clear)
                                ;        Also used as part of a the digit blinking code (SET=Show digits)
                                ; Bit2 = Indicates that the end of a scrolling message has been reached (SET=END)
                                ; Bit3 = User vs system string (SET=User String)
                                ; Bit4 = <UNUSED>
                                ; Bit5 = <UNUSED>
                                ; Bit6 = <UNUSED>
                                ; Bit7 = <UNUSED>
DATDIGIT1       EQU     $A2     ; First digit parameter for PUTMIDnn/PUTTOPnn routines
DATDIGIT2       EQU     $A3     ; Second digit parameter for PUTMIDnn/PUTTOPnn routines
UPDATE_VAL      EQU     $a6     ; Temporary value passed to the update/blink routines
UPDATE_PARM     EQU     $a7     ; Pointer to the data passed to the update/blink routines
;
; The sound in SYSSOUND can be set to one of the following values:
;
SND_HOURLY      EQU     $83	; HOURLY CHIME
SND_APPT        EQU     $85	; APPOINTMENT BEEP
SND_ALARM       EQU     $86	; ALARM BEEP
SND_DLOAD       EQU     $87	; PROGRAM DOWNLOAD
SND_EXTRA	EQU     $88	; EXTRA
SND_COMERR      EQU     $89	; COMM ERROR
SND_DONE        EQU   	$8A	; COMM DONE
SND_BUTTON      EQU     $c1	; BUTTON BEEP
SND_RETURN      EQU     $c2	; RETURN TO TIME
SND_CONF        EQU     $c4	; CONFIRMATION

APPT_PROMBASE   EQU     $0100   ; Address of the first entry for Appointments in the EEPROM
LIST_PROMBASE   EQU     $0102   ; Address of the first entry for LISTs in the EEPROM
PHONE_PROMBASE  EQU     $0104   ; Address of the first entry for PHONE numbers in the EEPROM
ANNIV_PROMBASE  EQU     $0106   ; Address of the first entry for Anniversaries in the EEPROM
APPT_ENTRIES    EQU     $0108   ; Number of currently loaded Appointment entries
LIST_ENTRIES    EQU     $0109   ; Number of currently loaded LIST entries
PHONE_ENTRIES   EQU     $010a   ; Number of currently loaded Phone number entries
ANNIV_ENTRIES   EQU     $010b   ; Number of currently loaded Anniversary entries
APPT_BASEYEAR   EQU     $010c   ; The year for the first loaded appointment
APPT_PRETIME    EQU     $010d   ; How many minutes ahead of time to announce an appointment
COMM_010e       EQU     $010e   ; ????
; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
SND_BASEOFF     EQU     $010f   ; Sound base pointer - All sounds are this base relative to SND_BASE (0336)
WRIST_MAIN      EQU     $0110   ; This is the primary initialization entry point for a Wristapp
WRIST_SUSPEND   EQU     $0113   ; This is the entry point called immediately before suspending the wristapp
WRIST_DOTIC     EQU     $0116   ; This is the entry point called for a timer tic in a wristapp
WRIST_INCOMM    EQU     $0119   ; This is called when the COMM app is suspending the wristapp which has requests to process timer events
WRIST_NEWDATA   EQU     $011c   ; This is the wristapp entry point called when new data has been downloaded to the watch
WRIST_GETSTATE  EQU     $011f   ; Entry to get a wristapp state table entry
WRIST_JMP_STATE0 EQU    $0123   ; Wristapp entry point to call state 0

INST_ADDRHI     EQU     $0437
INST_ADDRLO     EQU     $0438
USER04a1        EQU     $04a1
NESTED_APP      EQU     $04a2   ; Nested application (Only to run an application while a different one is running)
                                ; This is used to handle alarms and appointments that go off while you are running something else
APP2_ALARM      EQU     9       ; 9 = Alarm (while another app is running)
APP2_APPT       EQU     10      ; 10 = Appointment (while another app is running)
APP2_WRIST      EQU     11      ; 11 = Wristapp (while another app is running)
NESTED_PARM     EQU     $04a4   ; Parameter passed to the nested app call
USER04c3        EQU     $04c3
BUF_PHONENUM    EQU     $043a   ; 12 byte buffer to hold a decompressed phone number
EXTRACTBUF      EQU     $0446   ; 32 byte buffer to hold extracted data from the EEPROM
UPDATE_POS      EQU     $04f3   ; Position to update a segment or digit in the blink/refresh routines
;
; These two constants appear to be associated with the PUTSCROLLMSG and SCROLLMSG routines
;
SEPARATOR       EQU     $3F     ; Indicates the end of a scrolling string
MSGBUF          EQU     $04d2   ; Location of the system buffer for a scrolling string
CURRENT_APP     EQU     $04c1   ; The current application number (1-8)
APP_TIME        EQU     1       ; 1 = Time of Day
APP_ALARM       EQU     2       ; 2 = Alarm
APP_APPT        EQU     3       ; 3 = Appointment
APP_ANNIV       EQU     4       ; 4 = Anniversary
APP_PHONE       EQU     5       ; 5 = Phone number
APP_LIST        EQU     6       ; 6 = List
APP_COMM        EQU     7       ; 7 = Communication
APP_WRIST       EQU     8       ; 8 = Wristapp (if downloaded)
BTN_PRESSED     EQU     $04c3   ; The button currently pressed (For EVT_ANY or EVT_ANY4 events) 0=NEXT 1=MODE 2=SET 3=PREV 4=GLOW
EFFECTIVE_APP   EQU     $04c4   ; The efective application
APP_13          EQU     13      ; Some submode of the TIME application
APP_TIME_SET    EQU     14      ; Submode of the TIME application
UPDATE_MIN      EQU     $04f4   ; Minimum value for the update function to generate.  At this, it wraps to UPDATE_MAX
UPDATE_MAX      EQU     $04f5   ; Maximum value for the update function to generate.  At this, it wraps to UPDATE_MIN    
PARM_MONTH      EQU     $04f9   ; Month parameter
PARM_YEAR       EQU     $04fa   ; Current year also...

WATCHTIMER      EQU     $7ff0
;
; Other random routines which you might call....
;
ALARM_BLINKSEL          EQU     $4095
ALARM_UPDATESEL         EQU     $4099
ALARM_SELMIN            EQU     $409D
ALARM_SELMAX            EQU     $40A1
FIND_ANNIV_TODAY        EQU     $40CD
FIND_ANNIV_SCAN         EQU     $40D3
ANNIV_NEXT_ENTRY        EQU     $40E1
ANNIV_PREV_ENTRY        EQU     $4117
FIND_ANNIV_ENTRY        EQU     $415F
CHECK_ANNIVERSARIES     EQU     $41FC
SET_ANNIVTEST_TODAY     EQU     $423A
ANNIV_GETMONTHLEN       EQU     $426A
TEST_ANNIVERSARY        EQU     $4288
ANNIV_COPY_INFO         EQU     $4308
READ_ANNIV_CURRENT      EQU     $4317
READ_ANNIV_FIRST        EQU     $4326
READ_ANNIV_NEXT         EQU     $4335
TEST_SCAN_START         EQU     $4346
FIX_SCAN_YEAR           EQU     $4371
TEST_SCAN_END           EQU     $437E
RESTORE_SCAN_YEAR       EQU     $43AE
INCREMENT_SCAN_DATE     EQU     $43B9
GET_SCAN_MONTHLEN       EQU     $43E0
DECREMENT_SCAN_DATE     EQU     $43F4
FIND_APPT_NOW           EQU     $4415
FIND_APPT_SCAN          EQU     $441B
SET_APPTFIND_SCAN       EQU     $4422
READ_APPT_NEXT          EQU     $442C
APPT_LATCH_ENTRYDATA    EQU     $4468
APPT_LATCH_ENTRYONLY    EQU     $446C
READ_APPT_PREV          EQU     $447C
FIND_APPT_ENTRY         EQU     $44C6
APPT_LATCH_ENTDYDATA    EQU     $45A5
CHECK_APPOINTMENTS      EQU     $45B9
SET_APPTFIND_NOW        EQU     $462A
READ_APPT_FIRST         EQU     $4686
READ_APPT_LAST          EQU     $469D
CHECK_APPT_TIME         EQU     $46B7
READ_APPT_PACKET1       EQU     $473A
READ_NEXT_APPT_PACKET   EQU     $4749
READ_APPT_CURRENT       EQU     $475A
PROCESS_EVENTS          EQU     $49F6
DO_ANYAPP_EVENT         EQU     $4B42
DO_NESTAPP_EVENT        EQU     $4B45
DO_APP_EVENT            EQU     $4B81
DO_NORMAL_STATE         EQU     $4BB8
TRANSITION_RBUTTON      EQU     $48fe
TRANSITION_LBUTTON      EQU     $494d
QUEUE_INDIGLO_OFF       EQU     $4992
QUEUE_INDIGLO_OFF       EQU     $49D9
NIGHTMODE_INDIGLO_ON    EQU     $49E6
INDIGLO_ON              EQU     $49EC
PROCESS_REQUESTS        EQU     $4C66
TIMER1_INTERVALS        EQU     $4de1
TIMER2_INTERVALS        EQU     $4dec
DO_EVENT                EQU     $4CA4
GETSTATE                EQU     $4CFE
GETSTATE_TAB            EQU     $4D0e
CHECK_COMPATIBLE_EVENT  EQU     $4D96
STOP_ALL_SOUND          EQU     $4E68
PREPARE_TIMER2_TIMER    EQU     $4E96
PLAY_HOURLY             EQU     $4EB1
PAUSE_WATCH             EQU     $4EC7
RESUME_WATCH            EQU     $4EDE
RESUME_UPDATE           EQU     $4EF6
ACQUIRE_TIME            EQU     $4F22
RELEASE_TIME            EQU     $4F2E
PLAY_BUTTON_SAFE        EQU     $4F46
PREPARE_NEST_CALL       EQU     $4FA0
UNPACK_PHONENUM         EQU     $4FBF
PHONE_UNPACK_VAL        EQU     $4FE0
UNPACK_STRING           EQU     $4FF0
READ_PACKET             EQU     $503E
FIND_PACKET             EQU     $5044
DO_TRANSFER             EQU     $505F
TOGGLE_ENTRYFLAG        EQU     $5077
MAKE_INST_LDA           EQU     $50B4
MAKE_INST_LDA_X         EQU     $50B8
MAKE_INST_STA           EQU     $50BC
ADD_INSTADDR            EQU     $50C7
SET_INSTADDR_0110       EQU     $50D7
GET_INST_BYTE           EQU     $50EB
WRITE_FLAG_BYTE         EQU     $510A
FILL_EXTRACTBUF         EQU     $513E
SAVE_EXTRACTBUF         EQU     $515D
SYSTEM_RESET            EQU     $519B
SND_OFF                 EQU     $5286
DO_SOUND                EQU     $5298
SET_SYS_0f_4d           EQU     $5203
SET_SYS_0f_41           EQU     $5208
ENABLE_EYE              EQU     $53A6
SERIAL_DELAY            EQU     $53B4
DISABLE_EYE             EQU     $53BD
SET_SYS_07              EQU     $53C8
CLEAR_SYS_07            EQU     $53CF
RESET_SYS_07            EQU     $53D5
INITHW_SYS_07           EQU     $53DC
SETHW_07_08_C1          EQU     $53F4
WRITE_ACQUIRE           EQU     $543C
WRITE_RELEASE           EQU     $5448
MAKE_INST2_LDA_X        EQU     $5453
MAKE_INST2_STA_X        EQU     $5457
PROM_READ               EQU     $5462
PROM_WRITE              EQU     $5488
READ_EEPROM_PORT        EQU     $54CC
PROM_STARTIO            EQU     $54D6
PROM_ACQUIRE            EQU     $54E2
PROM_RELEASE            EQU     $54EC
PROM_SHOW               EQU     $54F3
PROM_HIDE               EQU     $54F8
DO_SCROLL               EQU     $5566
DO_BLINK                EQU     $55c8
PUTDOWTOP               EQU     $5872
FMTBLANK0B              EQU     $5963
SAYHOLDTODELETE         EQU     $598a
PUT_PHONENUM            EQU     $59a2
PUTYEARMID              EQU     $59d9
CLEAR_HMONTH            EQU     $59f8
PUT_HMONTHX             EQU     $59FD
CLEAR_HDAY              EQU     $5a11
PUT_HDAYX               EQU     $5a16
FIXLEAD0                EQU     $5A2A
CLEAR_MONTH             EQU     $5a36
IPUT_MONTHX             EQU     $5a3b
CLEAR_DAY               EQU     $5a4f
IPUT_DAYX               EQU     $5a54
CLEAR_YEAR              EQU     $5a6f
IPUT_YEARX              EQU     $5a74
PUTHALFDATESEP          EQU     $5aa0
PUT_LETTERX             EQU     $5ace
PUT_HOURX               EQU     $5ad9
CLEAR_RANGE             EQU     $5793
SYSSYMVALS              EQU     $57b0
PHONE_NEXT_ENTRY        EQU     $616D
PHONE_PREV_ENTRY        EQU     $618C
PHONE_READ_CURRENT      EQU     $61A7
PHONE_SHOW_CURRENT      EQU     $61B0
PHONE_FIND_SCAN_ENTRY   EQU     $61F1
PHONE_READ_ENTRY        EQU     $622C
PHONE_READ_NEXT_ENTRY   EQU     $623D
PHONE_READ_FIRST_NEXT   EQU     $6251
UPDATE_SECONDS          EQU     $625E
ADJUST_TZ1TIME          EQU     $62d7
ADJUST_TZ2TIME          EQU     $6343
UPDATE_TZ1DISP          EQU     $63af
UPDATE_TZ2DISP          EQU     $63e6
TIME_SET_BLINKON        EQU     $6660
TIME_SET_BLINKOFF       EQU     $6664
TIME_SET_GET_TIMEPTR    EQU     $667b
TIME_SET_SHOWDISPLAY    EQU     $668a
TIME_GET_BLINKPARM      EQU     $66e5
SHOW_TIME_DISPLAY       EQU     $676A
CLEAR_PM                EQU     $6815
CLEAR_AM                EQU     $681c
SHOWNIGHT_SYM           EQU     $6840
SAY_HOLD_TO             EQU     $6855
FIX_TMAPP_DAY           EQU     $6861
TMAPP_COPYTZ1           EQU     $6881
TMAPP_COPYTZ2           EQU     $688c
GETTZNAME               EQU     $6897
GET_MONTHDAYX           EQU     $689F
GET_YEAR                EQU     $68b2
GET_HOURFORMAT          EQU     $68bb
GET_DATEFMT             EQU     $68cb
COPY_MDY                EQU     $68db
CHECK_TZ                EQU     $690e
CALC_DOW                EQU     $691c
TIME_BLINKSEL           EQU     $69A4
TIME_UPDATESEL          EQU     $69AF
TIME_SELMIN             EQU     $69ba
TIME_SELMAX             EQU     $69c5
LIST_GO_NEXT            EQU     $6A9F
LIST_GO_PREV            EQU     $6AAD
LIST_DISPLAY_CURRENT    EQU     $6ABB
CLEAR_WRISTAPPMEM       EQU     $6b1f
DELAY_X                 EQU     $6b31
DELAY_X16               EQU     $6b43
SHOWNOTE_SYM            EQU     $6C62
SHOWALARM_SYM           EQU     $6C76
ALARM_CHECK             EQU     $6BC4
ALARM_START_BLINK       EQU     $6E9D
ALARM_CALL_BLINK        EQU     $6EA4
ALARM_GET_BLINKPARM     EQU     $6EB7
ALARM_DISPLAY_CURRENT   EQU     $6EF4
ALARM_SHOW_HOURLYNOTE   EQU     $6F39
ALARM_SHOW_ALARMSYM     EQU     $6F4A
ALARM_SHOW_AMPM         EQU     $6F5B
ALARM_SHOW_TEXTCHAR     EQU     $6F7C
ALARM_FIX_HOUR          EQU     $6F88
ALARM_GET_DISPLAYHOUR   EQU     $6FA0
ALARM_SET_CURRENT       EQU     $6FBE
ALARM_SAVE_STATUS       EQU     $6FD5
ALARM_GET_TEXTOFFSET    EQU     $6FDC
ALARM_GET_DATAOFFSET    EQU     $6FE5
MASK_ALARMS             EQU     $6FF3
UNMASK_ALARMS           EQU     $7000
ANNIV_SHOW_DATE         EQU     $7184
ANNIV_SHOW_SCAN_DATE    EQU     $719F
ANNIV_SHOW_CURRENT      EQU     $71AC
SHOWREMIND_SYM          EQU     $71D6
OFFREMIND_SYM           EQU     $71EE
SAY_NO_ANN_ENTRIES      EQU     $71F5
APPT_SHOW_TIME          EQU     $73D7
APPT_SHOW_DATE          EQU     $7439
APPT_SHOW_SCAN          EQU     $7454
APPT_SHOW_CURRENT       EQU     $7461
APPT_SHOW_UPCOMING      EQU     $748E
SAY_NO_APPT_ENTRIES     EQU     $74BD
