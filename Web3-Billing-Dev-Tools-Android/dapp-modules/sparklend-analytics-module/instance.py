import os

from sugar3 import profile
import shutil


class Instance:
	key = profile.get_pubkey()
	#joyride ...
	#keyHash = util.sha_data(key)
	#8.2...
	#keyHash = util._sha_data(key)
	#keyHashPrintable = util.printable_hash(keyHash)
	nickName = profile.get_nick_name()

	instanceId = None
	instancePath = None
	dataPath = None

	def __init__(self, ca):
		self.__class__.instanceId = ca._activity_id

		self.__class__.instancePath = os.path.join(ca.get_activity_root(), "instance")
		recreateTmp()

		self.__class__.dataPath = os.path.join(ca.get_activity_root(), "data")
		recreateData()


def recreateTmp():
	if (not os.path.exists(Instance.instancePath)):
		os.makedirs(Instance.instancePath)


def recreateData():
	if (not os.path.exists(Instance.dataPath)):
		os.makedirs(Instance.dataPath)
