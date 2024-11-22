# SAMMIVeadotubeMiniExtension
This is an extension for [SAMMI](https://sammi.solutions/) that allows you to control Veadotube mini using their WebSocket.
I made this in like two days because it was no extension already for Veadotube mini. Thanks to HueVirtualCreature, because my code is based on [theirs](https://github.com/HueVirtualCreature/SAMMIVtubeStudioExtension).

## Table of Contents
- [Usage](#usage)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Launching](#launching)

- [Commands](#commands)
  - [Veadotube mini - Peek Avatar State](#veadotube-mini---peek-avatar-state)
  - [Veadotube mini - Set Avatar State](#veadotube-mini---set-avatar-state)
  - [Veadotube mini - Push Avatar State](#veadotube-mini---push-avatar-state)
  - [Veadotube mini - Pop Avatar State](#veadotube-mini---pop-avatar-state)
  - [Veadotube mini - Thumb Avatar State](#veadotube-mini---thumb-avatar-state)
- [TO DO](#to-do)
- [Contributing](#contributing)
- [Links](#links)

## Usage
### Requirements
- [veadotube mini](https://olmewe.itch.io/veadotube-mini)
- [SAMMI](https://sammi.solutions/)
- [extension release](https://github.com/Benjas333/SAMMIVeadotubeMiniExtension/releases/latest)

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
### Veadotube mini - Peek Avatar State
Peek the actual avatar state.

Param | Description
------------- | -------------
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

### Veadotube mini - Set Avatar State
Set the actual avatar state to another one.

Param | Description
------------- | -------------
State to set | Specify the new avatar state.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

### Veadotube mini - Push Avatar State
Push an avatar state over the actual avatar state.

Param | Description
------------- | -------------
State to push | Specify the new overlapped avatar state.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

### Veadotube mini - Pop Avatar State
Pop an avatar state from the actual avatar state (if there's any).

Param | Description
------------- | -------------
State to pop | Specify the overlapped avatar state to remove.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string
}

### Veadotube mini - Thumb Avatar State
Get more detailed information about an avatar state.

Param | Description
------------- | -------------
State to thumb | Specify the avatar state to obtain info from.
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string,
        width: number,
        height: number,
        png: base64
}

## TO DO
- [ ] Add commands that use state ID instead of state name.
- [ ] Change commands that use state name to display format: `name:id`.
- [ ] Add random avatar state command.
- [ ] Find an implement utility for listen and unlisten endpoints.

## Contributing
Any contribution would be appreciated.

## Links
[Twitter](https://twitter.com/ElBenjas333)
