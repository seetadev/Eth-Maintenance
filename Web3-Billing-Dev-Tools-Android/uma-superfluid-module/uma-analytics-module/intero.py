# Ability to read single sheet Lotus .wk4 files in SocialCalc added. Developed by Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# Ability to read single sheet Excel .xls files in SocialCalc added. Developed by Mahesh Chand Sharma from SEETA (http://seeta.in) with pointers from Vijit Singh, 
# Software Engineer at SEETA (http://seeta.in) under the guidance of Manusheel Gupta.
# For getting involved in the development of SocialCalc on Sugar, or on any questions related to it, please e-mail at socialcalc<dot>sugar<at>seeta<dot>in. 
# For posting a feature request/bug, please use http://testtrack.seeta.in. 
# File author - Vijit Singh



import interoperability
from interoperability import lotus_wk4
from interoperability.xls import workbook


def convert(byte_string,file_extension):
    if file_extension == '.wk4':
        result=lotus_wk4.wk4_to_scalc(byte_string)

    elif file_extension == '.xls':
        result=workbook.bin2data(byte_string)
        if result=='file not in correct format':    ## To check that file is in the correct readable format
            print 'BEWARE : file not in correct format, it is not the correct xls format, check the file\n'
            result=''

    
    #print result
    return result


def check_file_extension(filename):
    if ('.wks' in filename or '.wk4' in filename):
        return (True, '.wk4')
    elif('.xls' in filename or '.xlw' in filename):
        return (True,'.xls')
    else :
        return ( False, '')
