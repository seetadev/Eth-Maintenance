import threading
from threading import *
from logic import ServerLogic
from server import Server
from instance import Instance
from sugar3.activity.activity import get_bundle_path
import gi
gi.require_version('WebKit', '3.0')
from gi.repository.WebKit import WebView
#from xpcom import components
from localized_strings_file import localized_strings
from gi.repository import Gtk
import json

class XOCom:
    # Constructor gives full XPCom access by default
    # This should be improved for future apps that may not need/want full access
    cometPort = 8889
    ajaxPort = 8890
    handler = None
    return_value = None

    def __init__(self, control_sending_text,uri=None):
        self.cond = Condition()
        #h = hash(Instance.instanceId)
        self.__class__.cometPort = 10
        self.__class__.ajaxPort = 11
        self.cometLogic = ServerLogic(self)
        #self.ajaxServer = ServerThread(self.__class__.ajaxPort, self.cometLogic)
        #self.ajaxServer.start()
        #self.cometServer = ServerThread(self.__class__.cometPort, self.cometLogic)
        #self.cometServer.start()
        if uri:
            self.uri = uri
        else:
            self.uri = 'file://' + get_bundle_path() + '/web/index.html?ajax='+str(self.__class__.ajaxPort)+'&comet='+str(self.__class__.cometPort);
        self.control_sending_text=control_sending_text
        self.give_full_xpcom_access()
        self.set_observer()
        ##self.send_to_browser_localize(['initlocalize'])  ## to initialize the localized strings in socialcalc
	
    # Give the browser permission to use XPCom interfaces
    # This is necessary for XPCom communication to work
    # Note: Not all of these preferences may be required - requires further
    #       investigation
    def give_full_xpcom_access(self):
        pass
        '''pref_class = components.classes["@mozilla.org/preferences-service;1"]
        prefs = pref_class.getService(components.interfaces.nsIPrefService)
        prefs.getBranch('signed.applets.').setBoolPref('codebase_principal_support',
                True);
        prefs.getBranch('capability.principal.').setCharPref(
                        'socialcalc.granted', 'UniversalXPConnect')
        prefs.getBranch('capability.principal.').setCharPref(
                        'socialcalc.id', self.uri)'''

    # Wrapper method to create a new webview embedded browser component
    # Uses hulahop's WebView.  Assumes that you'll want to serve
    # web/index.html relative to your activity directory.
    def create_webview(self):
        self.web_view = WebView()
        self.web_view.connect("navigation-requested", self.on_navigation_requested)
        ##self.uri = 'file://' + get_bundle_path() + '/web/index.html';
        self.web_view.load_uri(self.uri)
        self.web_view.show()
        return self.web_view

    def on_navigation_requested(self, view, frame, req, data=None):
        uri = req.get_uri()
        try:
            scheme, data = uri.split(':#', 1)
        except:
            return False
        if scheme == 'xo-message2':
            if handler is not None:
                data = json.loads(data)
                self.handler(data, 'xo-message2', data[1])
            return True
        elif scheme == 'return-value':
            self.return_value = json.loads(data)
            return True
        else:
            return False

    def set_observer(self):
        #try:
            print 'enter: set_observer'
            self.handler = self.control_sending_text;
            print 'exit: set_observer'
        #except:
            #print 'error is there, remove try and except thing'
        
        
    # Use XPCom to execute a javascript callback registered with XO.js
    # The command will execute a javascript method registered with the same name,
    # and return any value received from the javascript
    def send_to_browser(self, command, parameter=''):
        if((command == "read") and (parameter != '')):
            self.web_view.execute_script("XO.observer.setSheet('"+parameter.replace('\\n','DECNEWLINE').replace('\n','NEWLINE').replace("\\","B_SLASH").replace("'","\\'")+"');")
            return

        self.web_view.execute_script("XO.observer.observe(['"+parameter+"'], 'xo-message', '"+command+"');");
        self.handler = self.control_sending_text;

        # check if the browser returned anything
        while self.return_value == None:
            while Gtk.events_pending():
                Gtk.main_iteration()
        if self.return_value != '':
            value = self.return_value
            self.return_value = None
            return value
        return None
    
    def send_to_browser_shared(self,command):
        if command[0]=='execute':
            self.web_view.execute_script('XO.observe(' + str(command[1:3]) + ', "xo-message", "execute");');

    def send_to_browser_localize(self,command):
        print 'sending to javascript part to localize\n'
        localstr = "XO.lang=["
        for i,j in localized_strings.iteritems():
            localstr = localstr+"'"+i.replace("'","\\'")+"','"+j.replace("'","\\'")+"',"
        localstr = localstr+"'xv'];XO.observe();"
        self.web_view.execute_script(localstr)
        return
    
class Observer():
    def __init__(self,control_sending_text):

        print 'just initiating'
        self.control_sending_text=control_sending_text
        self.content_observe=''
    def observe(self, service, topic, extra):
        print 'getting the signal in the python part'
        
        
            
        if topic=="xo-message2":   #it is for the execute command type'
            #service = service.QueryInterface(components.interfaces.nsIMutableArray)
            if service.length:
                iter = service.enumerate()
                result = iter.getNext()
                #result = result.QueryInterface(components.interfaces.nsISupportsString)
                self.content_observe=result.toString()
                print 'the content in observer of xocom is ', self.content_observe
                saveundostring=iter.getNext()
                #saveundostring=saveundostring.QueryInterface(components.interfaces.nsISupportsString)
                saveundostring=saveundostring.toString()
                sendingArray=['execute',self.content_observe,saveundostring]
                self.control_sending_text(array=sendingArray,str='execute')
        

class ServerThread(threading.Thread):
    def __init__(self,port,logic):
        threading.Thread.__init__(self)
        self.startserver(port,logic)

    def startserver(self,port,logic):
        try:
            self.server = Server(("127.0.0.1",port),logic)
            self.closing = 0
        except:
            self.startserver(port+2,logic)

    def run(self):
        try:
            self.server.serve_forever()
        except:
            if(self.closing == 0):
                self.run()

    def stop(self):
        r = 2
