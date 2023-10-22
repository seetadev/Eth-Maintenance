import os
from XOCom import XOCom
import sys
import logging
import telepathy

from gi.repository import Gtk
from gi.repository import GLib
from gi.repository import WebKit

from dbus.service import method, signal
from dbus.gobject_service import ExportedGObject

from sugar3.activity import activity
from sugar3 import env
from sugar3.presence import presenceservice
from sugar3.presence.tubeconn import TubeConnection
from sugar3.graphics.toolbarbox import ToolbarBox
from sugar3.activity.widgets import ActivityButton
from sugar3.activity.widgets import TitleEntry
from sugar3.activity.widgets import ShareButton
from sugar3.activity.widgets import StopButton

import intero

SERVICE = "com.socialtext.SocialCalcActivity"  
IFACE = SERVICE
PATH = "/com/socialtext/SocialCalcActivity"
#global_filename=''
global_content=''
flag_WriteFromWriteFile=True
flag_toActivateSetInterval=True

class SocialCalcActivity (activity.Activity):
    def __init__(self, handle):
        activity.Activity.__init__(self, handle)
        self.set_title('SocialCalc')
        self._logger = logging.getLogger('OnePageWiki-Activity')

        # The XOCom object helps us communicate with the browser
        # This uses web/index.html as the default page to load
        self.xocom = XOCom(self.control_sending_text)                   #REMEMBER THAT I HAVE STILL TO SEND THE ARGUMENT IN THE XOCOM CLASS

        toolbox = ToolbarBox()

        activity_button = ActivityButton(self)
        toolbox.toolbar.insert(activity_button, 0)
        activity_button.show()

        title_entry = TitleEntry(self)
        toolbox.toolbar.insert(title_entry, -1)
        title_entry.show()
        
        separator = Gtk.SeparatorToolItem()
        separator.props.draw = False
        separator.set_expand(True)
        toolbox.toolbar.insert(separator, -1)
        separator.show()

        stop_button = ShareButton(self)
        toolbox.toolbar.insert(stop_button, -1)
        stop_button.show()
        self.set_toolbar_box(toolbox)
        toolbox.show()

        stop_button = StopButton(self)
        toolbox.toolbar.insert(stop_button, -1)
        stop_button.show()

        self.set_toolbar_box(toolbox)
        toolbox.show()
        ##self.xocom.send_to_browser_localize(['initlocalize'])

        self.set_canvas( self.xocom.create_webview() )

        self.hellotube = None  # Shared session    #REQUIRED
        self.initiating = False
        
        self.pservice = presenceservice.get_instance()
        
        owner = self.pservice.get_owner()
        self.owner = owner   
        
        self.connect('shared', self._shared_cb)
        self.connect('joined', self._joined_cb)
        
        self.filename=''       #ADDED SPECIFICALLY TO CALL WRITE AND READ METHODS
        self.content=''

        #calling to initialize strings in localization
        #should wait for init complete from browser
        GLib.timeout_add(4000, self.xocom.send_to_browser_localize,['initlocalize'])


    def _shared_cb(self, activity):
        self._logger.debug('My activity was shared')
        print 'my activity is shared'
        self.initiating = True
        self._sharing_setup()

        self._logger.debug('This is my activity: making a tube...')
        print 'This is my activity: making a tube...'
        id = self.tubes_chan[telepathy.CHANNEL_TYPE_TUBES].OfferDBusTube(
            SERVICE, {})
        
    def _sharing_setup(self):
        if self.shared_activity is None:
            self._logger.error('Failed to share or join activity')
            print 'Failed to share or join activity'
            return

        self.conn = self.shared_activity.telepathy_conn
        self.tubes_chan = self.shared_activity.telepathy_tubes_chan
        self.text_chan = self.shared_activity.telepathy_text_chan

        self.tubes_chan[telepathy.CHANNEL_TYPE_TUBES].connect_to_signal(
            'NewTube', self._new_tube_cb)

        self.shared_activity.connect('buddy-joined', self._buddy_joined_cb)
        self.shared_activity.connect('buddy-left', self._buddy_left_cb)

        #self.entry.set_sensitive(True)
        #self.entry.grab_focus()

        # Optional - included for example:
        # Find out who's already in the shared activity:
        #for buddy in self._shared_activity.get_joined_buddies():
            #self._logger.debug('Buddy %s is already in the activity',
                               #buddy.props.nick)

    def _list_tubes_reply_cb(self, tubes):
        for tube_info in tubes:
            self._new_tube_cb(*tube_info)

    def _list_tubes_error_cb(self, e):
        self._logger.error('ListTubes() failed: %s', e)
        

    def _joined_cb(self, activity):
        if not self._shared_activity:
            return

        self._logger.debug('Joined an existing shared activity')
        print 'Joined an existing shared activity'
        self.initiating = False
        self._sharing_setup()

        self._logger.debug('This is not my activity: waiting for a tube...')
        print 'This is not my activity: waiting for a tube...'
        self.tubes_chan[telepathy.CHANNEL_TYPE_TUBES].ListTubes(
            reply_handler=self._list_tubes_reply_cb,
            error_handler=self._list_tubes_error_cb)

    def _new_tube_cb(self, id, initiator, type, service, params, state):
        self._logger.debug('New tube: ID=%d initator=%d type=%d service=%s '
                     'params=%r state=%d', id, initiator, type, service,
                     params, state)
        if (type == telepathy.TUBE_TYPE_DBUS and
            service == SERVICE):
            if state == telepathy.TUBE_STATE_LOCAL_PENDING:
                self.tubes_chan[telepathy.CHANNEL_TYPE_TUBES].AcceptDBusTube(id)
            tube_conn = TubeConnection(self.conn,
                self.tubes_chan[telepathy.CHANNEL_TYPE_TUBES],
                id, group_iface=self.text_chan[telepathy.CHANNEL_INTERFACE_GROUP])
            self.hellotube = TextSync(tube_conn, self.initiating,
                                      self._get_buddy,self.read_shared,self.write_shared,self.xocom)

    def _buddy_joined_cb (self, activity, buddy):
        """Called when a buddy joins the shared activity.

        This doesn't do much here as HelloMesh doesn't have much 
        functionality. It's up to you do do interesting things
        with the Buddy...
        """
        self._logger.debug('Buddy %s joined', buddy.props.nick)
        print 'Buddy %s joined' % (buddy.props.nick)

    def _buddy_left_cb (self, activity, buddy):
        """Called when a buddy leaves the shared activity.

        This doesn't do much here as HelloMesh doesn't have much 
        functionality. It's up to you do do interesting things
        with the Buddy...
        """
        self._logger.debug('Buddy %s left', buddy.props.nick)
        print 'Buddy %s left' % (buddy.props.nick)

    def _get_buddy(self, cs_handle):
        """Get a Buddy from a channel specific handle."""
        self._logger.debug('Trying to find owner of handle %u...', cs_handle)
        group = self.text_chan[telepathy.CHANNEL_INTERFACE_GROUP]
        my_csh = group.GetSelfHandle()
        self._logger.debug('My handle in that group is %u', my_csh)
        if my_csh == cs_handle:
            handle = self.conn.GetSelfHandle()
            self._logger.debug('CS handle %u belongs to me, %u', cs_handle, handle)
        elif group.GetGroupFlags() & telepathy.CHANNEL_GROUP_FLAG_CHANNEL_SPECIFIC_HANDLES:
            handle = group.GetHandleOwners([cs_handle])[0]
            self._logger.debug('CS handle %u belongs to %u', cs_handle, handle)
        else:
            handle = cs_handle
            self._logger.debug('non-CS handle %u belongs to itself', handle)
            # XXX: deal with failure to get the handle owner
            assert handle != 0
        return self.pservice.get_buddy_by_telepathy_handle(
            self.conn.service_name, self.conn.object_path, handle)

    def write_file(self, filename):
        
