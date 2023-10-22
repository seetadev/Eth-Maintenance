import struct
# Ability to read single sheet Lotus .wk4 files in SocialCalc added. Developed by Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# For getting involved in the development of SocialCalc on Sugar, or on any questions related to it, please e-mail at socialcalc<dot>sugar<at>seeta<dot>in. 
# For posting a feature request/bug, please use http://testtrack.seeta.in. 
# File Author - Vijit Singh

def col_no_to_alphabet(no):

    alpha_1=chr(ord('A')+(no/26)-1)
    alpha_0=chr(ord('A')+(no%26))

    #print 'no received is',no

    if no/26==0:
        return alpha_0

    else:
        return alpha_1+alpha_0
    
    

    
    

def wk4_to_scalc(byte_string):
    i=0  # pointer to the character to be read
    l=len(byte_string)  # length of the byte array
   # print byte_string

   #### Creating the strings to be sent back as result- converted strings######

    result_string=''   # main string
    sheet_string=''## I think this string contains the values of various cells and it is what is loaded into the spreadsheet
    edit_string=''  ## This string tells the positions(parts) of spreadsheet which are visible at the time of saving, I mean the cell at which mouse was there et al
    audit_string='' ## it contains the actions which were taken, it is req. to maintain undo stack, not sure whether req at this juncture, still adding....
                    ## ....becoz don't know whether spreadsheet can be loaded without it or not.
    multipartBoundary_string="SocialCalcSpreadsheetControlSave"

   #### Initiating some of these strings######
    sheet_string+='version:1.5\n'


   #### Some constants which will be used during string preparation######
    add_center_string_flag=False    ## These 2 flags take care whether we should add the following string cellformat:2:right or cellformat:1:middle in the
    add_right_string_flag=False    ## sheet_string, we might not require them over the time, and might just add these strings everytime.

    max_col=0     ## Takes care of the max. value of row and col till which sheet is there, max dimensions of the sheet
    max_row=0

    while(i<l):

        #read instantly the header on the basis of the value of i
        header=byte_string[i:i+4]

        #type
        record_type=header[0:2]
       # print record_type
      #  print 'should be equal to',"\x16\x00"
        
        #length
        record_length=header[2:4]
        r_length=struct.unpack("i",record_length[0:2]+"\x00\x00")   # converting it to int value
        r_length=r_length[0]
        
        i=i+4

        #fetching the record body and incrementing i
        record_body=byte_string[i:i+r_length]        # as r_length is a tuple

        i=i+r_length



 ######### Starting the switch cases- if elif in python to test the record_type and take appropriate actions##############

    ## testing it for BOF
        if record_type=="\x00\x00":        ## NOTE: not doing anything for now, will take steps when complexity will inc
            #print 'it is BOF and the length is   ',r_length
            
            ## To decode the max dimensions of the sheet
            if max_row==0:    # so that we are not setting it again when bof is encountered again, might also check the length instead
                max_row=(struct.unpack("i",record_body[8]+record_body[9]+"\x00\x00")[0])+1    ## it reverses on its own
                max_col=struct.unpack("i",record_body[11:12]+"\x00\x00\x00")[0]
                max_col=col_no_to_alphabet(max_col)
                
                pass

    ## testing it for TREAL nos.
        elif record_type=="\x17\x00":

            #print 'in real no test, should be equal to',"\x16\x00"

            # To deode row and column

            row=struct.unpack("i",record_body[0:2]+"\x00\x00")[0]
            row=row+1   # as row starts from 1 but it returns according to index 0 , so to compensate
            worksheet=struct.unpack("i",record_body[2:3]+"\x00\x00\x00")[0]
            if worksheet>0:      # NOTE: Decodes only the first spreadsheet in case multiple worksheets are present; need to find a proper solution for this
                break
            col=struct.unpack("i",record_body[3:4]+"\x00\x00\x00")[0]
            col_alphabetical=col_no_to_alphabet(col)
            
            #print "row ",row,"worksheet ",worksheet,"col ",col

            record_body=record_body[4:len(record_body)]
            
            
            record_body=record_body[::-1]     ## reverse the hex string leaving each byte intact
            
            exponent=struct.unpack("i",record_body[1:2]+record_body[0:1]+"\x00\x00")
            exponent=exponent[0]
            #print "exponent is",exponent
            sign=exponent & 32768    ## because 0x8000= 32768 ## getting the sign bit
            exponent=exponent & 32767

            mantissa1=struct.unpack("i",record_body[3:4]+record_body[2:3]+"\x00\x00")
            mantissa2=struct.unpack("i",record_body[5:6]+record_body[4:5]+"\x00\x00")
            mantissa3=struct.unpack("i",record_body[7:8]+record_body[6:7]+"\x00\x00")
            mantissa4=struct.unpack("i",record_body[9:10]+record_body[8:9]+"\x00\x00")
            mantissa1=mantissa1[0]
            mantissa2=mantissa2[0]
            mantissa3=mantissa3[0]
            mantissa4=mantissa4[0]
