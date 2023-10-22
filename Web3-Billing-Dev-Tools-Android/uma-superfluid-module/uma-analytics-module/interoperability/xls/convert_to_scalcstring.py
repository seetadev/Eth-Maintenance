# Ability to read single sheet Excel .xls files in SocialCalc added. Developed by Mahesh Chand Sharma from SEETA (http://seeta.in) with pointers from Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# For getting involved in the development of SocialCalc on Sugar, or on any questions related to it, please e-mail at socialcalc<dot>sugar<at>seeta<dot>in. 
#For posting a feature request/bug, please use http://testtrack.seeta.in. 
# File Author - Vijit Singh


#### Creating the strings to be sent back as result- converted strings######

result_string=''   # main string
sheet_string=''## I think this string contains the values of various cells and it is what is loaded into the spreadsheet
edit_string=''  ## This string tells the positions(parts) of spreadsheet which are visible at the time of saving, I mean the cell at which mouse was there et al
audit_string='' ## it contains the actions which were taken, it is req. to maintain undo stack, not sure whether req at this juncture, still adding....
                                ## ....becoz don't know whether spreadsheet can be loaded without it or not.
multipartBoundary_string="SocialCalcSpreadsheetControlSave"


# dictionaries and list for maintianig the format_order and which of the formats are to be included
font_align={}
font_align_sorted=[]
ver_align={'bottom':0,'middle':0,'top':0}
ver_align_sorted=[]
hor_align={'center':0,'left':0,'right':0}
hor_align_sorted=[]

def col_no_to_alphabet(no):

    alpha_1=chr(ord('A')+(no/26)-1)
    alpha_0=chr(ord('A')+(no%26))

    #print 'no received is',no

    if no/26==0:
        return alpha_0

    else:
        return alpha_1+alpha_0


