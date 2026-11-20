Config = {
    VersionCheck = true,
    VehicleImages = {
        -- true: custom folder first, then PR Bridge. false reverses this order.
        PreferCustom = true,
        -- Local images: images/vehicles/<spawn name>.webp, streamed by this resource.
        -- May also be an HTTPS template, e.g. https://cdn.example.com/cars/{model}.png
        Template = 'https://cfx-nui-forge-npwd-garage/images/vehicles/{model}.webp',
        -- Per-model URLs override Template for addon/replace models.
        Overrides = {
            -- sultanrs = 'https://cdn.example.com/sultanrs.png',
        },
    },
}
