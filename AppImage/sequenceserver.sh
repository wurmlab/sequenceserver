# cd back to the directory where the AppImage was launched from. AppRun changes
# the working directory so as to work with binaries that have /usr hard-coded;
# we don't.
cd $OWD

# Set GEM_PATH to where we installed gems in the AppImage.
export GEM_PATH=$APPDIR/var/lib/gems/2.3.0

# Get path of sequenceserver executable inside AppImage. Path of bare commands
# (here ruby) are resolved within AppImage's context. Use of Gem.bin_path lets
# us avoid hardcoding version number. The file returned is bin/sequenceserver
# and not the shim that rubygem creates.
executable=$(ruby -e 'puts Gem.bin_path("sequenceserver", "sequenceserver")')

# Run sequenceserver.
ruby ${executable} "$@"
