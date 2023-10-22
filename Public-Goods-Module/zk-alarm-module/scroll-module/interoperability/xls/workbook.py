# Ability to read single sheet Excel .xls files in SocialCalc added. Developed by Mahesh Chand Sharma from SEETA (http://seeta.in) with pointers from Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# For getting involved in the development of SocialCalc on Sugar, or on any questions related to it, please e-mail at socialcalc<dot>sugar<at>seeta<dot>in. 
# For posting a feature request/bug, please use http://testtrack.seeta.in. 
# File Author - Mahesh Chand Sharma

from convert_to_scalcstring import workbook_data_to_scalc_string
from compound import return_wbk, integer, hexa
from function import read_formula
global err_value

err_value = ['']*(0x2A +1)
err_value[0x00] = '#NULL!'
err_value[0x07] = '#DIV/0!'
err_value[0x0F] = '#VALUE'
err_value[0x17] = '#REF!'
err_value[0x1D] = '#NAME?'
err_value[0x24] = '#NUM!'
err_value[0x2A] = '#N/A!'

def next_record_info():
    global ptr
    identity = hexa(wbk[ptr : ptr+2]) 
    off = ptr + 4
    size = integer(wbk[ptr+2 : ptr+4])
    ptr = ptr +4 +size
    return (identity, off, size)
def i2b(n):
    s=''
    while n>0:
        s=str(n%2)+s
        n/=2
    if len(s)<64:
        return '0'*(64-len(s))+s
    return s
def b2i(s):
    ans = 0
    p2 = 1
    for i in s[::-1]:
        ans+=p2*int(i)
        p2*=2
    return ans
def read_string(pos, len_size):
    save=pos
    ln=integer(wbk[pos:pos+len_size])
    pos+=len_size
    flag=integer(wbk[pos:pos+1])
    pos+=1
    rt = 0
    sz = 0
    if flag&8==8:
        rt = integer(wbk[pos : pos+2])
        pos+=2
    if flag&4==4:
        sz = integer(wbk[pos : pos+4])
        pos+=4
    if flag&1==1:
        s = wbk[pos:pos+2*ln:2]
        pos = pos+2*ln
    else:
        s = wbk[pos:pos+ln]
        pos = pos + ln
    pos += 4*rt
    pos += sz
    return s, pos-save
def read_index_record(off, size):
    rf = integer(wbk[off+4:off+8])
    rl = integer(wbk[off+8:off+12])
    l=[]
    for i in range(0, (size - 16) / 4):
        l.append(integer(wbk[off+16+4*i:off+16+4*(i+1)]))
    return rf, rl, l

def read_dimension_record(off, size):
    rf = integer(wbk[off:off+4])
    rl = integer(wbk[off+4:off+8])
    cf = integer(wbk[off+8:off+10])
    cl = integer(wbk[off+10:off+12])
    return rf,rl,cf,cl

def read_row_record(off, size):
    r = integer(wbk[off:off+2])
    c1 = integer(wbk[off+2:off+4])
    c2 = integer(wbk[off+4:off+6])
    return r, c1, c2

def read_dbcell_record(off, size):
    l=[]
    for i in range(0, (size-4)/2):
        l.append(integer(wbk[off+4+2*i : off+4+2*i+2]))
    return l

def read_sst_record(off, size):
    nm = integer(wbk[off+4:off+8])
    off += 8
    bytes = 0
    l=[]
    s=''
    for i in range(0, nm):
        (s, bytes) = read_string(off, 2)
        off += bytes
        l.append(s)
    return l

def read_blank_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    return r, c, '', 's'

def read_labelsst_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    j = integer(wbk[off+4 : off+6])
    fs=xf[j]
    i = integer(wbk[off+6 : off+10])
    return r, c, sst[i], 's', fs

def read_label_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    i = integer(wbk[off+4 : off+6])
    fs=xf[i]
    s, bytes = read_string(off+6, 2)
    return r, c, s, 's', fs

def read_float_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    i = integer(wbk[off+4 : off+6])
    fs=xf[i]
    fv = floating(hexa(wbk[off+6:off+14]))
    return r, c, fv, 'f', fs
def read_rk_value(val):
    change =  val & 0x00000001
    tp = val & 0x00000002
    val = val & 0xfffffffc
    if tp==0:
        val= val*2**32
        if change == 1: return float(floating(val))/100.0, 'f'
        else: return float(floating(val)), 'f'
    if tp==2:
        val=val>>2
        if val > 536870911: val = (2**30-val)*(-1)
        if change==1:
            return val/100, 'i'
        else:
            return val, 'i'
        
def read_rk_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    i = integer(wbk[off+4 : off+6])
    fs=xf[i]
    rk_val = hexa(wbk[off+6 : off+10])
    val, typ = read_rk_value(rk_val)
    if int(val) == val:
        val = int(val)
        typ = 'i'
    return r, c, str(val), typ, fs
    