##        print 'in write file'                       
##        print content
##        print 'filename is   ',filename,'  mime  ',self.metadata['mime_type']
        self.metadata['mime_type']='application/scalc'  ## The mime_type is changed beacause the name of file still remains .wk* even when it is saved and
                                                      ## opened in scalc format. So, to distinguish it from original one because, the mime_type of a binary
                                                    ## .wk* file would be application/vnd.lotus-1-2-3

        ##self.xocom.send_to_browser_localize(['initlocalize'])
        content = self.xocom.send_to_browser('write')
        if content:
            fh = open(filename, 'w')
            fh.write(content)
            fh.close()
       
        if not self.hellotube==None:
            if flag_WriteFromWriteFile:
                #self.control_sending_text()   COMMENTED ONLY FOR THIS TIME WHILE CHECKING UNCOMMENT IT OVER THE TIME
                self.hellotube.SendText(['whole',content])  #COMMENT THIS LINE AT THAT TIME
            

    def read_file(self, filename):
        #print '\nin read file\n'
        file_extension_value=intero.check_file_extension(filename)
        print ' \nthe extension is ',file_extension_value[1],' and the value is ',file_extension_value[0],'\n'
        
        if  file_extension_value[0] and (self.metadata['mime_type']!='application/scalc') :
            fh = open(filename, 'rb')
            #print 'filename is   ',filename,'  mime  ',self.metadata['mime_type']
            #print self.metadata['mime_type']
            content = fh.read()
            fh.close()
            #print content 
            content=intero.convert(content,file_extension_value[1])

        else:
            fh = open(filename, 'r')
            content = fh.read()
            fh.close()
            
        #print content
        #return
        def send_delayed_read():
            self.xocom.send_to_browser('read', content)
            return False
        # We must delay this to give the browser time to start up
        # It would be better if this send_to_browser was instead triggered
        # once the browser had finished loading.
        GLib.timeout_add(5000, send_delayed_read)

        
    def write_shared(self):
        content=self.xocom.send_to_browser('write')
        global_content=content
        self.content=content
        return content
        #self.hellotube.SendText(self.content)
    
    def read_shared(self,content):
        self.xocom.send_to_browser('read',content)
        
    def control_sending_text(self,array='', topic='', str=''):
        if not str=='':         #just to check that the string is received from the js part
            print 'reached control_sending_text from js part   ',str
        #content=self.write_shared()
        #content=array
        
        if str=='execute':
            print 'in execute in control_sending_text'
            global_content=array[1]
            self.content=global_content
            self.hellotube.SendText(array)


