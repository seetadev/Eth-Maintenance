# Ability to read single sheet Excel .xls files in SocialCalc added. Developed by Mahesh Chand Sharma from SEETA (http://seeta.in) with pointers from Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# For getting involved in the development of SocialCalc on Sugar, or on any questions related to it, please e-mail at socialcalc<dot>sugar<at>seeta<dot>in. 
# For posting a feature request/bug, please use http://testtrack.seeta.in. 
# File Author - Mahesh Chand Sharma


from sugar3.activity import activity
from compound import integer, hexa
global err_value
err_value = ['']*(0x2A +1)
err_value[0x00] = '#NULL!'
err_value[0x07] = '#DIV/0!'
err_value[0x0F] = '#VALUE'
err_value[0x17] = '#REF!'
err_value[0x1D] = '#NAME?'
err_value[0x24] = '#NUM!'
err_value[0x2A] = '#N/A!'
def read_string(wbk, pos, len_size):
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
        w = wbk[pos:pos+2*ln:2]
        pos = pos+2*ln
    else:
        w = wbk[pos:pos+ln]
        pos = pos + ln
    pos += 4*rt
    pos += sz
    return w, pos - save
def i2b(n):
    w=''
    while n>0:
        w=str(n%2)+w
        n/=2
    if len(w)<64:
        return '0'*(64-len(w))+w
    return w
def b2i(w):
    ans = 0
    p2 = 1
    for i in w[::-1]:
        ans+=p2*int(i)
        p2*=2
    return ans
def get_label(n):
    if n<26:
        return chr(n%26+65)
    return chr(n/26-1+65)+chr(n%26+65)
def floating(n):
    w = i2b(n)
    sign = (-1)**int(w[0])
    e = b2i(w[1:12])
    f = b2i(w[12:])/2.0**52
    if e==2047 and f!=0:
        return 'NaN'
    if e==2047 and f==0 and sign==-1:
        return '-INF'
    if e==2047 and f==0 and sign==1:
        return 'INF'
    if e==0:
        return '0.0'
    return str(sign * 2**(e-1023)*(1+f))
def read_cell_address(w):
    r=str(1+integer(w[:2]))
    i=(integer(w[2:]))&0x00FF
    c =get_label(i)
    return c + r
def read_cellrange_address(w):
    r1= str(1+integer(w[:2]))
    r2= str(1+integer(w[2:4]))
    i= (integer(w[4:6])) & 0x00FF
    c1= get_label(i)
    i= (integer(w[6:8])) & 0x00FF
    c2= get_label(i)
    return c1+r1+ ':' +c2+r2
def skip_attr(s, pos): # tAttr token: this token has many different tokens
    t = integer(s[pos+1]) # tAttrChoose token ,# IF control, choose, skip etc
    if t == 0x04:      
        nc=integer(s[pos+2:pos+4])
        return nc*2 + 6 ,t
    return 4, t                      
    
def read_additional(s, pos, tid):
    ans=''
    np=pos
    if tid == 0x20 or tid == 0x40 or tid == 0x60:
        ans+='{'
        nc= integer(s[pos])+1
        nr= integer(s[pos+1:pos+3])+1
        np+=3
        for i in range(0, nr):
            for j in range(0, nc):
               if integer(s[np])==0x00: # empty
                   ans += ','
                   np += 9
               elif integer(s[np])==0x01: # float
                   ans += str(floating(hexa(s[np+1:np+9])))+','
                   np+=9
               elif integer(s[np])==0x02:  # string
                   st,bytes = read_string(s, np+1, 2)
                   ans+= '"' + st + '"' + ','
                   np+=1+bytes
               elif integer(s[np])==0x04:  # boolean
                   if integer(s[np+1])==1:
                       ans+='TRUE,'
                   else:
                       ans+='FALSE,'
                   np+=9
               elif integer(s[np])==0x10:   # error value
                   ans+=err_value[integer(s[np+1])]+','
                   np+=9
               else:
                   pass
            ans=ans[:len(ans)-1]+';'
        ans=ans[:len(ans)-1]+'}'
        return ans, np-pos
    return '', 0
    
                    