def read_boolerr_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    i = integer(wbk[off+4 : off+6])
    fs=xf[i]
    typ = integer(wbk[off+7 : off+8])
    val = integer(wbk[off+6 : off+7])
    if typ == 0:            # 0 for boolean
        return r, c, bool(val), 'b', fs
    else:
        return r, c, err_value[val], 'e', fs
def read_mulrk_record(off, size):
    r = integer(wbk[off : off+2])
    fc = integer(wbk[off+2 : off+4])
    nc = (size - 6) / 6
    l = []
    for i in range(0, nc):
        j = integer(wbk[off+4+6*i : off+4+6*i+2])
        fs=xf[j]
        rk_val = integer(wbk[off + 4+6*i+2 : off+ 4+6*i+2+4])
        val, typ = read_rk_value(rk_val)
        if int(val) == val:
            val = int(val)
            typ = 'i'
        c = fc + i
        l.append( (r, c, val, typ, fs) )
    return l
        
        
def floating(n):
    s = i2b(n)
    sign = (-1)**int(s[0])
    e = b2i(s[1:12])
    f = b2i(s[12:])/2.0**52
    if e==2047 and f!=0:
        return 'NaN'
    if e==2047 and f==0 and sign==-1:
        return '-INF'
    if e==2047 and f==0 and sign==1:
        return 'INF'
    if e==0:
        return '0.0'
    return str(sign * 2**(e-1023)*(1+f))
def calc_formula_result(off, size):
    i = integer(wbk[off : off+1])
    if i == 0x01:
        return bool(integer(wbk[off+2 : off+3])), 'b'
    if i == 0x02:
        ec = integer(wbk[off+2 : off+3])
        return err_value[ec], 'e'
    if i == 0x03:
        return '', 's'
    else:
        return floating( integer(wbk[off : off+8]) ), 'f'
        
def read_formula_record(off, size):
    r = integer(wbk[off : off+2])
    c = integer(wbk[off+2 : off+4])
    i = integer(wbk[off+4 : off+6])
    fs=xf[i]
    val, typ = calc_formula_result(off+6, 8)
    formula = read_formula(wbk[off+20 : off + size])
    return r, c, val, fs, typ, formula

def read_font_record(off, size):
    h = integer(wbk[off : off+2])/20
    i=integer(wbk[off+2 : off+4])
    bold = ((i & 0x0001)==1)
    italic = ((i & 0x0002)==2)
    underlined = ((i & 0x0004)==4)
    return int(bold), int(italic), int(underlined), h


def read_xf_record(off, size):
    ans=''
    i=integer(wbk[off : off+2])
    (b, it, u, h) = fonts[i]
    ans+=str(b)
    ans+=str(it)
    ans+=str(u)
    i=integer(wbk[off+6 : off+7])
    n = i & 0x07
    if n==2:
        ans+='10'  # center
    elif n==3:
        ans+='11'   # right
    else:
        ans+='01'    #left
    n = (i & 0x70)/16
    if n==1:   
        ans+='10' #center
    elif n==2:
        ans+='11' # bottom
    else:
        ans+='01'  # top
    n = (i & 0x08)/8
    ans+=str(n) # 1 for word wrap
    return ans, h

def read_defcol_record(off, size):
    return integer(wbk[off:off+2])

def read_colinfo_record(off, size):
    cf = integer(wbk[off : off+2])
    cl = integer(wbk[off+2 : off+4])
    w = integer(wbk[off+4 : off+6])/256 + 1
    return cf, cl, w

def read_standardwidth_record(off, size):
    return integer(wbk[off:off+2])/16 + 1 

def bin2data(s):
    global wbk, ptr, fonts, xf
    wbk = return_wbk(s)
    ptr=0
    if wbk == 'file not in correct format':
        return wbk

    # reading the workbook global substream
    (f, off, size) = next_record_info()# BOF record
#####################################################
    while f != 0x0031: # reaching to FONT Records
        (f, off, size) = next_record_info()
    fonts=[]
    while f == 0x0031:   # reading font records
        tpl=read_font_record(off, size)
        fonts.append(tpl)
        if len(fonts)==4:   # since font with index 4 has been ommited 
            fonts.append((0, 0, 0, 0)) # by excel :)
        (f, off, size) = next_record_info()
        
    while f != 0x00E0:   # reaching to XF record 
        (f, off, size) = next_record_info()
    xf=[]
    while f == 0x00E0:   # reading XF records
        fs = read_xf_record(off, size) # fn is formatting no. 
        xf.append(fs)
        (f, off, size) = next_record_info()
