> [!WARNING]
> [v2.0.0](https://github.com/Benjas333/VeadoSAMMI/releases/tag/v2.0.0) will be the last release compatible with veadotube mini v2.0a and older. Next releases will be focused on the new v2.1 features and endpoints.

# VeadoSAMMI (A Veadotube extension for SAMMI)
This is an extension for [SAMMI](https://sammi.solutions/) that allows you to control [Veadotube](https://veado.tube/) using its WebSocket. It should be compatible with live and editor versions of Veadotube, but I don't have access to them, so I'm not sure.
<!-- ![](/assets/logo%20not%20alpha%20in%20head.png) -->
Thanks to HueVirtualCreature, because my code is based on [theirs](https://github.com/HueVirtualCreature/SAMMIVtubeStudioExtension).

## Table of Contents
- [Usage](#usage)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Launching](#launching)

- [Commands](#commands)
  - [VeadoSAMMI - Peek Avatar State](#veadotube-mini---peek-avatar-state)
  - [VeadoSAMMI - Set Avatar State](#veadotube-mini---set-avatar-state)
  - [VeadoSAMMI - Push Avatar State](#veadotube-mini---push-avatar-state)
  - [VeadoSAMMI - Pop Avatar State](#veadotube-mini---pop-avatar-state)
  - [VeadoSAMMI - Get Avatar State Thumbnail](#veadotube-mini---thumb-avatar-state)
  - [VeadoSAMMI - Set Random Avatar State](#veadotube-mini---set-random-avatar-state)
- [TO DO](#to-do)
- [Contributing](#contributing)
- [Links](#links)

## Usage (for mini version)
### Requirements
- [veadotube mini](https://olmewe.itch.io/veadotube-mini)
- [SAMMI](https://sammi.solutions/docs/download)
- [extension release](https://github.com/Benjas333/VeadoSAMMI/releases/latest)

### Installation
1. Download the .sef file.
2. In SAMMI's main GUI click on `SAMMI Bridge` and select `Install an extension`.
3. Navigate to the downloaded .sef file and select it.

### Launching
- The Bridge **must be** opened for the extension to work.
- In veadotube mini > program settings > websocket server make sure is enabled.
- In the extension tab, set up the WebSocket server url and the Window title. You can get these values from veadotube mini > program settings.
- When you have finished setting up the WebSocket server, click `Connect WebSocket`.
- From here, you should see in the SAMMI alerts area that the extension successfully connected to veadotube mini.

## Commands
- ### VeadoSAMMI - Peek Avatar State
Peek the actual avatar state.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

- ### VeadoSAMMI - Set Avatar State
Set the actual avatar state to another one.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to set | Specify the new avatar state by avatar state name.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

- ### VeadoSAMMI - Push Avatar State
Push an avatar state over the actual avatar state.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to push | Specify the new overlapped avatar state name.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

- ### VeadoSAMMI - Pop Avatar State
Pop an avatar state from the actual avatar state (if there's any).

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to pop | Specify the overlapped avatar state name to remove.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

- ### VeadoSAMMI - Get Avatar State Thumbnail
Get the thumbnail from an avatar state.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to thumb | Specify the avatar state name to obtain the thumbnail from.
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string,
        width: number,
        height: number,
        png: base64
}

- ### VeadoSAMMI - Set Random Avatar State
Set the actual avatar state to a random one.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

## TO DO
- [x] Add commands that use state ID besides of the state name commands.
- [ ] ~~Change commands that use state name to display format: `name:id`.~~ **Discarded.**
- [x] Add random avatar state command.
- [x] Add auto detect WebSocket instance.
- [x] Add compatibility with multiple instances at the same time.
- [x] Find an implement a useful utility for listen and unlisten endpoints.
- [ ] Add support for >= veadotube mini 2.1a.

## Contributing
Any contribution would be appreciated.

## Links
[Twitter](https://twitter.com/ElBenjas333)