def add_cell_format(format_info,font_size,r,col_alphabetical):

    global sheet_string
    global audit_string

    font_family='' # NULL for now will take the value accordingly when code would be written for it

    font_changed=False
    if font_size!=10:
        font_changed=True
    if font_size==26:
        font_size=24

    

    # checking vertical alignment
    vert_align_chars=format_info[5:7]
    if vert_align_chars!='00':
        if vert_align_chars=='01':  # top
            if ver_align['top']==0:
                local_len=len(ver_align_sorted)
                ver_align_sorted.append('top')
                local_len+=1
                ver_align['top']=local_len

            sheet_string+=':l:'+str(ver_align['top'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' layout padding:* * * *;vertical-align:top;'+'\n'

        elif vert_align_chars=='10':  # middle
            if ver_align['middle']==0:
                local_len=len(ver_align_sorted)
                ver_align_sorted.append('middle')
                local_len+=1
                ver_align['middle']=local_len

            sheet_string+=':l:'+str(ver_align['middle'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' layout padding:* * * *;vertical-align:middle;'+'\n'

        elif vert_align_chars=='11':  # bottom
            if ver_align['bottom']==0:
                local_len=len(ver_align_sorted)
                ver_align_sorted.append('bottom')
                local_len+=1
                ver_align['bottom']=local_len

            sheet_string+=':l:'+str(ver_align['bottom'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' layout padding:* * * *;vertical-align:bottom;'+'\n'


    # checking font
    font_chars=format_info[0:2]   # 0th for bold and 1st for italic
    if font_chars!='00': # normal font_type

        font_string=make_font_string(font_family,'',font_size)
        if font_string not in font_align:
            local_len=len(font_align_sorted)
            font_align_sorted.append(font_string)
            local_len+=1
            font_align[font_string]=local_len

        sheet_string+=':f:'+str(font_align[font_string])
        audit_string+='set '+str(col_alphabetical)+str(r+1)+' font '+font_string+'\n'
        
    if font_chars=='01':  # italic
        
        font_string=make_font_string(font_family,'italic normal',font_size)
        if font_string not in font_align:
            local_len=len(font_align_sorted)
            font_align_sorted.append(font_string)
            local_len+=1
            font_align[font_string]=local_len

        sheet_string+=':f:'+str(font_align[font_string])
        audit_string+='set '+str(col_alphabetical)+str(r+1)+' font '+font_string+'\n'

    elif font_chars=='10':  # bold
        font_string=make_font_string(font_family,'normal bold',font_size)
        if font_string not in font_align:
            local_len=len(font_align_sorted)
            font_align_sorted.append(font_string)
            local_len+=1
            font_align[font_string]=local_len

        sheet_string+=':f:'+str(font_align[font_string])
        audit_string+='set '+str(col_alphabetical)+str(r+1)+' font '+font_string+'\n'


    elif font_chars=='11':  # italic bold
        font_string=make_font_string(font_family,'italic bold',font_size)
        if font_string not in font_align:
            local_len=len(font_align_sorted)
            font_align_sorted.append(font_string)
            local_len+=1
            font_align[font_string]=local_len

        sheet_string+=':f:'+str(font_align[font_string])
        audit_string+='set '+str(col_alphabetical)+str(r+1)+' font '+font_string+'\n'


    # checking horizontal alignment
    hor_align_chars=format_info[3:5]   # 01 for left, 10 for center and 11 for right
    if hor_align_chars!='00':     
        if hor_align_chars=='01':  # left
            if hor_align['left']==0:
                local_len=len(hor_align_sorted)
                hor_align_sorted.append('left')
                local_len+=1
                hor_align['left']=local_len

            sheet_string+=':cf:'+str(hor_align['left'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' cellformat left'+'\n'

        elif hor_align_chars=='10':  # center
            if hor_align['center']==0:
                local_len=len(hor_align_sorted)
                hor_align_sorted.append('center')
                local_len+=1
                hor_align['center']=local_len

            sheet_string+=':cf:'+str(hor_align['center'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' cellformat center'+'\n'

        elif hor_align_chars=='11':  # right
            if hor_align['right']==0:
                local_len=len(hor_align_sorted)
                hor_align_sorted.append('right')
                local_len+=1
                hor_align['right']=local_len

            sheet_string+=':cf:'+str(hor_align['right'])
            audit_string+='set '+str(col_alphabetical)+str(r+1)+' cellformat right'+'\n'


def make_font_string(font_family,font_type,font_size):
    font_string=''
    if font_type=='':
        font_string+='* '
    else:
        font_string+=font_type+' '

    if font_size==10:
        font_string+='* '
    else:
        font_string+=str(font_size)+'pt '

    if font_family=='':
        font_string+='*'
    else:
        font_string+=font_family

    return font_string
    

def add_cell_format_abbr():

    global sheet_string
    global audit_string

    # adding abbreviations for horizontal alignment
    for i in range(len(hor_align_sorted)):
        sheet_string+='cellformat:'+str(i+1)+':'+hor_align_sorted[i]+'\n'

        # adding abbreviations for font
    for i in range(len(font_align_sorted)):
        sheet_string+='font:'+str(i+1)+':'+font_align_sorted[i]+'\n'

        # adding abbreviations for vertical alignment
    for i in range(len(ver_align_sorted)):
        sheet_string+='layout:'+str(i+1)+':padding:* * * *;vertical-align:'+ver_align_sorted[i]+';\n'


def add_col_width(workbook_col_widths,sheet_no):

    global sheet_string
    global audit_string

    for c in range(len(workbook_col_widths[sheet_no])):

        if workbook_col_widths[sheet_no][c]!=8:
            col_alphabetical=str(col_no_to_alphabet(c))
            width=str((workbook_col_widths[sheet_no][c])*10)
            sheet_string+='col:'+col_alphabetical+':w:'+width+'\n'
            audit_string+='set '+ col_alphabetical+' width '+width+'\n'

def workbook_data_to_scalc_string(workbook_data,workbook_col_widths,sheet_no=0):
    ## the sheet_no starts from 0 with the 1st sheet placed at 0th position, and it denotes the sheet whose data is to be shown


    global result_string
    global sheet_string
    global audit_string
    global edit_string
    global multipartBoundary_string

    #### Initiating some of these strings######
    sheet_string+='version:1.5\n'

    #### Some constants which will be used during string preparation######
    add_center_string_flag=False    ## These 2 flags take care whether we should add the following string cellformat:2:right or cellformat:1:middle in the
    add_right_string_flag=False    ## sheet_string, we might not require them over the time, and might just add these strings everytime.


    max_col=0     ## Takes care of the max. value of row and col till which sheet is there, max dimensions of the sheet
    max_row=0

    ## to know the max rows and col
    max_row=len(workbook_data[sheet_no])     
    max_col=len(workbook_data[sheet_no][max_row-1])  


    for r in range(len(workbook_data[sheet_no])):
        for c in range(len(workbook_data[sheet_no][r])):
            info=workbook_data[sheet_no][r][c]
            if info==():   # for empty cell
                continue
            elif info[1]=='i': # for integer
                ############################ Saving the no and its coordinates in the string format#######################################
                #### The format for sheet string would be cell:A1:v:1 ,i.e. cell:colrow:v:value_at_that_cell
                #### The format for audit string would be set AB24 value n 333.9898989, i.e. set colrow value n value_at_that_cell

                col_alphabetical=col_no_to_alphabet(c)
                sheet_string+='cell:'+str(col_alphabetical)+str(r+1)+':v:'+str(info[0])   ## here the row needs to be incremented by 1 as it starts from 1 in scalc
                audit_string+='set '+str(col_alphabetical)+str(r+1)+' value n '+str(info[0])+'\n'

            elif info[1]=='f': # for float, same as integer
                ############################ Saving the no and its coordinates in the string format#######################################
                #### The format for sheet string would be cell:A1:v:1 ,i.e. cell:colrow:v:value_at_that_cell
                #### The format for audit string would be set AB24 value n 333.9898989, i.e. set colrow value n value_at_that_cell

                col_alphabetical=col_no_to_alphabet(c)
                sheet_string+='cell:'+str(col_alphabetical)+str(r+1)+':v:'+str(info[0])   ## here the row needs to be incremented by 1 as it starts from 1 in scalc
                audit_string+='set '+str(col_alphabetical)+str(r+1)+' value n '+str(info[0])+'\n'

            elif info[1]=='s': # for string


                col_alphabetical=col_no_to_alphabet(c)
                # replacing the character ':' with '\c' and '\\' with '\\b' and '\n' with '\\n' as these characters are used internally in socialcalc
                label=''
                for j in range(len(info[0])):    ## seems to be needed. 

                    ch=chr(ord(info[0][j]))
                    if ch==':':           # IMP: because these strings are used in javascript part of socialcalc for other purposes
                        ch='\c'
                    elif ch=='\\':
                        ch='\\b'
                    elif ch=='\n':
                        ch='\\n'
                    label+=ch


                sheet_string+='cell:'+str(col_alphabetical)+str(r+1)+':t:'+label
                audit_string+='set '+str(col_alphabetical)+str(r+1)+' value t '+label+'\n'


            elif info[1]=='for':  #for formula

                col_alphabetical=col_no_to_alphabet(c)
                formula_type=info[3]
                formula_string2=info[4]
                formula_result=info[0]
                
                formula_string=''
                for j in range(len(formula_string2)):    ## seems to be needed. 

                    ch=chr(ord(formula_string2[j]))
                    if ch==':':           # IMP: because these strings are used in javascript part of socialcalc for other purposes
                        ch='\c'
                    elif ch=='\\':
                        ch='\\b'
                    elif ch=='\n':
                        ch='\\n'
                    formula_string+=ch
                
                if formula_type=='f' or formula_type=='i':
                    formula_type='n'
                elif formula_type=='s':
                    formula_type='t'
                elif formula_type=='b':
                    formula_type='nl'
                elif formula_type=='e':
                    formula_type='e'+str(formula_result)
                    formula_string+=':e:'+str(formula_result)
                    formula_result=''
                sheet_string+='cell:'+str(col_alphabetical)+str(r+1)+':vtf:'+formula_type+':'+str(formula_result)+':'+formula_string ## TODO: code for date/time fns
                audit_string+='set '+str(col_alphabetical)+str(r+1)+' formula '+formula_string+'\n'
                


            ## call to extract format information for each cell
            add_cell_format(info[2][0],info[2][1],r,col_alphabetical)

            # adding '\n' at the last of the sheet_string since it is required for each cell
            sheet_string+='\n'

            ####### End of looping over each cell element#####

    ###### Finalizing the strings before returning#########

    # to add the width of the columns
    add_col_width(workbook_col_widths,sheet_no)

    # to add the no. of columns and rows in the sheet
    sheet_string+='sheet:c:'+str(max_col)+':r:'+str(max_row)+'\n'

    # to add abbreviations of the type of format used
    add_cell_format_abbr()    

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