##            print 'man1=',mantissa1
##            print 'man2=',mantissa2
            

            mantissa_value=1.0
            mantissa1=mantissa1<<1   # to remove the not needed 1st one
            #mantissa1>>1

            for j in range(1,15):
                #print "mantissa is ",mantissa1<<1
                #print
                
                bit=(mantissa1)&32768
                mantissa1=mantissa1<<1
##                print 'bit is',bit
                if bit==32768:
                   # print 'in mantissa addn'
                   # print (1.0/pow(2,j))
                    mantissa_value+=(1.0/pow(2,j))
                                     
            
            for j in range(1,16):
                
                bit=(mantissa2)&32768
                mantissa2=mantissa2<<1
##                print 'bit is',bit
                if bit==32768:
                    mantissa_value+=(1.0/pow(2,15+j))    ## As, the distance should be more now

            for j in range(1,16):
                bit=(mantissa3)&32768
                mantissa3=mantissa3<<1
##                print 'bit is',bit
                if bit==32768:
                    mantissa_value+=(1.0/pow(2,31+j))    ## As, the distance should be more now

            for j in range(1,16):
                bit=(mantissa4)&32768
                mantissa4=mantissa4<<1
##                print 'bit is',bit
                if bit==32768:
                    mantissa_value+=(1.0/pow(2,47+j))    ## As, the distance should be more now

           # print mantissa_value
            # Calculating the value of the TREAL number
            #print "sign ",pow(-1,sign)," exp ",pow(2,(exponent-16383))," manti ",mantissa_value
            treal_no=pow(-1,sign)*pow(2,(exponent-16383))*(mantissa_value)


        ############################ Saving the no and its coordinates in the string format#######################################
            #### The format for sheet string would be cell:A1:v:1 ,i.e. cell:colrow:v:value_at_that_cell
            #### The format for audit string would be set AB24 value n 333.9898989, i.e. set colrow value n value_at_that_cell

            sheet_string+='cell:'+str(col_alphabetical)+str(row)+':v:'+str(treal_no)+'\n'
            audit_string+='set '+str(col_alphabetical)+str(row)+' value n '+str(treal_no)+'\n'

            #print "  no is   ",treal_no,"  present at : row ",row,"worksheet ",worksheet,"col ",col

 ### for testing labels (strings)
        elif record_type=="\x16\x00":

            # To deode row and column

            row=struct.unpack("i",record_body[0:2]+"\x00\x00")[0]
            row=row+1   # as row starts from 1 but it returns according to index 0 , so to compensate
            worksheet=struct.unpack("i",record_body[2:3]+"\x00\x00\x00")[0]
            if worksheet>0:
                break
            col=struct.unpack("i",record_body[3:4]+"\x00\x00\x00")[0]
            col_alphabetical=col_no_to_alphabet(col)
            #print "row ",row,"worksheet ",worksheet,"col ",col

            record_body=record_body[4:len(record_body)]

            ## justification
            #print "just as such is   ",record_body[0]
            justification=ord(record_body[0])

            ##label
