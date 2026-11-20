fx_version 'cerulean'
game 'gta5'

name 'forge-npwd-garage'
description 'Forge Garage application and notifications for Forge NPWD'
author 'ForgeBox - PierreMoraes'
version '1.0.2'

shared_scripts { '@pr_bridge/init.lua', '@forge-npwd/compat/app.lua', 'config.lua' }

client_script 'client/main.lua'
server_script 'server/main.lua'

ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/**/*',
    'images/vehicles/*.webp',
    'images/vehicles/*.png',
    'images/vehicles/*.jpg',
    'images/vehicles/*.jpeg',
}

dependencies {
    'pr_bridge',
    'forge-npwd',
    'forge-garage',
}

lua54 'yes'

-- Legacy dependency names; export routing remains inside forge-npwd.
provide 'npwd-forge-garage'
provide 'npwd_forge_garage'

server_script 'server/version.lua'
