# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

- /

### Added

- CHANGELOG.md.

## [3.1.1] - 2025-10-31

### Fixed

- Now it should detect properly any type of veadotube instances (mini, full, live, editor). [#1](<https://github.com/Benjas333/VeadoSAMMI/issues/1>)

## [3.1.0] - 2025-10-28

### Added

- Emojis in connection status :D.

### Changed

- Push-To-Talk related commands are now in release state instead of beta.
- Reduced amount of SAMMI notifications.

### Fixed

- A lot of if === null that hadn't a return statement (only logging lol).
- Number and Push-To-Talk variable retrieving.

## [3.0.0] - 2025-01-16

### Added

- Instance channels.
- Version/type warnings.
- Auto-start listeners.
- New command families: Toggle Avatar State, Push-To-Talk, and Number Commands.
- State, Push-To-Talk, and Number histories for improved tracking.

### Changed

- Improved WebSocket communication and instance management.
- Enhanced HTML templates for easier customization and better listener handling.

### Removed

- Queues and legacy listener behavior.

## [2.0.0] - 2024-12-11

> [!WARNING]
> This will be the last release compatible with veadotube v2.0a and older. Next release will be focused on the new v2.1 features and endpoints.

### Added

- Auto-detect WebSocket instances and OS.
- Compatibility with multiple instances at the same time.
- Listeners and extension triggers.

## [1.1.1] - 2024-11-23

### Changed

- Moved Thumbnail to be a separate case.
- Improved Avatar States objects logic.

### Fixed

- Set, push, and pop queues.

## [1.1.0] - 2024-11-22

### Added

- Default value for state name based commands.
- State ID based commands.
- Random state command.

### Changed

- Merged updateHTMLStatus and getWebSocketStatus.
- Improved queues and state vars.

## [1.0.1] - 2024-11-22

### Fixed

- Example deck not loading properly.

## [1.0.0] - 2024-11-22

- initial release.

<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
[unreleased]: https://github.com/Benjas333/VeadoSAMMI/compare/v3.1.1...HEAD
[3.1.1]: https://github.com/Benjas333/VeadoSAMMI/compare/v3.1.0..v3.1.1
[3.1.0]: https://github.com/Benjas333/VeadoSAMMI/compare/v3.0.0..v3.1.0
[3.0.0]: https://github.com/Benjas333/VeadoSAMMI/compare/v2.0.0..v3.0.0
[2.0.0]: https://github.com/Benjas333/VeadoSAMMI/compare/v1.1.1..v2.0.0
[1.1.1]: https://github.com/Benjas333/VeadoSAMMI/compare/v1.1.0..v1.1.1
[1.1.0]: https://github.com/Benjas333/VeadoSAMMI/compare/v1.0.1.1..v1.1.0
[1.0.1]: https://github.com/Benjas333/VeadoSAMMI/compare/v1.0.0.10...v1.0.1.1
[1.0.0]: https://github.com/Benjas333/VeadoSAMMI/releases/tag/v1.0.0.10