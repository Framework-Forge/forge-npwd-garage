local APP_ID = 'forge-npwd-garage'
local APP_PATH = '/forge-npwd-garage'

local function notify(data)
    data = type(data) == 'table' and data or {}

    if GetResourceState('forge-npwd') ~= 'started' then
        return false
    end

    local notification = {
        notisId = tostring(data.notisId or ('forge-npwd-garage:%s'):format(GetGameTimer())),
        appId = APP_ID,
        title = tostring(data.title or 'Forge Garage'),
        content = tostring(data.content or data.description or 'Atualização da garagem.'),
        keepOpen = data.keepOpen == true,
        duration = tonumber(data.duration) or 5000,
        path = data.path or APP_PATH,
    }

    return pcall(function()
        exports['forge-npwd']:createNotification(notification)
    end)
end

local function vehicleType(spawnName)
    if type(spawnName) ~= 'string' or spawnName == '' then
        return 'car'
    end

    local class = GetVehicleClassFromName(joaat(spawnName))

    if class == 15 or class == 16 then
        return 'aircraft'
    elseif class == 14 then
        return 'boat'
    elseif class == 8 or class == 13 then
        return 'bike'
    end

    return 'car'
end

local function enrich(vehicle)
    vehicle.type = vehicleType(vehicle.spawnName)
    local model = tostring(vehicle.spawnName or ''):lower():gsub('[^%w_%-]', '')
    local cfg = Config.VehicleImages or {}
    local custom = (cfg.Overrides or {})[model]
    if not custom and type(cfg.Template) == 'string' and cfg.Template ~= '' and model ~= '' then
        custom = cfg.Template:gsub('{model}', function() return model end)
    end
    local ok, bridge = pcall(function() return pr_lib.fivem.blips.getVehicleImageUrl(model) end)
    if not ok then bridge = nil end
    local images = {}
    local function add(url)
        if type(url) == 'string' and url:match('^https?://') then
            for _, previous in ipairs(images) do if previous == url then return end end
            images[#images+1] = url
        end
    end
    if cfg.PreferCustom ~= false then add(custom); add(bridge) else add(bridge); add(custom) end
    vehicle.images = images
    return vehicle
end
local function failed(cb, message)
    cb({status='error',message=message or 'Não foi possível consultar a garagem.'})
end
RegisterNUICallback('forge-npwd:garage:getVehicles', function(_, cb)
    if GetResourceState('forge-garage') ~= 'started' then failed(cb,'Forge Garage indisponível.'); return end
    local ok, vehicles = pcall(function() return exports['forge-garage']:getvehForPhone() end)
    if not ok or type(vehicles) ~= 'table' then failed(cb); return end
    for _, vehicle in ipairs(vehicles) do enrich(vehicle) end
    cb({status='ok',data=vehicles})
end)
RegisterNUICallback('forge-npwd:garage:getDetails', function(data, cb)
    if GetResourceState('forge-garage') ~= 'started' then failed(cb,'Forge Garage indisponível.'); return end
    local ok, result = pcall(function()
        return pr_lib.callback.await('forge_garage:phone:details',false,type(data)=='table' and data.plate)
    end)
    if not ok or type(result) ~= 'table' then failed(cb); return end
    if result.status == 'ok' and type(result.data) == 'table' then enrich(result.data) end
    cb(result)
end)
RegisterNUICallback('forge-npwd:garage:requestWaypoint', function(data, cb)
    if GetResourceState('forge-garage') ~= 'started' then failed(cb,'Forge Garage indisponível.'); return end
    local ok, result = pcall(function()
        return pr_lib.callback.await('forge_garage:phone:route',false,type(data)=='table' and data.plate)
    end)
    if not ok or type(result) ~= 'table' then failed(cb); return end
    if result.status ~= 'ok' then cb(result); return end
    local destination = result.data
    local coords = type(destination)=='table' and destination.coords
    if not coords or type(coords.x)~='number' or type(coords.y)~='number' then failed(cb,'Destino sem coordenadas válidas.'); return end
    SetNewWaypoint(coords.x,coords.y)
    cb({status='ok',message=('Rota definida para %s.'):format(destination.label),data=destination})
end)
RegisterNetEvent('forge-npwd-garage:client:notify', function(data) notify(data) end)
exports('sendGarageNotification', notify)
