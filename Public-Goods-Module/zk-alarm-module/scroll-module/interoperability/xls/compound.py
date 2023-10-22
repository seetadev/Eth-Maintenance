#from os import abort
def hexa(s):  # return the hexadecimal euvalent of sring 
    p=1
    ans=0
    for c in s:
        ans=ans+p*ord(c)
        p*=256
    return ans
def integer(s): # return the integer eqvalent in big-endian signed format
    p=1
    ans=0
    for c in s:
        ans=ans+p*ord(c)
        p*=256
    if ord(s[-1])<=0x7f:return ans
    return int(-1*((256**len(s))-ans))

def offset(sid, sec_size):
    return 512 + sec_size*sid  # 512 header size

def readname(st):
    b=integer(st[64:66]) - 2
    return st[:b:2]

def soffset(sid, short_sec_size):
    return short_sec_size*sid

def return_wbk(s):
    if hexa(s[:8])!=0xe11ab1a1e011cfd0:     # unique indentifier for CDFF
        return 'file not in correct format' 

    # reading the header
    sec_size = 2**integer(s[30:32]) # typically 512
    short_sec_size = 2**integer(s[32:34]) # typiclly 64
    sat_sectors = integer(s[44 : 48])
    dir_secid = integer(s[48 : 52])
    standard_strm_size = integer(s[56 : 60])
    ssat_secid = integer(s[60 : 64])
    ssat_sectors=integer(s[64 : 68])
    msat_secid = integer(s[68 : 72])
    msat_sectors = integer(s[72 : 76])
    init_msat = s[76 : 512]


    # building MSAT
    msat=[]
    for i in range(0, 436, 4):
        msat+=[integer(init_msat[i : i+4])]
    for i in range(0, msat_sectors):
        t=offset(msat_secid, sec_size)
        sec=s[t : t+sec_size]
        for j in range(0, sec_size-4, 4):
            msat+=[integer(sec[j : j+4])]
        msat_secid=integer(sec[508 : 512])
    
    #building SAT
    sat=[]
    for i in range (0, sat_sectors):
        t = offset(msat[i], sec_size)
        sec = s[t : t+sec_size]
        for j in range(0, sec_size, 4):
            sat+=[integer(sec[j : j+4])]


    #building SSAT
    ssat=[]
    for i in range (0, ssat_sectors):
        t = offset(ssat_secid, sec_size)
        if t==-2:break
        sec = s[t : t+sec_size]
        for j in range(0, sec_size, 4):
            ssat+=[integer(sec[j : j+4])]
        ssat_secid=sat[ssat_secid]


    # building directory stream
    dir_stream=''  # size of this stream is stored in root entry
    while dir_secid!=-2:
        t = offset(dir_secid, sec_size)
        dir_stream += s[t : t+sec_size]
        dir_secid=sat[dir_secid]



    # reading dir_stream


     # (1) reading root storage entry, only data of use is scaned
    rootname_len=integer(dir_stream[64:66])
    rootname = dir_stream[:rootname_len]
    rootnode_dirid =  integer(dir_stream[76 : 80])
    sstream_container_secid = integer(dir_stream[116 : 120])
    sstream_size = integer(dir_stream[120 : 124])
     
    sstream_container=''   #building short sector stream container
    while sstream_container_secid!=-2:
        t=offset(sstream_container_secid, sec_size)
        sstream_container += s[t : t+ sec_size]
        sstream_container_secid=sat[sstream_container_secid]
    
     # (2) Reaching to workbook directory
    dir_entry_count = len(dir_stream)/128
    for i in range(1, dir_entry_count):
        dir_entry = dir_stream[i*128 : (i+1)*128]
        if readname(dir_entry) == 'Workbook':
            wbk_entry = dir_entry
            break
    
      # (3) Reading the workbook entry
    wbk_size = integer(wbk_entry[120 : 124])
    sec_id = integer(wbk_entry[116 : 120])
    wbk = ''
    if wbk_size < standard_strm_size: # wbk is saved in short stream container
        while sec_id != -2:
            t = soffset(sec_id, short_sec_size)
            wbk += sstream_container[t : t + short_sec_size]
            sec_id = ssat[sec_id]

    else:
        while sec_id != -2:
            t = offset(sec_id, sec_size)
            wbk += s[t : t + sec_size]
            sec_id = sat[sec_id]
    return wbk

 # wbk is the user stresm (workbook

