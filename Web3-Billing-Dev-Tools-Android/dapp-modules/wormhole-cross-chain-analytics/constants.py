import os
from gettext import gettext as _

from sugar3.activity import activity

from instance import Instance

class Constants:

	VERSION = 8

	SERVICE = "org.laptop.Map"
	IFACE = SERVICE
	PATH = "/org/laptop/Map"
	activityId = None

	gfxPath = os.path.join(activity.get_bundle_path(), "gfx")
	htmlPath = os.path.join(activity.get_bundle_path(), "html")
	iconsPath = os.path.join(activity.get_bundle_path(), "icons")

	istrAnnotate = _("Edit")
	istrSearch = _("Search")
	istrSearchAddress = _('Find:')
	istrSearchMedia = _("Tags:")
	istrSaveSearch = _("Save Search")
	istrConnecting = _("Connecting to Map Server")
	istrZoomIn = _("Zoom In")
	istrZoomOut = _("Zoom Out")
	istrSaveSearch = _("Save")
	istrDensity = _("Density")
	istrSavedMap = _("Saved Map")
	istrTagMap = _("Describe Map")
	istrRemove = _("Remove Map")
	istrCopyToClipboard = _("Copy to Clipboard")
	istrAddMedia = _("Add Media")
	istrAddInfo = _("Add Info")
	istrDeleteMedia = _("Delete")
	istrWebMedia = _("Library")
	istrMeasure = _("Measure")
	istrStaticMaps = _("olpcMAP.net")
	istrPanoramio = _("Panoramio")
	istrLocalWiki = _("LocationWiki")
	istrWikiMapia = _("WikiMapia")
	istrLatitude = _("Latitude:")
	istrLongitude = _("Longitude:")
	istrTags = _("Description:")
	istrLang = _("lang=en")
	LineButton = _("Add Line")
	PolyButton = _("Add Shape")

	TYPE_PHOTO = 0
	TYPE_VIDEO = 1

	ui_dim_INSET = 4

	recdAlbum = "map"
	recdLat = "lat"
	recdLng = "lng"
	recdDatastoreId = "datastore"
	recdInfo = "info"
	recdMapItem = "mapItem"
	recdSavedMapItem = "savedMap"
	recdInfoMarker = "infoMarker"
	recdIcon = "icon"
	recdZoom = "zoom"
	recdNotes = "notes"
	recdMapImg = "mapImg"
	recdTags = "tags"
	recdMapThumbImg = "mapThumbImg"
	recdRecdId = "recdId"
	recdRecdLat = "recdLat"
	recdRecdLng = "recdLng"
	recdDensity = "density"
	recdLine = "line"
	lineID = "lid"
	lineColor = "lcolor"
	lineThick = "lthickness"
	linePts = "lpts"
	mapLat="lat"
	mapLng="lng"
	mapZoom="zoom"


	def __init__( self, ca ):
		self.__class__.activityId = ca._activity_id