#####################################################    
    while f != 0x0085:   #reaching to SHEET Records
        (f, off, size) = next_record_info()
    
    sheets = []  # contains the info of all the worksheets
    while f == 0x0085:   #reading the SHEET records
        record = wbk[off : off+size]

        pos = integer(record[:4])
        sheet_type = integer(record[5:6]);
        (name, bytes) = read_string(off + 6, 1)
        if sheet_type==0:                          # sheettype 0 for workssheet
            sheets.append((pos, sheet_type, name))  
        (f, off, size) = next_record_info()
    #building the SST shared string table
    while f != 0x00FC:     #reaching to SST record
        (f, off, size) = next_record_info()
    global sst
    sst = []  # list of used strings
    sst = read_sst_record(off, size)
    workbook_data=[]
    workbook_col_widths=[]
    for sheet in sheets:
        ptr = sheet[0]   # offset of 1st worksheet
        sheet_name = sheet[2]

        next_record_info() # skipping the BOF record
        (f, off, size) = next_record_info()
        if f == 0x020B:   # INDEX record
            (rf, rl, dbcell_posns) = read_index_record(off, size)
###################################################
        colinfo=[]
        def_width = 0
        standard_width = 0
        while f != 0x0200:  #reaching to DIMENSION record
            if f==0x0055:    #reading DEFCOLWIDTH
                def_width = read_defcol_record(off, size)
            if f==0x007D:    #reading COLINFO record
                cnf = read_colinfo_record(off, size)
                colinfo.append( cnf )
            (f, off, size) = next_record_info()
#####################################################
        rf,rl,cf,cl = read_dimension_record(off, size)
        if (rl-rf)%32==0: row_block_count = (rl-rf)/32
        else: row_block_count = int((rl-rf)/32)+1

        if row_block_count == 0: # sheet is empty 
            continue  

        #reading the data now
        sheet_data = [[()]*cl]*rl  # empty database
        for i in range(0, row_block_count):
            (f, off, size) = next_record_info()
            while f == 0x0208:
                (f, off, size) = next_record_info() # skipping the ROW record
        
            while f != 0x00D7: # f==0x00D7 for DBCELL record
                if f == 0x0205:
                    x, y, val, typ, fs = read_boolerr_record(off, size)
                elif f == 0x0204:
                    x, y, val, typ, fs = read_label_record(off, size)
                elif f == 0x00FD:
                    x, y, val, typ, fs = read_labelsst_record(off, size)
                elif f == 0x0203:
                    x, y, val, typ, fs = read_float_record(off, size)

                elif f == 0x027E:
                    x, y, val, typ, fs = read_rk_record(off, size)

                elif f == 0x0006: # formula record
                    x, y, val, fs, typ, formula= read_formula_record(off, size)
                    buf = list(sheet_data[x])
                    buf[y] = (val, 'for', fs, typ, formula)
                    sheet_data[x] = buf
                    (f, off, size) = next_record_info()
                    continue
                elif f == 0x00BD:
                    mul_cell_data = read_mulrk_record(off, size) # list of tuples
                    for tple in mul_cell_data:
                        x, y, val, typ, fs = tple
                        buf = list(sheet_data[x])
                        buf[y] = (val, typ, fs)
                        sheet_data[x] = buf
                    (f, off, size) = next_record_info()
                    continue
                else:
                    (f, off, size) = next_record_info()
                    continue
                
                buf = list(sheet_data[x])
                buf[y] = (val, typ, fs)
                sheet_data[x] = buf
                (f, off, size) = next_record_info()

        workbook_data.append(sheet_data)
#########################################################
        while f != 0x000A: # 000A for EOF record
            if f==0x0099:  # standardwidth record
                standard_width = read_standardwidth_record(off, size)
            (f, off, size) = next_record_info()

        col_widths = [0]*cl
        for tpl in colinfo:
            for j in range(tpl[0], tpl[1]+1):
                col_widths[j] = tpl[2]
        if standard_width!=0:
            default = standard_width
        else:
            default = def_width
        for j in range(0, cl):
            if col_widths[j] == 0:
                col_widths[j]=default
                
    workbook_col_widths.append(col_widths)
###########################################################    
    return workbook_data_to_scalc_string(workbook_data, workbook_col_widths,0)



#f=open('test.xls', 'rb')
#s=f.read()
#workbook_data = bin2data(s)
############### END OF CODE #############################
# NOW THE WORKBOOK_DATA CONTAINS THE DATA OF ALL THE SHEETS
# IT IS A 3D LIST OF DATA (ROW*COL*SHEET) and each cell has two
#fields (value, type) 
# WE CAN CHECK IT-
#for sheet_data in workbook_data:
#    for row_data in sheet_data:
#        print row_data
#    print '\n\n'
    
# NOW THIS DATA CAN BE USED TO LOAD TO THE SOCIALCALC
