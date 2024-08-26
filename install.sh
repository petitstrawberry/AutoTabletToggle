#!/bin/sh

# Install autotablettoggle@ichigo.dev to GNOME Shell extensions directory
# Usage: ./install.sh

# GNOME Shell extensions directory
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions"

# Copy extension to GNOME Shell extensions directory
cp -r autotablettoggle@ichigo.dev $EXTENSION_DIR