#            label=record_body[1:len(record_body)]    ## NOTE: using this assignment will transfer the hex-string itself to the browser to display. In case,
                                                     ##      browser gives error to display it , comment this line and uncomment the loop below
            label=''
            for j in range(1,len(record_body)-1):    ## seems to be needed. 
                
                c=chr(ord(record_body[j]))
                if c==':':           # IMP: because these strings are used in javascript part of socialcalc for other purposes
                    c='\c'
                elif c=='\\':
                    c='\\b'     ## NOTE: made changes here according to .xls, just in case lotus interoperability shows some kind of problem, reverse this change
                elif c=='\n':
                    c='\\n'
                label+=c

        ############################ Saving the no and its coordinates in the string format#######################################
            #### The format for sheet string would be cell:A1:v:1 ,i.e. cell:colrow:v:value_at_that_cell
            #### The format for audit string would be set AB24 value n 333.9898989, i.e. set colrow value n value_at_that_cell

            sheet_string+='cell:'+str(col_alphabetical)+str(row)+':t:'+label
            if justification=="'":
                sheet_string+='\n'
            elif justification=='^':
                sheet_string+=':cf:1\n'
                audit_string+='set '+str(col_alphabetical)+str(row)+' cellformat center'+'\n'   # this line is added afterwards, so incase the code creates some problem , check this line
                add_center_string_flag=True
            elif justification=='"':
                sheet_string+=':cf:2\n'
                audit_string+='set '+str(col_alphabetical)+str(row)+' cellformat right'+'\n'     # this line is added afterwards, so incase the code creates some problem , check this line

                add_right_string_flag=True
            else :
                sheet_string+='\n'
            audit_string+='set '+str(col_alphabetical)+str(row)+' value t '+label+'\n'

            #print "just ",justification,"  label  ",label, " present at : row ",row,"worksheet ",worksheet,"col ",col



    ###### Finalizing the strings before returning#########
    sheet_string+='sheet:c:'+str(max_col)+':r:'+str(max_row)+'\n'
    if add_center_string_flag:
        sheet_string+='cellformat:1:center\n'
    if add_right_string_flag:
        sheet_string+='cellformat:2:right\n'

    ## This edit_string is made like this just for now, over the time, atleast the sort thing would be needed to be dynamically assigned.
    ## The colpane, ecell and rowpane, need not be changed because, it tells when to keep the focus when restarted, and we don't have any such requirements.
    
    edit_string='version:1.0\nrowpane:0:1:26\ncolpane:0:1:10\necell:A4\nsort::-1:up::::\ngraph:range:undefined:type::minmax:undefined,undefined,undefined,undefined'

    result_string+="socialcalc:version:1.0\n" + "MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary="+multipartBoundary_string+ "\n" +\
    "--" + multipartBoundary_string + "\nContent-type: text/plain; charset=UTF-8\n\n" +\
      "# SocialCalc Spreadsheet Control Save\nversion:1.0\npart:sheet\npart:edit\npart:audit\n" +\
      "--" + multipartBoundary_string + "\nContent-type: text/plain; charset=UTF-8\n\n" +\
      sheet_string +\
      "--" + multipartBoundary_string + "\nContent-type: text/plain; charset=UTF-8\n\n" +\
      edit_string +\
      "--" + multipartBoundary_string + "\nContent-type: text/plain; charset=UTF-8\n\n" +\
      audit_string +\
      "--" + multipartBoundary_string + "--\n"

    return result_string






######## For debugging and testing purposes only, the following code should be commented when using in sync with the socialcalc code#############
            
           
def main():
    a="\x17\x00\x0e\x00\x2f\x00\x01\x01\x84\x12\x64\x1b\x7b\xf4\x06\xca\x05\x40\x16\x00\x0d\x00\x2f\x00\x01\x01\x27\x20\x42\x41\x53\x4b\x45\x54\x00"
    #a="\x17\x00\x0a\x00\xcb\xa1\x45\xb6\xf3\x7d\x9c\xad\x0c\x40"
    #f=open('check5.wk4','rb')
    #a=f.read()
    s=wk4_to_scalc(a)
    print s
    #f.close()
    #print "no is", no


#main()
                                    
            

            
            
