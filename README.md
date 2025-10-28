> [!WARNING]
> [v2.0.0](https://github.com/Benjas333/VeadoSAMMI/releases/tag/v2.0.0) will be the last release compatible with veadotube mini v2.0a and older. Next releases will be focused on the new v2.1 features and endpoints.

# VeadoSAMMI (A Veadotube extension for SAMMI)
> [!TIP]
> ### New update [available](https://github.com/Benjas333/VeadoSAMMI/releases/latest)! veadotube mini 2.1 features are here!

This is a SAMMI extension that allows you to control Veadotube mini using its WebSocket. It should be also compatible with Veadotube live and Veadotube editor, but I don't have access to them, so I haven't tested them yet.
<!-- ![](/assets/logo%20not%20alpha%20in%20head.png) -->
Thanks to HueVirtualCreature, because my first code was based on [theirs](https://github.com/HueVirtualCreature/SAMMIVtubeStudioExtension).

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
  - [VeadoSAMMI - (NEW) Toggle Avatar State](#veadosammi---new-toggle-avatar-state)
  - [VeadoSAMMI - Get Avatar State Thumbnail](#veadotube-mini---thumb-avatar-state)
  - [VeadoSAMMI - Set Random Avatar State](#veadotube-mini---set-random-avatar-state)
  - [VeadoSAMMI - (NEW) Get Push-To-Talk](#veadosammi---new-get-push-to-talk)
  - [VeadoSAMMI - (NEW) Set Push-To-Talk](#veadosammi---new-set-push-to-talk)
  - [VeadoSAMMI - (NEW) Toggle Push-To-Talk](#veadosammi---new-toggle-push-to-talk)
- [Beta Commands](#beta-commands)
  - [VeadoSAMMI - (NEW) Get Number](#veadosammi---new-get-number)
  - [VeadoSAMMI - (NEW) Set Number](#veadosammi---new-set-number)
  - [VeadoSAMMI - (NEW) Add Number](#veadosammi---new-add-number)
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
- The instances should be automatically detected by the extension in the extension tab. In case an instance is not found, you can add it manually typing the WebSocket server url and the Window title. You can get these values from veadotube mini > program settings.
- To start using the extension just click `Connect WebSocket`.
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
        id: string,
        thumbHash: string
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
        id: string,
        thumbHash: string
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
        id: string,
        thumbHash: string
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
        id: string,
        thumbHash: string
}

- ### VeadoSAMMI - (NEW) Toggle Avatar State
Toggle an avatar state from the stack (pushes a state if it’s not on the stack, and pops if it is).

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to toggle | Specify the overlapped avatar state name to remove.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        name: string,
        id: string,
        thumbHash: string
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
        hash: string,
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
        id: string,
        thumbHash: string
}

> [!IMPORTANT]
> In order to test the Push-To-Talk commands you must enable: microphone settings > push-to-talk > use websocket.
> If you have assigned a shortcut it will override the Push-to-talk WebSocket behavior (so remove it if you are going to test VeadoSAMMI commands related with Push-to-talk).
- ### VeadoSAMMI - (NEW) Get Push-To-Talk
Get the actual Push-To-Talk state.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: boolean
}

- ### VeadoSAMMI - (NEW) Set Push-To-Talk
Set the Push-To-Talk state to another one.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
State to set | Specify the new Push-To-Talk state from the dropdown.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: boolean
}

- ### VeadoSAMMI - (NEW) Toggle Push-To-Talk
Toggle the Push-To-Talk state.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Save Previous State As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: boolean
}

## Beta commands
> [!NOTE]
> I actually don't know what these endpoints are for (because they're not used in veadotube mini), but I added them in case they are used in Veadotube live or Veadotube editor. They are in Beta because I was unable to test them, so there's a high chance they don't even work.
- ### VeadoSAMMI - (NEW) Get Number
Get the actual Number value.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Save Variable As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: float
}

- ### VeadoSAMMI - (NEW) Set Number
Set Number to another one.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Number to set | Specify the new Number value.
Min | Specify the new range min value (optional).
Max | Specify the new range max value (optional).
Save Previous Number As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: float
}
or
{
        value: float,
        min: float,
        max: float,
}

- ### VeadoSAMMI - (NEW) Add Number
Add any value to the actual Number.

Param | Description
------------- | -------------
Instance | Specify the instance to manipulate.
Number to add | Specify the value to add to Number.
Min | Specify the value to add to the range min (optional).
Max | Specify the value to add to the range max (optional).
Save Previous Number As | Specify the variable name that you want the response to be saved into.
Delay (ms) | Native to SAMMI.

Response format: {
        value: float
}
or
{
        value: float,
        min: float,
        max: float,
}

## TO DO
- [x] Add commands that use state ID besides of the state name commands.
- [ ] ~~Change commands that use state name to display format: `name:id`.~~ **Discarded.**
- [x] Add random avatar state command.
- [x] Add auto detect WebSocket instance.
- [x] Add compatibility with multiple instances at the same time.
- [x] Find an implement a useful utility for listen and unlisten endpoints.
- [x] Add support for >= veadotube mini 2.1a.
- [ ] Maybe implement an auto updater or an updates detector.
- [ ] Maybe find a way to use TypeScript.
- [ ] Improve the instances listing in general.
- [ ] Add Number listener id for extTriggers.
- [ ] Release the beta commands lol.

- [ ] I'm actually thinking of rewriting the whole thing xd.

## Contributing
Any contribution would be appreciated.

## Links
[Twitter](https://twitter.com/ElBenjas333)