global fn_list
fn_list=['']*368
fp=open(activity.get_bundle_path()+'/interoperability/xls/function.txt','r')
for i in range(0, 249):
    s = fp.readline()
    l=s.split()
    if l[2]==l[3]:
        arg = int(l[2])
    else:
        arg = -1
    fn_list[int(l[0])] = l[1], arg
    
token_list=['','','','+','-','*','/','^','&','<','<=','=','>=','>']
token_list+=['<>', ' ', ',' ,':', 'u-', 'u+','%', '()', '']
def read_formula(s):
    rpn=[] # rpn array
    add_list=[]
    size=integer(s[:2])
    pos = 2
    while pos != 2+size:
        tid = integer(s[pos])
        if tid>=0x00 and tid<=0x02: return 'UNKNOWN'
        
        elif tid>=0x03 and tid<=0x16:
            rpn+=[token_list[tid]]
            pos+=1
        elif tid==0x17:  # string
            st, bytes = read_string(s, pos+1, 1)
            pos=pos+1+bytes
            rpn+=['"'+st+'"']
        elif tid==0x1C: # error value
            er=err_value[integer(s[pos+1])]
            rpn+=[er]
            pos+=2
        elif tid==0x1D:  # bool
            nt=integer(s[pos+1])
            if nt==0: rpn+=['FALSE']
            else: rpn+=['TRUE']
            pos+=2
        elif tid==0x1E: # integer
            rpn+=[str(integer(s[pos+1:pos+3]))]
            pos+=3
        elif tid==0x1F:  # float
            fv = floating(hexa(s[pos+1:pos+9]))
            pos+=9
            rpn+=[str(fv)]
        elif tid==0x21 or tid==0x41 or tid==0x61: # const argc function name
            ( fn, argc )= fn_list[integer(s[pos+1:pos+3])]
            rpn+=[(fn, argc)]
            pos+=3
        elif tid==0x22 or tid==0x42 or tid==0x62: # variable argc function name
            try:
                fn, argc = fn_list[integer(s[pos+2:pos+4])]
            except:
                return 'UNKNOWN'
            argc=integer(s[pos+1])
            rpn+=[(fn, argc)]
            pos+=4
        elif tid == 0x24 or tid==0x44 or tid==0x64: # tRef
            rpn+=[read_cell_address(s[pos+1:pos+5])]
            pos+=5
        elif tid == 0x25 or tid==0x45 or tid==0x65:   # tArea
            rpn+=[read_cellrange_address(s[pos+1:pos+9])]
            pos+=9
        elif tid == 0x20 or tid == 0x40 or tid == 0x60: # tArray
            add_list+=[ (len(rpn), tid) ]
            pos+=8
        elif tid == 0x26 or tid == 0x46 or tid == 0x66:
            pos+=7
        elif tid == 0x19:
            bytes, t = skip_attr(s, pos)
            pos += bytes
            if t==0x10:
                rpn+=[('SUM', 1)] # tAttrSum replaces the tFuncVar token here
        else:
            return 'UNKNOWN' # has to take care of some other tokens too

    for i in range(0, len(add_list)): # additional data
        index, tid = add_list[i]
        dt, bytes = read_additional(s, pos, tid)
        pos+=bytes
        rpn.insert(index, dt)
             
    l=len(rpn)
    stk=[]
    for i in range(0,l): # converting RPN to formula using stack
        if rpn[i] in token_list[:18]:
            t2=stk.pop()
            t1=stk.pop()
            stk+=[t1+rpn[i]+t2]
        elif rpn[i]=='u+' or rpn[i]=='u-':
            t1=stk.pop()
            ch=rpn[i]
            stk+=[ch[1]+t1]
        elif rpn[i]=='%':
            t1=stk.pop()
            stk+=[t1+'%']
        elif rpn[i]=='()':
            t1=stk.pop()
            stk+=['('+t1+')']
        elif type(rpn[i])==tuple:
            fname, argc = rpn[i]
            fnstr=')'
            for j in range(0, argc):
                fnstr=',' + stk.pop() + fnstr
            if argc != 0:
                fnstr=fnstr[1:]
            fnstr= fname+'('+fnstr
            stk+=[fnstr]
        else:
            stk+=[rpn[i]]
    return stk[0]



