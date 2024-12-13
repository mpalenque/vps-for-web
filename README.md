# Immersal VPS for Web
Immersal VPS for Web (aka WebAR)

This is a sample of how to use Immersal's Visual Positioning System (VPS) for on-device localization natively on a (mobile) Web browser. It can be used e.g. for persistent and anchored WebAR experiences, and to retrieve the user's position in global coordinates (latitude, longitude, altitude) from the camera image.

## Features

- Localizes against Immersal maps created with the Mapper app ([App Store](https://apps.apple.com/app/immersal-mapper/id1466607906), [Play Store](https://play.google.com/store/apps/details?id=com.immersal.sdk.mapper)), BLK2GO, 360 cameras... 100% compatible.
- Very lean JavaScript ES6 module implementation
- WGS84/ECEF support (a localized pose contains the information in global coordinates if the map itself has been saved with GPS coordinates)
- Works in both portrait and landscape orientations
- Supports both Three.js and Babylon.js (the latter example coming soon)
- Uses the device gyroscope for orientation tracking, and continuous localization for translation (position) tracking to emulate SLAM
- Supports either one-shot or continuous localization
- Supports both on-device and on-server localization (through the Immersal REST API)

## Compatibility

- iOS Safari
- Android Chrome
- etc., latest versions
- should work on all modern mobile browsers, [contact us](mailto:support@immersal.com) if it doesn't

## Prerequisites

- [Immersal Developer account](https://developer.immersal.com/)
- [Immersal Pro plan subscription](https://developer.immersal.com/pricing/)

## Future improvements

- Common API to replace "SLAM tracking" with other tracking implementations (native Android Chrome WebXR/ARCore, Zappar World Tracking, 8th Wall World Tracking, etc.)
- Accuracy and speed

## Notes

- This is the "standalone version" of Immersal VPS for Web. You can also use it with Zappar's excellent [Mattercraft](https://zap.works/mattercraft/) tool, which is using Zappar's proprietary World Tracking (meaning that you don't have to use continuous localization with Immersal, every few seconds is probably enough). See videos: [Transforming location based AR experiences through the web with Mattercraft and Immersal](https://youtu.be/G0wbBQzFZJ0?si=wms08zdgDluagk5f), [Introducing Mattercraft’s New Integration with Immersal VPS](https://youtu.be/39_lao6icSI?si=oyA05ySZnckTHrQ6)
- Support for on-device localization with 8th Wall or WeChat isn't planned at the moment, if you need it, [contact us](mailto:support@immersal.com) and let's talk.