class TextSync(ExportedGObject):
    """The bit that talks over the TUBES!!!"""

    def __init__(self, tube, is_initiator, get_buddy,read_shared,write_shared,xocom):
        super(TextSync, self).__init__(tube, PATH)
        self._logger = logging.getLogger('OnePageWiki-Activity.Textsync')
        self.tube = tube
        self.is_initiator = is_initiator
        #self.text_received_cb = text_received_cb
        #self._alert = alert
        self.entered = False  # Have we set up the tube?
        self.text = '' # State that gets sent or received   #to check whether anything is received till now or not
        self._get_buddy = get_buddy  # Converts handle to Buddy object
        self.tube.watch_participants(self.participant_change_cb)
        self.read_shared=read_shared
        self.write_shared=write_shared
        self.xocom=xocom
        

    def participant_change_cb(self, added, removed):
        self._logger.debug('Tube: Added participants: %r', added)
        self._logger.debug('Tube: Removed participants: %r', removed)
        for handle, bus_name in added:
            buddy = self._get_buddy(handle)
            if buddy is not None:
                self._logger.debug('Tube: Handle %u (Buddy %s) was added',
                                   handle, buddy.props.nick)
                print 'Buddy %s was added' % (buddy.props.nick)
        for handle in removed:
            buddy = self._get_buddy(handle)
            if buddy is not None:
                self._logger.debug('Buddy %s was removed' % buddy.props.nick)
                print 'Buddy %s was added' % (buddy.props.nick)
        if not self.entered:
            if self.is_initiator:
                self._logger.debug("I'm initiating the tube, will "
                    "watch for hellos.")
                print 'I am initiating the tube'
                self.add_hello_handler()
            else:
                self._logger.debug('Hello, everyone! What did I miss?')
                print 'what did I miss'
                self.Hello()
        self.entered = True
        
    @signal(dbus_interface=IFACE, signature='')
    def Hello(self):
        """Say Hello to whoever else is in the tube."""
        self._logger.debug('I said Hello.')
        print 'I said Hello.'
        
    @method(dbus_interface=IFACE, in_signature='s', out_signature='')
    def World(self, text):
        """To be called on the incoming XO after they Hello."""
        if not self.text:
            self._logger.debug('Somebody called World and sent me %s',
                               text)
            print 'Somebody called World and sent me %s' %(text)
            
            self.text = text
            self.read_shared(content=text)
            # now I can World others
            self.add_hello_handler()
        else:
            self._logger.debug("I've already been welcomed, doing nothing")
            print 'I have already been welcomed'
        
    def add_hello_handler(self):
        self._logger.debug('Adding hello handler.')
        print 'in add_hello_handler'
        self.tube.add_signal_receiver(self.hello_cb, 'Hello', IFACE,
            path=PATH, sender_keyword='sender')
        self.tube.add_signal_receiver(self.sendtext_cb, 'SendText', IFACE,
            path=PATH, sender_keyword='sender')
        global flag_toActivateSetInterval
        if flag_toActivateSetInterval:   #NOTE THAT THIS PART NEEDS TO BE UNCOMMENTED TO ACTUALLY IMPLEMENT WHAT WE WANT TO IN EXECUTECOMMAND
            print 'start: sending check'
            self.xocom.send_to_browser('check')
            #flag_toActivateSetInterval=False
            print 'exit: sending check'

        

    def hello_cb(self, sender=None):
        """Somebody Helloed me. World them."""
        if sender == self.tube.get_unique_name():
            # sender is my bus name, so ignore my own signal
            return
        self._logger.debug('Newcomer %s has joined', sender)
        print 'Newcomer %s has joined' % (sender)
        self._logger.debug('Welcoming newcomer and sending them the game state')
        print 'Welcoming newcomer and sending them the game state'
        content=self.write_shared()
        self.tube.get_object(sender, PATH).World(content,
                                                 dbus_interface=IFACE)
        
        #global flag_toActivateSetInterval
        #if flag_toActivateSetInterval:
            #print 'start: sending check'
            #self.xocom.send_to_browser('check')
            ##flag_toActivateSetInterval=False
            #print 'exit: sending check'

    def sendtext_cb(self, text, sender=None):
        """Handler for somebody sending SendText"""
        if sender == self.tube.get_unique_name():
            # sender is my bus name, so ignore my own signal
            return
        
        if text[0]=='execute':
            self._logger.debug('%s sent text %s', sender, text[1])
            print 'received text', text[1]
            self.text = text[1]
            self.xocom.send_to_browser_shared(text)            
            

    @signal(dbus_interface=IFACE, signature='as')
    def SendText(self, text):
        """Send some text to all participants."""
        #self.text = text
        #self._logger.debug('Sent text: %s', text)
        if text[0]=='whole':
            print 'in whole: sending sendtext signal',text[1]
        
        elif text[0]=='execute':
            print 'in execute: sending sendtext signal',text[1]
        
        #print 'sending sendtext signal'
        #self._alert('SendText', 'Sent %s' % text)


    
